import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Gauge,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend 
} from 'recharts';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import RiskBadge from '../components/common/RiskBadge';
import RiskGauge from '../components/common/RiskGauge';

const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orgId = user?.organizationId || 1;

  useEffect(() => {
    fetchDashboardData();
  }, [orgId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, anaRes] = await Promise.all([
        dashboardService.getSummary(orgId),
        dashboardService.getAnalytics(orgId),
      ]);
      setSummary(sumRes.data);
      setAnalytics(anaRes.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard metrics from backend.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading governance metrics from MySQL...</p>
      </div>
    );
  }

  // Chart datasets
  const statusChartData = analytics?.statusDistribution 
    ? Object.entries(analytics.statusDistribution).map(([name, value]) => ({ name: name.replace('_', ' '), value }))
    : [];

  const categoryChartData = analytics?.categoryDistribution 
    ? Object.entries(analytics.categoryDistribution).map(([name, value]) => ({ name: name.replace('_', ' '), count: value }))
    : [];

  const severityChartData = analytics?.severityDistribution 
    ? Object.entries(analytics.severityDistribution).map(([name, value]) => ({ name, count: value }))
    : [];

  const SEVERITY_COLORS = {
    CRITICAL: '#EF4444',
    HIGH: '#F97316',
    MEDIUM: '#F59E0B',
    LOW: '#10B981',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-card border border-indigo-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Brand DNA: {user?.organizationName || 'NovaHome Appliances'}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">AI Pre-Publication Governance Overview</h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Real-time verification against approved facts, warranty clauses, and pricing policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/inspector"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Inspect Content</span>
          </Link>
          <Link
            to="/brand-dna"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors"
          >
            Brand DNA
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Submissions"
          value={summary?.totalSubmissions ?? 0}
          icon={FileText}
          color="indigo"
        />
        <StatCard
          title="Approved Copy"
          value={summary?.approvedCount ?? 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Pending Reviews"
          value={summary?.pendingReviewsCount ?? 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Rejected Copy"
          value={summary?.rejectedCount ?? 0}
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="High-Risk Submissions"
          value={summary?.highRiskCount ?? 0}
          icon={AlertTriangle}
          color="red"
        />
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg Risk Score</p>
          <RiskGauge score={summary?.averageRiskScore || 0} level={summary?.averageRiskScore > 40 ? 'HIGH' : 'LOW'} size="sm" />
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Content Submission Status Distribution</h3>
            <span className="text-xs text-slate-400">Actual SQL Totals</span>
          </div>
          <div className="h-64">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No submissions logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Violations by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Violations by Brand Category</h3>
            <span className="text-xs text-slate-400">Detected Findings</span>
          </div>
          <div className="h-64">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No violation categories recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Recent Content Submissions</h3>
            <Link to="/submissions" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-5 py-3">Title & Channel</th>
                  <th className="px-5 py-3">Version</th>
                  <th className="px-5 py-3">Governance Status</th>
                  <th className="px-5 py-3">Risk Level</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics?.recentSubmissions?.length > 0 ? (
                  analytics.recentSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{sub.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-indigo-600">{sub.marketingChannel}</span>
                          <span>•</span>
                          <span>{sub.contentType?.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                          v{sub.currentVersionNumber || 1}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sub.overallStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          sub.overallStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          sub.overallStatus === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {sub.overallStatus?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <RiskBadge severity={sub.latestRiskLevel || 'LOW'} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/inspector?id=${sub.id}`}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          Inspect →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">
                      No submissions found. Create one using Content Inspector.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Review Decisions (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Recent Reviews</h3>
            <Link to="/approvals" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Queue →
            </Link>
          </div>
          <div className="p-5 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[360px]">
            {analytics?.recentReviews?.length > 0 ? (
              analytics.recentReviews.map((rev) => (
                <div key={rev.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800 text-xs truncate max-w-[170px]">
                      {rev.submissionTitle}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rev.decision === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      rev.decision === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {rev.decision}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 italic mb-1">"{rev.comments || 'No comments'}"</p>
                  <p className="text-[10px] text-slate-400">By {rev.reviewerName}</p>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                No recent review decisions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
