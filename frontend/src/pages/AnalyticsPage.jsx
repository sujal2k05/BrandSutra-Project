import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Award, 
  Layers 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend 
} from 'recharts';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';

const AnalyticsPage = () => {
  const { user } = useAuth();
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Compiling SQL governance analytics...</p>
      </div>
    );
  }

  const statusData = analytics?.statusDistribution 
    ? Object.entries(analytics.statusDistribution).map(([name, value]) => ({ name: name.replace('_', ' '), value }))
    : [];

  const categoryData = analytics?.categoryDistribution 
    ? Object.entries(analytics.categoryDistribution).map(([name, value]) => ({ name, count: value }))
    : [];

  const severityData = analytics?.severityDistribution 
    ? Object.entries(analytics.severityDistribution).map(([name, value]) => ({ name, count: value }))
    : [];

  const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6', '#3B82F6'];

  const totalSubs = analytics?.summary?.totalSubmissions || 0;
  const approvedSubs = analytics?.summary?.approvedCount || 0;
  const complianceRate = totalSubs > 0 ? Math.round((approvedSubs / totalSubs) * 100) : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <span>Brand Risk & Governance Analytics</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Deep-dive telemetry into organizational brand compliance, violation patterns, and approval velocity.
        </p>
      </div>

      {/* Top Level Metric Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          subtitle="Scored 41-100 on Risk Radar"
        />
        <StatCard
          title="Pending Queue Load"
          value={analytics?.summary?.pendingReviewsCount || 0}
          icon={TrendingUp}
          color="purple"
          subtitle="Requires Reviewer Action"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-1">Submission Pipeline Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Breakdown of content states from draft to publication.</p>
          <div className="h-72">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No pipeline data recorded.
              </div>
            )}
          </div>
        </div>

        {/* Severity Breakdown Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-1">Violation Findings by Severity</h3>
          <p className="text-xs text-slate-500 mb-4">Frequency of Critical, High, Medium, and Low risk detections.</p>
          <div className="h-72">
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
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
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No violation severities detected.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Violations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-1">Most Frequent Policy Violations</h3>
        <p className="text-xs text-slate-500 mb-4">Ranked distribution of brand contradictions and terminology conflicts.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryData.length > 0 ? (
            categoryData.map((cat, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block uppercase font-mono">{cat.name}</span>
                  <span className="text-xs text-slate-400">Total flags</span>
                </div>
                <span className="text-2xl font-bold text-indigo-600 font-mono">{cat.count}</span>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-slate-400 text-sm py-8">
              No categories flagged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
