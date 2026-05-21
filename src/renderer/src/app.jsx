// app.jsx — Pixens Launcher main app shell + state machine
// (useState/useEffect/useMemo come from ui.jsx's React destructure)

// ── Tweakable defaults (host can rewrite this block) ──
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "screen": "installer",
  "connectivity": "online",
  "appUpdate": "none",
  "selectedGame": "realms",
  "loggedIn": false,
  "walletLinked": false,
  "showError": false,
  "showWallet": false,
  "scanlines": true,
  "accent": "magenta"
}/*EDITMODE-END*/;

// ── Game catalog ─────────────────────────────────────────────
const GAMES = [
  {
    id: "realms",
    name: "Pixens Realms",
    titleParts: [
      { t: "PIXENS ",  cls: "a" },
      { t: "REALMS",   cls: "b" },
    ],
    tagline: "OPEN-WORLD VOXEL MMO · NATIVE",
    tagColor: "magenta",
    kind: "OPEN-WORLD MMO",
    desc: "Voxel realms, on-chain plots, real-time pixen battles.",
    longDesc: "A persistent open-world built on the Luanti engine, rebranded and extended for Pixens. Claim land, raise pixens, raid rival guilds. Your wallet is your inventory — every weapon, mount and plot is a Pixens asset. Native client for max framerate.",
    status: "installed",     // installed | install | update | playing
    version: "1.4.2",
    nextVersion: "1.5.0",
    size: "2.4 GB",
    platforms: ["WIN", "MAC", "LINUX"],
    placeholder: true, // sidebar shows P·R tile
    icon: "assets/pixens-realms.png",
    cover: "assets/pixens-realms.png",
    hero: "assets/pixens-realms.png",
    gallery: [],
    stats: [
      { label:"GENRE", value:"OPEN-WORLD MMO" },
      { label:"PLAYERS", value:"4,217", color:"var(--pix-lime)" },
      { label:"YOUR LV", value:"24" },
      { label:"PLAYTIME", value:"58h" },
    ],
  },
  {
    id: "defense",
    name: "Pixen Defense",
    titleParts: [
      { t: "PIXEN ",   cls: "b" },
      { t: "DEFENSE",  cls: "b" },
    ],
    tagline: "REAL-TIME PVP TOWER DEFENSE",
    tagColor: "cyan",
    kind: "TOWER DEFENSE PVP",
    desc: "Build towers, deploy drones, defend the lane.",
    longDesc: "Real-time PvP across 10 maps. Same NFT, different battlefield — your Pixen brings its kit and signature spell into the lane. Always-latest webview build — no install, no update.",
    status: "installed",
    version: "0.9.7",
    nextVersion: "0.9.7",
    size: "WEB",
    platforms: ["WEB", "WIN", "MAC"],
    icon: "assets/pixen-defense-promo.png",
    cover: "assets/pixen-defense-promo.png",
    hero: "assets/pixen-defense-promo.png",
    gallery: [
      "assets/pixen-defense-gameplay.png",
      "assets/pixen-defense-promo.png",
      "assets/pixen-defense-gameplay.png",
    ],
    stats: [
      { label:"GENRE", value:"TD · PVP" },
      { label:"PLAYERS", value:"892", color:"var(--pix-lime)" },
      { label:"YOUR MMR", value:"1000", color:"var(--pix-cyan)" },
      { label:"MAPS", value:"10" },
    ],
  },
  {
    id: "arena",
    name: "Block Arena",
    titleParts: [
      { t: "BLOCK ",   cls: "a" },
      { t: "ARENA",    cls: "a" },
    ],
    tagline: "COLOR-MATCH PUZZLE PVP",
    tagColor: "magenta",
    kind: "PUZZLE PVP",
    desc: "Chain 4-of-a-color combos, send garbage to crush your rival.",
    longDesc: "Chain 4-of-a-color combos, send garbage to crush your rival. Your NFT brings their kit and signature spell into the well. Always-latest webview — instant matchmaking, no install.",
    status: "update",
    version: "1.2.1",
    nextVersion: "1.3.0",
    size: "WEB",
    platforms: ["WEB", "WIN", "MAC"],
    icon: "assets/block-arena-promo.png",
    cover: "assets/block-arena-promo.png",
    hero: "assets/block-arena-promo.png",
    gallery: [
      "assets/block-arena-gameplay.png",
      "assets/block-arena-promo.png",
      "assets/block-arena-gameplay.png",
    ],
    stats: [
      { label:"GENRE", value:"PUZZLE PVP" },
      { label:"PLAYERS", value:"1,346", color:"var(--pix-lime)" },
      { label:"YOUR MMR", value:"976", color:"var(--pix-magenta)" },
      { label:"SEASON", value:"S4 · NEON" },
    ],
    hasUpdate: true,
  },
];

const NEWS = {
  realms: [
    { date:"MAY 16 · TODAY", tag:"PATCH 1.5.0", tagColor:"magenta", sprite:"#ff1e85",
      title:"REALMS 1.5 · GUILD WARS OPEN BETA",
      body:"32-guild bracket goes live next week. New territory mechanics, raid bosses, and on-chain treasury splits — everything you've been asking for since v1.0." },
    { date:"MAY 12", tag:"DEVLOG", tagColor:"cyan", sprite:"#41e6ff",
      title:"BEHIND THE VOXELS · ENGINE NOTES",
      body:"How we rebuilt the Luanti renderer to push 120fps with full glow at 4K. A deep technical dive from the engine team." },
    { date:"MAY 09", tag:"COMMUNITY", tagColor:"lime", sprite:"#6cff5a",
      title:"BUILD CONTEST · WINNERS",
      body:"The top 8 player-built realms from April. NEON PALACE clears all challengers — congrats @glitchkid." },
  ],
  defense: [
    { date:"MAY 14", tag:"SEASON 4", tagColor:"cyan", thumb: "assets/pixen-defense-gameplay.png",
      title:"DEFENDERS OPEN · SEASON 4 LIVE",
      body:"Ranked queue resets. New hero pixen WARMEC joins the roster. Top 100 earn the NEXUS CORE frame and exclusive base skin." },
    { date:"MAY 10", tag:"PATCH 0.9.7", tagColor:"magenta", sprite:"#ff1e85",
      title:"PATCH 0.9.7 · BALANCE PASS",
      body:"Tesla tower DPS −8%, Orbital splash radius +12%. Read full notes for all the math." },
    { date:"MAY 05", tag:"ESPORTS", tagColor:"yellow", sprite:"#ffcc1a",
      title:"NEXUS CUP · 32-PLAYER BRACKET",
      body:"Weekly cup auto-bracket. 250 BNB prize pool. Sign-ups open in launcher." },
  ],
  arena: [
    { date:"MAY 15", tag:"PATCH 1.3", tagColor:"magenta", thumb: "assets/block-arena-promo.png",
      title:"NEON CUP · NEW SPELLS DROP",
      body:"GARBAGE FREEZE, SCREEN WIPE and BYTEMITE all rebalanced. New hold piece UI, smoother chain previews, B2B multiplier rework." },
    { date:"MAY 11", tag:"COMMUNITY", tagColor:"cyan", sprite:"#41e6ff",
      title:"CHAIN OF THE WEEK · 14-CHAIN",
      body:"@nft-1 lands a 14-chain in ranked finals — watch the clip and grab the loadout." },
    { date:"MAY 06", tag:"DEVLOG", tagColor:"purple", sprite:"#9d4eff",
      title:"WHY YOUR PIXEN MATTERS",
      body:"How a Pixen's trait slots map to in-game spells. Worked example with three different builds." },
  ],
  all: [
    { date:"MAY 16", tag:"FEATURED", tagColor:"magenta", sprite:"#ff1e85",
      title:"REALMS 1.5 · GUILD WARS OPEN BETA",
      body:"32-guild bracket goes live next week. Sign your guild up from the launcher." },
    { date:"MAY 15", tag:"PATCH", tagColor:"cyan", thumb:"assets/block-arena-promo.png",
      title:"BLOCK ARENA · NEON CUP",
      body:"New season, new spells. Queue is live." },
    { date:"MAY 14", tag:"SEASON 4", tagColor:"yellow", thumb:"assets/pixen-defense-gameplay.png",
      title:"DEFENDERS OPEN · S4 LIVE",
      body:"Pixen Defense season reset. Climb to legend." },
  ],
};

// Aggregated feed for the NEWS tab (per-game lists, newest-first each).
const ALL_NEWS = [...NEWS.realms, ...NEWS.defense, ...NEWS.arena];

const FRIENDS = [
  { name:"glitchkid",    status:"In Pixens Realms — Neon Palace", online:true,  bg:"#5a0a45", seed:0 },
  { name:"nft_1",        status:"In Block Arena · ranked",        online:true,  bg:"#0a4e5e", seed:1 },
  { name:"ai_pixel",     status:"In Pixen Defense · queue",       online:true,  bg:"#14501a", seed:2 },
  { name:"warmec",       status:"In Pixens Realms — Guild raid",  online:true,  bg:"#5e4806", seed:3 },
  { name:"voxelmum",     status:"Online",                         online:true,  bg:"#3a0f6a", seed:4 },
  { name:"bytemite",     status:"Online · Launcher",              online:true,  bg:"#5a2806", seed:5 },
  { name:"prism",        status:"Last seen 2h ago",                online:false, bg:"#3a0f6a", seed:0 },
  { name:"warden",       status:"Last seen yesterday",             online:false, bg:"#1a0612", seed:1 },
  { name:"chunkers",     status:"Offline",                         online:false, bg:"#06212a", seed:2 },
];

// ════════════════════════════════════════════════════════════════════
// CHAT RAIL — persistent right rail, real pixens.io chat (shared session)
// ════════════════════════════════════════════════════════════════════
function ChatRail({ ready }) {
  return (
    <aside className="chat-rail">
      <div className="chat-rail-hd">
        <span className="chat-rail-dot" />
        CHAT
      </div>
      {/* C2 — the REAL desktop chat (ChatOverlay), not the mobile
          /social guild page. /chat-embed mounts ONLY that panel,
          full-fill, no shell/footer/mobile. Shared persist:pixens
          session = same login as the games. The webview is created
          ONLY after MAIN has (re)written a FRESH session into
          persist:pixens (auth.ensureSession) — else it loads
          unauthenticated → GUEST + dropped messages. */}
      {ready ? (
        <webview
          src="https://pixens.io/chat-embed"
          partition="persist:pixens"
          allowpopups="true"
          style={{ flex: 1, width: "100%", border: 0, background: "var(--pix-bg)" }}
        />
      ) : (
        <div style={{
          flex: 1, display: "grid", placeItems: "center",
          color: "var(--pix-ink-4)", fontSize: 13, background: "var(--pix-bg)",
        }}>
          connecting chat…
        </div>
      )}
    </aside>
  );
}

// ════════════════════════════════════════════════════════════════════
// AUTH GATE — step 1: the launcher account IS the pixens.io Supabase
// session. We embed the dedicated pixens.io /launcher-auth route on the
// shared persist:pixens partition (NOT a native form: localStorage is
// origin-scoped, so a supabase-js session in the launcher's own origin
// would NOT be shared with the pixens.io game webviews — auth must run
// under the https://pixens.io origin to be reused everywhere). The page
// encodes auth state in document.title ("PIXENS_AUTH|out" /
// "PIXENS_AUTH|ok|<addr>"); we advance to the hub on "ok". Replaces the
// old mock <LoginScreen>.
// ════════════════════════════════════════════════════════════════════
// R41.1 — BROWSER-HANDOFF sign-in (Grega's call; replaces the embedded
// <webview> that could never complete MetaMask / magic-link / Google).
// ONE button → main opens the SYSTEM browser (pixens.io/launcher-link),
// user signs in there with ANY method (or is already logged in →
// instant), the session is handed back over a localhost loopback and
// established in persist:pixens. We just await window.pixens.auth.signIn().
const PX_WM = [["P","#29ff7e"],["I","#00f0ff"],["X","#7dfcff"],["E","#a855ff"],["N","#c8a8ff"],["S","#ff1e85"]];
function AuthGate({ onAuthed }) {
  const [phase, setPhase] = useState("idle"); // idle | waiting | error
  const [err, setErr] = useState("");
  const doneRef = useRef(false);

  const signIn = async () => {
    if (phase === "waiting") return;
    setErr(""); setPhase("waiting");
    try {
      const r = await window.pixens?.auth?.signIn();
      if (r && r.ok) {
        if (doneRef.current) return;
        doneRef.current = true;
        onAuthed({ method: "pixens", name: "PIXENS", level: 1, address: "" });
      } else {
        const code = (r && r.error) || "UNKNOWN";
        setErr(code === "TIMEOUT"
          ? "Sign-in timed out. Click SIGN IN and finish it in your browser."
          : "Sign-in didn't complete (" + code + "). Try again.");
        setPhase("error");
      }
    } catch (e) {
      setErr("Couldn't start sign-in. Restart the launcher and try again.");
      setPhase("error");
    }
  };

  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, top: "var(--titlebar-h, 32px)",
      display: "grid", placeItems: "center", zIndex: 20,
      background: "radial-gradient(circle at 78% 22%, rgba(255,30,133,.18), transparent 45%), radial-gradient(circle at 18% 78%, rgba(65,230,255,.12), transparent 48%), var(--pix-bg, #0a0912)" }}>
      <div style={{ width: "min(440px,86%)", padding: "40px 34px", textAlign: "center",
        background: "linear-gradient(180deg, rgba(40,22,80,.34), rgba(18,10,38,.9))",
        border: "1px solid #2c1448", borderRadius: 14,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.06), 0 18px 50px rgba(0,0,0,.55)" }}>
        <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 28, letterSpacing: 3, marginBottom: 18, whiteSpace: "nowrap" }}>
          {PX_WM.map(([c, col]) => <span key={c} style={{ color: col }}>{c}</span>)}
        </div>
        <div style={{ fontFamily: "'VT323',monospace", fontSize: 19, color: "#cdb8ec", lineHeight: 1.5, marginBottom: 24 }}>
          One account — your games, wallet, friends &amp; chat, everywhere.
        </div>

        {phase !== "waiting" && (
          <button onClick={signIn} style={{ width: "100%", padding: "16px",
            fontFamily: "'Press Start 2P',monospace", fontSize: 13, color: "#fff",
            border: "2px solid #ff5ea8", borderRadius: 8, cursor: "pointer",
            background: "linear-gradient(180deg,#ff2e93,#b83cc9)",
            boxShadow: "0 0 24px rgba(255,30,133,.45), 0 4px 0 #5a042e" }}>
            SIGN IN
          </button>
        )}

        {phase === "waiting" && (
          <div style={{ fontFamily: "'VT323',monospace", fontSize: 18, color: "#cdb8ec", lineHeight: 1.5 }}>
            Opened your browser — sign in there (email link, wallet or
            Google all work). This screen continues automatically when
            you're done.
            <div style={{ marginTop: 16 }}>
              <button onClick={() => { setPhase("idle"); }} style={{ background: "transparent",
                border: "1px solid #3a2a55", color: "#9d8fc4", fontFamily: "'Press Start 2P',monospace",
                fontSize: 9, padding: "9px 14px", borderRadius: 6, cursor: "pointer" }}>
                CANCEL
              </button>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div style={{ fontFamily: "'VT323',monospace", fontSize: 16, color: "#ff9ec2", marginTop: 16, lineHeight: 1.5 }}>
            {err}
          </div>
        )}

        <div style={{ fontFamily: "'VT323',monospace", fontSize: 14, color: "#6b5d92", marginTop: 22, lineHeight: 1.45 }}>
          Sign-in opens in your normal browser so every method works.
          Already logged in on pixens.io? It's instant.
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // local UI state
  const [activeGame, setActiveGame] = useState(t.selectedGame);
  // prod: start at login (the NSIS step already installed — no in-app
  // "second installer"); dev: honor the Tweaks default so the InstallerWindow
  // design is still previewable.
  const [view, setView] = useState(import.meta.env.DEV ? t.screen : 'login');
  const [activeNav, setActiveNav] = useState("games");
  const [walletOpen, setWalletOpen] = useState(t.showWallet);
  const [errorOpen, setErrorOpen] = useState(t.showError);
  const [playingGame, setPlayingGame] = useState(null);
  const [realmsLaunch, setRealmsLaunch] = useState(null); // null=launching {ok}|{ok:false,error}

  // sync tweak ↔ local state — DEV ONLY. The Tweaks panel is dev-only; in
  // production the app is driven by real handlers, never the prototype state.
  useEffect(() => { if (import.meta.env.DEV) setView(t.screen); }, [t.screen]);
  useEffect(() => { if (import.meta.env.DEV) setActiveGame(t.selectedGame); }, [t.selectedGame]);
  useEffect(() => { if (import.meta.env.DEV) setWalletOpen(t.showWallet); }, [t.showWallet]);
  useEffect(() => { if (import.meta.env.DEV) setErrorOpen(t.showError); }, [t.showError]);

  // ── REAL account data (R41.1) ──
  // main keeps a hidden persist:pixens window on pixens.io/launcher-profile
  // (the site's own identity + progress hydration) and returns the
  // canonical profile. The hub/TopBar/GameDetail consume THIS — never
  // mock. Re-poll every 60s so the live players-online count stays fresh.
  // Keyed off t.loggedIn (a plain const here, set true by finishLogin) so
  // the hook sits BEFORE the early returns (no hooks-order violation).
  const [profile, setProfile] = useState(null);
  const [chatReady, setChatReady] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Battle.net-style launcher self-update. main pushes
  // { state:'downloading', percent } → { state:'ready', version }.
  // Login is preserved across the update (userData/persist:pixens
  // untouched) — one click restarts into the new version.
  const [upd, setUpd] = useState(null);
  useEffect(() => {
    try {
      return window.pixens && window.pixens.launcher && window.pixens.launcher.onUpdate
        && window.pixens.launcher.onUpdate((p) => setUpd(p));
    } catch (_) { /* not in launcher */ }
  }, []);
  useEffect(() => {
    if (!t.loggedIn) { setProfile(null); setChatReady(false); return; }
    let alive = true;
    // (Re)establish the persist:pixens session in MAIN with FRESH
    // tokens BEFORE the chat-embed webview mounts — not only right
    // after an explicit sign-in. Without this a relaunch leaves the hub
    // chat unauthenticated (GUEST) and the 0048 guest-guard silently
    // drops every message (vanishes on reopen, never reaches
    // pixens.io). ChatRail mounts ONLY after this resolves so its
    // webview reads a valid session at load (a separate webview context
    // never gets onAuthStateChange from MAIN's hidden session window).
    setChatReady(false);
    try {
      Promise.resolve(
        window.pixens && window.pixens.auth && window.pixens.auth.ensureSession
          ? window.pixens.auth.ensureSession() : { ok: true })
        .then(() => { if (alive) setChatReady(true); })
        .catch(() => { if (alive) setChatReady(true); }); // degrade: show chat anyway
    } catch (_) { if (alive) setChatReady(true); }
    const fetchProfile = () => {
      try {
        Promise.resolve(window.pixens && window.pixens.account && window.pixens.account.profile())
          .then((p) => { if (alive && p && typeof p === "object") setProfile(p); })
          .catch(() => {});
      } catch (_) { /* IPC unavailable (e.g. web preview) — stay null */ }
    };
    fetchProfile();
    const iv = setInterval(fetchProfile, 60000);
    return () => { alive = false; clearInterval(iv); };
  }, [t.loggedIn]);

  // ── Pixens Realms install/update state (R41.1 — B) ──
  // realms.state() = { installed, version, latest, needsUpdate }. The
  // launcher downloads the verified client from the CF-hosted manifest
  // on demand (never bundled). Drives the real INSTALL/UPDATE/PLAY CTA.
  const [realmsState, setRealmsState] = useState(null);
  const [installErr, setInstallErr] = useState("");
  const refreshRealms = () => {
    try {
      Promise.resolve(window.pixens && window.pixens.realms && window.pixens.realms.state())
        .then((s) => { if (s && typeof s === "object") setRealmsState(s); })
        .catch(() => {});
    } catch (_) { /* IPC unavailable (web preview) — leave null */ }
  };
  useEffect(() => { refreshRealms(); }, []);

  // Real per-game status: Realms reflects the actual install state; web
  // games are always-latest (no install). gamesView replaces the static
  // GAMES status everywhere it's rendered (Sidebar / hub / All Games).
  const gamesView = useMemo(() => GAMES.map(g => {
    if (g.id === "realms" && realmsState) {
      const status = !realmsState.installed ? "install"
        : realmsState.needsUpdate ? "update" : "installed";
      return {
        ...g, status,
        version: realmsState.version || g.version,
        nextVersion: realmsState.latest || g.nextVersion,
        sizeMB: realmsState.sizeMB || null,
        size: realmsState.sizeMB ? `${realmsState.sizeMB} MB` : "WEB",
      };
    }
    return g;
  }), [realmsState]);

  const game = useMemo(() => gamesView.find(g => g.id === activeGame) || gamesView[0], [activeGame, gamesView]);
  const news = NEWS[activeGame] || NEWS.all;

  // Download + verify + extract the Realms client (main does the work +
  // sha256 check). Honest: success → installed (PLAY launches the exe);
  // failure → stays INSTALL with a visible reason, retryable. No fake.
  const runRealmsInstall = () => {
    setInstallErr("");
    setView("updating"); setTweak("screen", "updating");
    try {
      Promise.resolve(window.pixens && window.pixens.realms && window.pixens.realms.installOrUpdate())
        .then((r) => {
          refreshRealms();
          setView("hub"); setTweak("screen", "hub");
          if (!r || r.ok === false) {
            setInstallErr("Couldn't install Pixens Realms" + (r && r.error ? " (" + r.error + ")" : "") + ". Try again.");
          }
        })
        .catch(() => {
          refreshRealms();
          setView("hub"); setTweak("screen", "hub");
          setInstallErr("Couldn't install Pixens Realms (IPC_ERROR). Try again.");
        });
    } catch (_) {
      setView("hub"); setTweak("screen", "hub");
      setInstallErr("Couldn't install Pixens Realms (NO_IPC). Try again.");
    }
  };

  const handleNav = (id) => {
    // SHOP opens pixens.io/shop in the user's normal browser (not embedded)
    if (id === "shop") { window.pixens && window.pixens.app.openExternal("shop"); return; }
    if (id === "news")  { setView("news"); setActiveNav("news"); return; }
    if (id === "games") { setView("hub");  setActiveNav("games"); return; }
    setActiveNav(id);
  };
  const handlePickGame = (id) => {
    setActiveGame(id);
    setTweak("selectedGame", id);
    if (view !== "hub" && view !== "all") {
      setView("hub"); setTweak("screen", "hub");
    } else {
      setView("hub"); setTweak("screen", "hub");
    }
  };
  const handleAll = () => { setView("all"); setTweak("screen", "all"); setActiveGame("all"); };

  const handlePlay = (g) => {
    if (g.id === "realms") {
      // Not installed yet → run the real install instead of launching
      // a missing exe (defensive — the CTA label already routes here).
      if (realmsState && !realmsState.installed) { runRealmsInstall(); return; }
      setPlayingGame(g);
      // #2 NFT-gate (Q3 LOCKED): Realms requires a Pixen. Fast-path the
      // mint-to-play screen when we already know the account owns 0
      // (the bridge+MAIN enforce it regardless). MAIN now resolves the
      // ownership-verified SIGNED token itself (it holds the session) —
      // the renderer no longer passes a code.
      if (profile && profile.loggedIn && profile.ownedCount === 0) {
        setRealmsLaunch({ ok: false, error: "NO_PIXEN" });
        return;
      }
      setRealmsLaunch(null);
      try {
        Promise.resolve(window.pixens && window.pixens.realms.launch())
          .then((r) => setRealmsLaunch(r || { ok: false, error: "NO_IPC" }))
          .catch(() => setRealmsLaunch({ ok: false, error: "IPC_ERROR" }));
      } catch (_) { setRealmsLaunch({ ok: false, error: "IPC_ERROR" }); }
    } else if (g.id === "defense" || g.id === "arena") {
      window.pixens && window.pixens.webGame.open(g.id); // fullscreen, shared pixens.io session
    } else {
      setPlayingGame(g);
    }
  };
  const handleInstall = (g) => { if (g.id === "realms") { runRealmsInstall(); return; } setView("updating"); setTweak("screen","updating"); };
  const handleUpdate = (g) => { if (g.id === "realms") { runRealmsInstall(); return; } setView("updating"); setTweak("screen","updating"); };

  const finishInstall = () => { setView("login"); setTweak("screen", "login"); };
  const finishLogin = (u) => {
    setTweak("loggedIn", true);
    setView("hub"); setTweak("screen", "hub");
  };
  const logout = () => {
    setTweak("loggedIn", false);
    setView("login"); setTweak("screen", "login");
  };

  // installer is a totally different chrome
  if (view === "installer") {
    return (
      <div className="stage" style={{background:"#050310"}}>
        <InstallerWindow onFinish={finishInstall} />
        <PixensTweaks t={t} setTweak={setTweak} />
      </div>
    );
  }

  // running a "playing" overlay
  if (playingGame) {
    return (
      <div className="stage">
        <div className="app">
          {/* R41.1 — TitleBar here too so minimize/close always work
              (this screen had NO window controls — Grega). */}
          <TitleBar subtitle="PLAYING" />
          <PlayingOverlay
            game={playingGame}
            result={playingGame.id === "realms" ? realmsLaunch : { ok: true }}
            onClose={() => { setPlayingGame(null); setRealmsLaunch(null); }}
          />
        </div>
        <PixensTweaks t={t} setTweak={setTweak} />
      </div>
    );
  }

  // Login is also full-bleed but inside app chrome
  const loggedIn = t.loggedIn;
  const showStatusBanner = t.connectivity === "offline" || t.appUpdate !== "none";

  return (
    <div className="stage">
      <div className="app">
        {t.scanlines && <div className="scanlines" style={{zIndex: 8, opacity:.22}} />}
        {upd && <LauncherUpdateBar upd={upd} />}
        <TitleBar subtitle={view === "settings" ? "SETTINGS" : view === "news" ? "NEWS" : view === "updating" ? "UPDATING" : view === "all" ? "ALL GAMES" : (loggedIn ? game.name?.toUpperCase() : "SIGN IN")} />

        {/* Login takes the full body (no topbar/sidebar). Step 1: the
            real pixens.io auth webview (shared persist:pixens session),
            not the old mock LoginScreen. */}
        {!loggedIn ? (
          <AuthGate onAuthed={finishLogin} />
        ) : (
          <>
            <TopBar
              activeNav={activeNav}
              onNav={handleNav}
              loggedIn={loggedIn}
              user={profile}
              onLogout={logout}
              onAvatar={() => { setView("settings"); setTweak("screen", "settings"); }}
            />
            <div className="body">
              <Sidebar
                games={gamesView}
                activeGameId={activeGame}
                onPick={handlePickGame}
                onAll={handleAll}
                onSettings={() => { setView("settings"); setTweak("screen", "settings"); }}
                onLogout={logout}
              />
              <div className="main">
                {t.connectivity === "offline" && (
                  <StatusBanner kind="offline" msg="OFFLINE — playing in solo mode. PvP &amp; queue disabled." action="RETRY" onAction={()=>setTweak("connectivity","online")} />
                )}
                {t.connectivity === "online" && t.appUpdate === "available" && (
                  <StatusBanner kind="update" msg="A LAUNCHER UPDATE IS AVAILABLE · v1.0.5" action="UPDATE NOW" onAction={()=>setTweak("appUpdate","required")} />
                )}
                {t.connectivity === "online" && t.appUpdate === "required" && (
                  <StatusBanner kind="error" msg="LAUNCHER UPDATE REQUIRED TO CONTINUE · v1.0.5" action="RESTART" onAction={()=>setTweak("appUpdate","none")} />
                )}
                {/* PRESALE promo — opens pixens.io/presale in the system browser
                    (conversion-critical money flow; wallet lives there). Remove
                    this one line when the presale ends. */}
                <StatusBanner kind="update" msg="PIXENS PRESALE IS LIVE — limited Genesis allocation" action="OPEN PRESALE" onAction={()=> window.pixens && window.pixens.app.openExternal("presale")} />
                {installErr && (
                  <StatusBanner kind="error" msg={installErr} action="RETRY" onAction={() => runRealmsInstall()} />
                )}


                {view === "hub" && (
                  <GameDetail
                    game={game}
                    profile={profile}
                    friends={FRIENDS}
                    news={news}
                    onPlay={handlePlay}
                    onInstall={handleInstall}
                    onUpdate={handleUpdate}
                    onWallet={() => setWalletOpen(true)}
                    onChangePixen={() => setPickerOpen(true)}
                  />
                )}
                {view === "all" && (
                  <AllGames games={gamesView} onPick={handlePickGame} />
                )}
                {view === "settings" && (
                  <SettingsScreen onClose={()=>{ setView("hub"); setTweak("screen", "hub"); }} onLogout={logout} />
                )}
                {view === "updating" && (
                  <UpdateScreen game={game} onClose={()=>{ setView("hub"); setTweak("screen", "hub"); }} />
                )}
                {view === "news" && (
                  <NewsScreen news={ALL_NEWS} />
                )}
              </div>
              {/* Persistent chat rail — always on the right, full height,
                  the real pixens.io chat (shared session). */}
              <ChatRail ready={chatReady} />
            </div>
          </>
        )}

        {walletOpen && (
          <WalletScreen
            walletConnected={t.walletLinked}
            onClose={()=>{ setWalletOpen(false); setTweak("showWallet", false); }}
            onPick={(id)=>{ setTweak("walletLinked", true); setWalletOpen(false); setTweak("showWallet", false); }}
          />
        )}

        {errorOpen && (
          <ErrorModal onClose={()=>{ setErrorOpen(false); setTweak("showError", false); }} />
        )}

        {pickerOpen && (
          <PixenPickerModal
            profile={profile}
            onClose={() => setPickerOpen(false)}
            onPick={(id) => {
              try {
                Promise.resolve(window.pixens && window.pixens.account && window.pixens.account.setFeatured(id))
                  .then((p) => { if (p && typeof p === "object") setProfile(p); })
                  .catch(() => {})
                  .finally(() => setPickerOpen(false));
              } catch (_) { setPickerOpen(false); }
            }}
          />
        )}
      </div>
      <PixensTweaks t={t} setTweak={setTweak} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// PLAYING OVERLAY — when user hits PLAY
// ════════════════════════════════════════════════════════════════════
function PlayingOverlay({ game, result, onClose }) {
  const [stage, setStage] = useState("launch"); // non-realms: launch | running
  const [dots, setDots] = useState(0);
  const isRealms = game.id === "realms";

  useEffect(() => {
    const d = setInterval(() => setDots(x => (x+1)%4), 400);
    // Realms is driven by the REAL launch result (prop), not a fake
    // timer. Only non-realms keep the timed launch→running info screen.
    const t = isRealms ? null : setTimeout(() => setStage("running"), 2400);
    return () => { clearInterval(d); if (t) clearTimeout(t); };
  }, [isRealms]);

  // mode: launch | running | error
  const mode = (result && result.ok === false)
    ? "error"
    : isRealms
      ? (result && result.ok ? "running" : "launch")
      : stage;
  const noPixen = result && result.error === "NO_PIXEN";
  const errMsg = result && result.error === "NOT_INSTALLED"
    ? "Pixens Realms isn't installed on this PC yet. (The in-launcher installer is the next step — it's not built yet.)"
    : noPixen
      ? "Pixens Realms requires a Pixen NFT — it's your character + identity here. Mint your Pixen on pixens.io to enter the realm. (Block Arena & Pixen Defense stay free to play without one.)"
      : `Couldn't start Pixens Realms${result && result.error ? " (" + result.error + ")" : ""}.`;

  return (
    <div style={{
      position:"absolute", left:0, right:0, bottom:0, top:"var(--titlebar-h, 32px)", zIndex: 100,
      background:
        "radial-gradient(circle at 50% 40%, #2a0a55 0%, #06031a 70%)," +
        "var(--pix-bg)",
      display:"grid", placeItems:"center",
    }}>
      <div className="scanlines" style={{opacity:.25}} />

      {mode === "error" && (
        <div style={{textAlign:"center", maxWidth: 480, padding: "0 20px"}}>
          <div className="eyebrow magenta" style={{marginBottom: 12, color: noPixen ? "var(--pix-magenta)" : "var(--pix-red,#ff5ea8)"}}><span className="dot" />{noPixen ? "PIXEN REQUIRED" : "CAN'T START"}</div>
          <h1 className="pix" style={{fontSize: 22, letterSpacing:".06em", marginBottom: 14, lineHeight:1.15}}>
            {game.titleParts.map((p, i) => <span key={i} className={p.cls}>{p.t}</span>)}
          </h1>
          <div className="mono" style={{fontSize: 16, color:"var(--pix-ink-2)", marginBottom: 26, lineHeight:1.5}}>
            {errMsg}
          </div>
          <div style={{display:"flex", gap:12, justifyContent:"center"}}>
            {noPixen && (
              <button className="btn magenta" onClick={() => window.pixens && window.pixens.app.openExternal("shop")}>
                ▸ MINT YOUR PIXEN
              </button>
            )}
            <button className="btn cyan" onClick={onClose}>◂ BACK TO LAUNCHER</button>
          </div>
        </div>
      )}

      {mode === "launch" && (
        <div style={{textAlign:"center"}}>
          <img src="assets/pixens-logo.png" alt="" style={{
            width: 120, height: 120, imageRendering:"pixelated",
            filter:"drop-shadow(0 0 30px rgba(255,30,133,.75))",
            marginBottom: 20,
          }} />
          <div className="eyebrow magenta" style={{marginBottom: 12}}><span className="dot" />LAUNCHING</div>
          <h1 className="pix" style={{fontSize: 28, letterSpacing:".08em", marginBottom: 18, lineHeight:1.1}}>
            {game.titleParts.map((p, i) => <span key={i} className={p.cls}>{p.t}</span>)}
          </h1>
          <div className="mono" style={{fontSize: 17, color:"var(--pix-ink-3)"}}>
            {game.id === "realms"
              ? <>Starting PixensRealms.exe{".".repeat(dots)}</>
              : <>Loading webview · pixens.io/{game.id === "defense" ? "td" : "play"}{".".repeat(dots)}</>}
          </div>
          <div className="progress" style={{height: 8, width: 360, margin: "26px auto 0"}}>
            <div className="bar" style={{width:"68%"}} />
          </div>
          <div style={{marginTop: 24}}>
            <button className="btn ghost sm" onClick={onClose}>CANCEL</button>
          </div>
        </div>
      )}

      {mode === "running" && (
        <div style={{textAlign:"center"}}>
          <div className="eyebrow lime" style={{marginBottom: 12}}><span className="dot" />GAME RUNNING</div>
          <h1 className="pix" style={{fontSize: 24, letterSpacing:".08em", marginBottom: 14, lineHeight:1.1}}>
            {game.titleParts.map((p, i) => <span key={i} className={p.cls}>{p.t}</span>)}
          </h1>
          <div className="mono" style={{fontSize: 17, color:"var(--pix-ink-2)", marginBottom: 32, maxWidth: 460}}>
            Launcher minimized to tray. Click below to bring it back, or quit to stop the game.
          </div>
          <div style={{display:"flex", gap: 14, justifyContent:"center"}}>
            <button className="btn cyan" onClick={onClose}>▸ BACK TO LAUNCHER</button>
            <button className="btn ghost" onClick={onClose} style={{borderColor:"var(--pix-red)", color:"var(--pix-red)"}}>■ STOP GAME</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ERROR MODAL
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
// PIXEN PICKER — native in-launcher Change/Pick Pixen (R41.1)
// No pixens.io window (that opened a wallet-less / wrong-identity view).
// Grid of the account's OWNED Pixens (real Worker SVG art); click →
// window.pixens.account.setFeatured(id) → fresh profile bubbles up.
// ════════════════════════════════════════════════════════════════════
function PixenPickerModal({ profile, onClose, onPick }) {
  const ids = (profile && Array.isArray(profile.ownedIds)) ? profile.ownedIds : [];
  const current = profile && profile.featured ? profile.featured.tokenId : null;
  const [busy, setBusy] = useState(null);
  const pick = (id) => { if (busy != null) return; setBusy(id); onPick(id); };
  return (
    <div className="modal-bg" onClick={busy != null ? undefined : onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}
        style={{ maxWidth: 640, width: "92%", borderColor:"var(--pix-purple)",
                 boxShadow:"0 0 60px rgba(157,78,255,.45)" }}>
        <div className="eyebrow purple" style={{marginBottom: 10}}><span className="dot" />YOUR PIXEN</div>
        <h2 className="pix" style={{fontSize: 14, letterSpacing:".06em", marginBottom: 6}}>
          PICK THE PIXEN YOU PLAY AS
        </h2>
        <p className="mono" style={{fontSize: 14, color:"var(--pix-ink-3)", lineHeight:1.4, marginBottom: 16}}>
          It carries its kit + signature spell into every Pixens game.
        </p>
        {ids.length === 0 ? (
          <div style={{textAlign:"center", padding:"26px 10px"}}>
            <p className="mono" style={{fontSize:15, color:"var(--pix-ink-3)", marginBottom:16}}>
              You don't own any Pixens yet.
            </p>
            <button className="btn magenta" onClick={() => window.pixens && window.pixens.app.openExternal("shop")}>
              ▸ MINT ON PIXENS.IO
            </button>
          </div>
        ) : (
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(96px, 1fr))",
            gap: 12, maxHeight: 380, overflowY:"auto", padding: "4px 2px",
            opacity: busy != null ? .55 : 1, pointerEvents: busy != null ? "none" : "auto",
          }}>
            {ids.map((id) => {
              const sel = id === current;
              return (
                <button key={id} onClick={() => pick(id)} title={`Pixen #${id}`}
                  style={{
                    display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                    padding:"10px 6px", cursor:"pointer",
                    background: sel ? "rgba(157,78,255,.18)" : "rgba(11,6,24,.55)",
                    border: `2px solid ${sel ? "var(--pix-purple)" : "var(--pix-line-2)"}`,
                    borderRadius: 8,
                    boxShadow: sel ? "0 0 16px rgba(157,78,255,.5)" : "none",
                  }}>
                  <img src={`https://pixens.io/nft/img/pixen/${id}.svg`} alt="" width={64} height={64}
                    style={{ imageRendering:"pixelated" }}
                    onError={(e)=>{ e.currentTarget.style.visibility="hidden"; }} />
                  <span className="pix" style={{fontSize:8, letterSpacing:".08em",
                    color: sel ? "var(--pix-purple)" : "var(--pix-ink-3)"}}>
                    {busy === id ? "…" : `#${id}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <div style={{display:"flex", justifyContent:"flex-end", marginTop: 18}}>
          <button className="btn ghost" disabled={busy != null}
            onClick={busy != null ? undefined : onClose}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// LAUNCHER SELF-UPDATE BAR (Battle.net-style) — fixed top, above all.
// Auto-downloads in the background → one-click RESTART & UPDATE (old
// closes, new installs, relaunches STILL SIGNED IN — userData untouched).
// No reinstall, no announcements: every launcher detects + offers it.
// ════════════════════════════════════════════════════════════════════
function LauncherUpdateBar({ upd }) {
  const [installing, setInstalling] = useState(false);
  if (!upd || !upd.state) return null;
  const ready = upd.state === "ready";
  const doInstall = () => {
    setInstalling(true);
    try { window.pixens && window.pixens.launcher && window.pixens.launcher.installUpdate(); } catch (_) {}
  };
  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, zIndex:99999,
      display:"flex", alignItems:"center", gap:14, padding:"9px 16px",
      fontFamily:"'Press Start 2P',monospace", fontSize:10, color:"#fff",
      background: ready ? "linear-gradient(90deg,#ff2e93,#b83cc9)" : "rgba(12,6,26,.97)",
      borderBottom: ready ? "1px solid #ff5ea8" : "1px solid #2c1448",
      boxShadow: ready ? "0 2px 20px rgba(255,46,147,.55)" : "none",
    }}>
      <span style={{flex:1, lineHeight:1.4}}>
        {ready
          ? <>PIXENS LAUNCHER UPDATE READY{upd.version ? " · v"+upd.version : ""} — installs &amp; relaunches, still signed in.</>
          : <>Downloading launcher update… {typeof upd.percent==="number"?upd.percent:0}%</>}
      </span>
      {!ready && (
        <div style={{width:170, height:6, background:"rgba(255,255,255,.12)", borderRadius:3, overflow:"hidden", flexShrink:0}}>
          <div style={{width:(upd.percent||0)+"%", height:"100%", background:"#ff2e93", transition:"width .3s"}} />
        </div>
      )}
      {ready && (
        <button onClick={doInstall} disabled={installing}
          style={{ fontFamily:"'Press Start 2P',monospace", fontSize:10, color:"#fff",
            padding:"8px 14px", border:"2px solid #fff", borderRadius:6,
            cursor: installing ? "default" : "pointer", flexShrink:0,
            background:"rgba(0,0,0,.28)", whiteSpace:"nowrap" }}>
          {installing ? "RESTARTING…" : "↻ RESTART & UPDATE"}
        </button>
      )}
    </div>
  );
}

function ErrorModal({ onClose }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{borderColor:"var(--pix-red)", boxShadow:"0 0 60px rgba(255,59,92,.5)"}}>
        <div className="eyebrow" style={{color:"var(--pix-red)", marginBottom: 10}}><span className="dot" />ERROR · CODE 0x1E85</div>
        <h2 className="pix" style={{fontSize: 14, letterSpacing:".08em", marginBottom: 14, color:"var(--pix-red)"}}>
          CANNOT REACH PIXENS NETWORK
        </h2>
        <p className="mono" style={{fontSize: 16, color:"var(--pix-ink-2)", lineHeight:1.4, marginBottom: 16}}>
          We couldn't connect to <span className="mono" style={{color:"var(--pix-cyan)"}}>auth.pixens.io</span>.
          Your wallet session is still valid — you can play in solo mode while we retry.
        </p>
        <div className="panel" style={{padding: 12, marginBottom: 18, fontFamily:"var(--font-mono)", fontSize:13, color:"var(--pix-ink-3)"}}>
          <div>▸ Attempted host: auth.pixens.io:443</div>
          <div>▸ Last response:  ETIMEDOUT (3000ms)</div>
          <div>▸ Retry: in 12s</div>
        </div>
        <div style={{display:"flex", justifyContent:"flex-end", gap: 10}}>
          <button className="btn ghost" onClick={onClose}>SOLO MODE</button>
          <button className="btn magenta" onClick={onClose}>RETRY NOW</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TWEAKS PANEL
// ════════════════════════════════════════════════════════════════════
function PixensTweaks({ t, setTweak }) {
  // Dev-only state simulator — hidden in the shipped launcher.
  if (!import.meta.env.DEV) return null;
  return (
    <TweaksPanel>
      <TweakSection label="Screen" />
      <TweakSelect label="View" value={t.screen}
        options={["installer","login","hub","all","settings","updating"]}
        onChange={v => setTweak("screen", v)} />
      <TweakSelect label="Active game" value={t.selectedGame}
        options={["realms","defense","arena"]}
        onChange={v => setTweak("selectedGame", v)} />
      <TweakToggle label="Logged in" value={t.loggedIn}
        onChange={v => setTweak("loggedIn", v)} />
      <TweakToggle label="Wallet linked" value={t.walletLinked}
        onChange={v => setTweak("walletLinked", v)} />

      <TweakSection label="States" />
      <TweakRadio label="Connectivity" value={t.connectivity}
        options={["online","offline"]}
        onChange={v => setTweak("connectivity", v)} />
      <TweakRadio label="App update" value={t.appUpdate}
        options={["none","available","required"]}
        onChange={v => setTweak("appUpdate", v)} />
      <TweakToggle label="Show error modal" value={t.showError}
        onChange={v => setTweak("showError", v)} />
      <TweakToggle label="Show wallet picker" value={t.showWallet}
        onChange={v => setTweak("showWallet", v)} />

      <TweakSection label="Look" />
      <TweakToggle label="CRT scanlines" value={t.scanlines}
        onChange={v => setTweak("scanlines", v)} />
    </TweaksPanel>
  );
}

// mount
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
