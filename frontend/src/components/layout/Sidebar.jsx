import React from 'react';
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
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'CONTENT_CREATOR', 'REVIEWER'] },
    { name: 'Brand DNA', path: '/brand-dna', icon: Dna, roles: ['ADMIN', 'CONTENT_CREATOR', 'REVIEWER'] },
    { name: 'Brand Guidelines', path: '/guidelines', icon: FileText, roles: ['ADMIN', 'CONTENT_CREATOR', 'REVIEWER'] },
    { name: 'Content Inspector', path: '/inspector', icon: ShieldAlert, roles: ['ADMIN', 'CONTENT_CREATOR'] },
    { name: 'My Submissions', path: '/submissions', icon: Send, roles: ['ADMIN', 'CONTENT_CREATOR'] },
    { name: 'Approvals Queue', path: '/approvals', icon: CheckCircle2, roles: ['ADMIN', 'REVIEWER'] },
    { name: 'Governance Analytics', path: '/analytics', icon: BarChart3, roles: ['ADMIN', 'REVIEWER'] },
    { name: 'Team Management', path: '/team', icon: Users, roles: ['ADMIN'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !user?.role || item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col min-h-screen border-r border-slate-200/90 select-none shadow-xs">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-100 bg-white">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
            BrandSutra
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-200/80">
              AI
            </span>
          </span>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide">Brand Governance Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Governance Workspace
        </div>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100/90'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
              <span className="flex-1 truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200/80 flex-shrink-0">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName || 'User'}</p>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                {user?.role?.replace('_', ' ') || 'GUEST'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
