# SignPath Foundation — Pixens Launcher application content

Drop-in copy/paste for the SignPath Foundation Open Source Program
application form at https://about.signpath.io/foundation/apply.
Saved here so the next chat / handoff session can pick this up
without re-deriving the wording.

---

## 1. Tagline (≤ 80 chars)

> Battle.net-style desktop launcher for the PIXENS gaming platform — one account, three games.

**Alt shorter (≤ 60 chars):**
> One desktop launcher for every PIXENS game.

---

## 2. Description

> Pixens Launcher is the open-source desktop client for **PIXENS** — a
> pixel-art Web3 gaming platform combining NFT identity with two
> arcade-style PvP games (Block Arena puzzle battler, Pixens Defense
> tower defense) and a persistent voxel world (Pixens Realms, built on
> the LGPL Luanti engine).
>
> The launcher gives players a single sign-in to all three games. One
> pixens.io account authenticates via browser-handoff (Supabase pairing
> code), then the Electron shell hosts: (a) Pixens Defense + Block Arena
> as fullscreen webviews against pixens.io (shared session partition so
> the login carries over), and (b) Pixens Realms as a native spawn of
> the rebranded Luanti game executable, handed an HMAC-signed link token
> that ties the in-game character to the player's PIXENS NFT.
>
> Built with Electron 33, electron-vite 2, electron-builder 25, React 18,
> and @supabase/supabase-js. The installer is a ~50 MB NSIS one-click
> per-machine bundle with auto-update via electron-updater. No bundled
> ffmpeg, no analytics SDK, no crash reporting service, no telemetry of
> any kind — gameplay recording is delegated to whatever the user already
> has (OBS, NVIDIA ShadowPlay, Win+G Game Bar, Discord).
>
> We're open-sourcing the launcher under MIT so any user can audit
> exactly what runs on their machine, and so SignPath Foundation can
> sign every release for zero-warning installation on Windows 10/11 —
> matching the same trust signal mainstream Web3 wallets (MetaMask,
> Rabby) already give users. PIXENS itself remains a commercial closed
> product; the launcher is just the door, and we believe the door should
> be transparent.

---

## 3. Reputation / Credibility

SignPath asks for "reputation" — typically expecting user counts, media
coverage, GitHub stars, etc. We are PRE-LAUNCH so framing is honest +
factual:

> **Project status (pre-launch).** PIXENS is in the late presale phase
> ahead of public launch later in 2026. We have:
>
> * **Live audited smart contracts on BNB Smart Chain mainnet (chain 56)**
>   — 8 contracts deployed including PixensGenesis (ERC-721 NFT
>   collection, EIP-2981 royalty), PixensPresale (Chainlink BNB/USD
>   oracle priced, BNB referral payouts), PixensMarketplace, PixensAuctions,
>   PixensPets, PixensEggs, PixensBreeding, PixensTournament. All
>   verified on BscScan; contract source in a sibling repository.
> * **Live game servers**: the Pixens Realms multiplayer server is
>   running on a Hetzner CPX32 instance with persistent world state; the
>   PvP authoritative server (Colyseus) is deployed on Fly.io. Both
>   have been online for weeks and are integration-tested daily.
> * **Live backend**: Supabase production database (`rfyitsmsryhtwmoknguh`,
>   EU west) with full row-level security, GDPR-compliant data handling
>   (see https://pixens.io/privacy section 12 for launcher-specific
>   handling), and dozens of security-definer RPCs powering account /
>   matchmaking / clans / marketplace / presale referrals.
> * **Active development**: the website (https://pixens.io) ships
>   updates daily (commits visible via the Cloudflare deploy log; the
>   launcher repo will show the same cadence). Two PvP games already
>   shipped + playable; the third (3v3 Pixen Arena) in active design.
> * **Real users**: ~30 distinct registered accounts in our pre-launch
>   alpha (small but real — we are not yet marketing). Players have
>   minted 7 Pixen NFTs + 1 Pet NFT on mainnet (small numbers because
>   the public mint hasn't opened yet — alpha testers + team only).
>   Public launch is scheduled to coincide with SignPath approval.
>
> **What we don't have yet**: media coverage, app store presence,
> >100 user installs. This is exactly why an unsigned launcher would
> hurt us — SmartScreen reputation requires download volume to clear,
> creating a chicken-and-egg problem. SignPath Foundation signing
> solves it cleanly: every user past day 1 has a clean install
> experience, the project graduates from pre-launch with the same
> trust signal mature projects enjoy.
>
> **Founder / maintainer**: Grega ([GitHub @arhitekt86](https://github.com/arhitekt86)),
> solo founder operating from Slovenia (EU). Reachable at
> support@pixens.io · Telegram https://t.me/playpixens.
>
> **Open source**: the launcher repository (this application) is
> 100% MIT licensed, complete source for every release tag. No closed
> binary blobs. No bundled telemetry or analytics SDKs. The HMAC-signed
> link-token flow that ties the launcher to our infrastructure is fully
> documented in the README and ARCHITECTURE.md. Audit-friendly by
> design.

---

## 4. Form-field cheatsheet

| Form field | Value |
|---|---|
| **Project name** | `Pixens Launcher` |
| **Repository URL** | `https://github.com/arhitekt86/pixens-launcher` |
| **Homepage URL** | `https://pixens.io` |
| **Privacy Policy URL** | `https://pixens.io/privacy` |
| **Terms of Use URL** | `https://pixens.io/terms` |
| **License** | `MIT` |
| **Primary maintainer** | Grega (@arhitekt86 on GitHub) |
| **Contact email** | `support@pixens.io` |
| **Tagline** | (from §1 above) |
| **Description** | (from §2 above) |
| **User base / reputation** | (from §3 above) |
| **Type of application** | Desktop application (Electron / Windows NSIS) |
| **Target platforms** | Windows 10 + 11 (x64) initially; macOS planned (no signing required there yet, separate Apple Developer enrollment) |
| **Why signing matters** | "Without an EV cert, every new installer triggers Windows SmartScreen 'Windows protected your PC' until enough users have run it for reputation to accumulate. For a pre-launch indie game project this is a 30-50% conversion-killer at the install step. SignPath Foundation signing removes that warning from day 1." |
| **Estimated release cadence** | 1-4 versioned releases per month during pre-launch + first months post-launch. Stable release every 4-8 weeks once mainline matures. |

---

## 5. Post-approval checklist (what we do once SignPath says yes)

1. Receive SignPath project credentials + GitHub App invite
2. Add `.github/workflows/signpath.yml` to the launcher repo (SignPath
   provides the template — uploads the unsigned `.exe` from a tag-build,
   downloads the signed `.exe` back, attaches to the GitHub Release)
3. Update `electron-builder.yml` `publish:` block to point at GitHub
   Releases (instead of generic url) so electron-updater fetches the
   SIGNED `.exe` from the tagged release asset
4. Cut a `v0.1.7` (or similar) test release, verify the auto-signed
   `.exe` installs on a fresh Windows 11 VM with ZERO SmartScreen
   warning, then promote to https://pixens.io/launcher (CF R2)
5. Add SignPath badge to README

---

## 6. Open questions for SignPath review (if asked)

- **Project age**: repository public from 2026-05-22 (today). Code is
  ~6 months old internally; we open-sourced specifically to apply.
- **Verifiable identity**: we're happy to verify via any of: GitHub
  account ownership, domain DNS TXT record on pixens.io, signed
  message from a smart-contract owner address on BSC (the
  PixensGenesis contract deployer wallet is the same person filing
  this application).
- **Funding**: founder-funded pre-launch + a small token presale on
  BNB Smart Chain. No VC, no equity-investor pressure that could
  conflict with open-source ethics.
