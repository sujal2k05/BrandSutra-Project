import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  ShieldCheck, 
  Database, 
  Cpu, 
  CheckCircle2, 
  Save 
} from 'lucide-react';
import { organizationService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId || 1;
  const isAdmin = user?.role === 'ADMIN';

  const [orgData, setOrgData] = useState({
    name: '',
    industry: '',
    website: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchOrg();
  }, [orgId]);

  const fetchOrg = async () => {
    try {
      setLoading(true);
      const res = await organizationService.getOrg(orgId);
      setOrgData({
        name: res.data.name || '',
        industry: res.data.industry || '',
        website: res.data.website || '',
        description: res.data.description || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await organizationService.updateOrg(orgId, orgData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update organization settings.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-indigo-600" />
          <span>Workspace & Governance Settings</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure organization workspace parameters, governance model connections, and database status.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Organization Details Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>Organization Profile</span>
        </h3>
        <p className="text-xs text-slate-500 mb-5">Primary workspace information used in header titles and policy scopes.</p>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Organization Legal Name
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Industry Sector
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={orgData.industry}
                onChange={(e) => setOrgData({ ...orgData, industry: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Official Website URL
            </label>
            <input
              type="url"
              disabled={!isAdmin}
              value={orgData.website}
              onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Workspace Description
            </label>
            <textarea
              rows={3}
              disabled={!isAdmin}
              value={orgData.description}
              onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
            />
          </div>

          {isAdmin && (
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Organization Profile</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* System Infrastructure Telemetry Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span>Connected Governance Infrastructure</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>MySQL 8 Engine</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-500">Database: <code className="font-mono text-indigo-600 font-bold">brandsutra_db</code></p>
            <p className="text-xs text-slate-400 font-mono">Port: 3307 • Connection Pool: HikariCP Active</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>FastAPI AI Microservice</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-500">Model: <code className="font-mono text-purple-600 font-bold">gemini-2.5-flash</code></p>
            <p className="text-xs text-slate-400 font-mono">Port: 8000 • PyMuPDF PDF Engine Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
