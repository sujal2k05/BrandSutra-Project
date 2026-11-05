import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Dna, 
  Sparkles, 
  FileSearch, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Shield,
  Zap,
  Lock,
  Swords,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { isDark, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-white flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Navigation */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="BrandSutra Logo" 
              className="w-10 h-10 object-contain drop-shadow-xs" 
            />
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                BrandSutra
                <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-extrabold px-2 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800">
                  AI Governance
                </span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Your Brand. Your Rules. AI-Powered Confidence.</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Core Platform</a>
            <a href="#round3" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-indigo-600 dark:text-indigo-400">AI Agents</a>
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Workflow</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs hover:border-slate-300 transition"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
            <Link
              to="/login"
              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 group"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Pre-Publication Brand Governance & Continuous Sentinel</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-6">
            Protect Your Brand <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-400">
              Before & After You Publish.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Enterprise AI governance grounding every marketing campaign against approved Brand DNA facts, featuring autonomous Self-Healing, Adversarial PR Red-Teaming, and Live Asset Drift Sentinel.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2.5"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/inspector"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-sm border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors"
            >
              Try Content Inspector
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Deterministic Rules</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Sub-15ms Safety Scan</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Gemini Grounding</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Zero Hallucinations</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-200 dark:border-purple-800">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Visual Audit</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Palette & Aspect Ratio</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-200 dark:border-amber-800">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Human Sign-Off</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Immutable Audit Trail</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Round 3 Breakthrough Modules Spotlight */}
      <section id="round3" className="py-20 bg-white dark:bg-[#111827] border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
              Autonomous Intelligence
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
              3 AI Breakthroughs in Brand Governance
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Transforming governance from passive detection into autonomous correction, red-team simulation, and live drift sentinel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module 1 */}
            <div className="p-7 rounded-3xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">1. Agentic Self-Healing Studio</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  4 sequential agents (Detection, Correction, Brand Voice, and Compliance Revalidation) rewrite flawed marketing copy into 100% compliant drafts strictly grounded in Brand DNA facts.
                </p>
              </div>
              <Link to="/self-healing" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <span>Explore Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Module 2 */}
            <div className="p-7 rounded-3xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5">
                  <Swords className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">2. Adversarial PR Simulator</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Red-teams marketing copy through 3 distinct stakeholder lenses (Consumer Advocate, Legal/Advertising Compliance, Brand Reputation) with zero-cost PyMuPDF executive vector PDF downloads.
                </p>
              </div>
              <Link to="/adversarial-simulator" className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1">
                <span>Simulate PR Fallout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Module 3 */}
            <div className="p-7 rounded-3xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">3. Live Brand Drift Sentinel</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Autonomous scheduled watcher monitoring live website URLs and offline copy snapshots with stable SHA-256 fingerprinting, instantly alerting reviewers on silent policy drift.
                </p>
              </div>
              <Link to="/drift-sentinel" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                <span>View Live Sentinel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-500 dark:text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="BrandSutra Logo" className="w-5 h-5 object-contain" />
            <span className="font-extrabold text-slate-900 dark:text-white">BrandSutra</span>
            <span>— AI-Powered Brand Governance Platform (₹0 Zero-Cost Architecture)</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400">Sign In</Link>
            <Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400">Register</Link>
            <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
