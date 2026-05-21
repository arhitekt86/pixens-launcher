// screens.jsx — All Pixens Launcher screens
// (useState/useEffect/useMemo come from ui.jsx's React destructure)

// ════════════════════════════════════════════════════════════════════
// SETUP / INSTALLER WINDOW
// ════════════════════════════════════════════════════════════════════
function InstallerWindow({ onFinish }) {
  const [step, setStep] = useState("welcome"); // welcome | installing | done
  const [progress, setProgress] = useState(0);
  const [loc, setLoc] = useState("C:/Program Files/Pixens");
  const [autostart, setAutostart] = useState(true);
  const [eula, setEula] = useState(false);

  useEffect(() => {
    if (step !== "installing") return;
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(t); setStep("done"); return 100; }
        return Math.min(100, p + 2 + Math.random() * 5);
      });
    }, 220);
    return () => clearInterval(t);
  }, [step]);

  return (
    <div className="installer" style={{position:"relative"}}>
      <div className="scanlines" />
      {/* LEFT — branded splash */}
      <div className="left">
        <img src="assets/pixens-logo.png" alt="" style={{
          width: 130, height: 130, imageRendering: "pixelated",
          filter: "drop-shadow(0 0 28px rgba(255,30,133,.7))",
          marginBottom: 18,
        }} />
        <img src="assets/pixens-wordmark.png" alt="PIXENS" style={{
          height: 32, width: "auto", imageRendering: "pixelated",
          filter: "drop-shadow(0 0 14px rgba(255,30,133,.35))",
          marginBottom: 22,
        }} />
        {/* Vertical MINT / BREED / BATTLE */}
        <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap: 10, marginTop: 4}}>
          {[
            { t: "MINT",   col: "var(--pix-magenta)" },
            { t: "BREED",  col: "var(--pix-cyan)" },
            { t: "BATTLE", col: "var(--pix-lime)" },
          ].map(p => (
            <div key={p.t} className="pix" style={{
              fontSize: 11, letterSpacing:".22em",
              color: p.col,
              textShadow: `0 0 12px ${p.col}`,
            }}>{p.t}</div>
          ))}
        </div>
        <div style={{
          marginTop: "auto", fontFamily:"var(--font-mono)", fontSize:14,
          color:"var(--pix-ink-4)", lineHeight:1.3, letterSpacing:".06em",
        }}>
          v1.0.4 · est. 2025<br/>pixens.io
        </div>
      </div>
      {/* RIGHT — wizard body */}
      <div className="right">
        {step === "welcome" && (
          <>
            <h2 className="pix" style={{fontSize:14, color:"var(--pix-ink)", marginBottom:4, letterSpacing:".1em"}}>
              PIXENS LAUNCHER INSTALLATION
            </h2>
            <div className="body-txt" style={{fontSize:15, color:"var(--pix-ink-3)", marginBottom: 18}}>
              Install once. Launch every Pixens game from one place.
            </div>

            <div style={{marginBottom: 14}}>
              <span className="input-lbl">INSTALL LOCATION</span>
              <div style={{display:"flex", gap: 8}}>
                <input className="input" value={loc} onChange={e=>setLoc(e.target.value)} style={{flex:1}} />
                <button className="btn ghost sm" style={{height:42, fontSize:9}}>CHANGE</button>
              </div>
              <div className="mono" style={{fontSize:14, color:"var(--pix-ink-4)", marginTop:4}}>
                320 MB required &nbsp;·&nbsp; 40.8 GB available on disk
              </div>
            </div>

            <div style={{display:"flex", flexDirection:"column", gap: 10, margin:"8px 0 14px"}}>
              <label className="chk">
                <input type="checkbox" checked={autostart} onChange={e=>setAutostart(e.target.checked)} />
                <span className="box" />
                <span className="lbl">Launch Pixens when I start my computer</span>
              </label>
              <label className="chk">
                <input type="checkbox" checked={eula} onChange={e=>setEula(e.target.checked)} />
                <span className="box" />
                <span className="lbl">I agree to the <u style={{color:"var(--pix-cyan)"}}>Terms of Service</u> &amp; <u style={{color:"var(--pix-cyan)"}}>LGPL notices</u></span>
              </label>
            </div>

            <div style={{marginTop:"auto", display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop: 14, borderTop:"1px solid var(--pix-line)"}}>
              <div className="mono" style={{fontSize:13, color:"var(--pix-ink-4)", whiteSpace:"nowrap"}}>STEP 1 / 2</div>
              <div style={{display:"flex", gap: 10}}>
                <button className="btn ghost">CANCEL</button>
                <button
                  className="btn magenta"
                  disabled={!eula}
                  onClick={() => setStep("installing")}
                  style={!eula ? {opacity:.4, cursor:"not-allowed"} : {}}
                >
                  ▸ INSTALL
                </button>
              </div>
            </div>
          </>
        )}

        {step === "installing" && (
          <>
            <h2 className="pix" style={{fontSize:14, color:"var(--pix-ink)", marginBottom:4, letterSpacing:".1em"}}>
              INSTALLING PIXENS LAUNCHER
            </h2>
            <div className="body-txt" style={{fontSize:15, color:"var(--pix-ink-3)", marginBottom: 26}}>
              Don't close this window. Bytes incoming.
            </div>

            <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom: 8}}>
              <span className="eyebrow magenta"><span className="dot" />DOWNLOADING CORE</span>
              <span className="mono" style={{fontSize:16, color:"var(--pix-magenta)"}}>{Math.floor(progress)}%</span>
            </div>
            <div className="progress" style={{height: 18}}>
              <div className="bar" style={{width: `${progress}%`}} />
            </div>

            <div className="mono" style={{fontSize:14, color:"var(--pix-ink-3)", marginTop: 14, fontFeatureSettings:'"tnum"'}}>
              {[
                "▸ Verifying signature .................. ok",
                "▸ Unpacking launcher-core.bin .......... ok",
                "▸ Installing PixensRealms hooks ........ ok",
                "▸ Registering protocol pixens:// ....... ok",
                progress > 50 ? "▸ Linking wallet bridge ................ working" : "  Linking wallet bridge .................. queued",
                progress > 80 ? "▸ Building game manifest ............... working" : "  Building game manifest ................. queued",
              ].map((l,i) => (
                <div key={i} style={{
                  color: l.startsWith("▸") ? "var(--pix-lime)" : "var(--pix-ink-4)",
                  opacity: l.startsWith("▸") ? 1 : .55,
                }}>{l}</div>
              ))}
            </div>
          </>
        )}

        {step === "done" && (
          <>
            <div className="eyebrow lime" style={{marginBottom:8}}><span className="dot" />INSTALL COMPLETE</div>
            <h2 className="pix" style={{fontSize:16, color:"var(--pix-lime)", marginBottom:10, letterSpacing:".1em"}}>
              WELCOME TO PIXENS.
            </h2>
            <div className="body-txt" style={{fontSize:15, color:"var(--pix-ink-3)", marginBottom: 14}}>
              Launcher is installed at <span className="mono" style={{color:"var(--pix-ink-2)"}}>{loc}</span>.<br/>
              Next: log in and pick your Pixen.
            </div>

            <div className="panel" style={{padding: 14, marginTop: 6}}>
              <div className="eyebrow" style={{marginBottom: 8}}>WHAT'S INSIDE</div>
              <div className="mono" style={{fontSize:15, color:"var(--pix-ink-2)", lineHeight:1.45}}>
                ▸ Pixens Realms <span style={{color:"var(--pix-ink-4)"}}>· native exe, install on demand</span><br/>
                ▸ Pixen Defense <span style={{color:"var(--pix-ink-4)"}}>· always-latest webview</span><br/>
                ▸ Block Arena <span style={{color:"var(--pix-ink-4)"}}>· always-latest webview</span>
              </div>
            </div>

            <div style={{marginTop:"auto", display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop: 14, borderTop:"1px solid var(--pix-line)"}}>
              <label className="chk">
                <input type="checkbox" defaultChecked />
                <span className="box" />
                <span className="lbl">Launch Pixens now</span>
              </label>
              <button className="btn magenta" onClick={onFinish}>▸ FINISH</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// LOGIN SCREEN  (full-bleed, no top/sidebar) — supports sign-in & sign-up
// ════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [agree, setAgree] = useState(false);
  const [pending, setPending] = useState(null);

  const submit = (method) => {
    setPending(method);
    setTimeout(() => { setPending(null); onLogin({ method, name: username || "IAMPIXEN", level: 1 }); }, 700);
  };

  return (
    <div style={{flex: 1, display:"grid", gridTemplateColumns:"1.1fr .9fr", overflow:"hidden", position:"relative"}}>
      {/* LEFT — art panel (floating mascot) */}
      <div style={{
        position:"relative", overflow:"hidden",
        background:
          "radial-gradient(circle at 50% 35%, #2c0c5a, transparent 55%)," +
          "radial-gradient(circle at 50% 85%, #5a0a45, transparent 55%)," +
          "linear-gradient(180deg, #0c0420, #1a062f)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div className="scanlines" />
        <div style={{textAlign:"center", padding: 40, width: "100%"}}>
          <img className="pxl-float" src="assets/pixens-logo.png" alt="" style={{
            width: 200, height: 200, imageRendering: "pixelated",
            filter: "drop-shadow(0 0 40px rgba(255,30,133,.7))",
            marginBottom: 22,
            display: "block", marginLeft: "auto", marginRight: "auto",
          }} />
          <img src="assets/pixens-wordmark.png" alt="PIXENS" style={{
            height: 64, width: "auto", imageRendering: "pixelated",
            filter: "drop-shadow(0 0 22px rgba(255,30,133,.45))",
            marginBottom: 28, display: "block", marginLeft: "auto", marginRight: "auto",
          }} />
          {/* Horizontal MINT · BREED · BATTLE */}
          <div style={{display:"flex", justifyContent:"center", alignItems:"center", gap: 24}}>
            {[
              { t: "MINT",   col: "var(--pix-magenta)" },
              { t: "BREED",  col: "var(--pix-cyan)" },
              { t: "BATTLE", col: "var(--pix-lime)" },
            ].map((p, i, arr) => (
              <React.Fragment key={p.t}>
                <span className="pix" style={{
                  fontSize: 13, letterSpacing:".22em",
                  color: p.col, textShadow: `0 0 14px ${p.col}`,
                }}>{p.t}</span>
                {i < arr.length - 1 && (
                  <span style={{
                    width: 6, height: 6, background: "var(--pix-ink-4)",
                    display: "inline-block",
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div style={{position:"absolute", left:20, bottom: 14, fontFamily:"var(--font-mono)", fontSize:14, color:"var(--pix-ink-3)"}}>
          v1.0.4 · MAINNET LIVE
        </div>
        <div style={{position:"absolute", right:20, bottom: 14, fontFamily:"var(--font-mono)", fontSize:14, color:"var(--pix-ink-3)"}}>
          pixens.io
        </div>
      </div>

      {/* RIGHT — auth form */}
      <div style={{padding:"48px 56px 28px", display:"flex", flexDirection:"column", background:"var(--pix-bg)", overflowY:"auto"}}>
        {mode === "signin" ? (
          <SignInForm email={email} setEmail={setEmail} pw={pw} setPw={setPw}
            pending={pending} submit={submit} onSwitch={() => setMode("signup")} />
        ) : (
          <SignUpForm
            email={email} setEmail={setEmail}
            username={username} setUsername={setUsername}
            pw={pw} setPw={setPw} pw2={pw2} setPw2={setPw2}
            agree={agree} setAgree={setAgree}
            pending={pending} submit={submit}
            onSwitch={() => setMode("signin")}
          />
        )}
      </div>
    </div>
  );
}

// ─── Sign-in form ─────────────────────────────────────────────────────
function SignInForm({ email, setEmail, pw, setPw, pending, submit, onSwitch }) {
  return (
    <>
      <div className="eyebrow magenta" style={{marginBottom: 12}}><span className="dot" />SIGN IN</div>
      <h1 className="pix" style={{fontSize:22, letterSpacing:".08em", marginBottom: 6, color:"var(--pix-ink)", lineHeight:1.2}}>
        WELCOME BACK,<br/><span style={{color:"var(--pix-magenta)", textShadow:"0 0 18px rgba(255,30,133,.5)"}}>PIXEN.</span>
      </h1>
      <div className="body-txt" style={{fontSize:16, color:"var(--pix-ink-3)", marginBottom: 28}}>
        One account &middot; every Pixens game &middot; wallet optional.
      </div>

      <label className="input-lbl">EMAIL</label>
      <input className="input" placeholder="pixen@pixens.io" value={email} onChange={e=>setEmail(e.target.value)} style={{marginBottom: 14}} />
      <label className="input-lbl">PASSWORD</label>
      <input className="input" type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} />
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop: 10, marginBottom: 22}}>
        <label className="chk">
          <input type="checkbox" defaultChecked />
          <span className="box" />
          <span className="lbl" style={{fontSize:15}}>Keep me signed in</span>
        </label>
        <a className="mono" style={{fontSize:15, color:"var(--pix-cyan)", cursor:"pointer", whiteSpace:"nowrap"}}>Forgot password?</a>
      </div>

      <button className="btn magenta lg block" onClick={()=>submit("email")} disabled={!!pending}>
        {pending === "email" ? "AUTHENTICATING…" : "▸ LOG IN"}
      </button>

      <div style={{display:"flex", alignItems:"center", gap: 12, margin:"22px 0"}}>
        <div style={{flex:1, height:1, background:"var(--pix-line)"}} />
        <span className="pix" style={{fontSize:8, color:"var(--pix-ink-4)"}}>OR CONTINUE WITH</span>
        <div style={{flex:1, height:1, background:"var(--pix-line)"}} />
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 10}}>
        <GoogleButton onClick={()=>submit("google")} disabled={!!pending} />
        <WalletConnectButton onClick={()=>submit("wallet")} disabled={!!pending} />
      </div>

      <div style={{marginTop:"auto", paddingTop: 24, textAlign:"center"}}>
        <span className="mono" style={{fontSize:15, color:"var(--pix-ink-3)"}}>
          New to Pixens? <a style={{color:"var(--pix-magenta)", cursor:"pointer"}} onClick={onSwitch}>Create an account →</a>
        </span>
      </div>
    </>
  );
}

// ─── Sign-up form ─────────────────────────────────────────────────────
function SignUpForm({ email, setEmail, username, setUsername, pw, setPw, pw2, setPw2, agree, setAgree, pending, submit, onSwitch }) {
  const pwOk = pw.length >= 8;
  const pwMatch = pw && pw === pw2;
  const canSubmit = email && username && pwOk && pwMatch && agree;
  return (
    <>
      <div className="eyebrow lime" style={{marginBottom: 12}}><span className="dot" />CREATE ACCOUNT</div>
      <h1 className="pix" style={{fontSize:22, letterSpacing:".08em", marginBottom: 6, color:"var(--pix-ink)", lineHeight:1.2}}>
        BECOME A<br/><span style={{color:"var(--pix-lime)", textShadow:"0 0 18px rgba(108,255,90,.5)"}}>PIXEN.</span>
      </h1>
      <div className="body-txt" style={{fontSize:16, color:"var(--pix-ink-3)", marginBottom: 22}}>
        Free to play. Wallet optional — link later when you mint.
      </div>

      <label className="input-lbl">USERNAME <span style={{color:"var(--pix-ink-4)"}}>· shown in-game</span></label>
      <input className="input" placeholder="iampixen" value={username} onChange={e=>setUsername(e.target.value.replace(/\s/g,"").toLowerCase())} style={{marginBottom: 12}} />

      <label className="input-lbl">EMAIL</label>
      <input className="input" placeholder="pixen@pixens.io" value={email} onChange={e=>setEmail(e.target.value)} style={{marginBottom: 12}} />

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12, marginBottom: 8}}>
        <div>
          <label className="input-lbl">PASSWORD</label>
          <input className="input" type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} />
        </div>
        <div>
          <label className="input-lbl">CONFIRM</label>
          <input className="input" type="password" placeholder="••••••••" value={pw2} onChange={e=>setPw2(e.target.value)} />
        </div>
      </div>

      {/* password rules */}
      <div className="mono" style={{fontSize: 13, color:"var(--pix-ink-4)", margin: "4px 0 14px"}}>
        <span style={{color: pwOk ? "var(--pix-lime)" : "var(--pix-ink-4)"}}>{pwOk ? "✓" : "·"} 8+ characters</span>
        &nbsp; &nbsp;
        <span style={{color: pwMatch ? "var(--pix-lime)" : "var(--pix-ink-4)"}}>{pwMatch ? "✓" : "·"} passwords match</span>
      </div>

      <label className="chk" style={{marginBottom: 18}}>
        <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} />
        <span className="box" />
        <span className="lbl" style={{fontSize:15}}>
          I agree to the <span style={{color:"var(--pix-cyan)"}}>Terms</span> &amp; <span style={{color:"var(--pix-cyan)"}}>Privacy Policy</span>
        </span>
      </label>

      <button className="btn magenta lg block" onClick={()=>submit("signup")} disabled={!canSubmit || !!pending}
        style={!canSubmit ? {opacity:.4, cursor:"not-allowed"} : {}}>
        {pending === "signup" ? "CREATING…" : "▸ CREATE ACCOUNT"}
      </button>

      <div style={{display:"flex", alignItems:"center", gap: 12, margin:"22px 0"}}>
        <div style={{flex:1, height:1, background:"var(--pix-line)"}} />
        <span className="pix" style={{fontSize:8, color:"var(--pix-ink-4)"}}>OR SIGN UP WITH</span>
        <div style={{flex:1, height:1, background:"var(--pix-line)"}} />
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 10}}>
        <GoogleButton onClick={()=>submit("google")} disabled={!!pending} label="Sign up with Google" />
        <WalletConnectButton onClick={()=>submit("wallet")} disabled={!!pending} label="Wallet Connect" />
      </div>

      <div style={{marginTop:"auto", paddingTop: 22, textAlign:"center"}}>
        <span className="mono" style={{fontSize:15, color:"var(--pix-ink-3)"}}>
          Already a Pixen? <a style={{color:"var(--pix-cyan)", cursor:"pointer"}} onClick={onSwitch}>Sign in →</a>
        </span>
      </div>
    </>
  );
}

// ─── Branded Google button (white with multicolor G mark) ─────────────
function GoogleButton({ onClick, disabled, label = "Sign in with Google" }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:"flex", alignItems:"center", justifyContent:"center", gap: 10,
      height: 44, padding: "0 14px",
      background: "#ffffff",
      border: "1px solid #dadce0",
      borderRadius: 4,
      color: "#3c4043",
      fontFamily: "Roboto, Arial, sans-serif",
      fontSize: 14, fontWeight: 500, letterSpacing: ".01em",
      cursor: disabled ? "default" : "pointer",
      boxShadow: "0 1px 2px rgba(0,0,0,.2)",
      transition: "box-shadow .15s ease",
    }}
    onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 6px rgba(0,0,0,.3)"}
    onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 2px rgba(0,0,0,.2)"}>
      <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09 0-.73.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>{label}</span>
    </button>
  );
}

// ─── WalletConnect-style button (signature blue) ──────────────────────
function WalletConnectButton({ onClick, disabled, label = "WalletConnect" }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:"flex", alignItems:"center", justifyContent:"center", gap: 10,
      height: 44, padding: "0 14px",
      background: "linear-gradient(180deg, #3b99fc, #2576dc)",
      border: "1px solid #4ea7ff",
      borderRadius: 4,
      color: "#ffffff",
      fontFamily: "var(--font-pixel)",
      fontSize: 9, letterSpacing: ".14em",
      cursor: disabled ? "default" : "pointer",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.3), 0 2px 0 #1a5db8, 0 0 18px rgba(59,153,252,.4)",
      transition: "box-shadow .15s ease",
    }}
    onMouseEnter={e=>e.currentTarget.style.boxShadow="inset 0 1px 0 rgba(255,255,255,.3), 0 2px 0 #1a5db8, 0 0 26px rgba(59,153,252,.65)"}
    onMouseLeave={e=>e.currentTarget.style.boxShadow="inset 0 1px 0 rgba(255,255,255,.3), 0 2px 0 #1a5db8, 0 0 18px rgba(59,153,252,.4)"}>
      {/* WC-style arc logo */}
      <svg width="18" height="12" viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.19 7.46c6.52-6.38 17.1-6.38 23.62 0l.78.77a.81.81 0 0 1 0 1.15l-2.68 2.62a.42.42 0 0 1-.59 0l-1.08-1.06c-4.55-4.45-11.92-4.45-16.47 0l-1.16 1.13a.42.42 0 0 1-.59 0L7.34 9.45a.81.81 0 0 1 0-1.15l.85-.84zm29.18 5.43l2.39 2.34a.81.81 0 0 1 0 1.15l-10.78 10.54a.84.84 0 0 1-1.18 0l-7.65-7.49a.21.21 0 0 0-.3 0l-7.65 7.49a.84.84 0 0 1-1.18 0L.24 16.38a.81.81 0 0 1 0-1.15l2.39-2.34a.84.84 0 0 1 1.18 0l7.65 7.49a.21.21 0 0 0 .3 0l7.65-7.49a.84.84 0 0 1 1.18 0l7.65 7.49a.21.21 0 0 0 .3 0l7.65-7.49a.84.84 0 0 1 1.18 0z" fill="white"/>
      </svg>
      <span>{label.toUpperCase()}</span>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════
// HUB / GAME DETAIL  (per-game)
// ════════════════════════════════════════════════════════════════════
function GameDetail({ game, profile, friends, news, onPlay, onInstall, onUpdate, onWallet, onChangePixen }) {
  const [newsIdx, setNewsIdx] = useState(0);

  // auto-rotate news every 6s
  useEffect(() => {
    const t = setInterval(() => setNewsIdx(i => (i + 1) % news.length), 6000);
    return () => clearInterval(t);
  }, [news.length]);

  // REAL stat tiles (R41.1) — GENRE is a true game fact; the rest are
  // the live platform + signed-in account values from window.pixens.
  // account.profile() (presence/players-online, player level, owned
  // Pixens). No per-game fabricated player counts — the online figure is
  // the honest platform total, identical to pixens.io.
  const li = profile && profile.loggedIn;
  const statTiles = [
    { label: "GENRE", value: game.kind || "—" },
    { label: "PLAYERS ONLINE",
      value: profile && typeof profile.online === "number" ? profile.online.toLocaleString() : "—",
      color: "var(--pix-lime)" },
    { label: "YOUR LEVEL",
      value: li ? `LV ${profile.level ?? 1}` : "—",
      color: (profile && profile.tier && profile.tier.color) || "var(--pix-cyan)" },
    { label: "YOUR PIXENS",
      value: li && typeof profile.ownedCount === "number" ? profile.ownedCount : "—",
      color: "var(--pix-magenta)" },
  ];

  const status = game.status; // 'installed' | 'install' | 'update' | 'playing'
  const playLabel = status === "install" ? "INSTALL"
    : status === "update" ? "UPDATE"
    : status === "playing" ? "PLAYING…"
    : "PLAY";
  const playColor = status === "install" ? "cyan" : status === "update" ? "cyan" : "magenta";

  return (
    <div className="scroll" style={{flex:1, display:"grid", gridTemplateColumns: "1fr 280px", gridTemplateRows: "auto 1fr", gap: 18, padding: 20, position:"relative"}}>
      {/* ── HERO (full-width across both cols) ──────────────────── */}
      <div style={{
        gridColumn: "1 / -1",
        height: 360,
        position: "relative",
        overflow: "hidden",
        borderRadius: 6,
        border: "1px solid var(--pix-line-2)",
      }}>
        {/* hero artwork or placeholder */}
        {game.hero ? (
          <img src={game.hero} alt=""
            onError={(e) => { const t = e.currentTarget; if (t.src.indexOf('pixens-logo.png') < 0) t.src = 'assets/pixens-logo.png'; }}
            style={{
            position:"absolute", inset: 0, width:"100%", height:"100%",
            objectFit:"cover", imageRendering: "pixelated",
            filter: "saturate(.85) brightness(.62)",
          }} />
        ) : (
          <div style={{
            position:"absolute", inset:0,
            background:
              "radial-gradient(circle at 70% 30%, #5a1075 0%, transparent 55%)," +
              "radial-gradient(circle at 25% 75%, #08263d 0%, transparent 55%)," +
              "linear-gradient(135deg, #160832, #0a0418)",
          }}>
            {/* placeholder pixel landscape */}
            <div style={{position:"absolute", left: 80, top: 90, opacity:.7}}>
              <PixenSprite color="#ff1e85" scale={8} />
            </div>
            <div style={{position:"absolute", right: 120, top: 200, opacity:.5}}>
              <PixenSprite color="#41e6ff" scale={5} />
            </div>
            <div style={{position:"absolute", left: 230, top: 220, opacity:.4}}>
              <PixenSprite color="#6cff5a" scale={4} />
            </div>
            {/* "art coming soon" tag */}
            <div style={{
              position:"absolute", right: 24, top: 20,
              fontFamily:"var(--font-pixel)", fontSize: 8,
              color: "var(--pix-ink-4)", letterSpacing:".14em",
              padding: "6px 10px", border:"1px dashed var(--pix-line-2)",
            }}>KEY ART · COMING SOON</div>
          </div>
        )}

        {/* glass scrim — the screenshot must recede so the title + CTA pop */}
        <div style={{
          position:"absolute", inset: 0,
          background:
            "linear-gradient(180deg, rgba(11,6,24,.34) 0%, rgba(11,6,24,.12) 28%, rgba(11,6,24,.80) 66%, rgba(11,6,24,.97) 100%)," +
            "linear-gradient(90deg, rgba(11,6,24,.92) 0%, rgba(11,6,24,.58) 38%, rgba(11,6,24,.14) 66%, transparent 82%)",
        }} />
        {/* frosted panel behind the headline/CTA cluster (bottom-left) */}
        <div style={{
          position:"absolute", left: 0, right: 0, bottom: 0, height: "62%",
          background: "linear-gradient(180deg, transparent, rgba(7,4,16,.55))",
          backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
        }} />
        <div className="scanlines" style={{opacity:.14}} />

        {/* content */}
        <div style={{
          position:"absolute", inset: 0, padding: 28,
          display:"flex", flexDirection:"column", justifyContent:"flex-end",
        }}>
          <div className={`eyebrow ${game.tagColor || "magenta"}`} style={{marginBottom: 10}}>
            <span className="dot" />{game.tagline}
          </div>
          <h1 className="title" style={{fontSize: 48, marginBottom: 10}}>
            {game.titleParts.map((p, i) => <span key={i} className={p.cls}>{p.t}</span>)}
          </h1>
          <p className="body-txt" style={{maxWidth: 580, marginBottom: 22, fontSize: 19}}>
            {game.desc}
          </p>
          <div style={{display:"flex", alignItems:"center", gap: 14}}>
            <button className={`btn ${playColor} xl`} onClick={() => playLabel === "INSTALL" ? onInstall(game) : playLabel === "UPDATE" ? onUpdate(game) : onPlay(game)}>
              ▸ {playLabel}
            </button>
            {status === "installed" && (
              <div style={{display:"flex", flexDirection:"column", gap: 4}}>
                <span className="eyebrow lime" style={{fontSize:7}}><span className="dot" />READY</span>
                <span className="mono" style={{fontSize: 14, color:"var(--pix-ink-3)"}}>
                  v{game.version} · {game.size}
                </span>
              </div>
            )}
            {status === "update" && (
              <div style={{display:"flex", flexDirection:"column", gap: 4}}>
                <span className="eyebrow cyan" style={{fontSize:7}}><span className="dot" />UPDATE AVAILABLE</span>
                <span className="mono" style={{fontSize: 14, color:"var(--pix-ink-3)"}}>
                  v{game.version} → v{game.nextVersion}{game.sizeMB ? ` · ${game.sizeMB} MB` : ""}
                </span>
              </div>
            )}
            {status === "install" && (
              <div style={{display:"flex", flexDirection:"column", gap: 4}}>
                <span className="eyebrow cyan" style={{fontSize:7}}><span className="dot" />NOT INSTALLED</span>
                <span className="mono" style={{fontSize: 14, color:"var(--pix-ink-3)"}}>
                  Download size · {game.size}
                </span>
              </div>
            )}
            <div style={{marginLeft: 14, display:"flex", gap: 6}}>
              {game.platforms.map(p => (
                <span key={p} className="pix" style={{
                  fontSize: 7, letterSpacing:".14em",
                  padding: "5px 8px",
                  border: "1px solid var(--pix-line-2)",
                  color: "var(--pix-ink-3)",
                  background: "rgba(11,6,24,.55)",
                }}>{p}</span>
              ))}
            </div>
          </div>
        </div>

        {/* nav arrows top-right (for swapping hero variants) */}
        <div style={{position:"absolute", top: 16, right: 16, display:"flex", gap: 6}}>
          <button className="tb-icon-btn" style={{width:28, height:28, background:"rgba(11,6,24,.65)"}}>‹</button>
          <button className="tb-icon-btn" style={{width:28, height:28, background:"rgba(11,6,24,.65)"}}>›</button>
        </div>
      </div>

      {/* ── LEFT COL: NEWS CAROUSEL + GALLERY ──────────────────── */}
      <div style={{display:"flex", flexDirection:"column", gap: 18, minWidth: 0}}>
        {/* NEWS CAROUSEL */}
        <div className="panel">
          <div className="panel-hd">
            <h3>NEWS &amp; PATCH NOTES</h3>
            <div style={{display:"flex", alignItems:"center", gap: 10}}>
              <div className="dots">
                {news.map((_, i) => <span key={i} className={`d ${i === newsIdx ? "on" : ""}`} onClick={()=>setNewsIdx(i)} />)}
              </div>
              <span className="meta">{newsIdx+1}/{news.length}</span>
            </div>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"260px 1fr", gap: 0}}>
            <div style={{
              aspectRatio:"16/9",
              background: news[newsIdx].thumb
                ? `url(${news[newsIdx].thumb}) center/cover`
                : `linear-gradient(135deg, ${news[newsIdx].tone || "#3a0f6a"}, #0e041e)`,
              imageRendering:"pixelated",
              position:"relative", borderRight: "1px solid var(--pix-line)",
            }}>
              {!news[newsIdx].thumb && (
                <div style={{position:"absolute", inset:0, display:"grid", placeItems:"center"}}>
                  <PixenSprite color={news[newsIdx].sprite || "#ff1e85"} scale={5} />
                </div>
              )}
              <div style={{position:"absolute", left: 8, top: 8}}>
                <span className={`eyebrow ${news[newsIdx].tagColor || "magenta"}`} style={{
                  background:"rgba(11,6,24,.7)", padding:"4px 6px",
                }}>{news[newsIdx].tag}</span>
              </div>
            </div>
            <div style={{padding: 16, display:"flex", flexDirection:"column"}}>
              <span className="mono" style={{fontSize: 13, color:"var(--pix-ink-4)", marginBottom: 4}}>
                {news[newsIdx].date}
              </span>
              <h4 className="pix" style={{fontSize:12, letterSpacing:".08em", color:"var(--pix-ink)", marginBottom: 8, lineHeight:1.3}}>
                {news[newsIdx].title}
              </h4>
              <p className="mono" style={{fontSize:15, color:"var(--pix-ink-2)", lineHeight:1.35, flex:1}}>
                {news[newsIdx].body}
              </p>
              <div style={{marginTop: 10}}>
                <a className="mono" style={{color:"var(--pix-cyan)", fontSize:14}}>READ MORE →</a>
              </div>
            </div>
          </div>
        </div>

        {/* SCREENSHOTS / GALLERY */}
        {game.gallery && game.gallery.length > 0 && (
          <div className="panel">
            <div className="panel-hd">
              <h3>SCREENSHOTS</h3>
              <span className="meta mono">{game.gallery.length} shots</span>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 6, padding: 14}}>
              {game.gallery.map((src, i) => (
                <div key={i} style={{
                  aspectRatio:"16/9",
                  background: `url(${src}) center/cover`,
                  border: "1px solid var(--pix-line-2)",
                  cursor:"pointer",
                  imageRendering: "pixelated",
                }} />
              ))}
            </div>
          </div>
        )}

        {/* DETAILS PANEL */}
        <div className="panel" style={{padding: 18}}>
          <div className="eyebrow" style={{marginBottom: 12}}><span className="dot" />ABOUT THIS GAME</div>
          <p className="mono" style={{fontSize:16, color:"var(--pix-ink-2)", lineHeight:1.45, marginBottom: 16}}>
            {game.longDesc}
          </p>
          <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 14, marginTop: 14}}>
            {statTiles.map(s => (
              <div key={s.label}>
                <div className="eyebrow" style={{fontSize:7, color:"var(--pix-ink-4)", marginBottom: 4}}>{s.label}</div>
                <div className="mono" style={{fontSize:18, color: s.color || "var(--pix-ink)"}}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT COL: PICK PIXEN + REAL CHAT ───────────────────── */}
      <div style={{display:"flex", flexDirection:"column", gap: 18, minWidth: 0}}>
        {/* YOUR PIXEN (R41.1) — the REAL featured Pixen from the signed-in
            account (same featured_token_id pixens.io uses). It carries
            its kit + spell into every game incl. Realms. Falls back to
            the pick CTA only when the account truly has none selected. */}
        {profile && profile.featured ? (
          (() => {
            const f = profile.featured;
            const RC = { common:"#9d8fc4", uncommon:"#6cff5a", rare:"#41e6ff",
              epic:"#b026ff", legendary:"#ffbe0b", mythic:"#ff1e85" };
            const tc = (f.tier && RC[f.tier]) || "var(--pix-purple)";
            return (
              <div className="panel" style={{padding: 16}}>
                <div className="eyebrow purple" style={{marginBottom: 12}}><span className="dot" />YOUR PIXEN</div>
                <div style={{display:"flex", alignItems:"center", gap: 14, marginBottom: 14}}>
                  <div style={{
                    width: 64, height: 64, flexShrink: 0, display:"grid", placeItems:"center",
                    border: `1px solid ${tc}`, borderRadius: 8, background:"rgba(11,6,24,.6)",
                    boxShadow:`0 0 16px ${tc}55`, overflow:"hidden",
                  }}>
                    {/* REAL Pixen art (pixens.io Worker SVG) — not a fake
                        canvas. onError keeps the box clean if offline. */}
                    {f.art
                      ? <img src={f.art} alt="" width={56} height={56}
                          style={{ imageRendering:"pixelated" }}
                          onError={(e)=>{ e.currentTarget.style.display="none"; }} />
                      : <span className="pix" style={{fontSize:10,color:tc}}>#{f.tokenId}</span>}
                  </div>
                  <div style={{minWidth: 0}}>
                    <div className="pix" style={{fontSize: 13, color:"var(--pix-ink)", letterSpacing:".06em", marginBottom: 5}}>
                      {f.name || `PIXEN #${f.tokenId}`}
                    </div>
                    {f.tier && (
                      <div className="pix" style={{fontSize: 8, letterSpacing:".16em", color: tc}}>
                        {String(f.tier).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <p className="mono" style={{fontSize: 14, color:"var(--pix-ink-3)", lineHeight: 1.4, marginBottom: 14}}>
                  Carries its kit + signature spell into every Pixens game.
                </p>
                <button className="btn ghost block"
                  onClick={() => onChangePixen && onChangePixen()}>
                  ▸ CHANGE PIXEN
                </button>
              </div>
            );
          })()
        ) : (
          <div className="panel" style={{padding: 16}}>
            <div className="eyebrow purple" style={{marginBottom: 10}}><span className="dot" />YOUR PIXEN</div>
            <p className="mono" style={{fontSize: 14, color:"var(--pix-ink-3)", lineHeight: 1.4, marginBottom: 14}}>
              Pick the Pixen you play as. It carries its kit + signature
              spell into every Pixens game.
            </p>
            <button className="btn magenta block"
              onClick={() => onChangePixen && onChangePixen()}>
              ▸ PICK YOUR PIXEN
            </button>
          </div>
        )}

        {/* chat is now the persistent global right rail (see ChatRail in
            app.jsx) — not duplicated per game here. */}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ALL GAMES (sidebar variant — grid)
// ════════════════════════════════════════════════════════════════════
function AllGames({ games, onPick }) {
  const [filter, setFilter] = useState("ALL");
  return (
    <div className="scroll" style={{flex:1, padding: 24}}>
      <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom: 18}}>
        <div>
          <div className="eyebrow magenta" style={{marginBottom: 6}}><span className="dot" />GAMES LIBRARY</div>
          <h1 className="pix" style={{fontSize: 20, letterSpacing:".08em"}}>ALL GAMES <span style={{color:"var(--pix-ink-4)"}}>· {games.length}</span></h1>
        </div>
        <div style={{display:"flex", gap: 4}}>
          {["ALL", "INSTALLED", "FAVORITES", "FREE"].map(f => (
            <button key={f} className={`pix`} style={{
              fontSize:9, letterSpacing:".14em",
              padding:"8px 12px",
              border:`1px solid ${filter===f ? "var(--pix-magenta)" : "var(--pix-line-2)"}`,
              background: filter===f ? "rgba(255,30,133,.12)" : "transparent",
              color: filter===f ? "var(--pix-magenta)" : "var(--pix-ink-3)",
            }} onClick={()=>setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 20}}>
        {games.map(g => {
          const art = g.cover || g.hero;
          const installed = g.status === "installed";
          const isUpdate = g.status === "update";
          return (
            <div key={g.id} className="ag-card" onClick={()=>onPick(g.id)} style={{
              background:"var(--pix-bg)", border:"1px solid var(--pix-line-2)",
              borderRadius: 12, overflow:"hidden", cursor:"pointer",
              display:"flex", flexDirection:"column",
            }}>
              <div style={{
                aspectRatio: "16/10",
                background: art ? `url(${art}) center/cover` : "linear-gradient(135deg, #1a0830, #3a0f6a)",
                position:"relative",
              }}>
                {!art && (
                  <div style={{position:"absolute", inset:0, display:"grid", placeItems:"center"}}>
                    <PixenSprite color="#ff1e85" scale={8} />
                  </div>
                )}
                <div style={{position:"absolute", top: 10, left: 10}}>
                  <span className={`eyebrow ${g.tagColor}`} style={{
                    background:"rgba(11,6,24,.78)", padding:"4px 7px",
                  }}><span className="dot" />{g.kind}</span>
                </div>
                {g.hasUpdate && (
                  <div style={{position:"absolute", top: 10, right: 10,
                    background: "var(--pix-cyan)", color:"#061018",
                    fontFamily:"var(--font-pixel)", fontSize: 8, padding:"3px 6px",
                  }}>UPDATE</div>
                )}
              </div>
              <div style={{padding: 16, display:"flex", flexDirection:"column", gap: 8, flex: 1}}>
                <div className="pix" style={{fontSize: 14, color:"var(--pix-ink)", letterSpacing:".05em"}}>
                  {g.titleParts.map((p, i) => <span key={i} className={p.cls}>{p.t}</span>)}
                </div>
                <div className="mono" style={{fontSize: 14, color:"var(--pix-ink-3)", lineHeight: 1.35, flex: 1}}>
                  {g.desc}
                </div>
                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginTop: 6}}>
                  <span className={`eyebrow ${installed ? "lime" : isUpdate ? "cyan" : "magenta"}`} style={{fontSize:8}}>
                    <span className="dot" />
                    {installed ? "READY" : isUpdate ? "UPDATE" : g.status === "playing" ? "RUNNING" : "NOT INSTALLED"}
                  </span>
                  <button className="btn magenta" onClick={(e)=>{ e.stopPropagation(); onPick(g.id); }}
                    style={{fontSize:9, padding:"9px 18px", letterSpacing:".1em"}}>
                    {g.id === "realms" ? (installed ? "PLAY" : "GET") : "PLAY"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// WALLET / PICK PIXEN
// ════════════════════════════════════════════════════════════════════
function WalletScreen({ onClose, onPick, walletConnected }) {
  const [mode, setMode] = useState(walletConnected ? "pick" : "connect");
  const [selected, setSelected] = useState(0);

  const pixens = useMemo(() => {
    const rarities = ["common", "common", "uncommon", "uncommon", "rare", "rare", "epic", "legendary"];
    return Array.from({length: 12}, (_, i) => ({
      id: i + 1,
      rarity: rarities[i % rarities.length],
      seed: i % 6,
      bg: ["#6b0c3a","#0a4e5e","#14501a","#3a0f6a","#5e4806","#5a2806"][i%6],
    }));
  }, []);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{width: 660, padding:0}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"18px 24px", borderBottom:"1px solid var(--pix-line)", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div>
            <div className="eyebrow purple" style={{marginBottom: 4}}><span className="dot" />WALLET</div>
            <h2 className="pix" style={{fontSize: 13, letterSpacing:".1em"}}>
              {mode === "connect" ? "CONNECT WALLET" : "PICK YOUR PIXEN"}
            </h2>
          </div>
          <button className="tb-btn" onClick={onClose}>✕</button>
        </div>

        {mode === "connect" && (
          <div style={{padding: 24, display:"grid", gridTemplateColumns:"1fr 1fr", gap: 24}}>
            {/* QR side */}
            <div style={{textAlign:"center"}}>
              <div className="eyebrow" style={{marginBottom: 14}}>SCAN WITH MOBILE</div>
              <Bracket color="magenta" style={{display:"inline-block", padding: 12, background: "white"}}>
                {/* fake QR */}
                <div style={{width:180, height:180, display:"grid", gridTemplateColumns:"repeat(21, 1fr)"}}>
                  {Array.from({length: 441}).map((_, i) => {
                    const x = i % 21, y = Math.floor(i / 21);
                    const corner = (x<7 && y<7) || (x>13 && y<7) || (x<7 && y>13);
                    const inner = corner && !((x===0||x===6||y===0||y===6) && (x<7&&y<7))
                      && !((x>13&&y<7&&(x===14||x===20||y===0||y===6)))
                      && !((x<7&&y>13&&(x===0||x===6||y===14||y===20)));
                    const on = corner ? (
                      (x<7&&y<7) ? (x===0||x===6||y===0||y===6 || (x>=2&&x<=4&&y>=2&&y<=4)) :
                      (x>13&&y<7) ? (x===14||x===20||y===0||y===6 || (x>=16&&x<=18&&y>=2&&y<=4)) :
                      (x===0||x===6||y===14||y===20 || (x>=2&&x<=4&&y>=16&&y<=18))
                    ) : ((x*31 + y*17 + i*7) % 5 < 2);
                    return <div key={i} style={{background: on ? "#0b0618" : "white"}} />;
                  })}
                </div>
              </Bracket>
              <div className="mono" style={{fontSize: 14, color:"var(--pix-ink-3)", marginTop: 14}}>
                Use any WalletConnect-compatible wallet
              </div>
            </div>
            {/* options side */}
            <div>
              <div className="eyebrow" style={{marginBottom: 14}}>OR PICK A WALLET</div>
              <div style={{display:"flex", flexDirection:"column", gap: 8}}>
                {[
                  { n: "MetaMask", col: "var(--pix-orange)", g: "🦊" },
                  { n: "Phantom", col: "var(--pix-purple)", g: "◉" },
                  { n: "Rainbow", col: "var(--pix-cyan)", g: "◌" },
                  { n: "Coinbase Wallet", col: "var(--pix-cyan)", g: "◇" },
                ].map(w => (
                  <button key={w.n} className="btn ghost block" style={{justifyContent:"flex-start", gap: 14, height:48, padding:"0 16px"}}>
                    <span style={{color: w.col, fontSize: 18}}>{w.g}</span>
                    <span style={{fontSize: 10}}>{w.n.toUpperCase()}</span>
                    <span style={{marginLeft:"auto", color:"var(--pix-ink-4)"}}>→</span>
                  </button>
                ))}
              </div>
              <div className="divider" />
              <button className="btn cyan block" onClick={()=>setMode("pick")}>▸ I'M CONNECTED, CONTINUE</button>
              <div className="mono" style={{fontSize:13, color:"var(--pix-ink-4)", marginTop: 10, textAlign:"center"}}>
                You can play VS AI without a wallet — but PvP &amp; ranked need a Pixen.
              </div>
            </div>
          </div>
        )}

        {mode === "pick" && (
          <div style={{padding: 20}}>
            <div className="mono" style={{fontSize: 15, color:"var(--pix-ink-3)", marginBottom: 14}}>
              Wallet <span style={{color:"var(--pix-purple)"}}>0xa487…f2c1</span> · {pixens.length} Pixens
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap: 8}}>
              {pixens.map(p => (
                <div key={p.id}
                  className={`pixen-cell ${selected === p.id ? "selected" : ""}`}
                  onClick={()=>setSelected(p.id)}>
                  <span className={`rarity ${p.rarity}`}>{p.rarity.slice(0,3).toUpperCase()}</span>
                  <div style={{background:`radial-gradient(circle at 50% 60%, ${p.bg}, transparent)`, width:"100%", height:"100%", display:"grid", placeItems:"center"}}>
                    <PixenAvatar seed={p.seed} scale={4} />
                  </div>
                  <span className="id">#{p.id}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop: 18}}>
              <span className="mono" style={{fontSize: 14, color:"var(--pix-ink-3)"}}>
                {selected ? <>Selected · <span style={{color:"var(--pix-magenta)"}}>Pixen #{selected}</span></> : "Pick a Pixen to link to your account."}
              </span>
              <div style={{display:"flex", gap: 10}}>
                <button className="btn ghost" onClick={onClose}>CANCEL</button>
                <button className="btn magenta" disabled={!selected} onClick={()=>onPick(selected)}
                  style={!selected?{opacity:.4, cursor:"not-allowed"}:{}}>
                  ▸ LINK PIXEN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════════════════════════════
function SettingsScreen({ onClose, onLogout }) {
  const [tab, setTab] = useState("game");
  const tabs = [
    { id: "game", label: "GAME" },
    { id: "video", label: "VIDEO" },
    { id: "audio", label: "AUDIO" },
    { id: "account", label: "ACCOUNT" },
    { id: "downloads", label: "DOWNLOADS" },
  ];

  return (
    <div className="scroll" style={{flex:1, padding: 24, display:"grid", gridTemplateColumns:"200px 1fr", gap: 24}}>
      <div>
        <div className="eyebrow magenta" style={{marginBottom: 14}}><span className="dot" />SETTINGS</div>
        <div style={{display:"flex", flexDirection:"column", gap: 4}}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className="pix" style={{
              fontSize: 10, letterSpacing:".1em",
              padding: "10px 14px", textAlign:"left",
              background: tab === t.id ? "rgba(255,30,133,.12)" : "transparent",
              borderLeft: `2px solid ${tab === t.id ? "var(--pix-magenta)" : "transparent"}`,
              color: tab === t.id ? "var(--pix-magenta)" : "var(--pix-ink-3)",
            }}>{t.label}</button>
          ))}
        </div>
        <div className="divider" style={{margin:"18px 0"}}/>
        <button className="btn ghost block sm" onClick={onClose}>← BACK</button>
      </div>

      <div>
        {tab === "video" && (
          <SettingsBlock title="VIDEO" rows={[
            { label: "RESOLUTION", control: <Select value="1920×1080" options={["1280×720","1600×900","1920×1080","2560×1440","3840×2160"]} /> },
            { label: "DISPLAY MODE", control: <Segmented value="fullscreen" options={["windowed","borderless","fullscreen"]} /> },
            { label: "REFRESH RATE", control: <Select value="144 Hz" options={["60 Hz","120 Hz","144 Hz","240 Hz"]} /> },
            { label: "PIXEL SCALE", control: <Slider value={4} min={1} max={8} unit="×" /> },
            { label: "VSYNC", control: <Toggle value={true} /> },
            { label: "CRT SCANLINES", control: <Toggle value={true} /> },
            { label: "BLOOM / GLOW", control: <Slider value={72} min={0} max={100} unit="%" /> },
          ]} />
        )}
        {tab === "audio" && (
          <SettingsBlock title="AUDIO" rows={[
            { label: "MASTER", control: <Slider value={80} min={0} max={100} unit="%" /> },
            { label: "MUSIC", control: <Slider value={65} min={0} max={100} unit="%" /> },
            { label: "SFX", control: <Slider value={90} min={0} max={100} unit="%" /> },
            { label: "VOICE", control: <Slider value={75} min={0} max={100} unit="%" /> },
            { label: "8-BIT CHIPTUNE", control: <Toggle value={true} /> },
            { label: "OUTPUT DEVICE", control: <Select value="System Default" options={["System Default","Headphones","Speakers"]} /> },
          ]} />
        )}
        {tab === "game" && (
          <SettingsBlock title="GAMEPLAY" rows={[
            { label: "DEFAULT GAME", control: <Select value="Pixens Realms" options={["Pixens Realms","Pixen Defense","Block Arena","Last played"]} /> },
            { label: "AUTO-INSTALL UPDATES", control: <Toggle value={true} /> },
            { label: "LAUNCH ON STARTUP", control: <Toggle value={true} /> },
            { label: "MINIMIZE WHEN PLAYING", control: <Toggle value={true} /> },
            { label: "GAME NOTIFICATIONS", control: <Toggle value={true} /> },
            { label: "DISCORD RICH PRESENCE", control: <Toggle value={true} /> },
            { label: "TELEMETRY", control: <Toggle value={false} /> },
          ]} />
        )}
        {tab === "account" && (
          <SettingsBlock title="ACCOUNT" rows={[
            { label: "EMAIL", control: <span className="mono" style={{fontSize:16, color:"var(--pix-ink-2)"}}>iampixen@pixens.io <a style={{color:"var(--pix-cyan)", marginLeft:8, fontSize:14}}>CHANGE</a></span> },
            { label: "WALLET", control: <span className="mono" style={{fontSize:16, color:"var(--pix-purple)"}}>0xa487…f2c1 <a style={{color:"var(--pix-cyan)", marginLeft:8, fontSize:14}}>SWITCH</a></span> },
            { label: "LINKED PIXEN", control: <span className="mono" style={{fontSize:16, color:"var(--pix-ink-2)"}}>#1 · Uncommon</span> },
            { label: "2-FACTOR AUTH", control: <Toggle value={true} /> },
            { label: "EMAIL UPDATES", control: <Toggle value={false} /> },
          ]} footer={
            <div style={{display:"flex", gap:10, marginTop: 18}}>
              <button className="btn ghost">EXPORT DATA</button>
              <button className="btn ghost" style={{borderColor:"var(--pix-red)", color:"var(--pix-red)"}} onClick={onLogout}>LOG OUT</button>
            </div>
          } />
        )}
        {tab === "downloads" && (
          <SettingsBlock title="DOWNLOADS &amp; STORAGE" rows={[
            { label: "INSTALL DIR", control: <span className="mono" style={{fontSize:15, color:"var(--pix-ink-2)"}}>C:/Program Files/Pixens <a style={{color:"var(--pix-cyan)", marginLeft:8, fontSize:14}}>CHANGE</a></span> },
            { label: "MAX BANDWIDTH", control: <Slider value={50} min={1} max={100} unit=" MB/s" /> },
            { label: "BACKGROUND DOWNLOAD", control: <Toggle value={true} /> },
            { label: "INSTALL P2P", control: <Toggle value={false} /> },
          ]} footer={
            <div className="panel" style={{padding: 14, marginTop: 18}}>
              <div className="eyebrow" style={{marginBottom: 8}}>STORAGE</div>
              {[
                { n: "Pixens Realms", size: "2.4 GB", pct: 64, col:"var(--pix-magenta)" },
                { n: "Launcher", size: "320 MB", pct: 10, col:"var(--pix-cyan)" },
                { n: "Cache", size: "180 MB", pct: 6, col:"var(--pix-purple)" },
              ].map(s => (
                <div key={s.n} style={{display:"flex", alignItems:"center", gap: 10, marginBottom: 6}}>
                  <div style={{width:140, fontFamily:"var(--font-mono)", fontSize:15, color:"var(--pix-ink-2)"}}>{s.n}</div>
                  <div style={{flex:1, height:8, background:"var(--pix-bg-3)", border:"1px solid var(--pix-line)"}}>
                    <div style={{width:`${s.pct}%`, height:"100%", background:s.col, boxShadow:`0 0 8px ${s.col}`}} />
                  </div>
                  <div className="mono" style={{fontSize:14, color:"var(--pix-ink-3)", width: 70, textAlign:"right"}}>{s.size}</div>
                </div>
              ))}
            </div>
          } />
        )}
      </div>
    </div>
  );
}

function SettingsBlock({ title, rows, footer }) {
  return (
    <div>
      <h2 className="pix" style={{fontSize: 16, letterSpacing:".08em", marginBottom: 6}}>{title}</h2>
      <div className="divider" style={{margin:"4px 0 18px"}} />
      <div style={{display:"flex", flexDirection:"column"}}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display:"grid", gridTemplateColumns:"220px 1fr",
            alignItems:"center", gap: 18,
            padding: "12px 0",
            borderBottom: "1px solid var(--pix-line)",
          }}>
            <div className="pix" style={{fontSize:9, letterSpacing:".1em", color:"var(--pix-ink-3)"}}>{r.label}</div>
            <div>{r.control}</div>
          </div>
        ))}
      </div>
      {footer}
    </div>
  );
}

function Toggle({ value }) {
  const [on, setOn] = useState(value);
  return (
    <button onClick={()=>setOn(o=>!o)} style={{
      width: 48, height: 24,
      background: on ? "var(--pix-magenta)" : "var(--pix-bg-3)",
      border: `1px solid ${on ? "var(--pix-magenta)" : "var(--pix-line-2)"}`,
      borderRadius: 2,
      position:"relative",
      boxShadow: on ? "0 0 10px rgba(255,30,133,.5)" : "none",
    }}>
      <span style={{
        position:"absolute", top: 2, left: on ? 26 : 2,
        width: 18, height: 18, background: "white", transition: "left .15s ease",
      }} />
    </button>
  );
}

function Slider({ value, min, max, unit = "" }) {
  const [v, setV] = useState(value);
  return (
    <div style={{display:"flex", alignItems:"center", gap: 14, maxWidth: 420}}>
      <input type="range" min={min} max={max} value={v} onChange={e=>setV(+e.target.value)}
        style={{flex:1, accentColor:"var(--pix-magenta)"}} />
      <span className="mono" style={{fontSize: 16, color: "var(--pix-cyan)", minWidth: 60, textAlign:"right"}}>{v}{unit}</span>
    </div>
  );
}

function Select({ value, options }) {
  const [v, setV] = useState(value);
  return (
    <select value={v} onChange={e=>setV(e.target.value)} style={{
      background:"var(--pix-bg-2)", color:"var(--pix-ink)",
      border:"1px solid var(--pix-line-2)", borderRadius:2,
      padding:"8px 12px", fontFamily:"var(--font-mono)", fontSize: 16,
      minWidth: 200,
    }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function Segmented({ value, options }) {
  const [v, setV] = useState(value);
  return (
    <div style={{display:"inline-flex", border:"1px solid var(--pix-line-2)", borderRadius:2}}>
      {options.map(o => (
        <button key={o} onClick={()=>setV(o)} className="pix" style={{
          fontSize: 8, letterSpacing:".1em",
          padding:"8px 14px",
          background: v === o ? "var(--pix-magenta)" : "transparent",
          color: v === o ? "white" : "var(--pix-ink-3)",
        }}>{o.toUpperCase()}</button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// UPDATE / PATCH SCREEN  (overlay)
// ════════════════════════════════════════════════════════════════════
// REAL update screen — driven by window.pixens.realms.onProgress
// (MAIN streams { phase:'download'|'verify'|'install'|'done', percent,
// recvMB, totalMB }). No fake timer / "84 MB" / fake speed / fake
// changelog: every number here is the actual download.
function UpdateScreen({ game, onClose }) {
  const [st, setSt] = useState({ phase: "download", percent: 0, recvMB: 0, totalMB: (game && game.sizeMB) || 0 });
  const [start] = useState(() => Date.now());
  useEffect(() => {
    try {
      return window.pixens && window.pixens.realms && window.pixens.realms.onProgress
        && window.pixens.realms.onProgress((p) => setSt(s => ({ ...s, ...p })));
    } catch (_) { /* not in launcher */ }
  }, []);

  const PH = { download: "DOWNLOAD", verify: "VERIFY", install: "INSTALL", done: "DONE" };
  const order = ["download", "verify", "install", "done"];
  const phaseKey = PH[st.phase] ? st.phase : "download";
  const isDone = phaseKey === "done";
  const pct = isDone ? 100 : Math.max(0, Math.min(100, Math.round(st.percent || 0)));
  const totalMB = st.totalMB || (game && game.sizeMB) || 0;
  const recvMB = isDone ? totalMB : (st.recvMB || 0);
  const elapsed = Math.max(0.25, (Date.now() - start) / 1000);
  const speed = (phaseKey === "download" && recvMB > 0) ? recvMB / elapsed : 0; // MB/s
  const etaS = (speed > 0.05 && phaseKey === "download")
    ? Math.max(0, Math.round((totalMB - recvMB) / speed)) : 0;
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="scroll" style={{flex:1, padding: 28, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap: 0}}>
      <div style={{width:"min(620px,92%)"}}>
        <div className={`eyebrow ${isDone ? "lime" : "cyan"}`} style={{marginBottom: 10}}><span className="dot" />
          {isDone ? "UPDATE COMPLETE" : "UPDATING"}
        </div>
        <h1 className="pix" style={{fontSize: 22, letterSpacing:".08em", lineHeight:1.2, marginBottom: 6}}>
          {game.titleParts.map((p, i) => <span key={i} className={p.cls}>{p.t}</span>)}
        </h1>
        <div className="mono" style={{fontSize: 16, color:"var(--pix-ink-3)", marginBottom: 24}}>
          {game.version ? <>v{game.version} → </> : null}v{game.nextVersion}
          {totalMB ? <> &nbsp;·&nbsp; {totalMB} MB</> : null}
        </div>

        <div style={{display:"flex", justifyContent:"space-between", marginBottom: 8}}>
          <span className="pix" style={{fontSize: 9, color:"var(--pix-cyan)", letterSpacing:".14em"}}>
            {isDone ? "✓ READY TO PLAY" : `▸ ${PH[phaseKey]}…`}
          </span>
          <span className="mono" style={{fontSize: 16, color:"var(--pix-cyan)"}}>{pct}%</span>
        </div>
        <div className="progress cyan" style={{height: 20}}>
          <div className="bar" style={{width: `${pct}%`, transition:"width .25s"}} />
        </div>

        <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 0, marginTop: 18}}>
          {order.map((k, i) => {
            const cur = order.indexOf(phaseKey);
            const done = i < cur || isDone;
            const active = i === cur && !isDone;
            return (
              <div key={k} style={{
                padding: "10px 6px", textAlign:"center",
                borderBottom: `2px solid ${done ? "var(--pix-lime)" : active ? "var(--pix-cyan)" : "var(--pix-line)"}`,
              }}>
                <div className="pix" style={{fontSize:8, letterSpacing:".12em", color: done ? "var(--pix-lime)" : active ? "var(--pix-cyan)" : "var(--pix-ink-4)"}}>
                  {done ? "✓ " : active ? "▸ " : ""}{PH[k]}
                </div>
              </div>
            );
          })}
        </div>

        <div className="panel" style={{padding: 16, marginTop: 22}}>
          <div className="eyebrow" style={{marginBottom: 8}}><span className="dot" />DOWNLOAD</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14}}>
            <div>
              <div className="eyebrow" style={{fontSize:7, color:"var(--pix-ink-4)", marginBottom:4}}>PROGRESS</div>
              <div className="mono" style={{fontSize:18, color:"var(--pix-cyan)"}}>
                {totalMB ? `${recvMB.toFixed(1)} / ${totalMB} MB` : `${pct}%`}
              </div>
            </div>
            <div>
              <div className="eyebrow" style={{fontSize:7, color:"var(--pix-ink-4)", marginBottom:4}}>SPEED</div>
              <div className="mono" style={{fontSize:18, color:"var(--pix-cyan)"}}>
                {phaseKey === "download" && speed > 0 ? `${speed.toFixed(1)} MB/s` : "—"}
              </div>
            </div>
            <div>
              <div className="eyebrow" style={{fontSize:7, color:"var(--pix-ink-4)", marginBottom:4}}>ETA</div>
              <div className="mono" style={{fontSize:18, color:"var(--pix-ink)"}}>
                {etaS > 0 ? mmss(etaS) : isDone ? "DONE" : "—"}
              </div>
            </div>
          </div>
        </div>

        <div style={{display:"flex", gap: 12, marginTop: 22}}>
          <button className="btn ghost" onClick={onClose}>
            {isDone ? "BACK" : "HIDE — KEEP UPDATING"}
          </button>
        </div>
        <div className="mono" style={{fontSize: 13, color:"var(--pix-ink-4)", marginTop: 12, lineHeight:1.4}}>
          Pixens Realms client — latest world, mods &amp; fixes. The launcher
          returns to the hub automatically when the update finishes.
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// NEWS — full news/announcements feed (the NEWS nav tab)
// ════════════════════════════════════════════════════════════════════
function NewsScreen({ news }) {
  return (
    <div className="scroll" style={{flex:1, padding:24}}>
      <div style={{marginBottom:18}}>
        <div className="eyebrow cyan" style={{marginBottom:6}}><span className="dot" />LATEST</div>
        <h1 className="pix" style={{fontSize:20, letterSpacing:".08em"}}>
          NEWS <span style={{color:"var(--pix-ink-4)"}}>· {news.length}</span>
        </h1>
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:14}}>
        {news.map((n, i) => (
          <div key={i} style={{
            border:"1px solid var(--pix-line-2)", borderRadius:10, overflow:"hidden",
            background:"var(--pix-bg)", display:"grid", gridTemplateColumns:"260px 1fr",
          }}>
            <div style={{
              aspectRatio:"16/9",
              background: n.thumb
                ? `url(${n.thumb}) center/cover`
                : `linear-gradient(135deg, ${n.tone || "#3a0f6a"}, #0e041e)`,
              position:"relative", borderRight:"1px solid var(--pix-line)",
            }}>
              {!n.thumb && (
                <div style={{position:"absolute", inset:0, display:"grid", placeItems:"center"}}>
                  <PixenSprite color={n.sprite || "#ff1e85"} scale={5} />
                </div>
              )}
              <div style={{position:"absolute", left:8, top:8}}>
                <span className={`eyebrow ${n.tagColor || "magenta"}`} style={{
                  background:"rgba(11,6,24,.7)", padding:"4px 6px",
                }}>{n.tag}</span>
              </div>
            </div>
            <div style={{padding:16, display:"flex", flexDirection:"column"}}>
              <span className="mono" style={{fontSize:13, color:"var(--pix-ink-4)", marginBottom:4}}>{n.date}</span>
              <h4 className="pix" style={{fontSize:12, letterSpacing:".08em", color:"var(--pix-ink)", marginBottom:8, lineHeight:1.3}}>
                {n.title}
              </h4>
              <p className="mono" style={{fontSize:15, color:"var(--pix-ink-2)", lineHeight:1.35, flex:1}}>
                {n.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// publish
Object.assign(window, {
  InstallerWindow, LoginScreen, GameDetail, AllGames,
  WalletScreen, SettingsScreen, UpdateScreen, NewsScreen,
});
