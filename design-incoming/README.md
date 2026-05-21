# PIXENS LAUNCHER

Battle.net-style desktop game launcher for Pixens — built in pure HTML/CSS/React (no build step).

Open `index.html` in any modern browser. The launcher auto-scales to fit your viewport.

---

## What's inside

A complete state-machine prototype that walks through every launcher state:

| Screen | What it does |
|---|---|
| **Installer** | Branded setup wizard: install location, EULA/LGPL agreement, install progress with live log, "welcome" finish screen |
| **Login / Sign-in** | Email + password, branded Google button, branded WalletConnect button, "remember me", forgot-password |
| **Create Account** | Username + email + password + confirm, password validation, TOS agreement, signup via Google/Wallet |
| **Hub / Game Detail** | Per-game hero with PLAY/INSTALL/UPDATE button, news carousel (auto-rotates), screenshot gallery, about + stats, friends sidebar, "your Pixen" card |
| **All Games** | Grid view with filters (All / Installed / Favorites / Free) |
| **Wallet / Pick Pixen** | WalletConnect QR + wallet picker modal, then grid of 12 Pixens by rarity (Common → Legendary) |
| **Settings** | 5 tabs: Game, Video, Audio, Account, Downloads & Storage |
| **Update / Patch** | 4-phase progress (Download → Verify → Install → Done) + full changelog |
| **Playing overlay** | Launch sequence + "game running in tray" state |
| **Error modal** | "Cannot reach Pixens network" with retry / solo-mode actions |

### Status banners (toggle via Tweaks)
- **Offline** mode (gray)
- **Update available** (cyan)
- **Update required** (red)

---

## Games

Three games in the library. Click any in the sidebar to open its detail page.

1. **Pixens Realms** — open-world voxel MMO, native client. Placeholder key art (label: "KEY ART · COMING SOON").
2. **Pixen Defense** — real-time PvP tower defense, web client. Uses your `pixen-defense-promo.png` and `S07-td-chaos.png`.
3. **Block Arena** — color-match puzzle PvP, web client. Uses your `block-arena-promo.png` and `S08-block-arena.png`. Flagged with an UPDATE badge.

---

## Brand system

- **Colors** — magenta `#ff1e85`, cyan `#41e6ff`, lime `#6cff5a`, yellow `#ffcc1a`, purple `#9d4eff`, on deep purple-black `#0b0618`
- **Type** — Press Start 2P (display/labels), VT323 (body/data/mono)
- **Texture** — CRT scanlines, bracket corner frames, pixel-art sprites, neon glow shadows
- **Logo** — your `pixens-logo.png` processed to transparent background with white eyes
- **Wordmark** — your `pixens x header.png` cropped to the multicolor "PIXENS" letters

---

## Tweaks panel

Click the floating handle in the bottom-right (or use the toolbar toggle) to open a Tweaks panel that lets you switch:

- **Screen** — installer · login · hub · all · settings · updating
- **Active game** — realms · defense · arena
- **Logged in / Wallet linked** — toggle to see the logged-out and unconnected states
- **Connectivity** — online · offline
- **App update** — none · available · required
- **Show error modal / wallet picker** — toggle overlays
- **CRT scanlines** — toggle the retro overlay

---

## File structure

```
index.html          ← entry point, loads fonts + scripts
styles.css          ← all brand tokens + component CSS
ui.jsx              ← shared components: TitleBar, TopBar, Sidebar, StatusBanner, Wordmark, sprites
screens.jsx         ← all screen components: Installer, Login (sign-in + sign-up), GameDetail, AllGames, Wallet, Settings, Update
app.jsx             ← main App + state machine + Tweaks panel wiring
tweaks-panel.jsx    ← reusable tweaks panel (host protocol + form controls)
assets/             ← processed brand assets (logo, wordmark, game promos, screenshots)
uploads/            ← your original source references (Battle.net refs + Pixens promos)
```

No build step, no bundler. Pure HTML loaded via `<script type="text/babel">` for instant edits.

---

## Notes

- **Original UI design** — uses standard game-launcher patterns (sidebar library + hero + news + friends panel) common to many launchers (Steam, Epic, GOG, Riot, Battle.net). The visual language, layout, type, and brand are all original Pixens, not a copy of any specific launcher's UI.
- **Pixens Realms hero is a placeholder** — replace with your key art when ready (drop the file into `assets/` and update `GAMES[0].hero` in `app.jsx`).
- **Friend avatars** — drawn as 8×8 pixel sprites via React (`PixenAvatar` in `ui.jsx`). Swap for real Pixen NFT thumbnails when available.

---

Built May 2026.
