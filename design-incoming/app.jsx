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
    icon: null,
    cover: null,       // key art TBD
    hero: null,
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
// MAIN APP
// ════════════════════════════════════════════════════════════════════
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // local UI state
  const [activeGame, setActiveGame] = useState(t.selectedGame);
  const [view, setView] = useState(t.screen); // installer | login | hub | all | settings | updating
  const [activeNav, setActiveNav] = useState("games");
  const [walletOpen, setWalletOpen] = useState(t.showWallet);
  const [errorOpen, setErrorOpen] = useState(t.showError);
  const [playingGame, setPlayingGame] = useState(null);

  // sync tweak ↔ local state for screen + game (so tweaks override on change)
  useEffect(() => { setView(t.screen); }, [t.screen]);
  useEffect(() => { setActiveGame(t.selectedGame); }, [t.selectedGame]);
  useEffect(() => { setWalletOpen(t.showWallet); }, [t.showWallet]);
  useEffect(() => { setErrorOpen(t.showError); }, [t.showError]);

  const game = useMemo(() => GAMES.find(g => g.id === activeGame) || GAMES[0], [activeGame]);
  const news = NEWS[activeGame] || NEWS.all;

  const handleNav = (id) => setActiveNav(id);
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
      setPlayingGame(g);
    } else {
      // webview games — pretend to fullscreen
      setPlayingGame(g);
    }
  };
  const handleInstall = (g) => { setView("updating"); setTweak("screen","updating"); };
  const handleUpdate = (g) => { setView("updating"); setTweak("screen","updating"); };

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
          <PlayingOverlay game={playingGame} onClose={() => setPlayingGame(null)} />
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
        <TitleBar subtitle={view === "settings" ? "SETTINGS" : view === "updating" ? "UPDATING" : view === "all" ? "ALL GAMES" : (loggedIn ? game.name?.toUpperCase() : "SIGN IN")} />

        {/* Login takes the full body (no topbar/sidebar) */}
        {!loggedIn ? (
          <LoginScreen onLogin={finishLogin} />
        ) : (
          <>
            <TopBar
              activeNav={activeNav}
              onNav={handleNav}
              loggedIn={loggedIn}
              user={{ name: "IAMPIXEN", level: 1 }}
              onLogout={logout}
              onAvatar={() => { setView("settings"); setTweak("screen", "settings"); }}
            />
            <div className="body">
              <Sidebar
                games={GAMES}
                activeGameId={activeGame}
                onPick={handlePickGame}
                onAll={handleAll}
                onSettings={() => { setView("settings"); setTweak("screen", "settings"); }}
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

                {view === "hub" && (
                  <GameDetail
                    game={game}
                    friends={FRIENDS}
                    news={news}
                    onPlay={handlePlay}
                    onInstall={handleInstall}
                    onUpdate={handleUpdate}
                    onWallet={() => setWalletOpen(true)}
                  />
                )}
                {view === "all" && (
                  <AllGames games={GAMES} onPick={handlePickGame} />
                )}
                {view === "settings" && (
                  <SettingsScreen onClose={()=>{ setView("hub"); setTweak("screen", "hub"); }} onLogout={logout} />
                )}
                {view === "updating" && (
                  <UpdateScreen game={game} onClose={()=>{ setView("hub"); setTweak("screen", "hub"); }} />
                )}
              </div>
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
      </div>
      <PixensTweaks t={t} setTweak={setTweak} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// PLAYING OVERLAY — when user hits PLAY
// ════════════════════════════════════════════════════════════════════
function PlayingOverlay({ game, onClose }) {
  const [stage, setStage] = useState("launch"); // launch | running
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const d = setInterval(() => setDots(x => (x+1)%4), 400);
    const t = setTimeout(() => setStage("running"), 2400);
    return () => { clearInterval(d); clearTimeout(t); };
  }, []);

  return (
    <div style={{
      position:"absolute", inset: 0, zIndex: 100,
      background:
        "radial-gradient(circle at 50% 40%, #2a0a55 0%, #06031a 70%)," +
        "var(--pix-bg)",
      display:"grid", placeItems:"center",
    }}>
      <div className="scanlines" style={{opacity:.25}} />

      {stage === "launch" && (
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

      {stage === "running" && (
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
