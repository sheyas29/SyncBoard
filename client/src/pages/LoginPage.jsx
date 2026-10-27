import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { KanbanSquare, ArrowRight, AlertCircle, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill helper for reviewer testing
  const handleQuickDemo = async (demoName, demoEmail, demoPassword) => {
    setLoading(true);
    setError('');
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch {
      try {
        await register(demoName, demoEmail, demoPassword);
        navigate('/dashboard');
      } catch (regErr) {
        setError(regErr.response?.data?.message || 'Failed to auto-provision demo user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f2fa] text-[#383139] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Claymorphic Pink Cushion Hero */}
        <div className="lg:col-span-5 rounded-[40px] bg-[#f6a3ca] shadow-[0_20px_40px_-10px_rgba(246,163,202,0.6),inset_4px_4px_8px_rgba(255,255,255,0.85),inset_-4px_-4px_10px_rgba(180,80,130,0.25)] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden text-[#383139]">
          {/* Molded Decorative Overlapping Objects */}
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[#ded0f9] shadow-[0_10px_25px_-5px_rgba(222,208,249,0.7),inset_3px_3px_6px_rgba(255,255,255,0.9),inset_-3px_-3px_6px_rgba(130,100,180,0.2)] pointer-events-none" />
          <div className="absolute top-24 -right-4 w-20 h-20 rounded-full bg-[#c0efdc] shadow-[0_10px_25px_-5px_rgba(192,239,220,0.7),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(90,160,130,0.2)] pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-[#f9e7a8] shadow-[0_10px_25px_-5px_rgba(249,231,168,0.7),inset_3px_3px_6px_rgba(255,255,255,0.9),inset_-3px_-3px_6px_rgba(180,150,60,0.2)] pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-full bg-[#fffdf7] shadow-[0_8px_20px_-4px_rgba(56,49,57,0.12),inset_2px_2px_4px_rgba(255,255,255,0.95),inset_-2px_-2px_4px_rgba(56,49,57,0.06)] flex items-center justify-center mb-6">
              <KanbanSquare className="w-7 h-7 text-[#383139]" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#383139] leading-tight">
              Molded for Instant Collaboration.
            </h1>
            <p className="text-sm font-medium text-[#48404b] mt-3 leading-relaxed">
              Real-time Kanban task management with tactile drag-and-drop, WebSocket live sync, and multi-user workspaces.
            </p>
          </div>

          {/* Feature Highlights on Pastel Cushions */}
          <div className="relative z-10 space-y-2.5 mt-8">
            <div className="px-4 py-2.5 rounded-full bg-white/70 shadow-[0_4px_12px_-2px_rgba(56,49,57,0.08),inset_1.5px_1.5px_3px_rgba(255,255,255,0.95),inset_-1.5px_-1.5px_3px_rgba(56,49,57,0.05)] flex items-center gap-2.5 text-xs font-bold text-[#383139]">
              <Zap className="w-4 h-4 text-[#1b8a5a]" />
              <span>Real-Time WebSocket Sync</span>
            </div>
            <div className="px-4 py-2.5 rounded-full bg-white/70 shadow-[0_4px_12px_-2px_rgba(56,49,57,0.08),inset_1.5px_1.5px_3px_rgba(255,255,255,0.95),inset_-1.5px_-1.5px_3px_rgba(56,49,57,0.05)] flex items-center gap-2.5 text-xs font-bold text-[#383139]">
              <ShieldCheck className="w-4 h-4 text-[#5b3b9b]" />
              <span>Strict Role-Based Access</span>
            </div>
          </div>
        </div>

        {/* Right Side: Cream Reading Tray Login Form */}
        <div className="lg:col-span-7 rounded-[40px] bg-[#fffdf7] border border-white shadow-[0_20px_45px_-12px_rgba(56,49,57,0.1),inset_3px_3px_6px_rgba(255,255,255,0.95),inset_-3px_-3px_8px_rgba(56,49,57,0.04)] p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#383139] tracking-tight">
                Sign in to SyncBoard
              </h2>
              <p className="text-xs font-medium text-[#48404b] mt-1">
                Enter your credentials or test with one-click reviewer profiles
              </p>
            </div>

            {isExpired && (
              <div className="mb-4 p-3.5 rounded-2xl bg-[#f9e7a8] text-[#6e5614] text-xs font-semibold flex items-center gap-2 shadow-[inset_1.5px_1.5px_3px_rgba(180,150,60,0.15)]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Your previous session expired. Please sign in again.</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-[#fcd2df] text-[#8c2340] text-xs font-semibold flex items-center gap-2 shadow-[inset_1.5px_1.5px_3px_rgba(180,60,90,0.15)]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold transition-all placeholder:text-[#8e8a94]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold transition-all placeholder:text-[#8e8a94]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full clay-btn-pill clay-btn-pink text-sm font-bold shadow-[0_10px_20px_-5px_rgba(246,163,202,0.5)] active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Reviewer Profiles */}
            <div className="mt-6 pt-5 border-t border-[#f1f2fa]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#48404b] mb-3">
                <Sparkles className="w-4 h-4 text-[#e273a5]" />
                <span>One-Click Test Reviewer Profiles:</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('Alex Rivera', 'alex@syncboard.dev', 'alex123456')}
                  className="p-3 rounded-2xl bg-[#c0efdc] hover:bg-[#b0ebd3] text-left shadow-[0_6px_14px_-3px_rgba(192,239,220,0.6),inset_1.5px_1.5px_3px_rgba(255,255,255,0.85),inset_-1.5px_-1.5px_3px_rgba(90,160,130,0.18)] active:scale-95 transition-all"
                >
                  <div className="font-bold text-xs text-[#1c573c]">User 1 (Alex)</div>
                  <div className="text-[11px] text-[#2e7454] font-medium">alex@syncboard.dev</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('Taylor Swift', 'taylor@syncboard.dev', 'taylor123456')}
                  className="p-3 rounded-2xl bg-[#ded0f9] hover:bg-[#d4c2f6] text-left shadow-[0_6px_14px_-3px_rgba(222,208,249,0.6),inset_1.5px_1.5px_3px_rgba(255,255,255,0.85),inset_-1.5px_-1.5px_3px_rgba(130,100,180,0.18)] active:scale-95 transition-all"
                >
                  <div className="font-bold text-xs text-[#4b3378]">User 2 (Taylor)</div>
                  <div className="text-[11px] text-[#63469b] font-medium">taylor@syncboard.dev</div>
                </button>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-xs font-medium text-[#48404b]">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-[#c74c83] hover:underline font-bold"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
