// PIXENS Launcher — Electron main process.
// Responsibilities (UI-independent; the renderer is the Claude Design app):
//   - one branded launcher window (frameless, fixed size)
//   - launch PIXENS REALMS (native PixensRealms.exe) + write the link token
//   - open PIXENS DEFENSE / BLOCK ARENA fullscreen in a shared-session webview
//   - Realms install/update from a version manifest
//   - launcher self-update (electron-updater)
// Shared Electron session partition "persist:pixens" => one pixens.io login
// is reused by the launcher renderer AND the embedded web games.

import { app, BrowserWindow, ipcMain, session, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import { spawn } from 'node:child_process'
import { join, dirname } from 'node:path'
import {
  writeFileSync,
  existsSync,
  readFileSync,
  mkdirSync,
  createWriteStream,
  rmSync
} from 'node:fs'
import { createHash } from 'node:crypto'
import extractZip from 'extract-zip'
// clipCapture (ffmpeg ring-buffer screen-record) removed 2026-05-22 — bundling
// ffmpeg-static added 82 MB to the installer + forced LGPL on the launcher
// repo. Users can stream/record with OBS / NVIDIA ShadowPlay / Win+G Game
// Bar / Discord, which are all higher-quality + already on most systems.
import { signInViaBrowser, ensurePersistSession, disposeBrowserAuth, setAuthLogger } from './browserAuth'
import { loadAccountProfile, setFeatured, realmsLinkToken } from './accountProfile'

const PIXENS_PARTITION = 'persist:pixens'
const WEB_BASE = process.env.PIXENS_WEB_BASE || 'https://pixens.io'
// Deep-link into a specific game. There is NO /td or /play route — the SPA
// enters a game via /lobby + sessionStorage 'bba_pendingPickMode'. The game
// window's preload pre-seeds that key (before page JS) from this mode, then
// we load /lobby so Index's handlePickMode goes straight into the game.
const GAME_MODE: Record<string, string> = {
  defense: 'td',     // Pixen Defense — TD vs-AI pre-menu → game
  arena: 'arcade'    // Block Arena   — puzzle vs-AI character-select → game
}
// Opened in the SYSTEM browser (not embedded). Shop + presale are
// commerce/wallet flows — they belong in the user's real browser where
// their wallet extension lives, not a fullscreen webview.
const EXTERNAL: Record<string, string> = {
  presale: `${WEB_BASE}/presale`,
  shop: `${WEB_BASE}/shop`
}

// Realms install dir (launcher-managed). The game build (our PixensRealms
// bundle) is downloaded here from the manifest; never bundled in the launcher.
const realmsDir = () => join(app.getPath('userData'), 'realms')
const realmsVersionFile = () => join(realmsDir(), 'VERSION')
const realmsDownloadTmp = () => join(app.getPath('userData'), 'realms-download.zip')
// Version/update manifest (hosted on CF static — pixens.io/launcher/realms/).
const REALMS_MANIFEST_URL = `${WEB_BASE}/launcher/realms/realms-latest.json`

// The packaged zip's root is `bin/PixensRealms.exe` (Compress-Archive of
// the bundle CONTENTS). A future repackage might wrap it in a `Pixens
// Realms/` folder — resolve either layout so launch never breaks on a
// packaging-style change.
function resolveRealmsExe(): string {
  const flat = join(realmsDir(), 'bin', 'PixensRealms.exe')
  if (existsSync(flat)) return flat
  const wrapped = join(realmsDir(), 'Pixens Realms', 'bin', 'PixensRealms.exe')
  if (existsSync(wrapped)) return wrapped
  return flat // default for the NOT_INSTALLED check
}

interface RealmsManifest {
  version: string
  url: string
  sha256: string
  size?: number
}

// BOM-safe: scripts/package-realms.ps1 writes the manifest with
// `Out-File -Encoding utf8` (PS 5.1 → UTF-8 BOM). A naive res.json() /
// JSON.parse throws "Unexpected token ﻿". Fetch as text, strip BOM.
async function fetchRealmsManifest(timeoutMs = 6000): Promise<RealmsManifest | null> {
  try {
    const ctrl = new AbortController()
    const tm = setTimeout(() => ctrl.abort(), timeoutMs)
    // `cache:'no-store'` is only the LOCAL (undici) cache — it does NOT
    // bust Cloudflare's EDGE cache, so a fresh deploy can still serve a
    // STALE manifest (→ launcher points at a now-404 old zip). A unique
    // query string is the reliable edge-cache bypass (proven).
    const res = await fetch(`${REALMS_MANIFEST_URL}?cb=${Date.now()}`, {
      signal: ctrl.signal,
      cache: 'no-store'
    }).finally(() => clearTimeout(tm))
    if (!res.ok) return null
    const txt = (await res.text()).replace(/^﻿/, '')
    const m = JSON.parse(txt) as RealmsManifest
    if (!m || !m.version || !m.url || !m.sha256) return null
    return m
  } catch {
    return null
  }
}

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1280,
    minHeight: 800,
    frame: false,
    resizable: true,
    maximizable: true,
    show: false,
    backgroundColor: '#0b0618',
    title: 'Pixens Launcher',
    icon: join(__dirname, '../../build/icon.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      partition: PIXENS_PARTITION,
      // allow <webview> in the hub for the real (shared-session) pixens.io chat
      webviewTag: true
    }
  })

  win.removeMenu()
  // NO setAspectRatio: maximize must fill the whole screen (Battle.net-style),
  // not letterbox to the design's 1280:800. The renderer scales to cover.
  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
  win.once('ready-to-show', () => win?.show())
  win.on('closed', () => (win = null))
}

// ---- Realms native game --------------------------------------------------

function readRealmsVersion(): string | null {
  try {
    return existsSync(realmsVersionFile())
      ? readFileSync(realmsVersionFile(), 'utf8').trim()
      : null
  } catch {
    return null
  }
}

// R41.1 — browser-handoff sign-in. Renderer's ONE "SIGN IN" button
// calls this; we open the system browser, receive the session via the
// Supabase pairing code, establish it in persist:pixens AND persist the
// tokens (browserAuth → saveSessionTokens) so MAIN can read the profile
// directly from REST — no SPA, instant.
ipcMain.handle('auth:signIn', () => signInViaBrowser())
// Renderer awaits this on hub entry BEFORE mounting the chat-embed
// webview, so the persist:pixens session is fresh even on a relaunch
// (not only right after an explicit sign-in) → chat is authed, not
// GUEST, and messages persist (the 0048 guard no longer drops them).
ipcMain.handle('auth:ensureSession', () => ensurePersistSession())

// ---- Real account profile (launcher hub data) ---------------------------
// MAIN reads Supabase REST directly with the kept session token (see
// accountProfile.ts). Sub-second, no hidden SPA window. Merges the
// account∪bound_wallet identities (DB-proven split: name/featured on the
// 0x row, level/xp/diamonds on the acct_ row).
ipcMain.handle('account:profile', () => loadAccountProfile())
// Native "Change Pixen" — set featured via REST (MAIN has the token),
// no pixens.io window. Returns the fresh profile.
ipcMain.handle('account:setFeatured', (_e, tokenId: number) => setFeatured(Number(tokenId)))

ipcMain.handle('realms:state', async () => {
  const installed = existsSync(resolveRealmsExe())
  const version = readRealmsVersion()
  const m = await fetchRealmsManifest()
  return {
    installed,
    version,
    installDir: realmsDir(),
    latest: m?.version ?? null,
    // REAL download size from the manifest (no more hardcoded "84 MB").
    sizeMB: m && typeof m.size === 'number' && m.size > 0
      ? Math.round((m.size / 1048576) * 10) / 10
      : null,
    // needs an action when not installed, or installed-but-stale
    needsUpdate: !!m && (!installed || (version != null && version !== m.version))
  }
})

// Download + verify + extract the Realms client from the CF-hosted
// manifest into userData/realms. Non-cheat is untouched (public client
// build + sha256). REAL progress is streamed to the renderer via
// 'realms:progress' { phase, percent, recvMB, totalMB } — no more fake
// "84 MB"/timer; the UpdateScreen shows the actual download.
ipcMain.handle('realms:installOrUpdate', async () => {
  const m = await fetchRealmsManifest()
  if (!m) return { ok: false, error: 'NO_MANIFEST' }
  const installed = existsSync(resolveRealmsExe())
  if (installed && readRealmsVersion() === m.version) {
    return { ok: true, upToDate: true, version: m.version }
  }
  const tmp = realmsDownloadTmp()
  try {
    // Cache-bust the zip too (edge cache; sha256 is verified after).
    const dlUrl = `${m.url}${m.url.includes('?') ? '&' : '?'}cb=${Date.now()}`
    const res = await fetch(dlUrl, { cache: 'no-store' })
    if (!res.ok || !res.body) return { ok: false, error: `DOWNLOAD_${res.status}` }
    const prog = (p: Record<string, unknown>) => {
      try { win?.webContents.send('realms:progress', p) } catch { /* */ }
    }
    const total = typeof m.size === 'number' && m.size > 0 ? m.size : 0
    const totalMB = total ? Math.round((total / 1048576) * 10) / 10 : 0
    let recv = 0
    let lastPct = -1
    const hash = createHash('sha256')
    const out = createWriteStream(tmp)
    const reader = (res.body as ReadableStream<Uint8Array>).getReader()
    // eslint-disable-next-line no-constant-condition
    for (;;) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        hash.update(value)
        out.write(Buffer.from(value))
        recv += value.length
        const pct = total ? Math.min(98, Math.floor((recv / total) * 100)) : 0
        if (pct !== lastPct) {
          lastPct = pct
          prog({
            phase: 'download',
            percent: pct,
            recvMB: Math.round((recv / 1048576) * 10) / 10,
            totalMB
          })
        }
      }
    }
    out.end()
    await new Promise<void>((resolve, reject) => {
      out.on('close', () => resolve())
      out.on('error', reject)
    })
    prog({ phase: 'verify', percent: 99, recvMB: totalMB, totalMB })
    const got = hash.digest('hex').toLowerCase()
    if (got !== String(m.sha256).toLowerCase()) {
      try { rmSync(tmp, { force: true }) } catch { /* */ }
      return { ok: false, error: 'SHA256_MISMATCH' }
    }
    // Clean install (avoid stale files from an older version), then
    // extract. Zip root is `bin/...` → extracts directly into realmsDir.
    prog({ phase: 'install', percent: 99, recvMB: totalMB, totalMB })
    try { rmSync(realmsDir(), { recursive: true, force: true }) } catch { /* */ }
    mkdirSync(realmsDir(), { recursive: true })
    await extractZip(tmp, { dir: realmsDir() })
    writeFileSync(realmsVersionFile(), m.version, 'utf8')
    try { rmSync(tmp, { force: true }) } catch { /* */ }
    if (!existsSync(resolveRealmsExe())) {
      return { ok: false, error: 'EXTRACT_NO_EXE' }
    }
    prog({ phase: 'done', percent: 100, recvMB: totalMB, totalMB })
    return { ok: true, version: m.version }
  } catch (err: unknown) {
    try { rmSync(tmp, { force: true }) } catch { /* */ }
    return { ok: false, error: String((err as Error)?.message || err) }
  }
})

// Launch Realms (#2 — ownership-verified, signed link). MAIN holds the
// Supabase session → realmsLinkToken() asks the bridge to re-verify
// ownership server-side + return an HMAC-signed token bound to the
// account + an OWNED pixen. The launcher can NOT forge it. 0 owned
// Pixens → NO_PIXEN (Realms is NFT-gated, Q3 LOCKED — renderer shows
// "mint to play"). Bridge/issue down → degrade to the legacy raw
// featured-id (cosmetic only; Phase 3.6 XP gates on the signed path).
// Write the launcher-managed pixens_* keys into the bundle minetest.conf
// atomically (strip ALL managed keys first → no stale values), so the
// client auto-connects with the account-derived identity + the signed
// link token. pixens_auth_name/pw = the deterministic Luanti identity
// (#2b, Model B): same account → same character → progress always
// resumes, no login popup. Values are sanitised (no whitespace/newline)
// so a value can never inject another conf setting.
function writeLauncherConf(
  bundleRoot: string, kv: Record<string, string>, linkTxt: string
): void {
  try {
    const cfgPath = join(bundleRoot, 'minetest.conf')
    let cfg = existsSync(cfgPath) ? readFileSync(cfgPath, 'utf8') : ''
    cfg = cfg
      .replace(/^[ \t]*pixens_(link_(token|code)|auth_(name|pw))[ \t]*=.*$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s*$/, '')
    for (const [k, v] of Object.entries(kv)) cfg += `\n${k} = ${v}`
    cfg += '\n'
    writeFileSync(cfgPath, cfg, 'utf8')
  } catch { /* non-fatal — manual /link still works in-game */ }
  try { writeFileSync(join(bundleRoot, 'pixens_link.txt'), linkTxt, 'utf8') } catch { /* */ }
}

ipcMain.handle('realms:launch', async () => {
  const exe = resolveRealmsExe()
  if (!existsSync(exe)) return { ok: false, error: 'NOT_INSTALLED' }
  const bundleRoot = dirname(dirname(exe))
  try {
    let r: {
      token?: string; gated?: boolean; pixen?: number
      luaName?: string; luaPass?: string; error?: string
    } = {}
    try { r = await realmsLinkToken() } catch { r = { error: 'ISSUE_THREW' } }
    if (r.gated) return { ok: false, error: 'NO_PIXEN' }
    // #2b (Model B) — connect via the engine's NATIVE direct-connect
    // CLI (flags source-confirmed in luanti src/main.cpp: --go --address
    // --port --name --password). The main menu is bypassed entirely →
    // zero popup, zero menu-Lua-timing risk (core.start() only works
    // from a menu callback, never at load-time → that path was wrong &
    // un-GUI-testable, brains #156). The launcher already knows the
    // deterministic account-derived identity (bridge /realms/issue) →
    // hand it straight to the engine. Same account → same Luanti name
    // → same mod_storage character → progress always resumes. No
    // creds / bridge down → spawn with NO args → the proven branded
    // menu shows (manual connect fallback, never broken).
    const REALMS_HOST = '157.90.233.88'
    const REALMS_PORT = '30000'
    let args: string[] = []
    if (r.token) {
      // signed token: base64url parts + dots — keep '.' (do NOT strip).
      // Still written to minetest.conf for the pixens_autolink CSM
      // (Pixen-trait link verification — separate from native auth).
      const t = String(r.token).replace(/[^A-Za-z0-9._-]/g, '').slice(0, 512)
      writeLauncherConf(bundleRoot, { pixens_link_token: t }, t)
      const nm = r.luaName ? String(r.luaName).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 20) : ''
      const pw = r.luaPass ? String(r.luaPass).replace(/[^A-Za-z0-9]/g, '').slice(0, 64) : ''
      if (nm && pw) {
        args = ['--go', '--address', REALMS_HOST, '--port', REALMS_PORT, '--name', nm, '--password', pw]
      }
    } else {
      // bridge/issue unavailable → best-effort legacy unverified link so
      // the game still runs (cosmetic; never earns XP — #3 gates on the
      // verified signed path). Proven branded menu shows (manual connect).
      try {
        const p = await loadAccountProfile()
        const fid = p.loggedIn && p.featured && p.featured.tokenId ? p.featured.tokenId : 0
        if (fid > 0) writeLauncherConf(bundleRoot, { pixens_link_code: String(fid) }, String(fid))
      } catch { /* launch unlinked; user can /link <#> manually */ }
    }
    const child = spawn(exe, args, { cwd: bundleRoot, detached: true, stdio: 'ignore' })
    child.unref()
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: String(err?.message || err) }
  }
})

// ---- Web games (Defense / Block Arena) — fullscreen, shared session ------

ipcMain.handle('webgame:open', (_e, which: string) => {
  const mode = GAME_MODE[which]
  if (!mode) return { ok: false, error: 'UNKNOWN_GAME' }
  const gw = new BrowserWindow({
    fullscreen: true,
    backgroundColor: '#0b0618',
    title: which === 'defense' ? 'Pixens Defense' : 'Block Arena',
    icon: join(__dirname, '../../build/icon.ico'),
    webPreferences: {
      partition: PIXENS_PARTITION, // same pixens.io login as the launcher
      contextIsolation: true,
      nodeIntegration: false,
      // pre-seeds sessionStorage.bba_pendingPickMode BEFORE pixens.io JS
      // runs → Index.handlePickMode opens the game (not the landing page)
      preload: join(__dirname, '../preload/game.js'),
      additionalArguments: [`--pixens-mode=${mode}`]
    }
  })
  gw.removeMenu()
  gw.loadURL(`${WEB_BASE}/lobby`)
  // Esc closes the game window and returns to the launcher library.
  gw.webContents.on('before-input-event', (_ev, input) => {
    if (input.key === 'Escape' && input.type === 'keyDown') gw.close()
  })
  // keep external links in the user's browser, not new app windows
  gw.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
  return { ok: true }
})

// Open a pixens.io page in a shared-session fullscreen window (no game-mode
// seed). Used by "pick your Pixen" → real /vault on the user's real session.
const WEB_PAGES: Record<string, string> = {
  vault: `${WEB_BASE}/vault`,
  social: `${WEB_BASE}/social`
}
ipcMain.handle('web:open', (_e, which: string) => {
  const url = WEB_PAGES[which]
  if (!url) return { ok: false, error: 'UNKNOWN_PAGE' }
  // "Change Pixen" → a normal centered window (NOT fullscreen — Grega:
  // fullscreen pixens.io for a quick pick is jarring). Esc closes.
  const w = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 980,
    minHeight: 680,
    center: true,
    backgroundColor: '#0b0618',
    title: which === 'vault' ? 'Pixens — Pick your Pixen' : 'Pixens',
    icon: join(__dirname, '../../build/icon.ico'),
    webPreferences: { partition: PIXENS_PARTITION, contextIsolation: true, nodeIntegration: false }
  })
  w.removeMenu()
  w.loadURL(url)
  w.webContents.on('before-input-event', (_ev, input) => {
    if (input.key === 'Escape' && input.type === 'keyDown') w.close()
  })
  w.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' } })
  return { ok: true }
})

// ---- Window controls (frameless) ----------------------------------------

ipcMain.handle('app:openExternal', (_e, target: string) => {
  const url = EXTERNAL[target]
  if (url) { shell.openExternal(url); return { ok: true } }
  return { ok: false, error: 'UNKNOWN_TARGET' }
})

ipcMain.handle('win:minimize', () => win?.minimize())
ipcMain.handle('win:maximize', () => {
  if (!win) return
  if (win.isMaximized()) win.unmaximize()
  else win.maximize()
})
ipcMain.handle('win:close', () => win?.close())
ipcMain.handle('app:info', () => ({
  launcher: app.getVersion(),
  electron: process.versions.electron,
  webBase: WEB_BASE
}))

// ---- Launcher self-update (electron-updater, Battle.net-style) -----------
// Feed = generic provider https://pixens.io/launcher (electron-builder.yml
// publish) → reads latest.yml + Pixens-Setup-<ver>.exe + .blockmap from CF.
// Auto-download in the background; the renderer shows a prominent
// "UPDATE READY → RESTART & UPDATE" button; one click quitAndInstall
// (NSIS: old closes, new installs, relaunches). Login is preserved
// automatically — the session lives in persist:pixens + userData
// (%APPDATA%); the perMachine NSIS update only rewrites Program Files.
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true
let updaterWired = false

function sendUpdate(payload: Record<string, unknown>): void {
  try { win?.webContents.send('launcher:update', payload) } catch { /* */ }
}

function wireUpdater(): void {
  if (updaterWired) return
  updaterWired = true
  autoUpdater.on('update-available', (info) =>
    sendUpdate({ state: 'downloading', version: info?.version ?? null, percent: 0 }))
  autoUpdater.on('download-progress', (p) =>
    sendUpdate({ state: 'downloading', percent: Math.round(p?.percent ?? 0) }))
  autoUpdater.on('update-downloaded', (info) =>
    sendUpdate({ state: 'ready', version: info?.version ?? null }))
  // never surface updater errors (unsigned dev / offline) — non-fatal
  autoUpdater.on('error', (e) => console.log('[updater] ' + String(e?.message || e)))
}

function checkForUpdates(): void {
  try { void autoUpdater.checkForUpdates()?.catch(() => {}) } catch { /* dev/unpackaged */ }
}

// renderer "RESTART & UPDATE" button → install the downloaded update.
ipcMain.handle('launcher:installUpdate', () => {
  try { autoUpdater.quitAndInstall(true, true); return { ok: true } }
  catch (err: any) { return { ok: false, error: String(err?.message || err) } }
})
// manual re-check (kept for the existing IPC contract)
ipcMain.handle('launcher:checkUpdate', async () => {
  try {
    const r = await autoUpdater.checkForUpdates()
    return { ok: true, version: r?.updateInfo?.version ?? null }
  } catch (err: any) {
    return { ok: false, error: String(err?.message || err) }
  }
})

// ---- boot ----------------------------------------------------------------

app.whenReady().then(() => {
  // Persisted partition so pixens.io Supabase session survives restarts and
  // is shared with the embedded game windows (one login everywhere).
  session.fromPartition(PIXENS_PARTITION)
  setAuthLogger((m) => console.log(m))
  createWindow()
  wireUpdater()
  // initial check shortly after boot, then every 30 min while running
  setTimeout(checkForUpdates, 4000)
  setInterval(checkForUpdates, 30 * 60_000)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  disposeBrowserAuth()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
