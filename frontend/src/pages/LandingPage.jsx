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
  Lock
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2">
                BrandSutra
                <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200/80">
                  AI Governance
                </span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium">Your Brand. Your Rules. AI-Powered Confidence.</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Platform Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#governance" className="hover:text-indigo-600 transition-colors">Governance Model</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl shadow-sm shadow-indigo-600/25 transition-all duration-150 flex items-center gap-2 group"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Subtle decorative radial gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-indigo-100/60 via-purple-50/30 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-indigo-700 mb-8 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Explainable AI Pre-Publication Content Governance</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight sm:leading-none mb-6">
            Protect Your Brand <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500">
              Before You Publish.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Automated AI verification that grounds every marketing advertisement, social post, and promotional campaign 
            rigorously against your organisation's authoritative Brand DNA.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/20 transition-all duration-150 flex items-center justify-center gap-3"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200/90 shadow-xs transition-colors"
            >
              Explore Platform Features
            </a>
          </div>

          {/* Trust Badges Bar */}
          <div className="pt-6 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-200/60">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Deterministic Safety</p>
                <p className="text-[11px] text-slate-500">Sub-15ms Rule Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-200/60">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Gemini Grounding</p>
                <p className="text-[11px] text-slate-500">Zero Hallucinations</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-200/60">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Visual Checker</p>
                <p className="text-[11px] text-slate-500">Palette & Ratio Audit</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-200/60">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Human Approval</p>
                <p className="text-[11px] text-slate-500">Immutable Audit Trail</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block">
              Enterprise Governance Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Eliminate Brand Liabilities Before Launch
            </h2>
            <p className="text-slate-600 text-base">
              Protect your brand against warranty misrepresentations, unauthorized discounts, banned terms, and rogue campaign claims.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-7 rounded-2xl bg-[#FBFBFC] border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200/60 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Dna className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">1. Brand DNA Engine</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Authoritative centralized knowledge base of approved facts, warranty policies, pricing thresholds, and brand voice guidelines.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-7 rounded-2xl bg-[#FBFBFC] border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">2. AI Content Inspector</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hybrid analysis combining deterministic safety rules with Google Gemini semantic verification to catch false marketing claims.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-7 rounded-2xl bg-[#FBFBFC] border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">3. Explainable Findings</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every detected issue is backed by specific approved evidence citations, policy version numbers, and one-click compliant rewrite suggestions.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-7 rounded-2xl bg-[#FBFBFC] border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">4. Brand Risk Radar</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Explainable risk score (0–100) weighted by severity (Critical=40, High=25, Medium=15, Low=5) to prioritize review workflows.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-7 rounded-2xl bg-[#FBFBFC] border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">5. Human Approval Workflow</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Seamless multi-role workflow where creators revise copy, and reviewers approve, reject, or request revisions on immutable versions.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-7 rounded-2xl bg-[#FBFBFC] border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">6. Guideline Intelligence</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload raw PDF brand guidelines and policy manuals. PyMuPDF extracts and indexes approved policies automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-50/80 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block">
              Streamlined Process
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              Five Steps from Draft to Verified Publication
            </h2>
            <p className="text-slate-600">
              A clear, accountable workflow that eliminates bottlenecks between creators and compliance reviewers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-3 text-sm shadow-xs shadow-indigo-600/30">1</div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Define Brand DNA</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Admin sets approved facts, warranty limits, & banned terms.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-3 text-sm shadow-xs shadow-indigo-600/30">2</div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Draft Content</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Creator prepares marketing copy for social or ad campaigns.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-3 text-sm shadow-xs shadow-indigo-600/30">3</div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Inspect with AI</h4>
              <p className="text-xs text-slate-500 leading-relaxed">FastAPI & Gemini check claims against approved facts.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-3 text-sm shadow-xs shadow-indigo-600/30">4</div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Review Evidence</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Inspect citations and accept suggested corrections.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-3 text-sm shadow-xs shadow-indigo-600/30">5</div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Human Approval</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Reviewer signs off with comments before release.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-slate-200/80 bg-white text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-900">BrandSutra</span>
            <span>— Developed for AVINYA Hackathon (Inkloom AI)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
