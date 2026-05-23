import { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

const features = [
  {
    icon: (
      <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "Kanban Pipeline",
    desc: "Drag & drop applications across stages effortlessly.",
  },
  {
    icon: (
      <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "AI Interview Coach",
    desc: "Get personalised prep tips & follow-up emails instantly.",
  },
  {
    icon: (
      <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Smart Analytics",
    desc: "Track conversion rate, interview rate, and more.",
  },
];

function EyeIcon({ open }) {
  return open ? (
    <svg style={{ width: "15px", height: "15px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg style={{ width: "15px", height: "15px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function Auth({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  function parseFirebaseError(msg) {
    if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential"))
      return "Invalid email or password. Please try again.";
    if (msg.includes("email-already-in-use")) return "An account with this email already exists.";
    if (msg.includes("weak-password")) return "Password must be at least 6 characters.";
    if (msg.includes("invalid-email")) return "Please enter a valid email address.";
    if (msg.includes("too-many-requests")) return "Too many attempts. Please try again later.";
    return "Something went wrong. Please try again.";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      if (isLogin) {
        const res = await signInWithEmailAndPassword(auth, email, password);
        setUser(res.user);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(res.user);
        setSuccessMsg("Account created! Check your email for a verification link.");
        setUser(res.user);
      }
    } catch (err) {
      setError(parseFirebaseError(err.message));
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsLogin(!isLogin);
    setError("");
    setSuccessMsg("");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }

        @keyframes orb1 { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(50px,30px) scale(1.12)} }
        @keyframes orb2 { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(-30px,-50px) scale(1.08)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }

        .auth-root {
          min-height: 100vh;
          display: flex;
          flex-direction: row;
          background: #0f0f1a;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .auth-orb1 {
          position: absolute; top: -180px; left: -180px;
          width: 520px; height: 520px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%);
          animation: orb1 8s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .auth-orb2 {
          position: absolute; bottom: -120px; right: -80px;
          width: 440px; height: 440px; border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%);
          animation: orb2 10s ease-in-out infinite alternate;
          pointer-events: none;
        }

        /* ── LEFT PANEL ── */
        .auth-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 52px;
          position: relative;
          z-index: 1;
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
        }
        .auth-logo-icon {
          width: 40px; height: 40px; border-radius: 11px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(99,102,241,0.4);
          flex-shrink: 0;
        }
        .auth-logo-text {
          font-size: 18px; font-weight: 700; color: white; letter-spacing: -0.3px;
        }
        .auth-headline {
          font-size: 36px; font-weight: 800; line-height: 1.15;
          color: white; margin-bottom: 12px; letter-spacing: -0.8px;
        }
        .auth-headline-grad {
          background: linear-gradient(135deg, #818cf8, #c084fc);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .auth-subtext {
          font-size: 14px; color: #94a3b8; line-height: 1.65; max-width: 340px; margin-bottom: 36px;
        }
        .auth-features { display: flex; flex-direction: column; gap: 10px; }
        .auth-feature-card {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 13px 15px; border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          transition: all 0.2s ease; cursor: default;
        }
        .auth-feature-card:hover {
          background: rgba(255,255,255,0.07);
          transform: translateX(4px);
        }
        .auth-feature-icon {
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(99,102,241,0.28), rgba(139,92,246,0.28));
          border: 1px solid rgba(99,102,241,0.28);
          display: flex; align-items: center; justify-content: center;
          color: #a5b4fc;
        }
        .auth-feature-title { font-weight: 600; font-size: 13px; color: white; margin-bottom: 2px; }
        .auth-feature-desc  { font-size: 12px; color: #64748b; line-height: 1.5; }
        .auth-badge {
          margin-top: 32px; display: flex; align-items: center; gap: 8px;
        }
        .auth-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #22c55e; box-shadow: 0 0 6px #22c55e;
        }
        .auth-badge-text { font-size: 12px; color: #64748b; }

        /* ── RIGHT PANEL ── */
        .auth-right {
          width: 440px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px 32px;
          position: relative;
          z-index: 1;
        }
        .auth-card {
          width: 100%;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 22px;
          padding: 34px 30px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07);
          animation: fadeUp 0.45s ease forwards;
        }
        .auth-card-title {
          font-size: 22px; font-weight: 800; color: white; margin-bottom: 4px; letter-spacing: -0.4px;
        }
        .auth-card-sub { font-size: 13px; color: #64748b; margin-bottom: 24px; }

        .auth-label { display: block; font-size: 12px; font-weight: 500; color: #cbd5e1; margin-bottom: 6px; }
        .auth-input-wrap { position: relative; margin-bottom: 14px; }
        .auth-input-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: #475569; pointer-events: none; display: flex; align-items: center;
        }
        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 11px;
          padding: 11px 12px 11px 38px;
          font-size: 13px; color: white;
          font-family: 'Inter', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .auth-input::placeholder { color: #475569; }
        .auth-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .auth-eye-btn {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #475569; display: flex; align-items: center; padding: 0;
        }
        .auth-eye-btn:hover { color: #94a3b8; }

        .auth-error {
          display: flex; align-items: flex-start; gap: 8px;
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.22);
          border-radius: 9px; padding: 10px 12px; margin-bottom: 14px;
          animation: fadeUp 0.25s ease;
        }
        .auth-error-text { font-size: 12px; color: #fca5a5; line-height: 1.5; }
        .auth-success {
          display: flex; align-items: flex-start; gap: 8px;
          background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.22);
          border-radius: 9px; padding: 10px 12px; margin-bottom: 14px;
        }
        .auth-success-text { font-size: 12px; color: #86efac; line-height: 1.5; }

        .auth-submit-btn {
          width: 100%; padding: 12px;
          border-radius: 11px; border: none;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; font-size: 14px; font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(99,102,241,0.3);
          transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-family: 'Inter', sans-serif;
          margin-top: 4px;
        }
        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(99,102,241,0.45);
        }
        .auth-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .auth-divider {
          display: flex; align-items: center; gap: 10px; margin: 18px 0;
        }
        .auth-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .auth-divider-text { font-size: 11px; color: #475569; }

        .auth-switch-text { text-align: center; font-size: 13px; color: #64748b; }
        .auth-switch-btn {
          background: none; border: none; cursor: pointer;
          color: #6366f1; font-weight: 600; font-size: 13px;
          padding: 0; font-family: 'Inter', sans-serif;
          transition: color 0.2s;
        }
        .auth-switch-btn:hover { color: #818cf8; }

        .spin { animation: spin 1s linear infinite; }

        @media (max-width: 768px) {
          .auth-root { flex-direction: column; }
          .auth-left { display: none; }
          .auth-right { width: 100%; padding: 24px 16px; }
        }
      `}</style>

      <div className="auth-root">
        <div className="auth-orb1" />
        <div className="auth-orb2" />

        {/* ════ LEFT PANEL ════ */}
        <div className="auth-left">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg style={{ width: "20px", height: "20px", color: "white" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="auth-logo-text">CareerPilot AI</span>
          </div>

          {/* Headline */}
          <h1 className="auth-headline">
            Land your dream{" "}
            <span className="auth-headline-grad">job faster.</span>
          </h1>
          <p className="auth-subtext">
            The all-in-one job application tracker with AI-powered coaching, analytics, and real-time pipeline management.
          </p>

          {/* Features */}
          <div className="auth-features">
            {features.map((f, i) => (
              <div key={i} className="auth-feature-card">
                <div className="auth-feature-icon">{f.icon}</div>
                <div>
                  <p className="auth-feature-title">{f.title}</p>
                  <p className="auth-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Badge */}
          <div className="auth-badge">
            <div className="auth-badge-dot" />
            <span className="auth-badge-text">All data synced securely via Firebase</span>
          </div>
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <div className="auth-right">
          <div className="auth-card">
            <h2 className="auth-card-title">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="auth-card-sub">
              {isLogin ? "Sign in to continue where you left off." : "Start tracking your job hunt for free."}
            </p>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <label className="auth-label">Email address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg style={{ width: "15px", height: "15px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>

              {/* Password */}
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg style={{ width: "15px", height: "15px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Enter your password" : "Min. 6 characters"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input"
                  style={{ paddingRight: "40px" }}
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="auth-error">
                  <svg style={{ width: "14px", height: "14px", color: "#f87171", flexShrink: 0, marginTop: "1px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="auth-error-text">{error}</p>
                </div>
              )}

              {/* Success */}
              {successMsg && (
                <div className="auth-success">
                  <svg style={{ width: "14px", height: "14px", color: "#4ade80", flexShrink: 0, marginTop: "1px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="auth-success-text">{successMsg}</p>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading} className="auth-submit-btn">
                {loading ? (
                  <>
                    <svg className="spin" style={{ width: "15px", height: "15px" }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  isLogin ? "Sign in →" : "Create account →"
                )}
              </button>
            </form>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or</span>
              <div className="auth-divider-line" />
            </div>

            <p className="auth-switch-text">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" className="auth-switch-btn" onClick={switchMode}>
                {isLogin ? "Sign up free" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Auth;
