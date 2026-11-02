import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Check, 
  X, 
  ShieldCheck, 
  Layers, 
  History,
  FileCheck,
  Send,
  Loader2,
  Cpu,
  Search,
  Wand2,
  Volume2,
  CheckCheck
} from 'lucide-react';
import { selfHealingService, contentService } from '../services/api';
import { useToast } from '../context/ToastContext';

const DEMO_VIOLATING_TEXT = 'Enjoy a 5-year warranty on every NovaHome product and flat 40% off sitewide, always!';

export default function SelfHealingPage() {
  const { success, error, info } = useToast();
  const [contentText, setContentText] = useState(DEMO_VIOLATING_TEXT);
  const [maxIterations, setMaxIterations] = useState(3);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const res = await contentService.getSubmissions();
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    }
  };

  const handleSelectSubmission = (subId) => {
    setSelectedSubmissionId(subId);
    if (!subId) return;
    const sub = submissions.find(s => s.id === parseInt(subId));
    if (sub && sub.currentVersion) {
      setContentText(sub.currentVersion.contentText);
      info(`Loaded copy from submission #${sub.id} ("${sub.title}")`);
    }
  };

  const handleStartHealing = async () => {
    if (!contentText.trim()) return;
    setLoading(true);
    try {
      const payload = {
        content_text: contentText,
        max_iterations: maxIterations,
        submission_id: selectedSubmissionId ? parseInt(selectedSubmissionId) : null,
      };
      const res = await selfHealingService.healContent(payload);
      setSessionData(res.data);
      success(`Self-Healing complete! Risk reduced from ${res.data.initial_risk_score} to ${res.data.final_risk_score}/100.`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to execute self-healing. Using deterministic fallback.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!sessionData?.id) return;
    setActionLoading(true);
    try {
      const res = await selfHealingService.acceptSession(sessionData.id);
      setSessionData(res.data);
      success('Healed content accepted! New version created and routed to Human Review queue.');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to accept revision.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!sessionData?.id) return;
    setActionLoading(true);
    try {
      const res = await selfHealingService.rejectSession(sessionData.id);
      setSessionData(res.data);
      info('Self-healing draft rejected.');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reject.');
    } finally {
      setActionLoading(false);
    }
  };

  const agentSteps = [
    { num: '01', name: 'Policy Detection Agent', icon: Search, desc: 'Identifies unsupported claims & banned terms against Brand DNA' },
    { num: '02', name: 'Content Correction Agent', icon: Wand2, desc: 'Replaces violations with grounded facts without hallucinations' },
    { num: '03', name: 'Brand Voice Agent', icon: Volume2, desc: 'Optimizes persona and tone to match official brand identity' },
    { num: '04', name: 'Compliance Revalidation', icon: CheckCheck, desc: 'Re-runs deterministic verification to guarantee zero new risk' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Agentic Governance Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Agentic Self-Healing Content Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            4-agent autonomous pipeline with grounded rewriting strictly sourced from Brand DNA facts. Final sign-off reserved for Human Reviewers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setContentText(DEMO_VIOLATING_TEXT)}
            className="px-3.5 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition"
          >
            Load NovaHome Demo Copy
          </button>
        </div>
      </div>

      {/* Visual 4-Stage Stepper Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {agentSteps.map((agent, i) => {
          const Icon = agent.icon;
          return (
            <div 
              key={i} 
              className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                loading 
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 animate-pulse' 
                  : 'bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">STAGE {agent.num}</span>
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{agent.name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{agent.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Link Existing Submission (Optional)
            </label>
            <select
              value={selectedSubmissionId}
              onChange={(e) => handleSelectSubmission(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Standalone Copy / Custom Text --</option>
              {submissions.map(s => (
                <option key={s.id} value={s.id}>#{s.id} - {s.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Max Agent Iterations
            </label>
            <select
              value={maxIterations}
              onChange={(e) => setMaxIterations(parseInt(e.target.value))}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1">1 Iteration (Fast)</option>
              <option value="2">2 Iterations</option>
              <option value="3">3 Iterations (Strict Convergence)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleStartHealing}
              disabled={loading || !contentText.trim()}
              className="w-full py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running 4-Agent Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Heal Content with AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Marketing Copy to Validate & Self-Heal
          </label>
          <textarea
            rows="3"
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            placeholder="Paste your promotional copy or claims here..."
            className="w-full text-xs font-mono rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Results & Side-by-Side Diff */}
      {sessionData && (
        <div className="space-y-6">
          {/* Scoreboard Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Iterations Run</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-indigo-500" />
                {sessionData.iterations_count} / {maxIterations}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Multi-agent loops</p>
            </div>

            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Initial Risk Score</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {sessionData.initial_risk_score} / 100
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Violations detected</p>
            </div>

            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Final Risk Score</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                {sessionData.final_risk_score} / 100
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Status: {sessionData.final_risk_level || 'LOW'}</p>
            </div>

            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Resolved Violations</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                {sessionData.resolved_violations_count}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Remaining: {sessionData.remaining_violations_count}</p>
            </div>
          </div>

          {/* Side by Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Copy */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-rose-200/80 dark:border-rose-900/60 p-6 shadow-xs flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-900/40 mb-4">
                <span className="text-xs font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Original Submitted Copy
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold border border-rose-200 dark:border-rose-900/60">
                  Risk: {sessionData.initial_risk_score}
                </span>
              </div>
              <div className="p-4 bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed flex-1 border border-rose-100 dark:border-rose-950/40">
                {sessionData.original_text}
              </div>
            </div>

            {/* Healed Copy */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-emerald-200/80 dark:border-emerald-900/60 p-6 shadow-xs flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/40 mb-4">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  AI Self-Healed Copy (Brand DNA Grounded)
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-200 dark:border-emerald-900/60">
                  Risk: {sessionData.final_risk_score}
                </span>
              </div>
              <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl font-mono text-xs text-slate-900 dark:text-white leading-relaxed font-semibold flex-1 border border-emerald-100 dark:border-emerald-950/40">
                {sessionData.healed_text}
              </div>
              {sessionData.summary && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/40">
                  {sessionData.summary}
                </p>
              )}
            </div>
          </div>

          {/* Action Decision Bar */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-indigo-900/40">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span>Human Reviewer Authority Preserved</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Accepting this draft creates an immutable Content Version. Content is never auto-published; it is forwarded directly to the designated Human Reviewer for final sign-off.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReject}
                disabled={actionLoading || sessionData.status === 'REJECTED'}
                className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition disabled:opacity-40"
              >
                Reject Draft
              </button>
              <button
                onClick={handleAccept}
                disabled={actionLoading || sessionData.status === 'ACCEPTED'}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition disabled:opacity-40"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{sessionData.status === 'ACCEPTED' ? 'Revision Accepted & Queued' : 'Accept Revision & Route to Reviewer'}</span>
              </button>
            </div>
          </div>

          {/* 4 Agent Step Breakdown */}
          {sessionData.steps && sessionData.steps.length > 0 && (
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Multi-Agent Execution Timeline</span>
              </h3>
              <div className="space-y-3">
                {sessionData.steps.map((step, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {step.iteration_number || 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">{step.agent_name} AGENT</span>
                          <span className="text-[10px] bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono">
                            {step.execution_time_ms || 20}ms
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{step.explanation || 'Step completed successfully.'}</p>
                      </div>
                    </div>
                    {step.output_text && (
                      <div className="text-xs font-mono bg-white dark:bg-[#111827] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 max-w-md truncate">
                        {step.output_text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
