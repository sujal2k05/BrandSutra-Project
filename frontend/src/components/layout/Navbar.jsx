import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  PlusCircle, 
  ShieldAlert, 
  Bell, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Organization Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-semibold text-slate-900">{user?.organizationName || 'NovaHome Appliances'}</span>
        </div>

        {/* Quick Action */}
        {(user?.role === 'ADMIN' || user?.role === 'CONTENT_CREATOR') && (
          <button
            onClick={() => navigate('/inspector')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all duration-150"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Verify Content</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
