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
  AlertCircle
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
        <p className="text-sm font-medium text-slate-500">Checking pending review queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <CheckCircle2 className="w-6 h-6 text-indigo-600" />
          <span>Human Review & Approval Queue</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Review marketing content drafts, inspect AI risk findings, and grant official publication approvals.
        </p>
      </div>

      {/* Alert Notification */}
      {notification.text && (
        <div className="p-4 rounded-xl text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Queue List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingQueue.length > 0 ? (
          pendingQueue.map((sub) => (
            <div 
              key={sub.id} 
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending Review
                  </span>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Version {sub.currentVersionNumber || 1}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1">{sub.title}</h3>
                <p className="text-xs text-slate-500 mb-3">
                  {sub.campaignName || 'General'} • {sub.marketingChannel} • By {sub.creatorName}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-sans italic line-clamp-3 mb-4 leading-relaxed">
                  "{sub.currentContentText}"
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <RiskBadge severity={sub.latestRiskLevel || 'LOW'} />
                  <span className="text-xs font-bold font-mono text-slate-600">
                    Risk: {sub.latestRiskScore || 0}/100
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenReview(sub)}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
              >
                <span>Inspect & Make Decision</span>
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-base">Approval Queue is Clear!</h4>
            <p className="text-sm mt-1">There are no pending submissions awaiting reviewer sign-off.</p>
          </div>
        )}
      </div>

      {/* MODAL: REVIEW SUBMISSION DIALOG */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Review Submission: ${selectedSub?.title || ''}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Version Info & Immutable Notice */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
            <span>
              <strong>Target Version:</strong> Version {selectedSub?.currentVersionNumber || 1} (Immutable)
            </span>
            <span>
              <strong>Creator:</strong> {selectedSub?.creatorName}
            </span>
          </div>

          {/* Copy Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Submitted Copy for Publication
            </label>
            <div className="p-4 bg-slate-900 text-white rounded-xl text-sm font-sans leading-relaxed whitespace-pre-wrap">
              {selectedSub?.currentContentText}
            </div>
          </div>

          {/* AI Findings Summary */}
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
                      <span className="font-bold text-slate-900">{f.issue}</span>
                    </div>
                    <p className="text-slate-600">{f.explanation}</p>
                    {f.evidenceText && (
                      <p className="text-indigo-700 bg-indigo-50/60 p-2 rounded text-[11px] font-mono">
                        Evidence: "{f.evidenceText}" ({f.sourceName})
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
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
              disabled={actionLoading}
              onClick={() => handleDecision('APPROVED')}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
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
