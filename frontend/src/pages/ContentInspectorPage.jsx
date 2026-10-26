import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Sparkles, 
  Play, 
  Send, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Check, 
  RotateCcw, 
  ExternalLink,
  BookOpen,
  Info,
  Clock,
  ThumbsUp,
  X
} from 'lucide-react';
import { contentService, approvalService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RiskGauge from '../components/common/RiskGauge';
import RiskBadge from '../components/common/RiskBadge';

const ContentInspectorPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySubmissionId = searchParams.get('id');

  const [submissionId, setSubmissionId] = useState(querySubmissionId ? parseInt(querySubmissionId) : null);
  const [activeVersionNumber, setActiveVersionNumber] = useState(1);
  const [formData, setFormData] = useState({
    organizationId: user?.organizationId || 1,
    title: 'Festive Season Promotional Campaign',
    campaignName: 'Diwali & Holiday Blitz 2026',
    contentType: 'SOCIAL_MEDIA',
    marketingChannel: 'INSTAGRAM',
    description: 'Promotional announcement for festive appliance discounts.',
    contentText: 'Get 40% OFF on all NovaHome products! Enjoy a 5-year warranty on everything. Our products are 100% perfect!',
    publicationDate: '2026-11-15'
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [notification, setNotification] = useState({ text: '', type: '' });
  const [overallStatus, setOverallStatus] = useState('DRAFT');

  useEffect(() => {
    if (submissionId) {
      loadSubmissionDetails(submissionId);
    }
  }, [submissionId]);

  const loadSubmissionDetails = async (id) => {
    try {
      const res = await contentService.getSubmissionById(id);
      const sub = res.data;
      setFormData({
        organizationId: sub.organizationId,
        title: sub.title,
        campaignName: sub.campaignName || '',
        contentType: sub.contentType,
        marketingChannel: sub.marketingChannel,
        description: sub.description || '',
        contentText: sub.currentContentText || '',
        publicationDate: sub.publicationDate || ''
      });
      setActiveVersionNumber(sub.currentVersionNumber || 1);
      setOverallStatus(sub.overallStatus || 'DRAFT');

      // Fetch existing findings
      try {
        const findingsRes = await contentService.getFindings(id);
        setAnalysisResult(findingsRes.data);
      } catch (ignored) {
        // May not have been analyzed yet
      }
    } catch (err) {
      console.error(err);
      setNotification({ text: 'Failed to load submission.', type: 'error' });
    }
  };

  const handlePresetViolating = () => {
    setFormData({
      ...formData,
      title: 'Festive Season Promotional Campaign',
      contentText: 'Get 40% OFF on all NovaHome products! Enjoy a 5-year warranty on everything. Our products are 100% perfect!'
    });
    setAnalysisResult(null);
  };

  const handlePresetCompliant = () => {
    setFormData({
      ...formData,
      title: 'Compliant Autumn Promotion',
      contentText: 'Get up to 25% off on selected NovaHome appliances. Enjoy standard 2-year warranty across all models, and 5-year compressor warranty on Model X. Seasonal offers expire on 30 November 2026.'
    });
    setAnalysisResult(null);
  };

  const handleSaveDraft = async () => {
    try {
      if (!submissionId) {
        const res = await contentService.createSubmission(formData);
        setSubmissionId(res.data.id);
        setActiveVersionNumber(res.data.currentVersionNumber);
        setNotification({ text: 'Draft saved as Version 1!', type: 'success' });
      } else {
        // Create revision version
        const res = await contentService.createRevision(submissionId, { contentText: formData.contentText });
        setActiveVersionNumber(res.data.versionNumber);
        setOverallStatus('DRAFT');
        setNotification({ text: `New revision created as Version ${res.data.versionNumber}!`, type: 'success' });
      }
      setTimeout(() => setNotification({ text: '', type: '' }), 4000);
    } catch (err) {
      console.error(err);
      setNotification({ text: 'Failed to save draft.', type: 'error' });
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setNotification({ text: '', type: '' });

    try {
      let currentSubId = submissionId;

      // If new submission, create it first
      if (!currentSubId) {
        const createRes = await contentService.createSubmission(formData);
        currentSubId = createRes.data.id;
        setSubmissionId(currentSubId);
        setActiveVersionNumber(createRes.data.currentVersionNumber);
      } else {
        // Save revision if content text has been edited
        const revRes = await contentService.createRevision(currentSubId, { contentText: formData.contentText });
        setActiveVersionNumber(revRes.data.versionNumber);
      }

      // Call backend to trigger hybrid rule + Gemini AI verification
      const analysisRes = await contentService.analyzeContent(currentSubId);
      setAnalysisResult(analysisRes.data);
      setOverallStatus('ANALYZED');

      setNotification({ 
        text: `Analysis complete! Detected ${analysisRes.data.totalFindings} issue(s). Brand Risk Score: ${analysisRes.data.riskScore}/100`, 
        type: analysisRes.data.riskScore > 40 ? 'warning' : 'success' 
      });
    } catch (err) {
      console.error(err);
      setNotification({ text: err.response?.data?.message || 'Failed to complete AI verification.', type: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!submissionId) {
      alert("Please analyze or save content before submitting for review.");
      return;
    }

    try {
      setIsSubmitting(true);
      await approvalService.submitForReview(submissionId);
      setOverallStatus('PENDING_REVIEW');
      setNotification({ text: `Version ${activeVersionNumber} has been locked and submitted to the Human Approval Queue!`, type: 'success' });
      setTimeout(() => navigate('/submissions'), 2000);
    } catch (err) {
      console.error(err);
      setNotification({ text: 'Failed to submit for review.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptCorrection = (suggestedText) => {
    if (!suggestedText) return;
    setFormData({
      ...formData,
      contentText: suggestedText
    });
    setNotification({ text: 'Suggested correction applied to draft editor! Run AI Verification to confirm compliance.', type: 'success' });
    setTimeout(() => setNotification({ text: '', type: '' }), 4000);
  };

  const handleDismissFinding = async (findingId) => {
    try {
      await contentService.dismissFinding(findingId);
      if (analysisResult) {
        setAnalysisResult({
          ...analysisResult,
          findings: analysisResult.findings.map(f => f.id === findingId ? { ...f, isDismissed: true } : f)
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Content Inspector & Verifier</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Version {activeVersionNumber}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              overallStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
              overallStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
              overallStatus === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800' :
              'bg-slate-100 text-slate-700'
            }`}>
              {overallStatus.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pre-publication check against approved Brand DNA warranty, pricing, and voice rules.
          </p>
        </div>

        {/* Preset Loaders for Hackathon Demonstrator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Sample Presets:</span>
          <button
            type="button"
            onClick={handlePresetViolating}
            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold border border-red-200 transition-colors"
          >
            Violating Draft (4 Issues)
          </button>
          <button
            type="button"
            onClick={handlePresetCompliant}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition-colors"
          >
            Compliant Draft (0 Issues)
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {notification.text && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between gap-3 ${
          notification.type === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-900' :
          notification.type === 'error' ? 'bg-red-50 border border-red-200 text-red-900' :
          'bg-emerald-50 border border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" /> :
             notification.type === 'error' ? <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" /> :
             <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            <span className="font-medium">{notification.text}</span>
          </div>
          <button onClick={() => setNotification({ text: '', type: '' })} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Content Editor & Settings (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Content Metadata & Copy</h3>
            <span className="text-xs text-slate-400">Marketing Collateral Draft</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Content Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Campaign Name
              </label>
              <input
                type="text"
                value={formData.campaignName}
                onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Content Type
              </label>
              <select
                value={formData.contentType}
                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="SOCIAL_MEDIA">Social Media Post</option>
                <option value="ADVERTISEMENT">Advertisement / Banner</option>
                <option value="EMAIL_MARKETING">Email Marketing</option>
                <option value="WEBSITE_CONTENT">Website Landing Copy</option>
                <option value="PRODUCT_DESCRIPTION">Product Description</option>
                <option value="PROMOTIONAL_CAMPAIGN">Promotional Campaign</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Channel
              </label>
              <select
                value={formData.marketingChannel}
                onChange={(e) => setFormData({ ...formData, marketingChannel: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="INSTAGRAM">Instagram</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="WEBSITE">Website</option>
                <option value="EMAIL">Email</option>
                <option value="OTHER">Other Channels</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Date
              </label>
              <input
                type="date"
                value={formData.publicationDate}
                onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Marketing Copy Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Marketing Copy & Claims
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {formData.contentText.length} chars • {formData.contentText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={7}
              required
              value={formData.contentText}
              onChange={(e) => setFormData({ ...formData, contentText: e.target.value })}
              placeholder="Paste or write promotional copy, advertisement claims, product specs..."
              className="w-full p-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Save Revision Draft</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isAnalyzing || !formData.contentText.trim()}
                onClick={handleAnalyze}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-indigo-600/25 transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Content with AI</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isSubmitting || !submissionId || overallStatus === 'PENDING_REVIEW' || overallStatus === 'APPROVED'}
                onClick={handleSubmitForReview}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-bold shadow-md shadow-emerald-600/25 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Submit for Approval</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Explainable Findings & Brand Risk Radar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand Risk Radar Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <span>Brand Risk Radar</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Explainable AI</span>
            </div>

            <div className="flex items-center justify-center py-2">
              <RiskGauge
                score={analysisResult?.riskScore || 0}
                level={analysisResult?.riskLevel || 'LOW'}
                size="md"
              />
            </div>

            {/* Severity Counters */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
              <div className="p-2 rounded-xl bg-red-50/70 border border-red-100">
                <span className="text-[10px] uppercase font-bold text-red-600 block">Critical</span>
                <span className="text-lg font-extrabold text-red-700">{analysisResult?.criticalCount || 0}</span>
              </div>
              <div className="p-2 rounded-xl bg-orange-50/70 border border-orange-100">
                <span className="text-[10px] uppercase font-bold text-orange-600 block">High</span>
                <span className="text-lg font-extrabold text-orange-700">{analysisResult?.highCount || 0}</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100">
                <span className="text-[10px] uppercase font-bold text-amber-600 block">Medium</span>
                <span className="text-lg font-extrabold text-amber-700">{analysisResult?.mediumCount || 0}</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Low</span>
                <span className="text-lg font-extrabold text-emerald-700">{analysisResult?.lowCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Explainable Findings List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Explainable Findings ({analysisResult?.findings?.filter(f => !f.isDismissed).length || 0})
              </h3>
              {analysisResult && (
                <span className="text-xs text-slate-400 font-mono">
                  {analysisResult.executionTimeMs}ms
                </span>
              )}
            </div>

            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
              {analysisResult?.findings && analysisResult.findings.filter(f => !f.isDismissed).length > 0 ? (
                analysisResult.findings.filter(f => !f.isDismissed).map((finding, idx) => (
                  <div 
                    key={finding.id || idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <RiskBadge severity={finding.severity} />
                        <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold">
                          {finding.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDismissFinding(finding.id)}
                        title="Dismiss Finding"
                        className="text-slate-400 hover:text-slate-600 p-1 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {finding.issue}
                    </h4>

                    {finding.excerpt && (
                      <div className="text-xs text-slate-600 font-mono bg-white px-2.5 py-1.5 rounded border border-slate-200/60">
                        "{finding.excerpt}"
                      </div>
                    )}

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {finding.explanation}
                    </p>

                    {/* Approved Evidence from Brand DNA */}
                    {finding.evidenceText && (
                      <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-700 block mb-0.5">
                          Approved Brand DNA Evidence:
                        </span>
                        <p className="italic font-sans">"{finding.evidenceText}"</p>
                        {finding.sourceName && (
                          <div className="text-[10px] text-indigo-600 mt-1 font-mono">
                            Source: {finding.sourceName} • Version {finding.sourceVersion || 'v1.0'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Suggested Correction */}
                    {finding.suggestedCorrection && (
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                        <div className="text-xs text-emerald-800 font-medium">
                          <span className="font-bold text-[10px] uppercase text-emerald-600 block">Suggested Correction:</span>
                          "{finding.suggestedCorrection}"
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAcceptCorrection(finding.suggestedCorrection)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs flex-shrink-0"
                        >
                          <Check className="w-3 h-3" />
                          <span>Accept</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {analysisResult ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">All clear! 0 violations detected.</p>
                      <p className="text-slate-400">Content adheres to all approved facts and policies.</p>
                    </div>
                  ) : (
                    <div>
                      <Info className="w-7 h-7 text-indigo-400 mx-auto mb-2" />
                      <p>Click "Analyze Content with AI" to inspect against your Brand DNA.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentInspectorPage;
