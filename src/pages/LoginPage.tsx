import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const { signIn } = useAuth();
  const navigate   = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div
      className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden"
      dir="rtl"
    >
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-summer-sky/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-vibrant-pink/10 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-summer-sky to-vibrant-pink mx-auto mb-4 flex items-center justify-center text-white shadow-lg">
            <Icon name="forest" className="text-3xl" />
          </div>
          <h1 className="text-h1-display text-deep-slate font-black tracking-tight">My Camp</h1>
          <p className="text-slate-500 text-sm mt-1">ברוכים השבים! התחברו כדי להמשיך</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8 space-y-5">

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3 text-right">
              <Icon name="error" className="text-red-500 text-lg shrink-0" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 text-right">
                כתובת אימייל
              </label>
              <div className="relative">
                <Icon name="mail" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-10 pl-4 text-sm focus:ring-2 focus:ring-summer-sky/30 focus:border-summer-sky outline-none transition-all text-right placeholder:text-slate-400 placeholder:text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Link
                  to="/forgot-password"
                  className="text-xs text-summer-sky font-bold hover:underline"
                >
                  שכחת סיסמה?
                </Link>
                <label className="block text-xs font-bold text-slate-500">סיסמה</label>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Icon name={showPwd ? 'visibility_off' : 'visibility'} className="text-xl" />
                </button>
                <Icon name="lock" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-10 pl-10 text-sm focus:ring-2 focus:ring-summer-sky/30 focus:border-summer-sky outline-none transition-all text-right"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-vibrant-pink text-white font-black py-3.5 rounded-2xl shadow-lg shadow-pink-200/50 hover:brightness-105 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed text-base"
            >
              {loading ? (
                <>
                  <Icon name="refresh" className="text-xl animate-spin" />
                  מתחבר...
                </>
              ) : (
                <>
                  כניסה למערכת
                  <Icon name="login" className="text-xl" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 text-slate-300">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs">או</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Sign Up link */}
          <p className="text-center text-sm text-slate-500">
            אין לך חשבון עדיין?{' '}
            <Link to="/signup" className="text-vibrant-pink font-bold hover:underline">
              הרשמה
            </Link>
          </p>
        </div>

        {/* Back to landing */}
        <div className="text-center mt-5">
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1"
          >
            <Icon name="arrow_forward" className="text-sm" />
            חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
