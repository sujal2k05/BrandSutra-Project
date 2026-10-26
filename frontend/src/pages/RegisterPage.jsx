import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  ArrowRight, 
  AlertCircle, 
  PenTool, 
  CheckCircle,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'CONTENT_CREATOR', // Default role option
    organizationId: '',
    organizationName: '',
    industry: 'Consumer Products'
  });

  const [organizations, setOrganizations] = useState([]);
  const [showNewOrgInput, setShowNewOrgInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Load existing organizations for selection
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await authService.getOrganizations();
        setOrganizations(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            organizationId: res.data[0].id,
            organizationName: res.data[0].name
          }));
        } else {
          setShowNewOrgInput(true);
        }
      } catch (err) {
        console.error("Could not fetch organizations:", err);
        setShowNewOrgInput(true);
      }
    };
    fetchOrgs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrgSelect = (e) => {
    const val = e.target.value;
    if (val === '__NEW__') {
      setShowNewOrgInput(true);
      setFormData({ ...formData, organizationId: '', organizationName: '' });
    } else {
      setShowNewOrgInput(false);
      const selectedOrg = organizations.find((o) => o.id.toString() === val);
      setFormData({
        ...formData,
        organizationId: val,
        organizationName: selectedOrg ? selectedOrg.name : ''
      });
    }
  };

  const handleRoleSelect = (roleName) => {
    setFormData({ ...formData, role: roleName });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        organizationId: formData.organizationId ? Number(formData.organizationId) : null,
        organizationName: formData.organizationName || undefined,
        industry: formData.industry
      };

      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please verify your inputs.');
    } finally {
      setIsLoading(false);
    }
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
          Join Your Brand Workspace
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-slate-950 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          
          {/* Admin Policy Notice */}
          <div className="mb-6 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              <strong>Team Governance Policy:</strong> Workspace Admin is managed by organization leadership. Please choose whether to register as a <strong>Content Creator</strong> or <strong>Reviewer</strong> below.
            </span>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Step 1: Role Selection Cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Select Your Role *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('CONTENT_CREATOR')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    formData.role === 'CONTENT_CREATOR'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white ring-2 ring-indigo-500/50'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <PenTool className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold text-white">Content Creator</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Draft copy, test AI inspection, accept fixes & submit revisions.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('REVIEWER')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    formData.role === 'REVIEWER'
                      ? 'bg-purple-600/15 border-purple-500 text-white ring-2 ring-purple-500/50'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-white">Human Reviewer</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Inspect evidence, verify compliance, Approve / Reject publications.
                  </p>
                </button>
              </div>
            </div>

            {/* Step 2: Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Sujal Bhoi"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Step 3: Work Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Step 4: Organization Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Workspace Organization *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Building2 className="w-4 h-4" />
                </div>
                <select
                  value={showNewOrgInput ? '__NEW__' : formData.organizationId}
                  onChange={handleOrgSelect}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.industry || 'Consumer Products'})
                    </option>
                  ))}
                  <option value="__NEW__">+ Join / Enter Other Organization</option>
                </select>
              </div>
            </div>

            {/* Optional Custom Organization Input if selected */}
            {showNewOrgInput && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    required
                    value={formData.organizationName}
                    onChange={handleChange}
                    placeholder="e.g. Nexus Dynamics"
                    className="block w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Industry
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Consumer Products">Consumer Products & Appliances</option>
                    <option value="SaaS & Technology">SaaS & Technology</option>
                    <option value="Financial Services">Financial Services & Fintech</option>
                    <option value="Healthcare">Healthcare & Pharmaceuticals</option>
                    <option value="E-Commerce">E-Commerce & Retail</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 5: Password with Visibility Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                formData.role === 'CONTENT_CREATOR'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
              } disabled:opacity-50`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    Join as {formData.role === 'CONTENT_CREATOR' ? 'Content Creator' : 'Reviewer'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
