import React, { useState, useEffect } from 'react';
import { 
  Dna, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Tag, 
  Search,
  Filter,
  Volume2,
  SlidersHorizontal,
  FileText,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { brandDnaService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import RiskBadge from '../components/common/RiskBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import { Skeleton } from '../components/common/Skeleton';

const BrandDnaPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const orgId = user?.organizationId || 1;
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState('facts');
  const [profile, setProfile] = useState(null);
  const [facts, setFacts] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [factSearch, setFactSearch] = useState('');
  const [factCategoryFilter, setFactCategoryFilter] = useState('ALL');
  const [ruleSearch, setRuleSearch] = useState('');
  const [ruleTypeFilter, setRuleTypeFilter] = useState('ALL');

  // Modals & Confirmation
  const [isFactModalOpen, setIsFactModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'fact' | 'rule', id, title }
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form States
  const [factForm, setFactForm] = useState({
    category: 'WARRANTY',
    factTitle: '',
    approvedStatement: '',
    source: '',
    version: 'v1.0'
  });

  const [ruleForm, setRuleForm] = useState({
    ruleType: 'BANNED_TERM',
    termOrPhrase: '',
    preferredReplacement: '',
    explanation: '',
    severity: 'HIGH',
    thresholdValue: ''
  });

  useEffect(() => {
    loadBrandData();
  }, [orgId]);

  const loadBrandData = async () => {
    try {
      setLoading(true);
      const [pRes, fRes, rRes] = await Promise.all([
        brandDnaService.getProfile(orgId),
        brandDnaService.getFacts(orgId),
        brandDnaService.getRules(orgId)
      ]);
      setProfile(pRes.data);
      setFacts(fRes.data || []);
      setRules(rRes.data || []);
    } catch (err) {
      console.error(err);
      error('Failed to load Brand DNA knowledge.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await brandDnaService.updateProfile(orgId, profile);
      setProfile(res.data);
      success('Brand DNA identity updated successfully!');
    } catch (err) {
      console.error(err);
      error('Failed to update brand profile.');
    }
  };

  const handleAddFact = async (e) => {
    e.preventDefault();
    try {
      const res = await brandDnaService.addFact(orgId, factForm);
      setFacts([...facts, res.data]);
      setIsFactModalOpen(false);
      setFactForm({ category: 'WARRANTY', factTitle: '', approvedStatement: '', source: '', version: 'v1.0' });
      success('Approved fact added to Brand DNA!');
    } catch (err) {
      console.error(err);
      error('Failed to save approved fact.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === 'fact') {
        await brandDnaService.deleteFact(deleteTarget.id);
        setFacts(facts.filter(f => f.id !== deleteTarget.id));
        success('Approved fact removed.');
      } else {
        await brandDnaService.deleteRule(deleteTarget.id);
        setRules(rules.filter(r => r.id !== deleteTarget.id));
        success('Governance rule deleted.');
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      error(`Failed to delete ${deleteTarget.type}.`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...ruleForm,
        thresholdValue: ruleForm.thresholdValue ? parseFloat(ruleForm.thresholdValue) : null
      };
      const res = await brandDnaService.addRule(orgId, payload);
      setRules([...rules, res.data]);
      setIsRuleModalOpen(false);
      setRuleForm({ ruleType: 'BANNED_TERM', termOrPhrase: '', preferredReplacement: '', explanation: '', severity: 'HIGH', thresholdValue: '' });
      success('Governance rule added successfully!');
    } catch (err) {
      console.error(err);
      error('Failed to add governance rule.');
    }
  };

  // Filtered lists
  const filteredFacts = facts.filter(f => {
    const matchesCategory = factCategoryFilter === 'ALL' || f.category === factCategoryFilter;
    const matchesSearch = !factSearch || 
      f.factTitle?.toLowerCase().includes(factSearch.toLowerCase()) ||
      f.approvedStatement?.toLowerCase().includes(factSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredRules = rules.filter(r => {
    const matchesType = ruleTypeFilter === 'ALL' || r.ruleType === ruleTypeFilter;
    const matchesSearch = !ruleSearch ||
      r.termOrPhrase?.toLowerCase().includes(ruleSearch.toLowerCase()) ||
      r.explanation?.toLowerCase().includes(ruleSearch.toLowerCase()) ||
      r.preferredReplacement?.toLowerCase().includes(ruleSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-12 w-64 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Authoritative Source of Truth</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Dna className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Brand DNA Knowledge Base</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Grounding truth, warranty policies, numeric caps, and tone profiles used by the AI Inspector.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('facts')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'facts' 
                ? 'bg-white dark:bg-[#111827] text-indigo-600 dark:text-indigo-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Approved Facts ({facts.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'rules' 
                ? 'bg-white dark:bg-[#111827] text-indigo-600 dark:text-indigo-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Terminology & Rules ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'profile' 
                ? 'bg-white dark:bg-[#111827] text-indigo-600 dark:text-indigo-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Identity & Voice
          </button>
        </div>
      </div>

      {/* TAB 1: APPROVED FACTS */}
      {activeTab === 'facts' && (
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
          {/* Controls bar */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search facts or approved claims..."
                  value={factSearch}
                  onChange={(e) => setFactSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={factCategoryFilter}
                onChange={(e) => setFactCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Categories</option>
                <option value="WARRANTY">Warranty</option>
                <option value="DISCOUNTS">Discounts</option>
                <option value="PRICING">Pricing</option>
                <option value="OFFERS">Offers</option>
                <option value="PRODUCT_INFO">Product Info</option>
                <option value="PERFORMANCE">Performance</option>
                <option value="GENERAL_POLICIES">General</option>
              </select>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsFactModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Approved Fact</span>
              </button>
            )}
          </div>

          {/* Facts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Title & Approved Grounding Statement</th>
                  <th className="px-6 py-3.5">Source & Version</th>
                  <th className="px-6 py-3.5">Status</th>
                  {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredFacts.length > 0 ? (
                  filteredFacts.map((fact) => (
                    <tr key={fact.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                          {fact.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-lg align-top">
                        <div className="font-extrabold text-slate-900 dark:text-white text-xs">{fact.factTitle}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/80 font-sans">
                          "{fact.approvedStatement}"
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 align-top">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">{fact.source || 'Internal Policy'}</div>
                        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">{fact.version || 'v1.0'}</div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          {fact.status || 'APPROVED'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right align-top">
                          <button
                            onClick={() => setDeleteTarget({ type: 'fact', id: fact.id, title: fact.factTitle })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Fact"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                      No facts found matching query. Add approved facts to train the governance engine.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BRAND RULES & TERMINOLOGY */}
      {activeTab === 'rules' && (
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
          {/* Controls bar */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search rules, banned terms..."
                  value={ruleSearch}
                  onChange={(e) => setRuleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={ruleTypeFilter}
                onChange={(e) => setRuleTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Rule Types</option>
                <option value="BANNED_TERM">Banned Terminology</option>
                <option value="RESTRICTED_TERM">Restricted Term</option>
                <option value="DISCOUNT_LIMIT">Discount Limit</option>
                <option value="WARRANTY_LIMIT">Warranty Limit</option>
                <option value="REQUIRED_PHRASE">Required Phrase</option>
              </select>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsRuleModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Rule</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Rule Type</th>
                  <th className="px-6 py-3.5">Restricted Term / Phrase</th>
                  <th className="px-6 py-3.5">Preferred Replacement</th>
                  <th className="px-6 py-3.5">Policy Rationale</th>
                  <th className="px-6 py-3.5">Severity</th>
                  {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredRules.length > 0 ? (
                  filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {rule.ruleType}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className="font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-2.5 py-1 rounded-md text-xs">
                          {rule.termOrPhrase}
                        </span>
                        {rule.thresholdValue !== null && rule.thresholdValue !== undefined && (
                          <span className="ml-2 text-xs font-extrabold text-slate-700 dark:text-slate-300 font-mono">
                            (Cap: {rule.thresholdValue})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400 align-top">
                        {rule.preferredReplacement ? (
                          <span className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                            {rule.preferredReplacement}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None specified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed align-top">
                        {rule.explanation || 'Explicit compliance rule'}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <RiskBadge severity={rule.severity || 'HIGH'} size="xs" />
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right align-top">
                          <button
                            onClick={() => setDeleteTarget({ type: 'rule', id: rule.id, title: rule.termOrPhrase })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                      No brand rules defined matching query. Add banned terms or limits to protect your copy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BRAND PROFILE & VOICE */}
      {activeTab === 'profile' && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Form (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 sm:p-8">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">Brand Identity & Voice Persona</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Authoritative voice configuration cited during semantic LLM analysis.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isAdmin}
                    value={profile.brandName || ''}
                    onChange={(e) => setProfile({ ...profile, brandName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Approved Voice Tone
                  </label>
                  <select
                    disabled={!isAdmin}
                    value={profile.voiceTone || 'Professional and Friendly'}
                    onChange={(e) => setProfile({ ...profile, voiceTone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  >
                    <option value="Professional and Friendly">Professional and Friendly</option>
                    <option value="Formal and Authoritative">Formal and Authoritative</option>
                    <option value="Casual and Energetic">Casual and Energetic</option>
                    <option value="Confident and Premium">Confident and Premium</option>
                    <option value="Informative and Educational">Informative and Educational</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Brand Mission & Core Values
                </label>
                <textarea
                  rows={3}
                  disabled={!isAdmin}
                  value={profile.mission || ''}
                  onChange={(e) => setProfile({ ...profile, mission: e.target.value })}
                  placeholder="Core mission and values..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Communication Guidelines & Style Boundaries
                </label>
                <textarea
                  rows={4}
                  disabled={!isAdmin}
                  value={profile.toneGuidelines || ''}
                  onChange={(e) => setProfile({ ...profile, toneGuidelines: e.target.value })}
                  placeholder="e.g. Avoid hyperbolic words like 'the absolute best'. Always cite certified efficiency data."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>

              {isAdmin && (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
                >
                  Save Brand Profile
                </button>
              )}
            </form>
          </div>

          {/* Side Brand Voice Dimension Cards (1 col) */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Voice Persona Pillars</span>
              </h4>
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Empathetic Clarity</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Direct statements with zero misleading legalese or concealed exclusions.</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Grounded Accuracy</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Every claim must tie to an explicit approved specification fact.</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">No False Urgency</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Promotions must have explicit expiry dates and realistic discount caps.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-tr from-indigo-900 to-slate-900 rounded-3xl p-5 text-white border border-indigo-800/50">
              <h4 className="font-extrabold text-sm flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>PDF Guidelines Ingestion</span>
              </h4>
              <p className="text-xs text-indigo-200/80 mb-4">
                Have a 50-page Brand Guidelines PDF? PyMuPDF parses and extracts rules automatically.
              </p>
              <Link
                to="/guidelines"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition"
              >
                <span>Open PDF Guidelines</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD APPROVED FACT */}
      <Modal isOpen={isFactModalOpen} onClose={() => setIsFactModalOpen(false)} title="Add Authoritative Brand Fact">
        <form onSubmit={handleAddFact} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={factForm.category}
                onChange={(e) => setFactForm({ ...factForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="WARRANTY">Warranty</option>
                <option value="DISCOUNTS">Discounts</option>
                <option value="PRICING">Pricing</option>
                <option value="OFFERS">Offers & Dates</option>
                <option value="PRODUCT_INFO">Product Information</option>
                <option value="PERFORMANCE">Performance</option>
                <option value="GENERAL_POLICIES">General Policies</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Fact Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Robot Vacuum Warranty"
                value={factForm.factTitle}
                onChange={(e) => setFactForm({ ...factForm, factTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Approved Grounding Statement (Exact Policy)</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. NovaClean robot vacuum has a standard 2-year warranty on motor and chassis."
              value={factForm.approvedStatement}
              onChange={(e) => setFactForm({ ...factForm, approvedStatement: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Source Document</label>
              <input
                type="text"
                placeholder="e.g. Official Warranty Policy 2026"
                value={factForm.source}
                onChange={(e) => setFactForm({ ...factForm, source: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Policy Version</label>
              <input
                type="text"
                placeholder="v1.0"
                value={factForm.version}
                onChange={(e) => setFactForm({ ...factForm, version: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFactModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
            >
              Add to Brand DNA
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD BRAND RULE */}
      <Modal isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)} title="Create Governance Safety Rule">
        <form onSubmit={handleAddRule} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Rule Type</label>
              <select
                value={ruleForm.ruleType}
                onChange={(e) => setRuleForm({ ...ruleForm, ruleType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BANNED_TERM">Banned Terminology</option>
                <option value="RESTRICTED_TERM">Restricted Term</option>
                <option value="REQUIRED_PHRASE">Required Phrase / Disclaimer</option>
                <option value="DISCOUNT_LIMIT">Discount Numeric Cap (%)</option>
                <option value="WARRANTY_LIMIT">Warranty Numeric Cap (Years)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Severity</label>
              <select
                value={ruleForm.severity}
                onChange={(e) => setRuleForm({ ...ruleForm, severity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CRITICAL">Critical (40 pts)</option>
                <option value="HIGH">High (25 pts)</option>
                <option value="MEDIUM">Medium (15 pts)</option>
                <option value="LOW">Low (5 pts)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Term / Phrase to Flag</label>
              <input
                type="text"
                required
                placeholder="e.g. 100% perfect, Guaranteed"
                value={ruleForm.termOrPhrase}
                onChange={(e) => setRuleForm({ ...ruleForm, termOrPhrase: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Numeric Threshold (Optional)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 15 for 15% max"
                value={ruleForm.thresholdValue}
                onChange={(e) => setRuleForm({ ...ruleForm, thresholdValue: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Preferred Compliant Replacement</label>
            <input
              type="text"
              placeholder="e.g. Engineered for high performance"
              value={ruleForm.preferredReplacement}
              onChange={(e) => setRuleForm({ ...ruleForm, preferredReplacement: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Policy Rationale / Reason</label>
            <textarea
              rows={2}
              placeholder="Why this rule exists..."
              value={ruleForm.explanation}
              onChange={(e) => setRuleForm({ ...ruleForm, explanation: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRuleModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
            >
              Save Rule
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title={`Delete ${deleteTarget?.type === 'fact' ? 'Approved Fact' : 'Governance Rule'}`}
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone and will affect live scans.`}
        confirmText="Delete Permanently"
      />
    </div>
  );
};

export default BrandDnaPage;
