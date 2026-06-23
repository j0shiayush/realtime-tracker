import { useState } from "react";
import { Loader2, Lock, MapPin, User, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password, fullName.trim());
        setSuccess("Account created! Sign in to continue.");
        setMode("login");
        setPassword("");
        setFullName("");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.12),_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.08),_transparent_45%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <MapPin className="text-cyan-400" size={26} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Live Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to access the real-time map
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-md">
          <div className="mb-6 flex rounded-xl border border-white/10 bg-slate-950/60 p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isLogin
                  ? "bg-cyan-500/20 text-cyan-300 shadow-inner shadow-cyan-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                !isLogin
                  ? "bg-emerald-500/20 text-emerald-300 shadow-inner shadow-emerald-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400"
                >
                  Full Name
                </label>
                <div className="relative">
                  <UserCircle
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    size={16}
                  />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required={!isLogin}
                    autoComplete="name"
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/25"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400"
              >
                Username
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Enter your username"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/25"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/25"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/20 py-2.5 text-sm font-semibold text-emerald-300 transition-all hover:bg-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  {isLogin ? "Signing in…" : "Creating account…"}
                </>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* --- NEW GITHUB OAUTH SECTION --- */}
          <div className="mt-6 flex items-center justify-between">
            <span className="w-1/5 border-b border-white/10 lg:w-1/4"></span>
            <span className="text-xs text-center text-slate-500 uppercase tracking-widest font-medium">Or continue with</span>
            <span className="w-1/5 border-b border-white/10 lg:w-1/4"></span>
          </div>

          <div className="mt-6">

            <button
  type="button"
  onClick={() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = "http://localhost:5173";
    const scope = "email profile";
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=google`;
  }}
  className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400/40"
>
  <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
  Sign in with Google
</button>
          </div>
          {/* -------------------------------------- */}

        </div>
      </div>
    </div>
  );
}