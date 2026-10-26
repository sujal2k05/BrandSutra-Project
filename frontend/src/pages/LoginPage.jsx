import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">BrandSutra</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
          Sign in to your Brand Workspace
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Or{' '}
          <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
            register a new organization
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-950 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@novahome.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/30"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>1-Click Test Accounts (NovaHome)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@novahome.com', 'Admin@123')}
                className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-indigo-500 text-xs text-slate-300 hover:text-white transition-colors text-center"
              >
                <div className="font-bold">Admin</div>
                <div className="text-[10px] text-slate-500">Full Access</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('creator@novahome.com', 'Creator@123')}
                className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-indigo-500 text-xs text-slate-300 hover:text-white transition-colors text-center"
              >
                <div className="font-bold">Creator</div>
                <div className="text-[10px] text-slate-500">Submit Copy</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('reviewer@novahome.com', 'Reviewer@123')}
                className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-indigo-500 text-xs text-slate-300 hover:text-white transition-colors text-center"
              >
                <div className="font-bold">Reviewer</div>
                <div className="text-[10px] text-slate-500">Approvals</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
