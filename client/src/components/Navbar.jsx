import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { LayoutDashboard, LogOut, Wifi, WifiOff, Users, KanbanSquare } from 'lucide-react';

export const Navbar = ({ currentBoardTitle, onToggleActivity, hasActivityDrawer }) => {
  const { user, logout } = useAuth();
  const { connectionStatus, activeUsers } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Board Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 group transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <KanbanSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              SyncBoard
            </span>
          </Link>

          {currentBoardTitle && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800">
              <span className="text-slate-500 text-sm">/</span>
              <span className="text-sm font-semibold text-slate-200 truncate max-w-xs">
                {currentBoardTitle}
              </span>
            </div>
          )}
        </div>

        {/* Status & Collaborators & User */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Real-time Connection Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              connectionStatus === 'connected'
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                : connectionStatus === 'connecting'
                ? 'bg-amber-950/60 text-amber-400 border-amber-800/80'
                : 'bg-rose-950/60 text-rose-400 border-rose-800/80'
            }`}
            title={`Real-Time WebSocket: ${connectionStatus}`}
          >
            <span className="relative flex h-2 w-2">
              {connectionStatus === 'connected' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-500'
                    : connectionStatus === 'connecting'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              ></span>
            </span>
            <span className="hidden sm:inline capitalize">
              {connectionStatus === 'connected' ? 'Live Sync' : connectionStatus}
            </span>
          </div>

          {/* Active Collaborators (if in board) */}
          {activeUsers && activeUsers.length > 0 && (
            <div className="hidden lg:flex items-center -space-x-2 overflow-hidden px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div className="text-xs text-slate-400 mr-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
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
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-slate-800 object-cover"
                />
              ))}
            </div>
          )}

          {/* Activity Drawer Toggle */}
          {hasActivityDrawer && onToggleActivity && (
            <button
              onClick={onToggleActivity}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
              title="View Real-Time Board Activity"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
          )}

          {/* User Info & Logout */}
          {user && (
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-800">
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    user.name
                  )}`
                }
                alt={user.name}
                className="w-8 h-8 rounded-full ring-2 ring-indigo-500/30 object-cover"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {user.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
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
