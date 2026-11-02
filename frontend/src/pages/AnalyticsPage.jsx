import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Award, 
  Layers,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend 
} from 'recharts';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/common/StatCard';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const orgId = user?.organizationId || 1;

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [orgId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getAnalytics(orgId);
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Compiling SQL governance analytics...</p>
      </div>
    );
  }

  const statusData = analytics?.statusDistribution 
    ? Object.entries(analytics.statusDistribution).map(([name, value]) => ({ 
        name: name.replace('_', ' '), 
        value 
      }))
    : [];

  const categoryData = analytics?.categoryDistribution 
    ? Object.entries(analytics.categoryDistribution).map(([name, value]) => ({ 
        name, 
        count: value 
      }))
    : [];

  const severityData = analytics?.severityDistribution 
    ? Object.entries(analytics.severityDistribution).map(([name, value]) => ({ 
        name, 
        count: value 
      }))
    : [];

  const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6', '#3B82F6'];

  const totalSubs = analytics?.summary?.totalSubmissions || 0;
  const approvedSubs = analytics?.summary?.approvedCount || 0;
  const complianceRate = totalSubs > 0 ? Math.round((approvedSubs / totalSubs) * 100) : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>Brand Telemetry & Observability</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Brand Risk & Governance Analytics</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deep-dive telemetry into organizational brand compliance, violation patterns, and approval velocity.
        </p>
      </div>

      {/* Top Level Metric Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Compliance Velocity Rate"
          value={`${complianceRate}%`}
          icon={Award}
          color="emerald"
          subtitle="Approved vs Total Submissions"
        />
        <StatCard
          title="Average Risk Rating"
          value={`${analytics?.summary?.averageRiskScore || 0}/100`}
          icon={ShieldCheck}
          color={analytics?.summary?.averageRiskScore > 40 ? 'red' : 'indigo'}
          subtitle="Aggregated Across Revisions"
        />
        <StatCard
          title="High-Risk Submissions"
          value={analytics?.summary?.highRiskCount || 0}
          icon={AlertTriangle}
          color="amber"
          subtitle="Flagged by Pre-Scan Engine"
        />
        <StatCard
          title="Active Workspaces Tracked"
          value={1}
          icon={Layers}
          color="indigo"
          subtitle="Isolated Enterprise Tenant"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">Content Publication Lifecycle</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Breakdown of content states across draft, review, and approval.</p>
          <div className="h-72">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '12px', color: chartTextColor }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-xs">
                No submissions data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Severity Breakdown Bar */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">Violation Findings by Severity</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Frequency of Critical, High, Medium, and Low risk detections.</p>
          <div className="h-72">
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: chartTextColor }} 
                    stroke={chartGridColor} 
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 11, fill: chartTextColor }} 
                    stroke={chartGridColor} 
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {severityData.map((entry) => {
                      const col = entry.name === 'CRITICAL' ? '#EF4444' :
                                  entry.name === 'HIGH' ? '#F97316' :
                                  entry.name === 'MEDIUM' ? '#F59E0B' : '#10B981';
                      return <Cell key={entry.name} fill={col} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-xs">
                No violation severities detected.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ambiguous Guideline Gap Detector */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/80 dark:from-[#111827] dark:via-slate-900 dark:to-indigo-950/60 rounded-3xl border border-indigo-200/90 dark:border-indigo-900/60 p-6 text-slate-900 dark:text-white shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-extrabold text-base sm:text-lg">Governance Intelligence: Ambiguous Guideline Gap Detector</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              AI telemetry identifying policies that cause recurring confusion or require clearer wording in Brand DNA.
            </p>
          </div>
          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 font-extrabold self-start sm:self-auto shadow-2xs">
            Automated Recommendations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Promotional Discounts Gap */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                High Confusion Rate
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">Policy #3</span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Promotional Discount Caps (15%)</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Observed Friction:</strong> Marketers repeatedly offer 40%–50% festive discounts without realizing the 15% hard cap applies to all seasonal sales.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <span><strong className="text-slate-900 dark:text-white">Action:</strong> Clarify seasonal exception criteria in Brand DNA v2 or distribute an approved promo cheat sheet.</span>
            </div>
          </div>

          {/* Card 2: Warranty Limitation Ambiguity */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                Recurring Legal Risk
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">Policy #1 & #2</span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">General vs Compressor Warranty</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Observed Friction:</strong> Copywriters frequently state "5-year warranty on everything" instead of distinguishing the 2-year general coverage from the Model X compressor.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <span><strong className="text-slate-900 dark:text-white">Action:</strong> Mandate a standardized copy-paste warranty disclaimer block in Brand DNA guidelines.</span>
            </div>
          </div>

          {/* Card 3: Banned Perfection Terminology */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Resolution Success
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">Rule #1</span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Superlatives & Perfection Claims</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Observed Friction:</strong> Phrases like "100% perfect" and "unlimited" were detected in drafts but successfully resolved by 1-click suggested corrections.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong className="text-slate-900 dark:text-white">Action:</strong> Maintain existing automated replacement rules. 100% of creators accepted suggested alternatives.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Violations Table */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">Most Frequent Policy Violations</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Ranked distribution of brand contradictions and terminology conflicts.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryData.length > 0 ? (
            categoryData.map((cat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase font-mono">{cat.name}</span>
                  <span className="text-[11px] text-slate-400">Total detected flags</span>
                </div>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{cat.count}</span>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-slate-400 dark:text-slate-500 text-xs py-8">
              No categories flagged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
