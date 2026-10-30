import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { LayoutDashboard, LogOut, KanbanSquare, ChevronDown } from 'lucide-react';

export const Navbar = ({ onToggleActivity, hasActivityDrawer }) => {
  const { user, logout } = useAuth();
  const { connectionStatus } = useSocket();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsProfileOpen(false);
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileOpen]);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 pt-2 pb-1">
      <div className="max-w-7xl mx-auto h-12 px-4 py-1.5 rounded-full bg-[#fffdf7] border border-white shadow-[0_8px_20px_-6px_rgba(56,49,57,0.06),inset_2px_2px_4px_rgba(255,255,255,0.95),inset_-2px_-2px_4px_rgba(56,49,57,0.03)] flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 group transition-transform active:scale-95"
            title="SyncBoard Dashboard"
            aria-label="SyncBoard Dashboard"
          >
            <div className="w-8 h-8 rounded-full bg-[#f6a3ca] shadow-[0_4px_10px_-2px_rgba(246,163,202,0.6),inset_1.5px_1.5px_2px_rgba(255,255,255,0.8),inset_-1.5px_-1.5px_3px_rgba(180,80,130,0.2)] flex items-center justify-center text-[#383139]">
              <KanbanSquare className="w-4 h-4 text-[#383139]" />
            </div>
            <span className="font-bold text-base tracking-tight text-[#383139]">
              SyncBoard
            </span>
          </Link>
        </div>

        {/* Status & User */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Real-time Connection Indicator Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              connectionStatus === 'connected'
                ? 'bg-[#c0efdc] text-[#1c4b38] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.85),inset_-1px_-1px_2px_rgba(90,160,130,0.2)]'
                : connectionStatus === 'connecting'
                ? 'bg-[#f9e7a8] text-[#5c4912] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.85),inset_-1px_-1px_2px_rgba(180,150,60,0.2)]'
                : 'bg-[#fcd2df] text-[#6b253c] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.85),inset_-1px_-1px_2px_rgba(180,60,90,0.2)]'
            }`}
            title={`Real-Time WebSocket: ${connectionStatus}`}
            role="status"
            aria-live="polite"
          >
            <span className="relative flex h-2 w-2">
              {connectionStatus === 'connected' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1b8a5a] opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  connectionStatus === 'connected'
                    ? 'bg-[#1b8a5a]'
                    : connectionStatus === 'connecting'
                    ? 'bg-[#c29013]'
                    : 'bg-[#c9345e]'
                }`}
              ></span>
            </span>
            <span className="hidden sm:inline capitalize">
              {connectionStatus === 'connected' ? 'Live Sync' : connectionStatus}
            </span>
          </div>

          {/* Activity Drawer Toggle (Grid Icon) */}
          {hasActivityDrawer && onToggleActivity && (
            <button
              onClick={onToggleActivity}
              className="p-1.5 rounded-full bg-[#fffdf7] hover:bg-[#f7f6fc] text-[#383139] shadow-[0_2px_6px_-1px_rgba(56,49,57,0.08),inset_1px_1px_2px_rgba(255,255,255,0.95),inset_-1px_-1px_2px_rgba(56,49,57,0.05)] active:scale-95 transition-all"
              title="Toggle board activity log"
              aria-label="Toggle board activity log"
            >
              <LayoutDashboard className="w-4 h-4 text-[#48404b]" />
            </button>
          )}

          {/* User Profile Menu & Dropdown with Logout */}
          {user && (
            <div className="relative pl-1.5 border-l border-[#e5e7f2]" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-full hover:bg-black/5 p-1 transition-all"
                aria-haspopup="true"
                aria-expanded={isProfileOpen}
                aria-label="Open user profile menu"
                title="User profile"
              >
                <img
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      user.name
                    )}`
                  }
                  alt={user.name}
                  className="w-7 h-7 rounded-full ring-2 ring-[#f6a3ca] object-cover shadow-sm"
                />
                <div className="hidden sm:flex items-center gap-1 text-left pr-1">
                  <span className="text-xs font-bold text-[#383139] max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#58515f]" />
                </div>
              </button>

              {/* Accessible Profile Dropdown */}
              {isProfileOpen && (
                <div
                  role="menu"
                  aria-label="Profile actions"
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#fffdf7] border border-[#e2dfec] shadow-[0_16px_36px_-8px_rgba(56,49,57,0.18),inset_1.5px_1.5px_3px_rgba(255,255,255,0.95)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-2 border-b border-[#f1f2fa]">
                    <p className="text-xs font-bold text-[#383139] truncate">{user.name}</p>
                    <p className="text-xs text-[#58515f] truncate font-medium">{user.email}</p>
                  </div>
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full mt-1.5 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#b91c1c] hover:bg-[#fef2f2] transition-colors"
                  >
                    <LogOut className="w-4 h-4 stroke-[2.2]" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
