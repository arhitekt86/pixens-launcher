// PIXENS Launcher — browser-handoff sign-in via Supabase pairing code
// (R41.1, robust rewrite).
//
// WHY NOT loopback: https://pixens.io → fetch http://127.0.0.1 is
// blocked by Chrome Private Network Access / mixed-content across
// versions + enterprise policy ("Failed to fetch") even WITH the PNA
// header. Bulletproof pattern instead (same as the Realms link token
// in ARCHITECTURE.md): a short-lived pairing code.
//
//   signInViaBrowser():
//     1. generate a random code, open the SYSTEM browser at
//        pixens.io/launcher-link?code=<code>
//     2. the page (auth works fully in a real browser; instant if
//        already logged in) calls bind_launcher_code(code, tokens)
//     3. we POLL claim_launcher_code(code) over normal https (Node →
//        Supabase REST — always works, no localhost / PNA / firewall)
//     4. on tokens → establish the SAME session in persist:pixens →
//        games + Realms token authed with one login.
//
// The Supabase anon key is public (already shipped in the pixens.io
// bundle; ARCHITECTURE.md "anon key — public, safe to ship"). Filled
// from frontend/.env.local at build by scripts/prepare-ffmpeg.mjs's
// sibling step — here it's a literal constant.

import { BrowserWindow, shell } from 'electron'
import { randomBytes } from 'node:crypto'
import { saveSessionTokens, getFreshTokens } from './accountProfile'

const WEB_BASE = process.env.PIXENS_WEB_BASE || 'https://pixens.io'
const SUPA_URL = 'https://rfyitsmsryhtwmoknguh.supabase.co'
// Public anon key (shippable). Replaced from .env.local at build.
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmeWl0c21zcnlodHdtb2tuZ3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxOTY3MTksImV4cCI6MjA5Mjc3MjcxOX0.7JjoHVQBfCiQSXl-xpsih-tyhGD7QsiyNtpbvgqj9eQ'

export interface BrowserAuthResult { ok: boolean; error?: string }

let cancelled = false
let log: (m: string) => void = () => {}
export function setAuthLogger(fn: (m: string) => void) { log = fn }

async function rpc(fn: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${SUPA_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: SUPA_ANON,
      authorization: `Bearer ${SUPA_ANON}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${fn} ${res.status}`)
  return res.json()
}

/** Establish the handed-back session inside persist:pixens so the
 *  embedded game webviews + Realms token are authed. */
export async function establishSession(tokens: { access_token: string; refresh_token: string }): Promise<boolean> {
  const w = new BrowserWindow({
    show: false,
    webPreferences: { partition: 'persist:pixens', contextIsolation: true, nodeIntegration: false },
  })
  try {
    await w.loadURL(`${WEB_BASE}/launcher-session`)
    let ready = false
    for (let i = 0; i < 60 && !ready; i++) {
      // eslint-disable-next-line no-await-in-loop
      ready = await w.webContents.executeJavaScript('window.__pixensSessionReady===true').catch(() => false)
      // eslint-disable-next-line no-await-in-loop
      if (!ready) await new Promise((r) => setTimeout(r, 100))
    }
    if (!ready) { log('[auth] launcher-session not ready'); return false }
    const ok: boolean = await w.webContents.executeJavaScript(
      `window.__pixensSetSession(${JSON.stringify(tokens)})`,
    ).catch((e) => { log('[auth] setSession exec error: ' + (e?.message || e)); return false })
    return !!ok
  } catch (e: unknown) {
    log('[auth] establishSession failed: ' + String((e as Error)?.message || e))
    return false
  } finally {
    try { w.destroy() } catch { /* */ }
  }
}

/** Open the system browser with a pairing code, poll Supabase for the
 *  bound session, establish it in persist:pixens. */
export async function signInViaBrowser(): Promise<BrowserAuthResult> {
  cancelled = false
  const code = 'lk_' + randomBytes(20).toString('hex') // 43 chars, unguessable
  const url = `${WEB_BASE}/launcher-link?code=${code}`
  log('[auth] opening system browser → ' + url)
  try { await shell.openExternal(url) } catch (e: unknown) {
    return { ok: false, error: 'BROWSER_OPEN_FAILED' }
  }

  const deadline = Date.now() + 5 * 60_000 // 5 min
  while (Date.now() < deadline) {
    if (cancelled) return { ok: false, error: 'CANCELLED' }
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 2500))
    let r: { ready?: boolean; access_token?: string; refresh_token?: string } | null = null
    try {
      // eslint-disable-next-line no-await-in-loop
      r = (await rpc('claim_launcher_code', { p_code: code })) as typeof r
    } catch (e: unknown) {
      log('[auth] poll error (continuing): ' + String((e as Error)?.message || e))
      continue
    }
    if (r && r.ready && r.access_token && r.refresh_token) {
      // Persist tokens for MAIN-direct REST profile reads (instant, no
      // SPA). Save BEFORE establishSession — the hub profile doesn't
      // need the persist:pixens session, only the tokens; the session
      // is still established for the embedded web games.
      saveSessionTokens({ access_token: r.access_token, refresh_token: r.refresh_token })
      // eslint-disable-next-line no-await-in-loop
      const sessOk = await establishSession({ access_token: r.access_token, refresh_token: r.refresh_token })
      return sessOk ? { ok: true } : { ok: false, error: 'SESSION_ESTABLISH_FAILED' }
    }
  }
  return { ok: false, error: 'TIMEOUT' }
}

/** (Re)establish the persist:pixens webview session from saved +
 *  refreshed tokens. MUST be awaited on hub entry (and on boot) BEFORE
 *  the chat-embed webview / embedded web games load — the session is
 *  otherwise only set right after an explicit sign-in, so a relaunch
 *  leaves the hub chat unauthenticated: it shows GUEST and the 0048
 *  guest-row guard silently DROPS every message (vanishes on reopen,
 *  never reaches pixens.io). Idempotent + best-effort. */
export async function ensurePersistSession(): Promise<BrowserAuthResult> {
  const t = await getFreshTokens()
  if (!t || !t.access_token || !t.refresh_token) return { ok: false, error: 'NO_TOKENS' }
  const ok = await establishSession({ access_token: t.access_token, refresh_token: t.refresh_token })
  return ok ? { ok: true } : { ok: false, error: 'SESSION_ESTABLISH_FAILED' }
}

export function disposeBrowserAuth() { cancelled = true }
