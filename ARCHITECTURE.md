# PIXENS Launcher — Architecture & Handoff

Battle.net-style unified launcher. **One account (pixens.io Supabase Auth),
three games**:

| Game          | Type            | How it runs                                   |
|---------------|-----------------|-----------------------------------------------|
| Pixens Realms | native (Luanti) | launcher downloads + launches `PixensRealms.exe` (the rebranded standalone we built) + hands it a verified link token |
| Pixens Defense| web             | fullscreen in launcher webview → `pixens.io/td` (shared session) |
| Block Arena   | web             | fullscreen in launcher webview → `pixens.io/play` (shared session) |

Realises the CLAUDE.md "3 pillars / one NFT collection / one identity" vision
in a single client. Masterplan **Phase 7 → PIXENS platform launcher**.

## Repo + toolchain

- **Location: `D:\PixensLauncher`** (NOT under `E:\Opus` — E:/C: too tight for
  iterative Electron+builder output; D: has ~838 GB). Source is small; build
  output (`dist/`, `out/`) is large.
- Node v22 · npm 11 · Electron 33 · electron-vite 2 · electron-builder 25.
- `npm run dev` (HMR shell) · `npm run build` (compile) · `npm run dist`
  (branded NSIS installer → `dist/Pixens-Setup-<ver>.exe`).

## Process model

- **main** (`src/main/index.ts`) — windows, game launch, web-game windows,
  Realms install/update, self-update. No business logic in the UI.
- **preload** (`src/preload/index.ts`) — the ONLY renderer⇄main bridge.
  Exposes `window.pixens.*`. **This is the stable contract** the Claude
  Design UI codes against.
- **renderer** (`src/renderer/`) — PLACEHOLDER today; REPLACED by the Claude
  Design React+Vite+TS+Tailwind app (see "UI integration").
- **Shared session partition `persist:pixens`** — the launcher window AND the
  embedded game windows use it ⇒ a single pixens.io login is reused
  everywhere and survives restarts.

## IPC contract (`window.pixens`)

```
app.info()                       -> { launcher, electron, webBase }
window.minimize() / window.close()
realms.state()                   -> { installed, version, installDir }
realms.launch(linkCode?)         -> { ok, error? }   spawns PixensRealms.exe
webGame.open('defense'|'arena')  -> { ok }            fullscreen, shared session
launcher.checkUpdate()           -> { ok, version? }
```
(install/update + auth helpers are added as their hosts go live — below.)

## Auth — one login everywhere

The launcher does NOT reimplement auth. The renderer uses
`@supabase/supabase-js` against the SAME project as pixens.io
(`rfyitsmsryhtwmoknguh`, anon key — public, safe to ship). Because the
launcher window and the embedded `pixens.io/td|/play` windows share the
`persist:pixens` Electron partition, the Supabase session (localStorage)
is shared: **log in once in the launcher → Defense/Arena are already
authed; Realms gets a token derived from the same account+wallet.**
Identity model = CLAUDE.md R39 (account-canonical `acct_…`, wallet bound).

Wallet in a desktop app: there is no MetaMask extension. Connect via
**WalletConnect v2** (QR / deep-link) or "open pixens.io in browser"
handoff. Same for any Electron app.

## Pixens Realms launch + signed link-token (NON-CHEAT)

Server authority is non-negotiable (CLAUDE.md / brains #154). The launcher
only DELIVERS an opaque code; the **server validates + decides**.

**Existing (Phase 0, mapped — do not reinvent):**
- Luanti server mod `E:\Opus\PixensRealms\mods\pixens_realms\bridge.lua`
  `M.do_link(name, code)` → POST `BRIDGE_URL/luanti/link {player, code}` →
  caches loadout in `mod_storage["loadout:"+player]`, applies skin/HUD.
- CF Worker `E:\Opus\PixensRealms\bridge\worker.js`: single
  `POST /luanti/link {player, code}`; code = tokenId 1–15000 →
  deterministic trait derivation. **No ownership check, no signature,
  no Supabase, no nonce.** Identity keyed by Luanti player name.
- In-game popup `branding.lua:287` (`pixens_realms:link`, field `pr_token`).
- `pixens.io/realms` does NOT exist yet; no link-code table/RPC.

**Hardened flow (DRAFTS prepared in `staging/`, NOT deployed — apply with
Grega when wiring end-to-end):**
1. Launcher renderer (authed + wallet, owns Pixen) → new Supabase RPC
   mints a short-lived row in `realms_link_codes` (code, wallet, pixen_id,
   expires_at, redeemed). Returns the code.
2. Launcher → `realms.launch(code)` → main writes `<realmsDir>/pixens_link.txt`
   then spawns `PixensRealms.exe`.
3. Game (CSM / branded `init.lua` extension) reads the code on join and
   submits it (existing `/link` path).
4. Worker `POST /luanti/link` is HARDENED: looks up the code in Supabase,
   checks TTL + not-redeemed + wallet still owns pixen_id, marks redeemed,
   then returns the loadout **+ Ed25519 signature**; the Luanti server
   verifies the signature before applying (tamper-proof, replay-proof).

Net: launcher = convenience delivery; **Supabase + worker + server =
authority**. No client/launcher can forge ownership or replay a code.

## Web games — fullscreen, shared session

`webGame.open('defense'|'arena')` opens a fullscreen `BrowserWindow` on
`pixens.io/td` / `/play` in `persist:pixens` (already logged in). Esc
closes → back to launcher library. External links → system browser.
Zero new game code — these ARE the existing pixens.io React app.

## Realms packaging + version/update manifest

The launcher is small; the Realms game (~40 MB, the `Pixens Realms`
bundle we built) is **downloaded on demand**, never bundled.

- Packaging script (prepared in `staging/`, draft): zip the verified
  `Pixens Realms` bundle → `realms-<ver>.zip` + `realms-latest.json`
  `{ version, url, sha256, size }`.
- Host: Cloudflare Pages/R2 under `pixens.io/launcher/realms/` (free).
- `realms.state()` compares `<realmsDir>/VERSION` to the manifest;
  `realms.installOrUpdate()` (added when host is live) downloads, verifies
  sha256, extracts to `userData/realms/`, writes VERSION.

## Launcher self-update

`electron-updater` (already a dep). `publish` in `electron-builder.yml`
= generic provider `https://pixens.io/launcher`. CI/script uploads the
NSIS + `latest.yml` there. `launcher.checkUpdate()` is wired; auto
download/install prompt added during integration.

## Branded installer

`npm run dist` → electron-builder NSIS. `productName: Pixens`,
`appId com.pixens.launcher`, icon `build/icon.ico` (the Pixen mascot),
desktop + start-menu shortcut "Pixens", ARP "Pixens". **No "Electron",
no "Luanti" anywhere** (same standard as the Realms client).

## UI integration (when Claude Design delivers)

The delivered React+Vite+TS+Tailwind folder becomes `src/renderer`.
Steps:
1. Drop their `src/` + assets into `src/renderer/` (keep `index.html`
   entry → `/src/main.tsx`; or adapt the entry path).
2. Merge their deps into `package.json`, `npm install`.
3. They code UI only; all OS actions go through `window.pixens.*`
   (typed via `src/preload/index.d.ts`).
4. Screens expected (per the brief): SETUP, LOGIN/ACCOUNT, GAMES LIBRARY
   (Realms Install/Update/Play · Defense/Arena Play), HOME/NEWS,
   WALLET/PICK-PIXEN, SETTINGS, UPDATE/PATCH; states loading/offline/
   update-required/error/logged-out. Brand: magenta `#ff1e85`, dark
   `#0b0618`, wordmark colors, Press Start 2P + VT323.
5. Auth = `@supabase/supabase-js` (same project) in the renderer; session
   auto-shared with web games via the partition.

## Brand assets — REAL only (locked)

Claude Design redraws the mascot + "PIXENS" wordmark — they are a
catastrophe. **NEVER ship Claude Design's drawn brand art.** After UI
integration, do a brand-asset pass:

- **Mascot** → swap every drawn/placeholder mascot for the canonical
  transparent PNG `src/renderer/src/assets/brand/pixens-mascot.png`
  (411×395 RGBA — the exact asset used for the rebranded `.exe` icon,
  the Realms menu bg, and pixens.io presale). Keep Claude Design's
  dimensions/positions; only swap the source so layout is unaffected
  and quality is real, not redrawn. (If Grega supplies a higher-res
  master, replace this file with it — same name.)
- **"PIXENS" wordmark** → use `<PixensWordmark>`
  (`src/renderer/src/components/PixensWordmark.tsx`): per-letter LOCKED
  hex P=#29ff7e I=#00f0ff X=#7dfcff E=#a855ff N=#c8a8ff S=#ff1e85 in
  Press Start 2P (matches pixens.io landing/topbar EXACTLY). Replace any
  rasterised/redrawn wordmark with this text component — crisp, exact,
  never an image.
- App/installer icon stays `build/icon.ico` (already the real mascot).
- Systematic, not whack-a-mole: grep the delivered UI for mascot/logo
  image refs + any "PIXENS" lettering, replace at the source.

## Status

- ✅ Scaffold builds clean (`electron-vite build`, main+preload+renderer).
- ✅ IPC contract defined + placeholder renderer proves the shell.
- ✅ Existing bridge/link architecture mapped (above).
- ⏳ DRAFTS to prepare in `staging/`: Realms packaging script + manifest;
  Supabase `realms_link_codes` migration; hardened worker `/luanti/link`
  + `/realms/link-code`; `bridge.lua`/CSM auto-link patch. **Not deployed
  — apply with Grega when wiring end-to-end (touches live infra).**
- ⏳ BLOCKED on Claude Design UI delivery for renderer integration.
- Open: code-signing cert (unsigned ⇒ SmartScreen warning) — later.
```
