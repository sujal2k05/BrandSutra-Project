import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  PlusCircle, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Role Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
          <span>{user?.role?.replace('_', ' ') || 'GUEST'}</span>
        </div>

        {/* Organization Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 shadow-2xs">
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-bold text-slate-900">{user?.organizationName || 'NovaHome Appliances'}</span>
        </div>

        {/* Quick Action */}
        {(user?.role === 'ADMIN' || user?.role === 'CONTENT_CREATOR') && (
          <button
            onClick={() => navigate('/inspector')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs shadow-indigo-600/20 transition-all duration-150 group"
          >
            <PlusCircle className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
            <span>Verify Content</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
