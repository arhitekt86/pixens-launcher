// PIXENS Launcher — preload. The ONLY bridge between the Claude Design
// renderer UI and Electron main. The UI calls window.pixens.* — keep this
// the stable contract; UI authors code against these names.
import { contextBridge, ipcRenderer } from 'electron'

const api = {
  app: {
    info: () => ipcRenderer.invoke('app:info'),
    // open a commerce/wallet flow in the SYSTEM browser (wallet lives there)
    openExternal: (target: 'presale' | 'shop') => ipcRenderer.invoke('app:openExternal', target)
  },
  window: {
    minimize: () => ipcRenderer.invoke('win:minimize'),
    maximize: () => ipcRenderer.invoke('win:maximize'),
    close: () => ipcRenderer.invoke('win:close')
  },
  realms: {
    // { installed, version, installDir, latest, needsUpdate }
    state: () => ipcRenderer.invoke('realms:state'),
    // Download + sha256-verify + extract the Realms client from the
    // CF-hosted manifest into userData/realms. → { ok, version?,
    // upToDate?, error? }. Non-cheat untouched (server stays authority).
    installOrUpdate: (): Promise<{ ok: boolean; version?: string; upToDate?: boolean; error?: string }> =>
      ipcRenderer.invoke('realms:installOrUpdate'),
    // REAL download progress: { phase:'download'|'verify'|'install'|'done',
    // percent, recvMB, totalMB }. Renderer drives UpdateScreen off this.
    onProgress: (cb: (p: { phase: string; percent: number; recvMB?: number; totalMB?: number }) => void) => {
      const h = (_e: unknown, p: { phase: string; percent: number; recvMB?: number; totalMB?: number }) => cb(p)
      ipcRenderer.on('realms:progress', h)
      return () => ipcRenderer.removeListener('realms:progress', h)
    },
    // linkCode = the player's featured Pixen tokenId (existing Phase-0
    // bridge convention: code 1–15000 → trait derivation). Server
    // validates; launcher only delivers (ARCHITECTURE.md non-cheat).
    launch: (linkCode?: string) => ipcRenderer.invoke('realms:launch', linkCode)
  },
  webGame: {
    // 'defense' | 'arena' | 'shop' → fullscreen, shared pixens.io session
    open: (which: 'defense' | 'arena' | 'shop') => ipcRenderer.invoke('webgame:open', which)
  },
  web: {
    // pixens.io page in a shared-session window (pick Pixen → real /vault)
    open: (which: 'vault' | 'social') => ipcRenderer.invoke('web:open', which)
  },
  launcher: {
    checkUpdate: () => ipcRenderer.invoke('launcher:checkUpdate'),
    // one-click "RESTART & UPDATE" — old closes, new installs, relaunches
    // (login preserved: userData/persist:pixens untouched by the update).
    installUpdate: (): Promise<{ ok: boolean; error?: string }> =>
      ipcRenderer.invoke('launcher:installUpdate'),
    // main pushes { state:'downloading', percent } → { state:'ready', version }
    onUpdate: (cb: (p: { state: string; version?: string; percent?: number }) => void) => {
      const h = (_e: unknown, p: { state: string; version?: string; percent?: number }) => cb(p)
      ipcRenderer.on('launcher:update', h)
      return () => ipcRenderer.removeListener('launcher:update', h)
    }
  },
  auth: {
    // R41.1 — browser-handoff sign-in. Opens the system browser; main
    // receives the session via the Supabase pairing code + establishes
    // it in persist:pixens. Resolves { ok, error? }. Replaces the
    // embedded-webview <AuthGate> that could never complete
    // MetaMask / magic-link / Google.
    signIn: (): Promise<{ ok: boolean; error?: string }> =>
      ipcRenderer.invoke('auth:signIn'),
    // (Re)establish the persist:pixens session w/ fresh tokens before
    // the hub chat-embed webview loads (fixes GUEST + dropped messages
    // on relaunch). Awaited by the renderer on hub entry.
    ensureSession: (): Promise<{ ok: boolean; error?: string }> =>
      ipcRenderer.invoke('auth:ensureSession')
  },
  account: {
    // R41.1 — REAL hub data. main keeps a hidden persist:pixens window
    // on pixens.io/launcher-profile (runs the site's own identity +
    // progress hydration) and returns the canonical profile. The
    // renderer hub/TopBar/GameDetail consume THIS instead of mock data.
    // Resolves { loggedIn, displayName, level, levelPct, tier, diamonds,
    // wallet, ownedCount, featured, online, totalPlayers, ts }.
    profile: (): Promise<Record<string, unknown>> =>
      ipcRenderer.invoke('account:profile'),
    // Native Change-Pixen: set featured by tokenId, resolves the fresh
    // profile. No pixens.io window (that showed a wallet-less / wrong
    // identity). Owned ids come from profile().ownedIds.
    setFeatured: (tokenId: number): Promise<Record<string, unknown>> =>
      ipcRenderer.invoke('account:setFeatured', tokenId)
  }
}

contextBridge.exposeInMainWorld('pixens', api)
export type PixensApi = typeof api
