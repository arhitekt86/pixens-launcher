// Game-window preload. Runs BEFORE pixens.io's own scripts, so it can
// pre-seed the SPA's pending-pick key. Without this, /lobby with no
// pending mode redirects to /play and the user lands on the hub/landing
// instead of inside the game. Mode is passed via webPreferences
// additionalArguments (--pixens-mode=<mode>) from the main process.
const arg = process.argv.find((a) => a.startsWith('--pixens-mode='))
if (arg) {
  const mode = arg.slice('--pixens-mode='.length)
  try {
    // sessionStorage is the page's (shared document) — set before app JS.
    window.sessionStorage.setItem('bba_pendingPickMode', mode)
  } catch {
    /* ignore — non-fatal; falls back to the lobby */
  }
}
