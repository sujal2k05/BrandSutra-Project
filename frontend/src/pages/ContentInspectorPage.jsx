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
  Eye,
  Swords,
  ArrowRight
} from 'lucide-react';
import { contentService, approvalService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RiskGauge from '../components/common/RiskGauge';
import RiskBadge from '../components/common/RiskBadge';

const ContentInspectorPage = () => {
  const { user } = useAuth();
  const { success, error: toastError, warning: toastWarning, info: toastInfo } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySubmissionId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'visual'
  const [submissionId, setSubmissionId] = useState(querySubmissionId ? parseInt(querySubmissionId) : null);
  const [activeVersionNumber, setActiveVersionNumber] = useState(1);
  const [loadedContentText, setLoadedContentText] = useState('');
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
      setLoadedContentText(sub.currentContentText || '');
      setActiveVersionNumber(sub.currentVersionNumber || 1);
      setOverallStatus(sub.overallStatus || 'DRAFT');

      if (sub.overallStatus && sub.overallStatus !== 'DRAFT') {
        try {
          const findingsRes = await contentService.getFindings(id);
          setAnalysisResult(findingsRes.data);
        } catch (findingsErr) {
          if (findingsErr.response?.status !== 404) {
            console.warn('Could not load existing findings:', findingsErr);
          }
          setAnalysisResult(null);
        }
      } else {
        setAnalysisResult(null);
      }
    } catch (err) {
      console.error(err);
      toastError('Failed to load submission.');
    }
  };

  const handlePresetViolating = () => {
    setFormData({
      ...formData,
      title: 'Festive Season Promotional Campaign',
      contentText: 'Get 40% OFF on all NovaHome products! Enjoy a 5-year warranty on everything. Our products are 100% perfect!'
    });
    setAnalysisResult(null);
    toastInfo('Loaded deliberate policy-violating copy preset.');
  };

  const handlePresetCompliant = () => {
    setFormData({
      ...formData,
      title: 'Compliant Autumn Promotion',
      contentText: 'Get up to 15% off on selected NovaHome appliances. Enjoy standard 2-year warranty across all models, and 5-year compressor warranty on Model X. Seasonal offers expire on 30 November 2026.'
    });
    setAnalysisResult(null);
    toastSuccess('Loaded Brand DNA compliant copy preset.');
  };

  const toastSuccess = (msg) => success(msg);

  const handleSaveDraft = async () => {
    try {
      if (!submissionId) {
        const res = await contentService.createSubmission(formData);
        setSubmissionId(res.data.id);
        setActiveVersionNumber(res.data.currentVersionNumber);
        setLoadedContentText(formData.contentText);
        toastSuccess('Draft saved as Version 1!');
      } else {
        const res = await contentService.createRevision(submissionId, { contentText: formData.contentText });
        setActiveVersionNumber(res.data.versionNumber);
        setOverallStatus('DRAFT');
        setLoadedContentText(formData.contentText);
        toastSuccess(`New revision created as Version ${res.data.versionNumber}!`);
      }
    } catch (err) {
      console.error(err);
      toastError('Failed to save draft revision.');
    }
  };

  const handleAnalyze = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      let currentSubId = submissionId;
      if (!currentSubId) {
        const createRes = await contentService.createSubmission(formData);
        currentSubId = createRes.data.id;
        setSubmissionId(currentSubId);
        setActiveVersionNumber(createRes.data.currentVersionNumber || 1);
        setLoadedContentText(formData.contentText);
      } else if (overallStatus === 'ANALYZED' && formData.contentText.trim() !== loadedContentText.trim()) {
        const revRes = await contentService.createRevision(currentSubId, { contentText: formData.contentText });
        setActiveVersionNumber(revRes.data.versionNumber);
        setOverallStatus('DRAFT');
        setLoadedContentText(formData.contentText);
      }

      const res = await contentService.analyzeContent(currentSubId);
      setAnalysisResult(res.data);
      setOverallStatus('ANALYZED');
      
      if (res.data.riskScore > 40) {
        toastWarning(`Analysis complete! Risk Score: ${res.data.riskScore}/100 (${res.data.riskLevel})`);
      } else {
        toastSuccess(`Analysis complete! Risk Score: ${res.data.riskScore}/100 (${res.data.riskLevel})`);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      const backendMessage = err.response?.data?.message;
      toastError(backendMessage || 'Analysis failed. Deterministic safety fallback applied.');
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
    toastInfo('Accepted AI suggested correction! Click "Analyze Content with AI" to verify.');
  };

  const handleDismissFinding = async (findingId) => {
    try {
      await contentService.dismissFinding(findingId);
      setAnalysisResult({
        ...analysisResult,
        findings: analysisResult.findings.filter(f => f.id !== findingId)
      });
      toastInfo('Finding dismissed.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitForReview = async () => {
    if (!submissionId) {
      toastWarning('Please save and analyze content before submitting for review.');
      return;
    }
    setIsSubmitting(true);
    try {
      await approvalService.submitForReview(submissionId);
      setOverallStatus('PENDING_REVIEW');
      toastSuccess(`Version ${activeVersionNumber} submitted to Human Review queue!`);
    } catch (err) {
      console.error(err);
      toastError('Submission failed. Ensure content is analyzed first.');
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

    const data = new FormData();
    data.append('file', visualFile);
    data.append('marketingChannel', formData.marketingChannel);
    data.append('primaryColorHex', '#6366F1');
    data.append('secondaryColorHex', '#8B5CF6');

    try {
      const res = await contentService.analyzeVisual(data);
      setVisualResult(res.data);
      toastSuccess('Visual Brand Analysis complete!');
    } catch (err) {
      console.error(err);
      toastError('Visual analysis failed. Please verify service connection.');
    } finally {
      setIsAnalyzingVisual(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Enterprise Data Protection Banner */}
      <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-slate-800 dark:text-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center border border-indigo-200/90 dark:border-indigo-800 flex-shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
                Enterprise AI Governance & Privacy Boundary
              </span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800">
                Zero Data Retention
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Evaluated via sandboxed Gemini 2.5 Flash. Content is verified against Brand DNA facts and never retained for public training.
            </p>
          </div>
        </div>
        <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1.5 bg-white dark:bg-[#111827] px-3 py-1.5 rounded-xl border border-indigo-200/80 dark:border-indigo-800 shadow-2xs">
          <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Final publication authority rests strictly with Human Reviewers</span>
        </div>
      </div>

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>AI Content Inspector & Verifier</span>
            <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800">
              v{activeVersionNumber}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Hybrid deterministic rules engine + deep semantic evidence grounding against Brand DNA.
          </p>
        </div>

        {/* Verification Mode Tabs */}
        <div className="flex items-center bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-bold self-start md:self-auto">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'text'
                ? 'bg-white dark:bg-[#111827] text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Copy Claims & Text</span>
          </button>
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'visual'
                ? 'bg-white dark:bg-[#111827] text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Visual Brand Checker</span>
            <span className="text-[9px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded font-extrabold uppercase">
              Pillow
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: TEXT COPY INSPECTOR */}
      {activeTab === 'text' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Input Form (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs space-y-4">
            
            {/* Presets Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Test Presets:</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePresetViolating}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900 transition-colors"
                >
                  Load High-Risk Promo
                </button>
                <button
                  type="button"
                  onClick={handlePresetCompliant}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
                >
                  Load Compliant Promo
                </button>
              </div>
            </div>

            {/* Campaign Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Content Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Festive Discount Post"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                  placeholder="e.g. Diwali Super Sale 2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Marketing Channel
                </label>
                <select
                  value={formData.marketingChannel}
                  onChange={(e) => setFormData({ ...formData, marketingChannel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Publication Date
                </label>
                <input
                  type="date"
                  value={formData.publicationDate}
                  onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Marketing Copy Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
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
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
              >
                <Save className="w-4 h-4 text-slate-400" />
                <span>Save Revision Draft</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isAnalyzing || !formData.contentText.trim()}
                  onClick={handleAnalyze}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit for Review</span>
                </button>
              </div>
            </div>

            {/* Direct Handoff Shortcuts if Violations Exist */}
            {analysisResult?.findings && analysisResult.findings.filter(f => !f.isDismissed).length > 0 && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-indigo-900 dark:text-indigo-200 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Fix violations with AI or test PR fallout:</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/self-healing')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>Self-Healing Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => navigate('/adversarial-simulator')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <Swords className="w-3 h-3" />
                    <span>Red-Team PR</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Explainable Findings & Radar (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Brand Risk Radar Card */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Brand Risk Radar</span>
                </h3>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Explainable AI</span>
              </div>

              <div className="flex items-center justify-center py-2">
                <RiskGauge
                  score={analysisResult?.riskScore || 0}
                  level={analysisResult?.riskLevel || 'LOW'}
                  size="md"
                />
              </div>

              {/* Severity Counters */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
                <div className="p-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50">
                  <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Critical</span>
                  <span className="text-base font-black text-rose-700 dark:text-rose-300">{analysisResult?.criticalCount || 0}</span>
                </div>
                <div className="p-2 rounded-xl bg-orange-50/70 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50">
                  <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 block">High</span>
                  <span className="text-base font-black text-orange-700 dark:text-orange-300">{analysisResult?.highCount || 0}</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Medium</span>
                  <span className="text-base font-black text-amber-700 dark:text-amber-300">{analysisResult?.mediumCount || 0}</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Low</span>
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-300">{analysisResult?.lowCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Findings List */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
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
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <RiskBadge severity={finding.severity} size="xs" />
                          
                          {finding.evidenceStatus === 'CONTRADICTED' ? (
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

                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
                            {finding.category}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDismissFinding(finding.id)}
                          title="Dismiss Finding"
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {finding.issue}
                      </h4>

                      {finding.excerpt && (
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-[#111827] px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                          "{finding.excerpt}"
                        </div>
                      )}

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {finding.explanation}
                      </p>

                      {/* Approved Evidence Citation */}
                      {finding.evidenceText ? (
                        <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200">
                          <span className="font-extrabold uppercase tracking-wider text-[10px] text-indigo-700 dark:text-indigo-400 block mb-0.5">
                            Approved Brand DNA Evidence:
                          </span>
                          <p className="italic font-sans">"{finding.evidenceText}"</p>
                          {finding.sourceName && (
                            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                              Source: {finding.sourceName} • Version {finding.sourceVersion || 'v1.0'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-950 dark:text-amber-200">
                          <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400 block mb-0.5">
                            Evidence Status Notice:
                          </span>
                          <p className="text-[11px]">
                            No supporting claim exists in approved Brand DNA. Human Reviewer must verify before approval.
                          </p>
                        </div>
                      )}

                      {/* Suggested Correction */}
                      {finding.suggestedCorrection && (
                        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                            <span className="font-extrabold text-[10px] uppercase text-emerald-600 dark:text-emerald-400 block">Suggested Correction:</span>
                            "{finding.suggestedCorrection}"
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAcceptCorrection(finding.suggestedCorrection)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs flex-shrink-0"
                          >
                            <Check className="w-3 h-3" />
                            <span>Accept</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    {analysisResult ? (
                      <div className="space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                        <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">All clear! 0 violations detected.</p>
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

      {/* TAB 2: VISUAL BRAND CHECKER (IMAGES) */}
      {activeTab === 'visual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Visual Asset Upload & Preview (6 cols) */}
          <div className="lg:col-span-6 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Upload Creative Asset (Banner / Social Post)</span>
            </h3>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/50 dark:bg-slate-900/40">
              <input
                type="file"
                id="visual-file-input"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              <label htmlFor="visual-file-input" className="cursor-pointer block">
                <ImageIcon className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 block">Click to upload marketing image</span>
                <span className="text-xs text-slate-400 block mt-1">PNG, JPG, WebP up to 20MB</span>
              </label>
            </div>

            {/* Image Preview & Details */}
            {visualPreview && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center max-h-72 overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img src={visualPreview} alt="Asset Preview" className="max-h-64 object-contain rounded-xl" />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span>File: {visualFile?.name}</span>
                  <span>Size: {(visualFile?.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            )}

            {/* Channel Selection */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Target Channel Standard
                </label>
                <select
                  value={formData.marketingChannel}
                  onChange={(e) => setFormData({ ...formData, marketingChannel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="INSTAGRAM">Instagram (1:1 / 4:5)</option>
                  <option value="FACEBOOK">Facebook (1.91:1 / 1:1)</option>
                  <option value="LINKEDIN">LinkedIn (1.91:1 / 1:1)</option>
                  <option value="WEBSITE">Website Banner (16:9)</option>
                  <option value="EMAIL">Email Header (3:2)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Brand Color Guidelines
                </label>
                <div className="flex items-center gap-2 pt-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <span className="w-4 h-4 rounded-full bg-[#6366F1] border border-slate-300 dark:border-slate-700 inline-block" />
                    <span className="font-mono">#6366F1</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <span className="w-4 h-4 rounded-full bg-[#8B5CF6] border border-slate-300 dark:border-slate-700 inline-block" />
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
          <div className="lg:col-span-6 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Visual Compliance Report</span>
            </h3>

            {visualResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Dimensions:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{visualResult.metadata?.dimensions}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Aspect Ratio:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{visualResult.metadata?.aspectRatio}</span>
                  </div>
                </div>

                {/* Dominant Color Swatches */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Extracted Palette Swatches:
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {visualResult.metadata?.dominantColors?.map((col, i) => (
                      <div key={i} className="flex items-center gap-1.5 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xs">
                        <span className="w-5 h-5 rounded-lg border border-slate-300 dark:border-slate-700" style={{ backgroundColor: col.hex }} />
                        <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 font-bold">{col.hex}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({col.percent}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Findings List */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Detected Visual Issues ({visualResult.findings.length})
                  </h4>
                  {visualResult.findings.length > 0 ? (
                    visualResult.findings.map((vf, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <RiskBadge severity={vf.severity} size="xs" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{vf.issue}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{vf.explanation}</p>
                        <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium bg-indigo-50 dark:bg-indigo-950/60 p-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                          <strong>Fix:</strong> {vf.suggested_correction || vf.suggestedCorrection}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                      Visual asset is 100% compliant with approved brand palette and aspect ratio!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                <Palette className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No visual asset inspected yet</p>
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
