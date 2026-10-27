import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { KanbanSquare, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(name.trim(), email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f2fa] text-[#383139] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Pink Cushion Hero */}
        <div className="lg:col-span-5 rounded-[40px] bg-[#f6a3ca] shadow-[0_20px_40px_-10px_rgba(246,163,202,0.6),inset_4px_4px_8px_rgba(255,255,255,0.85),inset_-4px_-4px_10px_rgba(180,80,130,0.25)] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden text-[#383139]">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[#c0efdc] shadow-[0_10px_25px_-5px_rgba(192,239,220,0.7),inset_3px_3px_6px_rgba(255,255,255,0.9),inset_-3px_-3px_6px_rgba(90,160,130,0.2)] pointer-events-none" />
          <div className="absolute top-28 -right-4 w-20 h-20 rounded-full bg-[#f9e7a8] shadow-[0_10px_25px_-5px_rgba(249,231,168,0.7),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(180,150,60,0.2)] pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-[#ded0f9] shadow-[0_10px_25px_-5px_rgba(222,208,249,0.7),inset_3px_3px_6px_rgba(255,255,255,0.9),inset_-3px_-3px_6px_rgba(130,100,180,0.2)] pointer-events-none" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-full bg-[#fffdf7] shadow-[0_8px_20px_-4px_rgba(56,49,57,0.12),inset_2px_2px_4px_rgba(255,255,255,0.95),inset_-2px_-2px_4px_rgba(56,49,57,0.06)] flex items-center justify-center mb-6">
              <KanbanSquare className="w-7 h-7 text-[#383139]" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#383139] leading-tight">
              Create Your Workspace.
            </h1>
            <p className="text-sm font-medium text-[#48404b] mt-3 leading-relaxed">
              Join SyncBoard to create collaborative project boards, assign cards, and synchronize actions live across browsers.
            </p>
          </div>

          <div className="relative z-10 space-y-2.5 mt-8">
            <div className="px-4 py-2.5 rounded-full bg-white/70 shadow-[0_4px_12px_-2px_rgba(56,49,57,0.08),inset_1.5px_1.5px_3px_rgba(255,255,255,0.95),inset_-1.5px_-1.5px_3px_rgba(56,49,57,0.05)] flex items-center gap-2.5 text-xs font-bold text-[#383139]">
              <CheckCircle2 className="w-4 h-4 text-[#1b8a5a]" />
              <span>Free Multi-User Workspaces</span>
            </div>
            <div className="px-4 py-2.5 rounded-full bg-white/70 shadow-[0_4px_12px_-2px_rgba(56,49,57,0.08),inset_1.5px_1.5px_3px_rgba(255,255,255,0.95),inset_-1.5px_-1.5px_3px_rgba(56,49,57,0.05)] flex items-center gap-2.5 text-xs font-bold text-[#383139]">
              <Sparkles className="w-4 h-4 text-[#8264b4]" />
              <span>Full Kanban Board Capabilities</span>
            </div>
          </div>
        </div>

        {/* Right Side: Cream Reading Tray Form */}
        <div className="lg:col-span-7 rounded-[40px] bg-[#fffdf7] border border-white shadow-[0_20px_45px_-12px_rgba(56,49,57,0.1),inset_3px_3px_6px_rgba(255,255,255,0.95),inset_-3px_-3px_8px_rgba(56,49,57,0.04)] p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#383139] tracking-tight">
                Get Started with SyncBoard
              </h2>
              <p className="text-xs font-medium text-[#48404b] mt-1">
                Fill in your details below to set up your account
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-[#fcd2df] text-[#8c2340] text-xs font-semibold flex items-center gap-2 shadow-[inset_1.5px_1.5px_3px_rgba(180,60,90,0.15)]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold transition-all placeholder:text-[#8e8a94]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold transition-all placeholder:text-[#8e8a94]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold transition-all placeholder:text-[#8e8a94]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
                    Confirm
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat"
                    className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold transition-all placeholder:text-[#8e8a94]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full clay-btn-pill clay-btn-pink text-sm font-bold shadow-[0_10px_20px_-5px_rgba(246,163,202,0.5)] active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-xs font-medium text-[#48404b]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#c74c83] hover:underline font-bold"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
