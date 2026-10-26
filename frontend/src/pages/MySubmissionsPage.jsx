import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Plus, 
  History, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  XCircle,
  FileText,
  Eye
} from 'lucide-react';
import { contentService, approvalService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RiskBadge from '../components/common/RiskBadge';
import Modal from '../components/common/Modal';

const MySubmissionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgId = user?.organizationId || 1;

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [versions, setVersions] = useState([]);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [orgId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await contentService.getSubmissions(orgId);
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVersions = async (sub) => {
    setSelectedSubmission(sub);
    try {
      const res = await contentService.getVersions(sub.id);
      setVersions(res.data);
      setIsVersionModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitForReview = async (subId) => {
    try {
      await approvalService.submitForReview(subId);
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      alert("Failed to submit for review.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading submissions from MySQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Send className="w-6 h-6 text-indigo-600" />
            <span>Content Submissions & Revision History</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track all marketing copy drafts, AI risk scores, and human review statuses.
          </p>
        </div>

        <Link
          to="/inspector"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Submission</span>
        </Link>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Campaign & Title</th>
                <th className="px-6 py-3.5">Channel</th>
                <th className="px-6 py-3.5">Active Version</th>
                <th className="px-6 py-3.5">Governance Status</th>
                <th className="px-6 py-3.5">Risk Score</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.length > 0 ? (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{sub.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {sub.campaignName || 'General Campaign'} • Created by {sub.creatorName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
                        {sub.marketingChannel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenVersions(sub)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold transition-colors"
                        title="View Version History"
                      >
                        <History className="w-3.5 h-3.5 text-slate-500" />
                        <span>v{sub.currentVersionNumber || 1}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        sub.overallStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        sub.overallStatus === 'REJECTED' ? 'bg-red-100 text-red-800 border border-red-200' :
                        sub.overallStatus === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {sub.overallStatus === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {sub.overallStatus === 'PENDING_REVIEW' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        {sub.overallStatus === 'REJECTED' && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                        {sub.overallStatus?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <RiskBadge severity={sub.latestRiskLevel || 'LOW'} />
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {sub.latestRiskScore || 0}/100
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/inspector?id=${sub.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>

                      {sub.overallStatus === 'DRAFT' || sub.overallStatus === 'ANALYZED' ? (
                        <button
                          onClick={() => handleSubmitForReview(sub.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit</span>
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No submissions found. Create your first marketing submission using the Content Inspector.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: VERSION HISTORY */}
      <Modal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        title={`Revision History: ${selectedSubmission?.title || ''}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Immutable snapshot history of all copy revisions, risk scores, and human feedback.
          </p>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {versions.map((ver) => (
              <div key={ver.id} className="p-4 bg-white hover:bg-slate-50/60 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono text-xs font-bold">
                      Version {ver.versionNumber}
                    </span>
                    <span className="text-xs text-slate-500">
                      Created by {ver.createdByName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskBadge severity={ver.riskLevel} />
                    <span className="text-xs font-mono font-bold text-slate-600">
                      Score: {ver.riskScore}/100
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed border border-slate-200/60">
                  "{ver.contentText}"
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsVersionModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold"
            >
              Close History
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MySubmissionsPage;
