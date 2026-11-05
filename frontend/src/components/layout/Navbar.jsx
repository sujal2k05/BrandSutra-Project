import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  PlusCircle, 
  Sun, 
  Moon, 
  Monitor, 
  Menu, 
  ChevronDown, 
  UserCheck, 
  LogOut, 
  Settings, 
  Sparkles,
  Shield,
  Dna
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

const Navbar = ({ title, setIsMobileOpen }) => {
  const { user, switchDemoAccount, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  const themeRef = useRef(null);
  const roleRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeRef.current && !themeRef.current.contains(e.target)) setIsThemeMenuOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setIsRoleMenuOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = async (roleName) => {
    setIsRoleMenuOpen(false);
    setIsSwitchingRole(true);
    try {
      const switchedUser = await switchDemoAccount(roleName);
      success(`Switched role to ${roleName.replace('_', ' ')} (${switchedUser.email})`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      error("Failed to switch demo account.");
    } finally {
      setIsSwitchingRole(false);
    }
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200 shadow-2xs">
      {/* Left Title & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <img 
          src="/logo.png" 
          alt="BrandSutra Logo" 
          className="md:hidden w-7 h-7 object-contain flex-shrink-0" 
        />
        <div>
          <h1 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate max-w-xs sm:max-w-md">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Workspace Organization Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-slate-900 dark:text-white">{user?.organizationName || 'NovaHome Appliances'}</span>
        </div>

        {/* Demo Role Switcher */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            disabled={isSwitchingRole}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden sm:inline">{user?.role?.replace('_', ' ') || 'GUEST'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#111827] shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Quick Role Switcher (Zero-Cost)
              </div>
              <button
                onClick={() => handleRoleSwitch('ADMIN')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between"
              >
                <span>Administrator</span>
                <span className="text-[10px] font-mono text-slate-400">admin@novahome.com</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('CONTENT_CREATOR')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between"
              >
                <span>Content Creator</span>
                <span className="text-[10px] font-mono text-slate-400">creator@novahome.com</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('REVIEWER')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between"
              >
                <span>Human Reviewer</span>
                <span className="text-[10px] font-mono text-slate-400">reviewer@novahome.com</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle Dropdown */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            title="Theme preference"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Monitor className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            )}
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-[#111827] shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50">
              <button
                onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }}
                className={`w-full px-3 py-2 text-xs font-bold flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  theme === 'light' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }}
                className={`w-full px-3 py-2 text-xs font-bold flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  theme === 'dark' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => { setTheme('system'); setIsThemeMenuOpen(false); }}
                className={`w-full px-3 py-2 text-xs font-bold flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  theme === 'system' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                <span>System</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Action: Verify Content */}
        {(user?.role === 'ADMIN' || user?.role === 'CONTENT_CREATOR') && (
          <button
            onClick={() => navigate('/inspector')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs shadow-indigo-600/20 transition-all duration-150 group"
          >
            <PlusCircle className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
            <span>Verify Content</span>
          </button>
        )}

        {/* User Profile Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/30 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#111827] shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.fullName || 'User'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200/80 dark:border-indigo-800/80">
                  <Shield className="w-3 h-3" />
                  <span>{user?.role?.replace('_', ' ') || 'GUEST'}</span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Workspace Settings</span>
                </Link>
                <Link
                  to="/brand-dna"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <Dna className="w-4 h-4 text-slate-400" />
                  <span>Brand DNA Profile</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
