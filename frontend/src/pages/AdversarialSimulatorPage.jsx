import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  ShieldAlert, 
  FileDown, 
  Sparkles, 
  Users, 
  Scale, 
  HeartHandshake, 
  CheckCircle2, 
  ExternalLink,
  Loader2,
  Swords,
  ArrowRight,
  ShieldCheck,
  Flame,
  FileCheck2
} from 'lucide-react';
import { adversarialService } from '../services/api';
import { useToast } from '../context/ToastContext';

const NOVA_DEMO_TEXT = 'Enjoy a 5-year warranty on every NovaHome product and flat 40% off sitewide, always!';

export default function AdversarialSimulatorPage() {
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();
  const [contentText, setContentText] = useState(NOVA_DEMO_TEXT);
  const [campaignName, setCampaignName] = useState('Diwali Mega Sale Promotion');
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [activeTab, setActiveTab] = useState('CONSUMER');

  const handleSimulate = async () => {
    if (!contentText.trim()) return;
    setLoading(true);
    try {
      const payload = {
        content_text: contentText,
        campaign_name: campaignName,
      };
      const res = await adversarialService.simulate(payload);
      setSimulationData(res.data);
      success(`Red-team simulation completed! Overall Risk Score: ${res.data.overall_risk_score}/100.`);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to execute adversarial simulation. Using deterministic rules.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!simulationData?.id) return;
    setDownloadingPdf(true);
    try {
      const res = await adversarialService.exportPdf(simulationData.id);
      
      // Guard against 0-byte or invalid responses
      if (!res.data || res.data.size === 0) {
        throw new Error('AI Service returned an empty PDF document.');
      }

      // Check if backend returned an error JSON payload disguised as a blob
      if (res.data.type === 'application/json') {
        const text = await res.data.text();
        let errMsg = 'Failed to generate PDF audit report.';
        try {
          const errObj = JSON.parse(text);
          errMsg = errObj.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BrandSutra-Adversarial-Audit-${simulationData.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      // Do NOT revoke immediately - allows Edge & Chromium to finish writing the file to disk
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);

      success(`Executive PDF Audit Report downloaded successfully (${(res.data.size / 1024).toFixed(1)} KB vector PDF).`);
    } catch (err) {
      console.error('PDF export error:', err);
      let errMsg = err.message || 'Failed to download PDF audit report.';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          errMsg = json.message || json.error || errMsg;
        } catch (_) {}
      }
      toastError(errMsg);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePreviewPdf = async () => {
    if (!simulationData?.id) return;
    setDownloadingPdf(true);
    try {
      const res = await adversarialService.exportPdf(simulationData.id);
      if (!res.data || res.data.size === 0) {
        throw new Error('AI Service returned an empty PDF document.');
      }
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
      success('Executive PDF Audit Report opened in browser tab.');
    } catch (err) {
      console.error('PDF preview error:', err);
      let errMsg = err.message || 'Failed to open PDF report in browser.';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          errMsg = json.message || json.error || errMsg;
        } catch (_) {}
      }
      toastError(errMsg);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleHandoffToSelfHealing = () => {
    navigate('/self-healing');
  };

  const parseJsonSafe = (str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return [];
    }
  };

  const currentReport = simulationData?.reports?.find(
    r => r.agent_perspective?.toUpperCase() === activeTab
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Swords className="w-4 h-4" />
            <span>Pre-Publication Red Teaming</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Adversarial PR Simulator</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Simulates public pushback across 3 adversarial stakeholder perspectives: Consumer Advocate, Legal/Advertising Compliance, and Brand Reputation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setContentText(NOVA_DEMO_TEXT);
              setCampaignName('Diwali Mega Sale Promotion');
              info('Loaded NovaHome promotional copy preset.');
            }}
            className="px-3.5 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition"
          >
            Load NovaHome Demo Text
          </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g. Diwali Mega Warranty Campaign"
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSimulate}
              disabled={loading || !contentText.trim()}
              className="w-full py-2.5 px-5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Simulating 3 Perspectives...</span>
                </>
              ) : (
                <>
                  <Swords className="w-4 h-4" />
                  <span>Run Red-Team Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Proposed Marketing Copy to Stress-Test
          </label>
          <textarea
            rows="3"
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            placeholder="Enter promotional copy to simulate public pushback and compliance audit..."
            className="w-full text-xs font-mono rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Simulation Results */}
      {simulationData && (
        <div className="space-y-6">
          {/* Composite Scorecard Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500">Overall Composite Risk</span>
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-2">
                <ShieldAlert className="w-7 h-7 text-rose-500" />
                {simulationData.overall_risk_score} / 100
              </div>
              <p className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 mt-1 uppercase tracking-wide">
                Level: {simulationData.risk_level || 'HIGH'}
              </p>
            </div>

            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Consumer Perception Risk</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                {simulationData.consumer_risk_score} / 100
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Bait & switch perception</p>
            </div>

            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Legal & ASCI Risk</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-2">
                <Scale className="w-5 h-5 text-rose-500" />
                {simulationData.compliance_risk_score} / 100
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Regulatory exposure level</p>
            </div>

            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Reputation & Trust Risk</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-indigo-500" />
                {simulationData.reputation_risk_score} / 100
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Social media blowback index</p>
            </div>
          </div>

          {/* Action Strip: PDF Export & Handoff */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl border border-indigo-900/40">
            <div>
              <span className="text-[11px] uppercase font-extrabold text-indigo-400 tracking-wider">Executive Artifacts Ready</span>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">
                Full vector PDF audit report generated instantly with PyMuPDF with zero external fees (₹0).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handlePreviewPdf}
                disabled={downloadingPdf}
                className="px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700/80 transition shadow-sm"
                title="Preview report in new browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                <span>Preview PDF in Tab</span>
              </button>
              <button
                onClick={handleExportPdf}
                disabled={downloadingPdf}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition"
              >
                {downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                <span>Download PDF (₹0)</span>
              </button>
              <button
                onClick={handleHandoffToSelfHealing}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>1-Click Handoff to Self-Healing</span>
              </button>
            </div>
          </div>

          {/* Perspective Breakdown Tabs */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 px-6 pt-3 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('CONSUMER')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 flex-shrink-0 ${
                  activeTab === 'CONSUMER'
                    ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white border-t-2 border-amber-500 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 text-amber-500" />
                <span>Consumer Advocate ({simulationData.consumer_risk_score}/100)</span>
              </button>

              <button
                onClick={() => setActiveTab('COMPLIANCE')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 flex-shrink-0 ${
                  activeTab === 'COMPLIANCE'
                    ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white border-t-2 border-rose-600 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Scale className="w-4 h-4 text-rose-500" />
                <span>Legal & Compliance ({simulationData.compliance_risk_score}/100)</span>
              </button>

              <button
                onClick={() => setActiveTab('REPUTATION')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 flex-shrink-0 ${
                  activeTab === 'REPUTATION'
                    ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white border-t-2 border-indigo-600 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-indigo-500" />
                <span>Brand Reputation ({simulationData.reputation_risk_score}/100)</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 space-y-6">
              {currentReport ? (
                <>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/70 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Perspective Synthesis</span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">
                      {currentReport.perspective_summary}
                    </p>
                  </div>

                  {/* Findings */}
                  <div>
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                      Identified Risk Vulnerabilities
                    </h4>
                    <div className="space-y-3">
                      {parseJsonSafe(currentReport.findings_json).map((f, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 flex items-start justify-between gap-4">
                          <div>
                            <span className="font-extrabold text-xs sm:text-sm text-rose-900 dark:text-rose-200">{f.title}</span>
                            <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">{f.explanation}</p>
                          </div>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex-shrink-0">
                            {f.severity || 'HIGH'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                      Mitigation Guidance
                    </h4>
                    <div className="space-y-2">
                      {parseJsonSafe(currentReport.recommendations_json).map((rec, i) => (
                        <div key={i} className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 text-center py-8">No report available for this perspective.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
