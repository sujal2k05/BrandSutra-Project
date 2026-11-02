import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  ShieldCheck, 
  Database, 
  Cpu, 
  CheckCircle2, 
  Save,
  Sun,
  Moon,
  Monitor,
  User,
  Shield,
  Layers,
  Lock,
  LogOut
} from 'lucide-react';
import { organizationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, error: toastError } = useToast();
  const orgId = user?.organizationId || 1;
  const isAdmin = user?.role === 'ADMIN';

  const [orgData, setOrgData] = useState({
    name: '',
    industry: '',
    website: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      setSaving(true);
      await organizationService.updateOrg(orgId, orgData);
      success("Workspace organization profile updated!");
    } catch (err) {
      console.error(err);
      toastError("Failed to update organization settings.");
    } finally {
      setSaving(false);
    }
  };

  const permissionsMatrix = [
    { module: 'Brand DNA Facts & Rules Management', admin: true, creator: false, reviewer: false },
    { module: 'PDF Brand Guidelines Extraction', admin: true, creator: false, reviewer: false },
    { module: 'Content Inspection & AI Verification', admin: true, creator: true, reviewer: false },
    { module: 'Agentic Self-Healing Content Studio', admin: true, creator: true, reviewer: true },
    { module: 'Adversarial PR Red-Team Simulator', admin: true, creator: true, reviewer: true },
    { module: 'Human Review & Publication Sign-Off', admin: true, creator: false, reviewer: true },
    { module: 'Live Brand Drift Sentinel', admin: true, creator: false, reviewer: true },
    { module: 'Team Role Management', admin: true, creator: false, reviewer: false },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Workspace & Governance Settings</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure organization workspace parameters, theme appearance, and inspect infrastructure health.
        </p>
      </div>

      {/* User Profile Overview Card */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>User Profile Information</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Your current authenticated session credentials</p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-indigo-600/20">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{user?.fullName || 'User'}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Role: {user?.role?.replace('_', ' ') || 'GUEST'}
                </span>
                <span className="text-[10px] text-slate-400">Org ID: #{orgId}</span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Theme Preferences */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">Theme & Display Appearance</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Choose your interface theme preference. Saved automatically in local storage.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 ${
              theme === 'light'
                ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <Sun className="w-5 h-5 text-amber-500" />
              {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <div>
              <p className="font-extrabold text-xs text-slate-900 dark:text-white">Light Mode</p>
              <p className="text-[10px] text-slate-400">Crisp white canvas (#F8FAFC)</p>
            </div>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 ${
              theme === 'dark'
                ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <Moon className="w-5 h-5 text-indigo-400" />
              {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <div>
              <p className="font-extrabold text-xs text-slate-900 dark:text-white">Dark Mode</p>
              <p className="text-[10px] text-slate-400">Deep midnight (#0B1120)</p>
            </div>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 ${
              theme === 'system'
                ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <Monitor className="w-5 h-5 text-slate-500" />
              {theme === 'system' && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <div>
              <p className="font-extrabold text-xs text-slate-900 dark:text-white">System Synchronized</p>
              <p className="text-[10px] text-slate-400">Matches OS appearance</p>
            </div>
          </button>
        </div>
      </div>

      {/* Organization Details Form */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Organization Profile</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Workspace profile used in header banners and policy enforcement scopes.</p>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Organization Legal Name
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Industry Sector
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={orgData.industry}
                onChange={(e) => setOrgData({ ...orgData, industry: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Official Website URL
            </label>
            <input
              type="url"
              disabled={!isAdmin}
              value={orgData.website}
              onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Workspace Description
            </label>
            <textarea
              rows={3}
              disabled={!isAdmin}
              value={orgData.description}
              onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>

          {isAdmin && (
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Organization Profile'}</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Role Permissions Matrix */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Role-Based Access Control (RBAC) Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Strict backend privilege scopes enforced across all controllers.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                <th className="py-3 px-4">Platform Module</th>
                <th className="py-3 px-4 text-center">ADMIN</th>
                <th className="py-3 px-4 text-center">CONTENT_CREATOR</th>
                <th className="py-3 px-4 text-center">REVIEWER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{row.module}</td>
                  <td className="py-3 px-4 text-center">
                    {row.admin ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.creator ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.reviewer ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Infrastructure Telemetry Card */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Connected Governance Infrastructure (₹0 Zero-Cost)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>MySQL 8 Community Edition</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Database: <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">brandsutra_db</code></p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Port: 3307 • HikariCP Active Pool</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>FastAPI AI Microservice</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Model: <code className="font-mono text-purple-600 dark:text-purple-400 font-bold">gemini-2.5-flash (Free Tier)</code></p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Port: 8000 • PyMuPDF Vector Engine</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
