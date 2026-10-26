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
  Lock,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
                BrandSutra
                <span className="text-xs bg-indigo-500/20 text-indigo-400 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
                  AI Governance
                </span>
              </span>
              <p className="text-[11px] text-slate-400">Your Brand. Your Rules. AI-Powered Confidence.</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#demo" className="hover:text-white transition-colors">Test Accounts</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-150 flex items-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-indigo-300 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Explainable AI Pre-Publication Content Governance</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none mb-6">
            Protect Your Brand <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">
              Before You Publish.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered content verification that keeps every marketing advertisement, post, and campaign 
            rigorously aligned with your organisation's approved Brand DNA.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/25 transition-all duration-150 flex items-center justify-center gap-3"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-base border border-slate-700 transition-colors"
            >
              Explore Features
            </a>
          </div>

          {/* Test Accounts Highlight */}
          <div id="demo" className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 max-w-3xl mx-auto backdrop-blur-sm text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                Pre-Loaded Evaluator Accounts (NovaHome Appliances)
              </span>
              <span className="text-xs text-slate-400">1-Click Login Supported</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-bold text-white block">Administrator</span>
                <span className="text-xs text-indigo-300 font-mono block">admin@novahome.com</span>
                <span className="text-[11px] text-slate-400 font-mono">Admin@123</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-bold text-white block">Content Creator</span>
                <span className="text-xs text-indigo-300 font-mono block">creator@novahome.com</span>
                <span className="text-[11px] text-slate-400 font-mono">Creator@123</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-bold text-white block">Human Reviewer</span>
                <span className="text-xs text-indigo-300 font-mono block">reviewer@novahome.com</span>
                <span className="text-[11px] text-slate-400 font-mono">Reviewer@123</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-24 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Comprehensive Content Governance Platform
            </h2>
            <p className="text-slate-400">
              Eliminate marketing liabilities, warranty contradictions, and rogue claims with automated AI verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
                <Dna className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Brand DNA Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Centralized authoritative knowledge base of approved facts, warranty policies, pricing thresholds, and brand voice guidelines.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. AI Content Inspector</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Hybrid analysis combining deterministic safety rules with Google Gemini semantic verification to catch false marketing claims.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Explainable Findings</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every detected issue is backed by specific approved evidence citations, policy version numbers, and one-click compliant rewrite suggestions.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">4. Brand Risk Radar</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Explainable risk score (0–100) weighted by severity (Critical=40, High=25, Medium=15, Low=5) to prioritize review workflows.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">5. Human Approval Workflow</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Seamless multi-role workflow where creators revise copy, and reviewers approve, reject, or request revisions on immutable versions.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">6. Guideline Intelligence</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload raw PDF brand guidelines and policy manuals. PyMuPDF extracts and indexes approved policies automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              How BrandSutra Works
            </h2>
            <p className="text-slate-400">
              Five straightforward steps from draft to fully compliant publication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-3">1</div>
              <h4 className="font-bold text-white text-sm mb-1">Define Brand DNA</h4>
              <p className="text-xs text-slate-400">Admin sets approved facts, warranty limits, & banned terms.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-3">2</div>
              <h4 className="font-bold text-white text-sm mb-1">Draft Content</h4>
              <p className="text-xs text-slate-400">Creator prepares marketing copy for social or ad campaigns.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-3">3</div>
              <h4 className="font-bold text-white text-sm mb-1">Inspect with AI</h4>
              <p className="text-xs text-slate-400">FastAPI & Gemini check claims against approved facts.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-3">4</div>
              <h4 className="font-bold text-white text-sm mb-1">Review Evidence</h4>
              <p className="text-xs text-slate-400">Inspect citations and accept suggested corrections.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-3">5</div>
              <h4 className="font-bold text-white text-sm mb-1">Human Approval</h4>
              <p className="text-xs text-slate-400">Reviewer signs off with comments before release.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-slate-800 bg-slate-950 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-slate-300">BrandSutra</span>
            <span>— Developed for AVINYA Hackathon (Inkloom AI)</span>
          </div>
          <p className="text-xs text-slate-500">
            Powered by Spring Boot 3, React, MySQL 8, and Google Gemini API.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
