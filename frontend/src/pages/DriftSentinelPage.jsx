import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  ExternalLink, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity, 
  Check, 
  Loader2,
  Fingerprint,
  Radio,
  FileCode,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Code2
} from 'lucide-react';
import { driftService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';

// Strips raw HTML, script blocks, styles and comments to display human-readable text
const stripHtmlToCleanText = (str) => {
  if (!str) return '';
  try {
    let extractedMeta = [];
    const titleMatch = str.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      extractedMeta.push('Page Title: ' + titleMatch[1].trim());
    }
    const descMatch = str.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) 
                   || str.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    if (descMatch && descMatch[1]) {
      extractedMeta.push('Meta Description: ' + descMatch[1].trim());
    }

    let clean = str;
    // Remove script tags (closed or unclosed if truncated)
    clean = clean.replace(/<script\b[\s\S]*?(?:<\/script>|$)/gi, ' ');
    // Remove style tags (closed or unclosed)
    clean = clean.replace(/<style\b[\s\S]*?(?:<\/style>|$)/gi, ' ');
    clean = clean.replace(/<noscript\b[\s\S]*?(?:<\/noscript>|$)/gi, ' ');
    clean = clean.replace(/<svg\b[\s\S]*?(?:<\/svg>|$)/gi, ' ');
    clean = clean.replace(/<!--[\s\S]*?-->/g, ' ');
    // Convert headings, paragraphs, divs and breaks into newlines
    clean = clean.replace(/<\/?(?:div|p|h[1-6]|li|tr|br|blockquote|section|article|header|footer)[^>]*>/gi, '\n');
    // Strip remaining tags
    clean = clean.replace(/<[^>]+>/g, ' ');
    // Decode common entities
    clean = clean
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&copy;/gi, '©');

    // Filter out leftover raw JavaScript statements or theme snippets
    const lines = clean.split('\n')
      .map(line => line.trim())
      .filter(line => {
        if (!line) return false;
        if (line.startsWith('(function()') || line.includes('localStorage.') || line.includes('classList.add') || line.includes('classList.remove')) {
          return false;
        }
        return true;
      });

    let result = lines.join('\n\n');
    if (!result || result.trim().length === 0) {
      if (extractedMeta.length > 0) {
        return `${extractedMeta.join('\n\n')}\n\n[Note: Single-Page Application (SPA) shell detected. Client-side DOM is rendered dynamically in the browser. For dynamic React apps, use 'Offline Manual Snapshot' to test the full marketing copy, or monitor pre-rendered/SSR URLs].`;
      }
      return 'No readable marketing text found in page response.';
    }

    if (extractedMeta.length > 0 && !result.includes(extractedMeta[0])) {
      result = `${extractedMeta.join('\n\n')}\n\n---\n\n${result}`;
    }

    return result;
  } catch (_) {
    return str;
  }
};

export default function DriftSentinelPage() {
  const { success, error: toastError, info } = useToast();
  const [sources, setSources] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [diffModalSource, setDiffModalSource] = useState(null);
  const [diffViewMode, setDiffViewMode] = useState('clean'); // 'clean' | 'raw'
  const [manualSnapshotSource, setManualSnapshotSource] = useState(null);
  const [manualSnapshotText, setManualSnapshotText] = useState('');

  // Register Form State
  const [formName, setFormName] = useState('');
  const [formSourceType, setFormSourceType] = useState('PUBLIC_URL');
  const [formUrl, setFormUrl] = useState('');
  const [formFrequency, setFormFrequency] = useState('HOURLY');
  const [formInitialContent, setFormInitialContent] = useState('');
  const [formError, setFormError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [srcRes, alertRes] = await Promise.all([
        driftService.getSources(),
        driftService.getAlerts(),
      ]);
      setSources(srcRes.data || []);
      setAlerts(alertRes.data || []);
    } catch (err) {
      console.error('Failed to load Drift Sentinel data:', err);
      toastError('Failed to load monitored assets.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSource = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        name: formName,
        source_type: formSourceType,
        url: formSourceType === 'PUBLIC_URL' ? formUrl : null,
        check_frequency: formFrequency,
        initial_content: formInitialContent || null,
      };
      await driftService.registerSource(payload);
      setShowRegisterModal(false);
      resetForm();
      success('Monitored asset registered successfully! Baseline SHA-256 fingerprint generated.');
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register monitored source.';
      setFormError(msg);
      toastError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormSourceType('PUBLIC_URL');
    setFormUrl('');
    setFormFrequency('HOURLY');
    setFormInitialContent('');
    setFormError(null);
  };

  const handleCheckNow = async (sourceId) => {
    setActionLoading(prev => ({ ...prev, [sourceId]: true }));
    try {
      const res = await driftService.checkSourceNow(sourceId);
      await loadData();
      if (res.data?.drift_detected) {
        toastError(`Drift detected on asset: ${res.data.drift_type}`);
      } else {
        success('Asset verified! Content matches approved Brand DNA baseline perfectly.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Verification check failed.');
    } finally {
      setActionLoading(prev => ({ ...prev, [sourceId]: false }));
    }
  };

  const handleToggleActive = async (source) => {
    try {
      await driftService.toggleSource(source.id, !source.is_active);
      loadData();
      info(`Monitoring ${!source.is_active ? 'resumed' : 'paused'} for ${source.name}.`);
    } catch (err) {
      toastError('Failed to toggle active monitoring.');
    }
  };

  const handleUpdateSnapshotSubmit = async () => {
    if (!manualSnapshotSource) return;
    try {
      await driftService.updateManualSnapshot(manualSnapshotSource.id, manualSnapshotText);
      setManualSnapshotSource(null);
      setManualSnapshotText('');
      success('Updated manual snapshot and re-scanned for policy drift.');
      loadData();
    } catch (err) {
      toastError('Failed to update manual snapshot.');
    }
  };

  const handleReviewAlert = async (alertId) => {
    try {
      await driftService.reviewAlert(alertId);
      success('Alert acknowledged and marked resolved.');
      loadData();
    } catch (err) {
      toastError('Failed to review alert.');
    }
  };

  const healthyCount = sources.filter(s => s.last_status === 'HEALTHY').length;
  const driftCount = sources.filter(s => s.last_status === 'DRIFT_DETECTED').length;
  const unreviewedAlerts = alerts.filter(a => !a.is_reviewed);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Continuous Brand Integrity Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Live Brand Drift Sentinel</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Continuously monitors live public URLs and offline copy snapshots for silent policy drift, unapproved discounts, and warranty mismatch.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register Monitored Asset</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Monitored Assets</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {sources.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Active governance endpoints</p>
        </div>

        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Healthy & Synced</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            {healthyCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Matches approved DNA baseline</p>
        </div>

        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Drift Detected</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            {driftCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Requires reviewer sign-off</p>
        </div>

        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Pending Alerts</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            {unreviewedAlerts.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">In-app notifications unreviewed</p>
        </div>
      </div>

      {/* Monitored Sources Table */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Monitored Assets Registry</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Automated SHA-256 fingerprint baseline verification</p>
          </div>
          <button
            onClick={loadData}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading monitored assets from MySQL...</div>
        ) : sources.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No assets monitored yet. Register a public URL or manual snapshot above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Asset Name & Hash</th>
                  <th className="py-3.5 px-6">Type & Endpoint</th>
                  <th className="py-3.5 px-6">Frequency</th>
                  <th className="py-3.5 px-6">Status & Risk</th>
                  <th className="py-3.5 px-6">Drift Dimension</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {sources.map(src => (
                  <tr key={src.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-4 px-6 align-top">
                      <div className="font-extrabold text-slate-900 dark:text-white text-xs">{src.name}</div>
                      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        <Fingerprint className="w-3 h-3" />
                        <span>SHA: {src.current_hash ? src.current_hash.substring(0, 12) + '...' : 'PENDING'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-top text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {src.source_type}
                        </span>
                        {src.url ? (
                          <span className="truncate max-w-xs font-mono text-slate-500 dark:text-slate-400">{src.url}</span>
                        ) : (
                          <span className="text-slate-400 italic">Offline Snapshot</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-top text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {src.check_frequency}
                    </td>
                    <td className="py-4 px-6 align-top">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          src.last_status === 'HEALTHY' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                          src.last_status === 'DRIFT_DETECTED' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' :
                          'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {src.last_status}
                        </span>
                        {src.last_risk_score > 0 && (
                          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                            {src.last_risk_score}/100
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-top text-xs font-mono text-slate-700 dark:text-slate-300">
                      {src.last_drift_type || 'NO_CHANGE'}
                    </td>
                    <td className="py-4 px-6 align-top text-right space-x-2">
                      <button
                        onClick={() => handleCheckNow(src.id)}
                        disabled={actionLoading[src.id]}
                        className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition"
                      >
                        {actionLoading[src.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Check Now'}
                      </button>
                      <button
                        onClick={() => setDiffModalSource(src)}
                        className="px-2.5 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg transition"
                      >
                        View Diff
                      </button>
                      {src.source_type === 'MANUAL_SNAPSHOT' && (
                        <button
                          onClick={() => {
                            setManualSnapshotSource(src);
                            setManualSnapshotText(src.current_snapshot || '');
                          }}
                          className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition"
                        >
                          Update Snapshot
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* In-App Alerts Queue */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>Drift Alerts Queue</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Unresolved discrepancies flagged on public assets</p>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {unreviewedAlerts.length} unreviewed
          </span>
        </div>

        {alerts.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No active drift alerts detected. All assets are compliant with approved Brand DNA.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map(a => (
              <div 
                key={a.id} 
                className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
                  a.is_reviewed 
                    ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60' 
                    : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">{a.alert_title}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                      {a.severity}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {a.drift_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">{a.explanation}</p>
                </div>
                <div>
                  {a.is_reviewed ? (
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Reviewed by {a.reviewed_by_name || 'Reviewer'}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleReviewAlert(a.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Acknowledge Alert
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Register Source Modal */}
      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register Monitored Asset">
        {formError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 rounded-xl text-xs font-semibold mb-4 border border-rose-200 dark:border-rose-900/60">
            {formError}
          </div>
        )}

        <form onSubmit={handleRegisterSource} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Asset Name
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. NovaHome Official Warranty Page"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Source Type
            </label>
            <select
              value={formSourceType}
              onChange={(e) => setFormSourceType(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PUBLIC_URL">Public URL (HTTP/HTTPS with SSRF Protection)</option>
              <option value="MANUAL_SNAPSHOT">Offline Manual Snapshot</option>
            </select>
          </div>

          {formSourceType === 'PUBLIC_URL' ? (
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Public Web URL
              </label>
              <input
                type="url"
                required
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://example.com/promotions"
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Protected by SSRF Guard: Loopback, private ranges (RFC1918), and internal ports are blocked.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Initial Baseline Copy
              </label>
              <textarea
                rows="4"
                required
                value={formInitialContent}
                onChange={(e) => setFormInitialContent(e.target.value)}
                placeholder="Paste approved baseline copy to monitor for drift..."
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Check Frequency
            </label>
            <select
              value={formFrequency}
              onChange={(e) => setFormFrequency(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="HOURLY">Hourly Automated Polling</option>
              <option value="DAILY">Daily Automated Polling</option>
              <option value="MANUAL">Manual On-Demand Only</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowRegisterModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs"
            >
              {formSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register & Monitor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Diff Viewer Modal */}
      <Modal isOpen={!!diffModalSource} onClose={() => setDiffModalSource(null)} title="Drift Snapshot Comparison" maxWidth="max-w-5xl">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Asset: <span className="font-bold text-slate-900 dark:text-white text-sm">{diffModalSource?.name}</span>
                {diffModalSource?.url && (
                  <span className="ml-2 text-[11px] font-mono text-indigo-600 dark:text-indigo-400">({diffModalSource.url})</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Side-by-side verification between approved legal baseline and live public asset.
              </p>
            </div>

            {/* View Mode Toggle: Clean Content vs Raw Source */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setDiffViewMode('clean')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  diffViewMode === 'clean'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Clean Readable Text</span>
              </button>
              <button
                type="button"
                onClick={() => setDiffViewMode('raw')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  diffViewMode === 'raw'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Raw Source / HTML</span>
              </button>
            </div>
          </div>

          {diffViewMode === 'clean' && (diffModalSource?.baseline_snapshot?.includes('<') || diffModalSource?.current_snapshot?.includes('<')) && (
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium rounded-xl border border-indigo-100 dark:border-indigo-900/40">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Webpage Source Cleaned: HTML tags, stylesheets, and scripts have been automatically stripped to display clean marketing copy and policy claims.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Approved Baseline Snapshot</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {diffViewMode === 'clean' 
                    ? `${stripHtmlToCleanText(diffModalSource?.baseline_snapshot).length} chars`
                    : `${(diffModalSource?.baseline_snapshot || '').length} raw chars`}
                </span>
              </div>
              <div className={`max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed ${
                diffViewMode === 'clean'
                  ? 'font-sans text-xs text-slate-800 dark:text-slate-200 selection:bg-indigo-500/20'
                  : 'font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-900/40 p-2.5 rounded-xl'
              }`}>
                {diffViewMode === 'clean'
                  ? (stripHtmlToCleanText(diffModalSource?.baseline_snapshot) || 'No readable text captured.')
                  : (diffModalSource?.baseline_snapshot || 'No baseline captured.')}
              </div>
            </div>

            <div className="p-4 bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase text-rose-600 dark:text-rose-400">Live / Current Snapshot</span>
                <span className="text-[10px] font-mono text-rose-500">
                  {diffViewMode === 'clean'
                    ? `${stripHtmlToCleanText(diffModalSource?.current_snapshot).length} chars`
                    : `${(diffModalSource?.current_snapshot || '').length} raw chars`}
                </span>
              </div>
              <div className={`max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed ${
                diffViewMode === 'clean'
                  ? 'font-sans text-xs text-rose-950 dark:text-rose-200 selection:bg-rose-500/20'
                  : 'font-mono text-xs text-rose-950 dark:text-rose-200 bg-slate-900/40 p-2.5 rounded-xl'
              }`}>
                {diffViewMode === 'clean'
                  ? (stripHtmlToCleanText(diffModalSource?.current_snapshot) || 'No readable text captured.')
                  : (diffModalSource?.current_snapshot || 'No snapshot captured.')}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Last checked: {diffModalSource?.last_checked_at ? new Date(diffModalSource.last_checked_at).toLocaleTimeString() : 'Recently'}
            </span>
            <button
              onClick={() => setDiffModalSource(null)}
              className="px-5 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Manual Snapshot Update Modal */}
      <Modal isOpen={!!manualSnapshotSource} onClose={() => setManualSnapshotSource(null)} title="Update Manual Snapshot">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              New Snapshot Text
            </label>
            <textarea
              rows="6"
              value={manualSnapshotText}
              onChange={(e) => setManualSnapshotText(e.target.value)}
              placeholder="Paste latest version of copy to trigger drift validation..."
              className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setManualSnapshotSource(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateSnapshotSubmit}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Save & Run Drift Check
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
