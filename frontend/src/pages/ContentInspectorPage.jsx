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
  X,
  Image as ImageIcon,
  UploadCloud,
  Palette,
  ShieldCheck,
  Shield,
  Layers,
  HelpCircle,
  Eye
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

  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'visual'
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

  // Visual Brand Checker state
  const [visualFile, setVisualFile] = useState(null);
  const [visualPreview, setVisualPreview] = useState(null);
  const [isAnalyzingVisual, setIsAnalyzingVisual] = useState(false);
  const [visualResult, setVisualResult] = useState(null);

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

      try {
        const findingsRes = await contentService.getFindings(id);
        setAnalysisResult(findingsRes.data);
      } catch (ignored) {}
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
        const res = await contentService.createRevision(submissionId, { contentText: formData.contentText });
        setActiveVersionNumber(res.data.versionNumber);
        setOverallStatus('DRAFT');
        setNotification({ text: `New revision created as Version ${res.data.versionNumber}!`, type: 'success' });
      }
      setTimeout(() => setNotification({ text: '', type: '' }), 4000);
    } catch (err) {
      console.error(err);
      setNotification({ text: 'Failed to save draft revision.', type: 'error' });
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setNotification({ text: '', type: '' });

    try {
      let currentSubId = submissionId;
      if (!currentSubId) {
        const createRes = await contentService.createSubmission(formData);
        currentSubId = createRes.data.id;
        setSubmissionId(currentSubId);
        setActiveVersionNumber(createRes.data.currentVersionNumber);
      }

      const res = await contentService.analyzeContent(currentSubId);
      setAnalysisResult(res.data);
      setNotification({
        text: `Analysis complete! Brand Risk Score: ${res.data.riskScore}/100 (${res.data.riskLevel})`,
        type: res.data.riskScore > 40 ? 'warning' : 'success'
      });
    } catch (err) {
      console.error(err);
      setNotification({ text: 'AI analysis failed. Please verify AI microservice is active.', type: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptCorrection = (suggestedText) => {
    if (!suggestedText) return;
    setFormData({
      ...formData,
      contentText: suggestedText
    });
    setNotification({
      text: 'Accepted AI suggested correction! Click "Save Revision Draft" or "Run AI Verification" to create Version 2.',
      type: 'info'
    });
  };

  const handleDismissFinding = async (findingId) => {
    try {
      await contentService.dismissFinding(findingId);
      setAnalysisResult({
        ...analysisResult,
        findings: analysisResult.findings.filter(f => f.id !== findingId)
      });
      setNotification({ text: 'Finding dismissed.', type: 'info' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitForReview = async () => {
    if (!submissionId) {
      setNotification({ text: 'Please save and analyze content before submitting for review.', type: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      await approvalService.submitForReview(submissionId);
      setOverallStatus('PENDING_REVIEW');
      setNotification({ text: `Version ${activeVersionNumber} submitted to Human Review queue!`, type: 'success' });
    } catch (err) {
      console.error(err);
      setNotification({ text: 'Submission failed. Ensure content is analyzed first.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Visual Image Upload & Analysis
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVisualFile(file);
      setVisualPreview(URL.createObjectURL(file));
      setVisualResult(null);
    }
  };

  const handleAnalyzeVisual = async () => {
    if (!visualFile) return;
    setIsAnalyzingVisual(true);
    setNotification({ text: '', type: '' });

    const data = new FormData();
    data.append('file', visualFile);
    data.append('marketingChannel', formData.marketingChannel);
    data.append('primaryColorHex', '#6366F1');
    data.append('secondaryColorHex', '#8B5CF6');

    try {
      const res = await contentService.analyzeVisual(data);
      setVisualResult(res.data);
      setNotification({ text: 'Visual Brand Analysis complete!', type: 'success' });
    } catch (err) {
      console.error(err);
      setNotification({ text: 'Visual analysis failed. Please verify microservice.', type: 'error' });
    } finally {
      setIsAnalyzingVisual(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* AREA 4: ENTERPRISE DATA PROTECTION & AI DISCLOSURE BANNER */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/30 text-white flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                Enterprise AI Governance & Privacy Disclosure
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Zero Data Retention
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Evaluated via sandboxed Google Gemini 2.5 Flash. Submitted content is isolated and never retained for public model training.
            </p>
          </div>
        </div>
        <div className="text-[11px] text-indigo-300 font-medium flex items-center gap-1.5 bg-indigo-900/50 px-3 py-1.5 rounded-xl border border-indigo-500/20">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Final publication authority rests strictly with human reviewers</span>
        </div>
      </div>

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>AI Content Inspector & Verifier</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
              Active Version: v{activeVersionNumber}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hybrid deterministic safety checks + deep semantic evidence grounding against approved Brand DNA.
          </p>
        </div>

        {/* Verification Mode Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'text'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Copy Claims & Text</span>
          </button>
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'visual'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Visual Brand Checker (Images)</span>
            <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-extrabold uppercase">
              New
            </span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification.text && (
        <div className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between shadow-sm animate-fade-in ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          notification.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
          notification.type === 'info' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' :
          'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification({ text: '', type: '' })} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: TEXT COPY INSPECTOR */}
      {activeTab === 'text' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Input Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            
            {/* Presets Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Test Presets:</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePresetViolating}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  Load High-Risk Promo
                </button>
                <button
                  type="button"
                  onClick={handlePresetCompliant}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                >
                  Load Compliant Promo
                </button>
              </div>
            </div>

            {/* Campaign Metadata */}
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
                  placeholder="e.g. Festive Discount Post"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  placeholder="e.g. Diwali Super Sale 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Marketing Channel
                </label>
                <select
                  value={formData.marketingChannel}
                  onChange={(e) => setFormData({ ...formData, marketingChannel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="WEBSITE">Website Banner</option>
                  <option value="EMAIL">Email Marketing</option>
                  <option value="OTHER">Other Channels</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Publication Date
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

            {/* AREA 2: EXPLAINABLE EVIDENCE-BASED FINDINGS LIST */}
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
                          
                          {/* EVIDENCE DISTINCTION BADGE */}
                          {finding.evidenceStatus === 'CONTRADICTED' ? (
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

                      {/* Approved Evidence Citation if Contradicted */}
                      {finding.evidenceText ? (
                        <div className="p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950">
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
                      ) : (
                        <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-950">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 block mb-0.5">
                            Evidence Status Notice:
                          </span>
                          <p className="text-[11px]">
                            No supporting fact or policy exists in your approved Brand DNA for this claim. This statement is uncorroborated. The Reviewer must verify before approval.
                          </p>
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
      )}

      {/* AREA 1: TAB 2 - VISUAL BRAND CHECKER (IMAGES) */}
      {activeTab === 'visual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Visual Asset Upload & Preview (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-600" />
              <span>Upload Creative Asset (Banner / Social Post)</span>
            </h3>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="visual-file-input"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              <label htmlFor="visual-file-input" className="cursor-pointer block">
                <ImageIcon className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <span className="text-sm font-bold text-indigo-600 block">Click to upload marketing image</span>
                <span className="text-xs text-slate-400 block mt-1">PNG, JPG, WebP up to 20MB</span>
              </label>
            </div>

            {/* Image Preview & Details */}
            {visualPreview && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-center max-h-72 overflow-hidden border border-slate-200">
                  <img src={visualPreview} alt="Asset Preview" className="max-h-64 object-contain rounded-lg" />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>File: {visualFile?.name}</span>
                  <span>Size: {(visualFile?.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            )}

            {/* Channel Selection */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Channel Standard
                </label>
                <select
                  value={formData.marketingChannel}
                  onChange={(e) => setFormData({ ...formData, marketingChannel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="INSTAGRAM">Instagram (1:1 / 4:5)</option>
                  <option value="FACEBOOK">Facebook (1.91:1 / 1:1)</option>
                  <option value="LINKEDIN">LinkedIn (1.91:1 / 1:1)</option>
                  <option value="WEBSITE">Website Banner (16:9)</option>
                  <option value="EMAIL">Email Header (3:2)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Brand Color Guidelines
                </label>
                <div className="flex items-center gap-2 pt-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-[#6366F1] border border-slate-300 inline-block" />
                    <span className="font-mono">#6366F1</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-[#8B5CF6] border border-slate-300 inline-block" />
                    <span className="font-mono">#8B5CF6</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              type="button"
              disabled={isAnalyzingVisual || !visualFile}
              onClick={handleAnalyzeVisual}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isAnalyzingVisual ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Inspecting Visual Assets...</span>
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4" />
                  <span>Run Visual Brand Check</span>
                </>
              )}
            </button>
          </div>

          {/* Visual Analysis Results (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Visual Compliance Report</span>
            </h3>

            {visualResult ? (
              <div className="space-y-4">
                
                {/* Visual Metadata Badges */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Dimensions:</span>
                    <span className="font-mono font-bold text-slate-800">{visualResult.metadata?.dimensions}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Aspect Ratio:</span>
                    <span className="font-mono font-bold text-slate-800">{visualResult.metadata?.aspectRatio}</span>
                  </div>
                </div>

                {/* Extracted Dominant Color Swatches */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Extracted Palette Swatches:
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {visualResult.metadata?.dominantColors?.map((col, i) => (
                      <div key={i} className="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-200 bg-white shadow-xs">
                        <span className="w-5 h-5 rounded-md border border-slate-300" style={{ backgroundColor: col.hex }} />
                        <span className="text-[11px] font-mono text-slate-700 font-bold">{col.hex}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({col.percent}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Findings List */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Detected Visual Issues ({visualResult.findings.length})
                  </h4>
                  {visualResult.findings.length > 0 ? (
                    visualResult.findings.map((vf, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <RiskBadge severity={vf.severity} />
                          <span className="text-xs font-bold text-slate-900">{vf.issue}</span>
                        </div>
                        <p className="text-xs text-slate-600">{vf.explanation}</p>
                        <div className="text-[11px] text-indigo-700 font-medium bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                          <strong>Fix:</strong> {vf.suggested_correction || vf.suggestedCorrection}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                      Visual asset is 100% compliant with approved brand palette and aspect ratio!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">
                <Palette className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">No visual asset inspected yet</p>
                <p className="mt-1">Upload an image on the left and click "Run Visual Brand Check".</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentInspectorPage;
