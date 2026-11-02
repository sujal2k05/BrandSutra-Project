import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dna, 
  FileText, 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Swords,
  Globe,
  X,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('brandsutra_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('brandsutra_sidebar_collapsed', String(next));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Grouped Navigation Items
  const navGroups = [
    {
      group: 'Core Governance',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'CONTENT_CREATOR', 'REVIEWER'] },
        { name: 'Brand DNA', path: '/brand-dna', icon: Dna, roles: ['ADMIN', 'CONTENT_CREATOR', 'REVIEWER'] },
        { name: 'Brand Guidelines', path: '/guidelines', icon: FileText, roles: ['ADMIN', 'CONTENT_CREATOR', 'REVIEWER'] },
        { name: 'Content Inspector', path: '/inspector', icon: ShieldAlert, roles: ['ADMIN', 'CONTENT_CREATOR'] },
        { name: 'My Submissions', path: '/submissions', icon: Send, roles: ['ADMIN', 'CONTENT_CREATOR'] },
      ]
    },
    {
      group: 'AI Agents & Red-Team',
      items: [
        { name: 'Self-Healing Studio', path: '/self-healing', icon: Sparkles, roles: ['ADMIN', 'CONTENT_CREATOR', 'REVIEWER'], badge: 'AI' },
        { name: 'Adversarial Simulator', path: '/adversarial-simulator', icon: Swords, roles: ['ADMIN', 'CONTENT_CREATOR', 'REVIEWER'], badge: 'Red' },
        { name: 'Brand Drift Sentinel', path: '/drift-sentinel', icon: Globe, roles: ['ADMIN', 'CONTENT_CREATOR', 'REVIEWER'], badge: 'Live' },
      ]
    },
    {
      group: 'Compliance & Workspace',
      items: [
        { name: 'Approvals Queue', path: '/approvals', icon: CheckCircle2, roles: ['ADMIN', 'REVIEWER'] },
        { name: 'Governance Analytics', path: '/analytics', icon: BarChart3, roles: ['ADMIN', 'REVIEWER'] },
        { name: 'Team Management', path: '/team', icon: Users, roles: ['ADMIN'] },
        { name: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
      ]
    }
  ];

  const renderContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 select-none">
      {/* Brand Header */}
      <div className={`h-16 flex items-center px-4 gap-3 border-b border-slate-200/80 dark:border-slate-800/80 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                BrandSutra
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-extrabold px-1.5 py-0.5 rounded border border-indigo-200/80 dark:border-indigo-800/80">
                  AI
                </span>
              </span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">Brand Governance OS</p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {isMobileOpen ? (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={toggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navGroups.map((group, gIdx) => {
          const visibleItems = group.items.filter(item => 
            !user?.role || item.roles.includes(user.role)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.group}
                </div>
              )}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                    title={collapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group relative ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                      } ${collapsed ? 'justify-center px-2' : ''}`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        item.badge === 'AI' ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300' :
                        item.badge === 'Red' ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300' :
                        'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-2 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/70 dark:border-slate-800 shadow-xs`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.fullName || 'User'}</p>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block truncate">
                  {user?.role?.replace('_', ' ') || 'GUEST'}
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Log out"
              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className={`hidden md:flex flex-col min-h-screen border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        {renderContent}
      </aside>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileOpen(false)} 
          />
          <aside className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {renderContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
