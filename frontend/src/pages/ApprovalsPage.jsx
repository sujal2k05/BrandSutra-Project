import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Clock, 
  MessageSquare, 
  ShieldAlert, 
  User, 
  History, 
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Shield,
  Info,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { approvalService, contentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RiskBadge from '../components/common/RiskBadge';
import RiskGauge from '../components/common/RiskGauge';
import Modal from '../components/common/Modal';

const ApprovalsPage = () => {
  const { user } = useAuth();
  const { success, error: toastError, warning } = useToast();
  const orgId = user?.organizationId || 1;

  const [pendingQueue, setPendingQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [findings, setFindings] = useState([]);
  const [history, setHistory] = useState([]);
  const [reviewComments, setReviewComments] = useState('');
  const [humanConfirmed, setHumanConfirmed] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL');

  useEffect(() => {
    fetchPendingApprovals();
  }, [orgId]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const res = await approvalService.getPendingApprovals(orgId);
      setPendingQueue(res.data || []);
    } catch (err) {
      console.error(err);
      toastError('Failed to load approval queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = async (sub) => {
    setSelectedSub(sub);
    setReviewComments('');
    setHumanConfirmed(false);
    try {
      const [fRes, hRes] = await Promise.all([
        contentService.getFindings(sub.id),
        approvalService.getApprovalHistory(sub.id)
      ]);
      setFindings(fRes.data?.findings || []);
      setHistory(hRes.data || []);
      setIsReviewModalOpen(true);
    } catch (err) {
      console.error(err);
      setIsReviewModalOpen(true);
    }
  };

  const handleDecision = async (decisionType) => {
    if (!selectedSub) return;
    if (decisionType === 'REJECTED' && !reviewComments.trim()) {
      warning("Please provide a comment explaining why this submission is rejected.");
      return;
    }
    if (decisionType === 'APPROVED' && !humanConfirmed) {
      warning("Please confirm the human accountability verification checkbox before approving.");
      return;
    }

    try {
      setActionLoading(true);
      const payload = { decision: decisionType, comments: reviewComments };

      if (decisionType === 'APPROVED') {
        await approvalService.approveSubmission(selectedSub.id, payload);
        success(`Submission #${selectedSub.id} approved for publication!`);
      } else if (decisionType === 'REJECTED') {
        await approvalService.rejectSubmission(selectedSub.id, payload);
        success(`Submission #${selectedSub.id} rejected.`);
      } else {
        await approvalService.requestChanges(selectedSub.id, payload);
        info(`Revision requested for submission #${selectedSub.id}.`);
      }

      setIsReviewModalOpen(false);
      fetchPendingApprovals();
    } catch (err) {
      console.error(err);
      toastError("Failed to submit review decision.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredQueue = pendingQueue.filter(sub => {
    const matchesSearch = !searchQuery || 
      sub.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.campaignName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.creatorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === 'ALL' || sub.marketingChannel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  const highRiskCount = pendingQueue.filter(s => (s.latestRiskScore || 0) > 40).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading pending approval queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Enterprise AI Disclosure & Privacy Banner */}
      <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-slate-800 dark:text-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-200/90 dark:border-purple-800 flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white tracking-wide uppercase block">
              Human Reviewer Authority & Accountability Notice
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              AI analysis provides advisory findings. Publication authorization strictly requires editorial sign-off by a designated Human Reviewer.
            </p>
          </div>
        </div>
      </div>

      {/* Header & Stats Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Human Review & Approval Queue</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Inspect marketing submissions against Brand DNA evidence before authorizing publication.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
            {pendingQueue.length} Pending Approvals
          </span>
          {highRiskCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold">
              {highRiskCount} High Risk
            </span>
          )}
        </div>
      </div>

      {/* Pending Table Card */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Controls */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search submission title, campaign, creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Channels</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="WEBSITE">Website Banner</option>
              <option value="EMAIL">Email Marketing</option>
            </select>
          </div>
        </div>

        {filteredQueue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-3.5 px-6">Title & Campaign</th>
                  <th className="py-3.5 px-6">Channel</th>
                  <th className="py-3.5 px-6">Active Version</th>
                  <th className="py-3.5 px-6">AI Risk Level</th>
                  <th className="py-3.5 px-6">Submitted By</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 align-top">
                      <div className="font-extrabold text-slate-900 dark:text-white text-xs">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.campaignName || 'General Campaign'}</div>
                    </td>
                    <td className="py-4 px-6 align-top font-mono text-slate-600 dark:text-slate-400 text-xs font-bold">
                      {item.marketingChannel}
                    </td>
                    <td className="py-4 px-6 align-top">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 font-bold">
                        v{item.currentVersionNumber}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <div className="flex items-center gap-1.5">
                        <RiskBadge severity={item.latestRiskLevel || 'LOW'} size="xs" />
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{item.latestRiskScore}/100</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-top text-slate-600 dark:text-slate-400 text-xs">
                      {item.creatorName || 'Marketing Creator'}
                    </td>
                    <td className="py-4 px-6 align-top text-right">
                      <button
                        onClick={() => handleOpenReview(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-2xs"
                      >
                        Inspect & Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Review Queue Clear!</p>
            <p className="mt-1">All marketing submissions have been reviewed and approved.</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Reviewing: ${selectedSub?.title} (Version ${selectedSub?.currentVersionNumber})`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-5">
          {/* Content View */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Submitted Marketing Copy (Version {selectedSub?.currentVersionNumber})
            </label>
            <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs font-mono leading-relaxed whitespace-pre-wrap border border-slate-800">
              {selectedSub?.currentContentText}
            </div>
          </div>

          {/* AI Findings Summary */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>AI Governance Findings ({findings.length})</span>
              <span className="font-mono text-slate-500 dark:text-slate-400">Risk Score: {selectedSub?.latestRiskScore}/100</span>
            </label>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {findings.length > 0 ? (
                findings.map((f, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <RiskBadge severity={f.severity} size="xs" />
                      {f.evidenceStatus === 'CONTRADICTED' ? (
                        <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/60 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          PROVEN CONTRADICTION
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/60 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          UNSUPPORTED CLAIM
                        </span>
                      )}
                      <span className="font-bold text-slate-900 dark:text-white">{f.issue}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.explanation}</p>
                    {f.evidenceText ? (
                      <p className="text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/60 p-2 rounded-xl text-[11px] font-mono border border-indigo-100 dark:border-indigo-900/50">
                        <strong>Approved Evidence:</strong> "{f.evidenceText}" ({f.sourceName})
                      </p>
                    ) : (
                      <p className="text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/60 p-2 rounded-xl text-[11px] border border-amber-200 dark:border-amber-900/50">
                        <strong>Notice:</strong> No approved fact corroborates this claim in Brand DNA.
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>No active violations detected by AI engine. Compliant for publication.</span>
                </div>
              )}
            </div>
          </div>

          {/* Reviewer Comments */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Reviewer Comments & Feedback (Required for Rejections)
            </label>
            <textarea
              rows={3}
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder="e.g. Approved. Warranty disclaimer accurately matches Brand DNA fact limits."
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Human Accountability Checkbox */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="human-confirmed-chk"
              checked={humanConfirmed}
              onChange={(e) => setHumanConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="human-confirmed-chk" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium leading-relaxed">
              <strong>Human Verification Accountability:</strong> I confirm I have inspected the AI advisory findings, validated Brand DNA evidence citations, and hereby authorize this publication decision.
            </label>
          </div>

          {/* Decision Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleDecision('CHANGES_REQUESTED')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Request Changes</span>
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleDecision('REJECTED')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Submission</span>
            </button>

            <button
              type="button"
              disabled={actionLoading || !humanConfirmed}
              onClick={() => handleDecision('APPROVED')}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve for Publication</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApprovalsPage;
