# Pixens Launcher

Battle.net-style unified desktop launcher for **PIXENS** — one account, three games:

| Game            | Type             | How it runs                                                      |
| --------------- | ---------------- | ---------------------------------------------------------------- |
| Pixens Realms   | native (Luanti)  | Launcher downloads + spawns `PixensRealms.exe` with a verified link token |
| Pixens Defense  | web              | Fullscreen webview → `pixens.io/play`, shared pixens.io session  |
| Block Arena     | web              | Fullscreen webview → `pixens.io/play`, shared pixens.io session  |

Implements the "3 pillars / one NFT collection / one identity" vision in a single client (PIXENS Masterplan, Phase 7).

The launcher is open-sourced so anyone can audit exactly what runs on their machine and (when SignPath Foundation approves the project) so its release `.exe` can be signed with a free EV certificate for zero-warning installation on Windows 10 / 11.

---

## What's in this repo

- **`src/main/`** — Electron main process: windows, IPC, browser-handoff auth, Realms install/launch, auto-update.
- **`src/preload/`** — the `window.pixens` IPC bridge (only renderer⇄main contract).
- **`src/renderer/`** — React UI (HUB / GAMES / NEWS / SHOP).
- **`scripts/`** — build helpers (Realms repack).
- **`electron-builder.yml`** — NSIS installer config (one-click, perMachine, generic-feed auto-update).

What's **not** in this repo:
- The pixens.io frontend (separate codebase, hosted at https://pixens.io)
- The Pixens Realms server mods (separate repo)
- Smart contracts (already public on BSC)
- Any secrets — the only embedded key is the **public** Supabase anon key, which is gated server-side by RLS (same key ships in the pixens.io web bundle).

---

## Architecture (high level)

Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full handoff. TL;DR:

- **Auth** — system browser opens `pixens.io/launcher-link?code=<rand>`, user signs in there (MetaMask / Google / magic link), launcher polls Supabase pairing-code RPC, establishes the session in a hidden persistent `persist:pixens` partition. This partition is shared by both the launcher window and every embedded web-game window — one login covers everything.
- **Realms launch** — fetches the rebranded Luanti binary on first run, then spawns it via `--go --address --port --name --password` so the in-game main menu is bypassed entirely.
- **Web games** — open a fullscreen `BrowserWindow` against `pixens.io/play` with the same shared session.

---

## Build from source

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
npm install
npm run dev          # HMR dev shell
npm run build        # compile to ./out
npm run dist         # branded NSIS installer → ./dist/Pixens-Setup-<ver>.exe
```

Requires Node 18+ (tested on Node 22), npm 10+, Windows for `npm run dist` (NSIS target).

---

## Releases

Production installer is published to **https://pixens.io/launcher** (auto-update channel via `electron-updater`). Source for every release lives in this repo under the matching git tag.

Once SignPath Foundation approval lands, release `.exe` files will be **signed with a free EV certificate** courtesy of the SignPath Foundation Open Source Program. Until then the installer is unsigned; Windows SmartScreen may prompt "Windows protected your PC" — click **More info → Run anyway**. Users who prefer to skip that step can build their own signed copy from source.

---

## License

[MIT](./LICENSE) © Pixens. No copyleft inheritance from runtime dependencies.

---

## Security

Found a security issue? Please email security@pixens.io (or open a private GitHub Security Advisory). Do **not** open a public issue for sensitive disclosures.
