// ui.jsx — shared components for Pixens Launcher
// Loaded as a global Babel script. Exports go on window for cross-file access.

const { useState, useEffect, useRef, useMemo } = React;

// ─── Pixens invader sprite (drawn pixel-by-pixel via grid) ─────────────
// Avoids hand-drawing an SVG monster — just a colored grid.
function PixenSprite({ color = "#ff1e85", scale = 4, frame = 0 }) {
  // 12x12 invader pattern derived from the brand logo (simple silhouette only)
  const P = [
    "............",
    "..XX....XX..",
    "...XXXXXX...",
    "..XXXXXXXX..",
    ".XX.XXXX.XX.",
    "XXXXXXXXXXXX",
    "XX.XXXXXX.XX",
    "X..X....X..X",
    "...XX..XX...",
    "..XX....XX..",
    ".XX......XX.",
    "............",
  ];
  const s = scale;
  return (
    <div style={{
      width: 12 * s, height: 12 * s,
      position: "relative",
      filter: `drop-shadow(0 0 ${s * 1.5}px ${color})`,
    }}>
      {P.map((row, y) => [...row].map((c, x) => c === "X" ? (
        <div key={`${x}-${y}`} style={{
          position: "absolute",
          left: x * s, top: y * s,
          width: s, height: s,
          background: color,
        }} />
      ) : null))}
    </div>
  );
}

// ─── Pixel-art character avatar (simple 8x8 humanoid) ──────────────────
function PixenAvatar({ seed = 1, scale = 3 }) {
  // 8x8 chibi sprite, palette varies by seed
  const palettes = [
    ["#ff1e85", "#ffd1e6", "#1a0612"], // pink
    ["#41e6ff", "#cfeffd", "#06212a"], // cyan
    ["#6cff5a", "#dfffd1", "#062012"], // lime
    ["#ffcc1a", "#fff3b8", "#2a1f06"], // yellow
    ["#9d4eff", "#e3cfff", "#180830"], // purple
    ["#ff8a3c", "#ffe1c4", "#2a1306"], // orange
  ];
  const [main, light, dark] = palettes[seed % palettes.length];
  // y=hair, s=skin, e=eye, c=cloth, b=bg
  const G = [
    "..hhhh..",
    ".hhhhhh.",
    ".hssssh.",
    ".se..es.",
    ".ssooss.",
    "ccccccccc".slice(0,8),
    "ccccccccc".slice(0,8),
    "c.cccc.c",
  ];
  const map = { h: main, s: light, e: dark, o: main, c: main, ".": "transparent" };
  const s = scale;
  return (
    <div style={{ width: 8 * s, height: 8 * s, position:"relative" }}>
      {G.map((row, y) => [...row].map((ch, x) => map[ch] && map[ch] !== "transparent" && (
        <div key={`${x}-${y}`} style={{
          position:"absolute", left: x*s, top: y*s, width: s, height: s,
          background: map[ch],
        }} />
      )))}
    </div>
  );
}

// ─── Bracket frame wrapper ─────────────────────────────────────────────
function Bracket({ color = "magenta", children, style }) {
  return (
    <div className={`brk ${color}`} style={style}>
      <div className="brk-tl" />
      <div className="brk-br" />
      {children}
    </div>
  );
}

// ─── Titlebar (frameless window chrome) ────────────────────────────────
function TitleBar({ subtitle = "GAMES" }) {
  return (
    <div className="titlebar">
      <span className="tb-title"><b>PIXENS</b> LAUNCHER · {subtitle}</span>
      <span className="tb-spacer" />
      <div className="tb-btns">
        <button className="tb-btn" title="Minimize" onClick={() => window.pixens && window.pixens.window.minimize()}>─</button>
        <button className="tb-btn" title="Maximize" onClick={() => window.pixens && window.pixens.window.maximize()}>▢</button>
        <button className="tb-btn close" title="Close" onClick={() => window.pixens && window.pixens.window.close()}>✕</button>
      </div>
    </div>
  );
}

// ─── Top bar: logo, nav, account pills ─────────────────────────────────
function TopBar({ activeNav, onNav, loggedIn, user, onLogout, onAvatar }) {
  return (
    <div className="topbar">
      <div className="tb-logo">
        <img src="assets/pixens-logo.png" alt="" />
        <img src="assets/pixens-wordmark.png" alt="PIXENS" style={{
          height: 22, width: "auto", imageRendering: "pixelated",
          filter: "drop-shadow(0 0 10px rgba(255,30,133,.4))",
        }} />
      </div>
      <nav className="tb-nav">
        <a className={activeNav === "games" ? "active" : ""} onClick={() => onNav("games")}>GAMES</a>
        <a className={activeNav === "news" ? "active" : ""} onClick={() => onNav("news")}>NEWS</a>
        <a className={activeNav === "shop" ? "active" : ""} onClick={() => onNav("shop")}>SHOP</a>
      </nav>
      <div className="tb-right">
        {loggedIn ? (
          <>
            {/* REAL data (R41.1). Pills only render when their value is
                known — no fake placeholders. Diamonds = player_progress;
                wallet = real bound/connected 0x ONLY (brains #161, never
                the acct_ id → pill hidden for email accounts w/o wallet).
                No BNB pill: there's no honest source, so we don't show a
                made-up balance. */}
            {typeof user?.diamonds === "number" && (
              <div className="tb-pill cyan" title="Diamonds">
                <span style={{color:"var(--pix-cyan)"}}>◆</span>
                <span className="v">{user.diamonds.toLocaleString()}</span>
              </div>
            )}
            {user?.wallet && (
              <div className="tb-pill purple" title={user.wallet}>
                <span style={{color:"var(--pix-purple)"}}>◇</span>
                <span className="v">{user.wallet.slice(0,6)}</span>
              </div>
            )}
            <div className="tb-user" onClick={onAvatar} style={{cursor:"pointer"}} title="Account / Settings">
              <div className="av">
                {user?.featured?.art
                  ? <img src={user.featured.art} alt="" width={28} height={28}
                      style={{ imageRendering:"pixelated", display:"block" }}
                      onError={(e)=>{ e.currentTarget.style.display="none"; }} />
                  : <PixenAvatar seed={4} scale={2} />}
              </div>
              <div style={{display:"flex", flexDirection:"column", lineHeight:1}}>
                <span className="nm">{user?.displayName || "PLAYER"}</span>
                <span className="lv" style={user?.tier?.color ? {color: user.tier.color} : undefined}>
                  LV {user?.level ?? 1}{user?.tier?.label ? ` · ${user.tier.label}` : ""}
                </span>
              </div>
            </div>
            <button className="tb-icon-btn" title="Log out" onClick={onLogout}>
              <span style={{fontSize:14, lineHeight:0}}>⏻</span>
            </button>
          </>
        ) : (
          <button className="btn cyan sm" onClick={onAvatar}>LOG IN</button>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar: games library ────────────────────────────────────────────
function Sidebar({ games, activeGameId, onPick, onSettings, onAll, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sb-label">GAMES</div>
      <button
        className={`sb-game placeholder ${activeGameId === "all" ? "active" : ""}`}
        onClick={onAll}
        title="All Games"
      >
        <span>ALL</span>
      </button>
      {games.map(g => (
        <button
          key={g.id}
          className={`sb-game ${activeGameId === g.id ? "active" : ""} ${g.placeholder ? "placeholder" : ""}`}
          onClick={() => onPick(g.id)}
          title={g.name}
        >
          {g.placeholder ? <span>P·R</span> : <img src={g.icon} alt="" />}
          {g.hasUpdate && <span className="badge-update" />}
        </button>
      ))}
      <div className="sb-bottom">
        <button className="sb-mini" title="Downloads" onClick={onSettings}>
          <span style={{fontFamily:"var(--font-mono)", fontSize:18}}>↓</span>
        </button>
        <button className="sb-mini" title="Settings" onClick={onSettings}>
          <span style={{fontFamily:"var(--font-mono)", fontSize:18}}>⚙</span>
        </button>
        <button className="sb-mini" title="Log out" onClick={onLogout}>
          <span style={{fontFamily:"var(--font-mono)", fontSize:18}}>⏻</span>
        </button>
      </div>
    </aside>
  );
}

// ─── Status banners (offline / update / error) ─────────────────────────
function StatusBanner({ kind, msg, action, onAction }) {
  return (
    <div className={`status-banner ${kind}`}>
      <span className="ico">
        {kind === "offline" ? "◎" : kind === "update" ? "▲" : "!"}
      </span>
      <span>{msg}</span>
      {action && (
        <button onClick={onAction}>{action}</button>
      )}
    </div>
  );
}

// ─── Pixens wordmark (uses the brand header asset) ─────────────────────
function Wordmark({ size = 28 }) {
  // Use the real Pixens wordmark image — multi-color pixel letters preserved
  // size = target line-height in px; image scales preserving aspect
  return (
    <img
      src="assets/pixens-wordmark.png"
      alt="PIXENS"
      style={{
        height: size,
        width: "auto",
        imageRendering: "pixelated",
        filter: `drop-shadow(0 0 ${size * 0.35}px rgba(255,30,133,.35))`,
        display: "inline-block",
        verticalAlign: "middle",
      }}
    />
  );
}

// publish to window for other Babel files
Object.assign(window, {
  PixenSprite, PixenAvatar, Bracket,
  TitleBar, TopBar, Sidebar,
  StatusBanner, Wordmark,
});
