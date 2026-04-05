import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { LogOut, Code2, LayoutDashboard, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { logout, selectCurrentUser } from '../store/authSlice';
import RoleTag from './RoleTag';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isOnRoom = location.pathname.startsWith('/room/');

  // Generate user initials for avatar
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <Motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-14 flex items-center justify-between px-4 border-b border-border-default bg-bg-surface/80 backdrop-blur-md z-50 sticky top-0"
      id="main-navbar"
    >
      {/* Left: Logo */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2.5 group"
        id="navbar-logo"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center group-hover:shadow-glow-blue transition-all duration-300">
          <Code2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-text-primary text-sm tracking-wide">
          RCO<span className="gradient-text-blue">-IDE</span>
        </span>
      </Link>

      {/* Center: Nav Links (only on dashboard) */}
      {!isOnRoom && (
        <div className="flex items-center gap-1">
          <Link
            to="/dashboard"
            className={`btn-ghost text-xs ${
              location.pathname === '/dashboard'
                ? 'text-text-primary bg-bg-elevated'
                : ''
            }`}
            id="nav-dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </div>
      )}

      {/* Right: User info + logout */}
      {user && (
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-accent-green">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow" />
            Online
          </div>

          {/* User avatar + name */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-border-default">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-bg-primary shadow-glow-blue"
              style={{ backgroundColor: user.color || '#58a6ff' }}
              id="user-avatar"
            >
              {initials}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-semibold text-text-primary leading-none mb-0.5">
                {user.username}
              </span>
              <RoleTag role={user.role} />
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="btn-ghost text-xs text-text-muted hover:text-accent-orange"
            title="Logout"
            id="logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </Motion.nav>
  );
}
