import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  Swords, 
  Globe, 
  Layers, 
  Activity, 
  TrendingUp,
  RefreshCw,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/common/StatCard';
import RiskBadge from '../components/common/RiskBadge';
import RiskGauge from '../components/common/RiskGauge';
import { Skeleton, TableSkeleton } from '../components/common/Skeleton';

const DashboardPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const orgId = user?.organizationId || 1;

  useEffect(() => {
    fetchDashboardData();
  }, [orgId]);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const [sumRes, anaRes] = await Promise.all([
        dashboardService.getSummary(orgId),
        dashboardService.getAnalytics(orgId),
      ]);
      setSummary(sumRes.data);
      setAnalytics(anaRes.data);
      setError('');
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load live governance metrics from backend.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Recharts styling based on dark mode
  const chartTextColor = isDark ? '#94A3B8' : '#64748B';
  const chartGridColor = isDark ? '#1F2937' : '#E2E8F0';
  const tooltipStyle = {
    backgroundColor: isDark ? '#111827' : '#FFFFFF',
    borderColor: isDark ? '#374151' : '#E2E8F0',
    color: isDark ? '#F8FAFC' : '#0F172A',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    fontSize: '12px',
    fontWeight: '600'
  };

  const statusChartData = analytics?.statusDistribution 
    ? Object.entries(analytics.statusDistribution).map(([name, value]) => ({ 
        name: name.replace('_', ' '), 
        value 
      }))
    : [];

  const categoryChartData = analytics?.categoryDistribution 
    ? Object.entries(analytics.categoryDistribution).map(([name, value]) => ({ 
        name: name.replace('_', ' '), 
        count: value 
      }))
    : [];

  const totalSubs = summary?.totalSubmissions || 0;
  const approvedSubs = summary?.approvedCount || 0;
  const approvalRate = totalSubs > 0 ? Math.round((approvedSubs / totalSubs) * 100) : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Personalized Welcome Section */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/90 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-800/40">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Workspace: {user?.organizationName || 'NovaHome Appliances'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.fullName || 'Governance Officer'}
            </h1>
            <p className="text-indigo-200/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
              BrandSutra is continuously monitoring all marketing collateral and live public assets against authoritative Brand DNA facts and safety policies.
            </p>
          </div>

          {/* Quick Actions Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/inspector')}
              className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Inspect Content</span>
            </button>
            <button
              onClick={() => navigate('/self-healing')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Self-Healing</span>
            </button>
            <button
              onClick={() => navigate('/adversarial-simulator')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <Swords className="w-4 h-4 text-rose-300" />
              <span>Red-Team PR</span>
            </button>
            <button
              onClick={fetchDashboardData}
              title="Refresh live metrics"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="font-bold underline ml-3">Retry</button>
        </div>
      )}

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Submissions"
            value={summary?.totalSubmissions ?? 0}
            icon={FileText}
            color="indigo"
            subtitle="Immutable revisions"
          />
          <StatCard
            title="Approved Copy"
            value={summary?.approvedCount ?? 0}
            icon={CheckCircle2}
            color="emerald"
            trend={`${approvalRate}%`}
            trendLabel="approval rate"
          />
          <StatCard
            title="Pending Review"
            value={summary?.pendingReviewsCount ?? 0}
            icon={Clock}
            color="amber"
            subtitle="Awaiting human sign-off"
          />
          <StatCard
            title="Rejected Copy"
            value={summary?.rejectedCount ?? 0}
            icon={XCircle}
            color="red"
            subtitle="Violation blocks"
          />
          <StatCard
            title="High-Risk Alerts"
            value={summary?.highRiskCount ?? 0}
            icon={AlertTriangle}
            color="red"
            subtitle="Requires red-teaming"
          />
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Avg Risk Rating</p>
            <RiskGauge score={summary?.averageRiskScore || 0} level={summary?.averageRiskScore > 40 ? 'HIGH' : 'LOW'} size="sm" />
          </div>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Status Distribution */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
                Submission Workflow Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current status across all campaigns</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Live SQL Totals
            </span>
          </div>
          <div className="h-64">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: chartTextColor }} 
                    stroke={chartGridColor}
                    interval={0} 
                    angle={-15} 
                    textAnchor="end" 
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 11, fill: chartTextColor }} 
                    stroke={chartGridColor}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]}>
                    {statusChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.name.toLowerCase().includes('approved') ? '#10B981' :
                          entry.name.toLowerCase().includes('reject') ? '#EF4444' :
                          entry.name.toLowerCase().includes('pending') ? '#F59E0B' :
                          '#6366F1'
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-xs">
                <Layers className="w-8 h-8 mb-2 opacity-50" />
                <span>No submission telemetry logged yet.</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Violations by Category */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
                Policy Violations by Brand Category
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Findings grouped by safety dimension</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Deterministic + AI
            </span>
          </div>
          <div className="h-64">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
                  <XAxis 
                    type="number" 
                    allowDecimals={false} 
                    tick={{ fontSize: 11, fill: chartTextColor }} 
                    stroke={chartGridColor}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: chartTextColor }} 
                    stroke={chartGridColor}
                    width={90} 
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 mb-2 opacity-50 text-emerald-500" />
                <span>No policy violations detected yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">Recent Content Submissions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest collateral submitted for governance scan</p>
            </div>
            <Link 
              to="/submissions" 
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 transition"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Title & Channel</th>
                  <th className="px-5 py-3.5">Version</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Risk Level</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {analytics?.recentSubmissions?.length > 0 ? (
                  analytics.recentSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{sub.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{sub.marketingChannel}</span>
                          <span>•</span>
                          <span>{sub.contentType?.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold">
                          v{sub.currentVersionNumber || 1}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.overallStatus === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' :
                          sub.overallStatus === 'REJECTED' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300' :
                          sub.overallStatus === 'PENDING_REVIEW' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {sub.overallStatus?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <RiskBadge severity={sub.latestRiskLevel || 'LOW'} size="xs" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/inspector?id=${sub.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                      No submissions found. Create one using Content Inspector.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Review Decisions Feed (1 col) */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">Recent Human Reviews</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Accountability log</p>
            </div>
            <Link 
              to="/approvals" 
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Queue →
            </Link>
          </div>
          <div className="p-5 divide-y divide-slate-100 dark:divide-slate-800/60 flex-1 overflow-y-auto max-h-[380px]">
            {analytics?.recentReviews?.length > 0 ? (
              analytics.recentReviews.map((rev) => (
                <div key={rev.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[170px]">
                      {rev.submissionTitle}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      rev.decision === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' :
                      rev.decision === 'REJECTED' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300' :
                      'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    }`}>
                      {rev.decision}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{rev.comments || 'No comments left.'}"
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between pt-0.5">
                    <span>By {rev.reviewerName}</span>
                    <span>{new Date(rev.reviewedAt).toLocaleDateString()}</span>
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-xs">
                <Clock className="w-8 h-8 mb-2 opacity-50" />
                <span>No review decisions logged yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
