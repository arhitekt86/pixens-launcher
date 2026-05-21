// PIXENS Launcher — REAL account profile, read DIRECTLY from Supabase
// REST in the MAIN process (R41.1, Track 1 — clean single-identity).
//
// The renderer is file:// and can't read the persist:pixens session.
// MAIN holds the post-handoff session tokens (browserAuth →
// saveSessionTokens, safeStorage-encrypted) and calls Supabase REST
// itself → instant (~1 s), no SPA window.
//
// Migration 0050 made the canonical `acct_…` row the SINGLE COMPLETE
// truth (it moved the legacy 0x row's username + featured onto it and
// hardened bind via a trigger). So this reads ONE identity only — NO
// two-row merge, NO max(), NO dual calls. `account_for_auth(sub)` →
// acct_ id → get_player_progress_full (display_name/level/xp/diamonds/
// featured) + get_owned_nft_ids. Done.

import { app, safeStorage } from 'electron'
import { join } from 'node:path'
import { writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'

const SUPA_URL = 'https://rfyitsmsryhtwmoknguh.supabase.co'
// Public anon key (shippable; same as browserAuth.ts / the pixens.io bundle).
const SUPA_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmeWl0c21zcnlodHdtb2tuZ3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxOTY3MTksImV4cCI6MjA5Mjc3MjcxOX0.7JjoHVQBfCiQSXl-xpsih-tyhGD7QsiyNtpbvgqj9eQ'

const TOK_FILE = () => join(app.getPath('userData'), 'pixens-auth.bin')

interface Tokens { access_token: string; refresh_token: string }
let mem: Tokens | null = null
let lastAcct: string | null = null

/** Persisted by browserAuth on a successful pairing-code claim. */
export function saveSessionTokens(t: Tokens): void {
  if (!t || !t.access_token || !t.refresh_token) return
  mem = { access_token: t.access_token, refresh_token: t.refresh_token }
  try {
    const json = JSON.stringify(mem)
    const buf = safeStorage.isEncryptionAvailable()
      ? safeStorage.encryptString(json)
      : Buffer.from(json, 'utf8')
    writeFileSync(TOK_FILE(), buf)
  } catch { /* non-fatal — mem still works this run */ }
}

function loadTokens(): Tokens | null {
  if (mem) return mem
  try {
    if (!existsSync(TOK_FILE())) return null
    const raw = readFileSync(TOK_FILE())
    const json = safeStorage.isEncryptionAvailable()
      ? safeStorage.decryptString(raw)
      : raw.toString('utf8')
    mem = JSON.parse(json) as Tokens
    return mem
  } catch {
    return null
  }
}

export function clearSessionTokens(): void {
  mem = null
  lastAcct = null
  try { rmSync(TOK_FILE(), { force: true }) } catch { /* */ }
}

function jwtPayload(jwt: string): Record<string, unknown> | null {
  try {
    const b = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(Buffer.from(b, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

async function refreshTokens(rt: string): Promise<Tokens | null> {
  try {
    const res = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: SUPA_ANON },
      body: JSON.stringify({ refresh_token: rt }),
    })
    if (!res.ok) return null
    const j = (await res.json()) as { access_token?: string; refresh_token?: string }
    if (!j.access_token) return null
    const t: Tokens = { access_token: j.access_token, refresh_token: j.refresh_token || rt }
    saveSessionTokens(t)
    return t
  } catch {
    return null
  }
}

/** Fresh access token (proactive refresh if <2 min to expiry). */
async function ensureAccess(): Promise<Tokens | null> {
  const t = loadTokens()
  if (!t) return null
  const p = jwtPayload(t.access_token)
  const exp = p && typeof p.exp === 'number' ? (p.exp as number) : 0
  if (exp && exp - Math.floor(Date.now() / 1000) > 120) return t
  return (await refreshTokens(t.refresh_token)) || t
}

/** Fresh (refreshed-if-near-expiry) tokens for (re)establishing the
 *  persist:pixens webview session on hub entry / boot — so the embedded
 *  chat + web games are ALWAYS authed, not only right after an explicit
 *  sign-in. */
export async function getFreshTokens(): Promise<Tokens | null> {
  return ensureAccess()
}

async function rpc<T>(fn: string, body: Record<string, unknown>, access: string): Promise<T | null> {
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: SUPA_ANON,
        authorization: `Bearer ${access}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

// ---- level → tier + progress (mirror frontend nft/playerXp.ts) -----------
const xpForLevel = (n: number) => ((n - 1) * n) / 2 * 500
const TIERS: { label: string; min: number; color: string }[] = [
  { label: 'UNRANKED', min: 0, color: '#7a6fa8' },
  { label: 'BRONZE', min: 2, color: '#c47a3a' },
  { label: 'SILVER', min: 5, color: '#cfcfe0' },
  { label: 'GOLD', min: 10, color: '#ffbe0b' },
  { label: 'PLATINUM', min: 18, color: '#00f5ff' },
  { label: 'DIAMOND', min: 28, color: '#b026ff' },
  { label: 'MASTER', min: 42, color: '#ff006e' },
  { label: 'GRANDMASTER', min: 60, color: '#06ffa5' },
]
function tierFor(level: number) {
  let t = TIERS[0]
  for (const x of TIERS) if (level >= x.min) t = x
  return { label: t.label, color: t.color }
}
function levelPct(level: number, totalXp: number): number {
  const a = xpForLevel(level)
  const b = xpForLevel(level + 1)
  if (b <= a) return 0
  return Math.max(0, Math.min(100, Math.round(((totalXp - a) / (b - a)) * 100)))
}

interface Prog {
  display_name: string | null
  level: number
  xp: number | string
  diamonds: number
  featured_token_id: number | null
  selected_token_id: number | null
}

export interface LauncherProfile {
  loggedIn: boolean
  displayName?: string
  level?: number
  xp?: number
  levelPct?: number
  tier?: { label: string; color: string }
  diamonds?: number
  wallet?: string | null
  ownedCount?: number
  ownedIds?: number[]
  featured?: { tokenId: number; name: string; art: string } | null
  ts: number
}

async function resolveAcct(access: string): Promise<{ acctId: string; wallet: string | null } | null> {
  const sub = (jwtPayload(access) || {}).sub as string | undefined
  if (!sub) return null
  const acc = await rpc<{ ok: boolean; identity?: string; bound_wallet?: string | null }>(
    'account_for_auth',
    { p_auth_id: sub },
    access,
  )
  if (!acc || !acc.ok || !acc.identity) return null
  lastAcct = acc.identity
  return { acctId: acc.identity, wallet: acc.bound_wallet || null }
}

/** Sub-second, REST-only, SINGLE canonical identity (post-0050). */
export async function loadAccountProfile(): Promise<LauncherProfile> {
  const ts = Date.now()
  const tok = await ensureAccess()
  if (!tok) return { loggedIn: false, ts }
  const who = await resolveAcct(tok.access_token)
  if (!who) return { loggedIn: false, ts }

  const [prog, owned] = await Promise.all([
    rpc<Prog>('get_player_progress_full', { p_wallet: who.acctId }, tok.access_token),
    rpc<number[]>('get_owned_nft_ids', { p_owner: who.acctId }, tok.access_token),
  ])

  const displayName = (prog && prog.display_name) || 'PLAYER'
  const level = prog?.level || 1
  const xp = Number(prog?.xp || 0)
  const diamonds = prog?.diamonds || 0
  const ownedIds = Array.isArray(owned)
    ? owned.filter((n) => Number.isFinite(n) && n > 0)
    : []
  const featuredId =
    (prog && prog.featured_token_id) ||
    (prog && prog.selected_token_id) ||
    (ownedIds.length ? ownedIds[0] : null)

  return {
    loggedIn: true,
    displayName,
    level,
    xp,
    levelPct: levelPct(level, xp),
    tier: tierFor(level),
    diamonds,
    // the bound 0x for the wallet pill (real connected/bound wallet —
    // never the acct_ id, brains #161). Display only, not a merge.
    wallet: who.wallet && who.wallet.startsWith('0x') ? who.wallet : null,
    ownedCount: ownedIds.length,
    ownedIds,
    featured: featuredId
      ? { tokenId: featuredId, name: `PIXEN #${featuredId}`, art: `https://pixens.io/nft/img/pixen/${featuredId}.svg` }
      : null,
    ts,
  }
}

const REALMS_BRIDGE = 'https://pixens-realms-bridge.grega-xp.workers.dev'

/** #2 — ownership-verified signed Realms link token. MAIN holds the
 *  Supabase session; the bridge re-verifies ownership server-side
 *  (account_for_auth + get_owned_nft_ids) and returns an HMAC-signed
 *  token bound to the canonical account + an OWNED pixen. 0 owned
 *  Pixens → { gated:true } (Realms is NFT-gated, Q3 LOCKED). The
 *  launcher can NOT forge this — the secret lives only in the Worker. */
export async function realmsLinkToken(): Promise<{ token?: string; gated?: boolean; pixen?: number; luaName?: string; luaPass?: string; error?: string }> {
  const tok = await ensureAccess()
  if (!tok) return { error: 'NOT_SIGNED_IN' }
  let pixen = 0
  try {
    const p = await loadAccountProfile()
    if (p.loggedIn && p.featured && p.featured.tokenId) pixen = p.featured.tokenId
  } catch { /* bridge picks owned[0] if we don't pass one */ }
  try {
    const res = await fetch(`${REALMS_BRIDGE}/realms/issue`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ access_token: tok.access_token, pixen }),
    })
    if (!res.ok) return { error: `ISSUE_${res.status}` }
    const j = (await res.json()) as {
      ok?: boolean; token?: string; gated?: boolean; pixen?: number
      luaName?: string; luaPass?: string; reason?: string
    }
    if (j && j.gated) return { gated: true }
    if (j && j.ok && j.token)
      return { token: j.token, pixen: j.pixen, luaName: j.luaName, luaPass: j.luaPass }
    return { error: (j && j.reason) || 'ISSUE_FAILED' }
  } catch (e: unknown) {
    return { error: String((e as Error)?.message || e) }
  }
}

/** Native "Change Pixen" — set the account's featured Pixen via REST
 *  (MAIN has the token), then return the fresh profile. No pixens.io
 *  window. Writes the canonical acct_ row (the single truth post-0050). */
export async function setFeatured(tokenId: number): Promise<LauncherProfile> {
  const tok = await ensureAccess()
  if (!tok || !Number.isFinite(tokenId) || tokenId <= 0) return loadAccountProfile()
  let acctId = lastAcct
  if (!acctId) {
    const who = await resolveAcct(tok.access_token)
    acctId = who ? who.acctId : null
  }
  if (acctId) {
    await rpc('set_featured_pixen', { p_wallet: acctId, p_token_id: tokenId }, tok.access_token)
  }
  return loadAccountProfile()
}
