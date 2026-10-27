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
  Info
} from 'lucide-react';
import { approvalService, contentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RiskBadge from '../components/common/RiskBadge';
import RiskGauge from '../components/common/RiskGauge';
import Modal from '../components/common/Modal';

const ApprovalsPage = () => {
  const { user } = useAuth();
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
  const [notification, setNotification] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchPendingApprovals();
  }, [orgId]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const res = await approvalService.getPendingApprovals(orgId);
      setPendingQueue(res.data);
    } catch (err) {
      console.error(err);
      setNotification({ text: 'Failed to load approval queue.', type: 'error' });
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
      alert("Please provide a comment explaining why this submission is rejected.");
      return;
    }
    if (decisionType === 'APPROVED' && !humanConfirmed) {
      alert("Please confirm the human accountability verification checkbox before approving.");
      return;
    }

    try {
      setActionLoading(true);
      const payload = { decision: decisionType, comments: reviewComments };

      if (decisionType === 'APPROVED') {
        await approvalService.approveSubmission(selectedSub.id, payload);
      } else if (decisionType === 'REJECTED') {
        await approvalService.rejectSubmission(selectedSub.id, payload);
      } else {
        await approvalService.requestChanges(selectedSub.id, payload);
      }

      setIsReviewModalOpen(false);
      setNotification({ text: `Content marked as ${decisionType}!`, type: 'success' });
      fetchPendingApprovals();
    } catch (err) {
      console.error(err);
      alert("Failed to submit review decision.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Loading pending approval queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Enterprise AI Disclosure & Privacy Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200/90 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 tracking-wide uppercase block">
              Human Reviewer Authority & Confidentiality Notice
            </span>
            <p className="text-[11px] text-slate-600">
              AI analysis provides advisory findings. The legal stamp of publication approval requires authorized human decision-making.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Human Review & Approval Queue</h2>
          <p className="text-xs text-slate-500 mt-1">
            Inspect marketing submissions against Brand DNA evidence before authorizing publication.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            {pendingQueue.length} Pending Actions
          </span>
        </div>
      </div>

      {notification.text && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-sm">
          <span>{notification.text}</span>
          <button onClick={() => setNotification({ text: '', type: '' })} className="text-emerald-600 font-bold">✕</button>
        </div>
      )}

      {/* Pending Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {pendingQueue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Title & Campaign</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Active Version</th>
                  <th className="py-3 px-4">AI Risk Level</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-400">{item.campaignName || 'General Campaign'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                      {item.marketingChannel}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700 font-bold">
                        v{item.currentVersionNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <RiskBadge severity={item.latestRiskLevel || 'LOW'} />
                        <span className="font-mono font-bold text-slate-700">{item.latestRiskScore}/100</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.creatorName || 'Marketing Creator'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenReview(item)}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs"
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
          <div className="p-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">Inbox Zero!</p>
            <p className="mt-1">All marketing submissions have been reviewed and approved.</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Reviewing: ${selectedSub?.title} (Version ${selectedSub?.currentVersionNumber})`}
        size="lg"
      >
        <div className="space-y-5">
          
          {/* Content View */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Submitted Marketing Copy for Publication (Version {selectedSub?.currentVersionNumber})
            </label>
            <div className="p-4 bg-slate-900 text-white rounded-xl text-sm font-sans leading-relaxed whitespace-pre-wrap">
              {selectedSub?.currentContentText}
            </div>
          </div>

          {/* AI Findings Summary with Evidence Badges */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>AI Governance Findings ({findings.length})</span>
              <span className="font-mono text-slate-500">Risk Score: {selectedSub?.latestRiskScore}/100</span>
            </label>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {findings.length > 0 ? (
                findings.map((f, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-2">
                      <RiskBadge severity={f.severity} />
                      
                      {/* EVIDENCE STATUS BADGE */}
                      {f.evidenceStatus === 'CONTRADICTED' ? (
                        <span className="text-[10px] bg-red-100 text-red-800 font-extrabold px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-red-600" />
                          PROVEN CONTRADICTION
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          UNSUPPORTED CLAIM (UNVERIFIED)
                        </span>
                      )}

                      <span className="font-bold text-slate-900">{f.issue}</span>
                    </div>
                    <p className="text-slate-600">{f.explanation}</p>
                    {f.evidenceText ? (
                      <p className="text-indigo-700 bg-indigo-50/80 p-2 rounded text-[11px] font-mono border border-indigo-100">
                        <strong>Approved Evidence:</strong> "{f.evidenceText}" ({f.sourceName})
                      </p>
                    ) : (
                      <p className="text-amber-800 bg-amber-50/80 p-2 rounded text-[11px] border border-amber-200">
                        <strong>Notice:</strong> No approved fact corroborates this claim in Brand DNA.
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No active violations detected by AI engine. Compliant for publication.</span>
                </div>
              )}
            </div>
          </div>

          {/* Reviewer Comments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Reviewer Comments & Feedback (Required for Rejections)
            </label>
            <textarea
              rows={3}
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder="e.g. Approved. Warranty disclaimer accurately states Model X compressor limitation."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* AREA 4: Human Accountability Checkbox */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="human-confirmed-chk"
              checked={humanConfirmed}
              onChange={(e) => setHumanConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="human-confirmed-chk" className="text-xs text-slate-700 cursor-pointer font-medium leading-relaxed">
              <strong>Human Verification Accountability:</strong> I confirm I have inspected the AI findings, validated approved Brand DNA citations, and hereby assume human editorial responsibility for this publication decision.
            </label>
          </div>

          {/* Decision Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleDecision('CHANGES_REQUESTED')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Request Changes</span>
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleDecision('REJECTED')}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Submission</span>
            </button>

            <button
              type="button"
              disabled={actionLoading || !humanConfirmed}
              onClick={() => handleDecision('APPROVED')}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
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
