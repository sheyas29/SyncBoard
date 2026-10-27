import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { LayoutDashboard, LogOut, Users, KanbanSquare } from 'lucide-react';

export const Navbar = ({ currentBoardTitle, onToggleActivity, hasActivityDrawer }) => {
  const { user, logout } = useAuth();
  const { connectionStatus, activeUsers } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="max-w-7xl mx-auto h-18 px-5 py-3 rounded-full bg-[#fffdf7] border border-white shadow-[0_12px_30px_-8px_rgba(56,49,57,0.08),inset_2px_2px_4px_rgba(255,255,255,0.95),inset_-2px_-2px_5px_rgba(56,49,57,0.04)] flex items-center justify-between">
        {/* Brand & Board Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-[#f6a3ca] shadow-[0_6px_14px_-3px_rgba(246,163,202,0.6),inset_2px_2px_3px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(180,80,130,0.2)] flex items-center justify-center text-[#383139]">
              <KanbanSquare className="w-5 h-5 text-[#383139]" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#383139]">
              SyncBoard
            </span>
          </Link>

          {currentBoardTitle && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#e5e7f2]">
              <span className="text-[#8e8a94] text-sm">/</span>
              <span className="text-sm font-semibold text-[#383139] truncate max-w-xs">
                {currentBoardTitle}
              </span>
            </div>
          )}
        </div>

        {/* Status & Collaborators & User */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Real-time Connection Indicator Pill */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              connectionStatus === 'connected'
                ? 'bg-[#c0efdc] text-[#245240] shadow-[0_4px_12px_-2px_rgba(192,239,220,0.6),inset_1.5px_1.5px_3px_rgba(255,255,255,0.85),inset_-1.5px_-1.5px_3px_rgba(90,160,130,0.2)]'
                : connectionStatus === 'connecting'
                ? 'bg-[#f9e7a8] text-[#5c4912] shadow-[0_4px_12px_-2px_rgba(249,231,168,0.6),inset_1.5px_1.5px_3px_rgba(255,255,255,0.85),inset_-1.5px_-1.5px_3px_rgba(180,150,60,0.2)]'
                : 'bg-[#fcd2df] text-[#6b253c] shadow-[0_4px_12px_-2px_rgba(252,210,223,0.6),inset_1.5px_1.5px_3px_rgba(255,255,255,0.85),inset_-1.5px_-1.5px_3px_rgba(180,60,90,0.2)]'
            }`}
            title={`Real-Time WebSocket: ${connectionStatus}`}
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

          {/* Active Collaborators */}
          {activeUsers && activeUsers.length > 0 && (
            <div className="hidden lg:flex items-center -space-x-1.5 overflow-hidden px-2.5 py-1 rounded-full bg-[#f1f2fa] shadow-[inset_1.5px_1.5px_3px_rgba(56,49,57,0.06),inset_-1.5px_-1.5px_3px_rgba(255,255,255,0.9)]">
              <div className="text-xs font-bold text-[#48404b] mr-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#383139]" />
                <span>{activeUsers.length}</span>
              </div>
              {activeUsers.slice(0, 4).map((u, i) => (
                <img
                  key={u._id || i}
                  src={
                    u.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      u.name || 'User'
                    )}`
                  }
                  alt={u.name}
                  title={`${u.name} (Online)`}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-[#fffdf7] bg-[#f9e7a8] object-cover"
                />
              ))}
            </div>
          )}

          {/* Activity Drawer Toggle */}
          {hasActivityDrawer && onToggleActivity && (
            <button
              onClick={onToggleActivity}
              className="p-2 rounded-full bg-[#fffdf7] hover:bg-[#f7f6fc] text-[#383139] shadow-[0_4px_10px_-2px_rgba(56,49,57,0.08),inset_1.5px_1.5px_3px_rgba(255,255,255,0.95),inset_-1.5px_-1.5px_3px_rgba(56,49,57,0.06)] active:scale-95 transition-all"
              title="View Real-Time Board Activity"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
          )}

          {/* User Info & Logout */}
          {user && (
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#e5e7f2]">
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    user.name
                  )}`
                }
                alt={user.name}
                className="w-8 h-8 rounded-full ring-2 ring-[#f6a3ca] object-cover shadow-sm"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#383139] leading-tight">
                  {user.name}
                </div>
                <div className="text-[11px] text-[#48404b] truncate max-w-[110px]">
                  {user.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-[#48404b] hover:text-[#c9345e] hover:bg-[#fcd2df] transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
