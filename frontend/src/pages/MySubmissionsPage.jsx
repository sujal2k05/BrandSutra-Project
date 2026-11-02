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
  Eye,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';
import { contentService, approvalService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RiskBadge from '../components/common/RiskBadge';
import Modal from '../components/common/Modal';

const MySubmissionsPage = () => {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();
  const navigate = useNavigate();
  const orgId = user?.organizationId || 1;

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [versions, setVersions] = useState([]);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL');

  useEffect(() => {
    fetchSubmissions();
  }, [orgId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await contentService.getSubmissions(orgId);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error(err);
      toastError('Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVersions = async (sub) => {
    setSelectedSubmission(sub);
    try {
      const res = await contentService.getVersions(sub.id);
      setVersions(res.data || []);
      setIsVersionModalOpen(true);
    } catch (err) {
      console.error(err);
      toastError('Failed to load version history.');
    }
  };

  const handleSubmitForReview = async (subId) => {
    try {
      await approvalService.submitForReview(subId);
      success(`Submission #${subId} submitted to Human Review queue!`);
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      toastError('Failed to submit for review. Ensure content is analyzed first.');
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = !searchQuery ||
      sub.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.campaignName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.creatorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === 'ALL' || sub.marketingChannel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading submissions from MySQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Content Pipeline</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Send className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>My Content Submissions & Revisions</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track all marketing copy drafts, AI risk scores, and human review statuses.
          </p>
        </div>

        <Link
          to="/inspector"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Submission</span>
        </Link>
      </div>

      {/* Submissions Table Card */}
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Campaign & Title</th>
                <th className="px-6 py-3.5">Channel</th>
                <th className="px-6 py-3.5">Active Version</th>
                <th className="px-6 py-3.5">Governance Status</th>
                <th className="px-6 py-3.5">Risk Score</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="font-extrabold text-slate-900 dark:text-white text-xs">{sub.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {sub.campaignName || 'General Campaign'} • Created by {sub.creatorName}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="font-bold text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/50 px-2.5 py-1 rounded-lg">
                        {sub.marketingChannel}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <button
                        onClick={() => handleOpenVersions(sub)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold transition-colors"
                        title="View Version History"
                      >
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        <span>v{sub.currentVersionNumber || 1}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.overallStatus === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                        sub.overallStatus === 'REJECTED' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800' :
                        sub.overallStatus === 'PENDING_REVIEW' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {sub.overallStatus === 'APPROVED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {sub.overallStatus === 'PENDING_REVIEW' && <Clock className="w-3 h-3 text-amber-600" />}
                        {sub.overallStatus === 'REJECTED' && <XCircle className="w-3 h-3 text-rose-600" />}
                        {sub.overallStatus?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <RiskBadge severity={sub.latestRiskLevel || 'LOW'} size="xs" />
                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                          {sub.latestRiskScore || 0}/100
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-right space-x-2">
                      <Link
                        to={`/inspector?id=${sub.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>

                      {sub.overallStatus === 'DRAFT' || sub.overallStatus === 'ANALYZED' ? (
                        <button
                          onClick={() => handleSubmitForReview(sub.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors"
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
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No submissions found. Create your first marketing submission using Content Inspector.
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
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable snapshot history of all copy revisions, risk scores, and human feedback.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {versions.map((ver) => (
              <div key={ver.id} className="p-4 bg-white dark:bg-[#111827] hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-mono text-xs font-bold">
                      Version {ver.versionNumber}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Created by {ver.createdByName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskBadge severity={ver.riskLevel} size="xs" />
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                      Score: {ver.riskScore}/100
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-200/60 dark:border-slate-800">
                  "{ver.contentText}"
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsVersionModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
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
