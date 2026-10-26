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
  SlidersHorizontal 
} from 'lucide-react';
import { brandDnaService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import RiskBadge from '../components/common/RiskBadge';

const BrandDnaPage = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId || 1;
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState('facts');
  const [profile, setProfile] = useState(null);
  const [facts, setFacts] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Modal States
  const [isFactModalOpen, setIsFactModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

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
      setFacts(fRes.data);
      setRules(rRes.data);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load Brand DNA knowledge.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await brandDnaService.updateProfile(orgId, profile);
      setProfile(res.data);
      setMessage({ text: 'Brand DNA identity updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to update brand profile.', type: 'error' });
    }
  };

  const handleAddFact = async (e) => {
    e.preventDefault();
    try {
      const res = await brandDnaService.addFact(orgId, factForm);
      setFacts([...facts, res.data]);
      setIsFactModalOpen(false);
      setFactForm({ category: 'WARRANTY', factTitle: '', approvedStatement: '', source: '', version: 'v1.0' });
      setMessage({ text: 'Approved fact added to Brand DNA!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to save fact.', type: 'error' });
    }
  };

  const handleDeleteFact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this approved fact?")) return;
    try {
      await brandDnaService.deleteFact(id);
      setFacts(facts.filter(f => f.id !== id));
      setMessage({ text: 'Fact removed successfully.', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to delete fact.', type: 'error' });
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
      setMessage({ text: 'Governance rule added successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to add rule.', type: 'error' });
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;
    try {
      await brandDnaService.deleteRule(id);
      setRules(rules.filter(r => r.id !== id));
      setMessage({ text: 'Rule deleted successfully.', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to delete rule.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Retrieving approved Brand DNA knowledge base...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Dna className="w-6 h-6 text-indigo-600" />
            <span>Brand DNA Knowledge Base</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative source of approved facts, policies, and terminology rules used by the AI Inspector.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('facts')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'facts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved Facts ({facts.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'rules' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terminology & Rules ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'profile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Identity & Voice
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {message.text && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* TAB 1: APPROVED FACTS */}
      {activeTab === 'facts' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Approved Product & Policy Facts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Authoritative grounding facts used as evidence during verification.</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsFactModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Approved Fact</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Title & Approved Statement</th>
                  <th className="px-6 py-3.5">Source & Version</th>
                  <th className="px-6 py-3.5">Status</th>
                  {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facts.length > 0 ? (
                  facts.map((fact) => (
                    <tr key={fact.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          {fact.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <div className="font-bold text-slate-900">{fact.factTitle}</div>
                        <div className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 font-sans">
                          "{fact.approvedStatement}"
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <div className="font-medium text-slate-700">{fact.source || 'Internal Policy'}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">{fact.version || 'v1.0'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {fact.status || 'APPROVED'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteFact(fact.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No facts added yet. Add approved facts to train the governance engine.
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
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Deterministic Brand Rules & Terminology</h3>
              <p className="text-xs text-slate-500 mt-0.5">Strict safety rules, banned terminology, discount limits, and warranty caps.</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsRuleModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Rule</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Rule Type</th>
                  <th className="px-6 py-3.5">Restricted Term / Phrase</th>
                  <th className="px-6 py-3.5">Preferred Replacement</th>
                  <th className="px-6 py-3.5">Policy Rationale</th>
                  <th className="px-6 py-3.5">Severity</th>
                  {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.length > 0 ? (
                  rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {rule.ruleType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-md text-xs">
                          {rule.termOrPhrase}
                        </span>
                        {rule.thresholdValue !== null && rule.thresholdValue !== undefined && (
                          <span className="ml-2 text-xs font-bold text-slate-700 font-mono">
                            (Cap: {rule.thresholdValue})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-emerald-700">
                        {rule.preferredReplacement ? (
                          <span className="bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                            {rule.preferredReplacement}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None specified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-xs leading-relaxed">
                        {rule.explanation || 'Explicit compliance rule'}
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge severity={rule.severity || 'HIGH'} />
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No brand rules defined. Add banned terms or limits to protect your copy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BRAND PROFILE */}
      {activeTab === 'profile' && profile && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-3xl">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 text-lg">Brand Identity & Tone Guidelines</h3>
              <p className="text-xs text-slate-500 mt-0.5">Defines the voice persona and mission cited during semantic tone verification.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={profile.brandName || ''}
                  onChange={(e) => setProfile({ ...profile, brandName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Approved Voice Tone
                </label>
                <select
                  disabled={!isAdmin}
                  value={profile.voiceTone || 'Professional and Friendly'}
                  onChange={(e) => setProfile({ ...profile, voiceTone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Brand Mission & Values
              </label>
              <textarea
                rows={3}
                disabled={!isAdmin}
                value={profile.mission || ''}
                onChange={(e) => setProfile({ ...profile, mission: e.target.value })}
                placeholder="Core mission and values..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Communication Guidelines & Disallowed Styles
              </label>
              <textarea
                rows={4}
                disabled={!isAdmin}
                value={profile.toneGuidelines || ''}
                onChange={(e) => setProfile({ ...profile, toneGuidelines: e.target.value })}
                placeholder="e.g. Avoid hyperbolic words like 'the absolute best'. Always cite certified efficiency data."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
              />
            </div>

            {isAdmin && (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-all"
              >
                Save Brand Profile
              </button>
            )}
          </form>
        </div>
      )}

      {/* MODAL: ADD APPROVED FACT */}
      <Modal isOpen={isFactModalOpen} onClose={() => setIsFactModalOpen(false)} title="Add Authoritative Brand Fact">
        <form onSubmit={handleAddFact} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={factForm.category}
                onChange={(e) => setFactForm({ ...factForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Fact Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Compressor Warranty"
                value={factForm.factTitle}
                onChange={(e) => setFactForm({ ...factForm, factTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Approved Statement (Exact Policy Text)</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Model X compressor warranty is 5 years."
              value={factForm.approvedStatement}
              onChange={(e) => setFactForm({ ...factForm, approvedStatement: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Source Document</label>
              <input
                type="text"
                placeholder="e.g. Spec Sheet 2026"
                value={factForm.source}
                onChange={(e) => setFactForm({ ...factForm, source: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Policy Version</label>
              <input
                type="text"
                placeholder="v1.0"
                value={factForm.version}
                onChange={(e) => setFactForm({ ...factForm, version: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFactModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-sm"
            >
              Add to Brand DNA
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD BRAND RULE */}
      <Modal isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)} title="Create Governance Rule">
        <form onSubmit={handleAddRule} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Rule Type</label>
              <select
                value={ruleForm.ruleType}
                onChange={(e) => setRuleForm({ ...ruleForm, ruleType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BANNED_TERM">Banned Terminology</option>
                <option value="RESTRICTED_TERM">Restricted Term</option>
                <option value="REQUIRED_PHRASE">Required Phrase / Disclaimer</option>
                <option value="DISCOUNT_LIMIT">Discount Numeric Cap (%)</option>
                <option value="WARRANTY_LIMIT">Warranty Numeric Cap (Years)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Severity</label>
              <select
                value={ruleForm.severity}
                onChange={(e) => setRuleForm({ ...ruleForm, severity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Term / Phrase to Flag</label>
              <input
                type="text"
                required
                placeholder="e.g. 100% perfect, Guaranteed"
                value={ruleForm.termOrPhrase}
                onChange={(e) => setRuleForm({ ...ruleForm, termOrPhrase: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Numeric Threshold (Optional)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 25 for 25% max"
                value={ruleForm.thresholdValue}
                onChange={(e) => setRuleForm({ ...ruleForm, thresholdValue: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Preferred Compliant Replacement</label>
            <input
              type="text"
              placeholder="e.g. Engineered for excellence"
              value={ruleForm.preferredReplacement}
              onChange={(e) => setRuleForm({ ...ruleForm, preferredReplacement: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Policy Explanation</label>
            <textarea
              rows={2}
              placeholder="Why this rule exists..."
              value={ruleForm.explanation}
              onChange={(e) => setRuleForm({ ...ruleForm, explanation: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRuleModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-sm"
            >
              Save Rule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BrandDnaPage;
