import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { organizationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';

const TeamManagementPage = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const orgId = user?.organizationId || 1;

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({
    email: '',
    fullName: '',
    role: 'CONTENT_CREATOR'
  });

  useEffect(() => {
    fetchMembers();
  }, [orgId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await organizationService.getMembers(orgId);
      setMembers(res.data || []);
    } catch (err) {
      console.error(err);
      toastError('Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await organizationService.addMember(orgId, memberForm);
      setMembers([...members, res.data]);
      setIsAddModalOpen(false);
      setMemberForm({ email: '', fullName: '', role: 'CONTENT_CREATOR' });
      success(`Invited ${res.data.fullName} as ${res.data.roleInOrg}! Default password: Welcome@123`);
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to add member.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading organization team roster...</p>
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
            <span>Workspace Administration</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Team Management & Role Access</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Assign Administrator, Content Creator, and Human Reviewer permissions within {user?.organizationName || 'your organization'}.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Team Table Card */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Assigned Role</th>
                <th className="px-6 py-3.5">Permissions Scope</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                        {m.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white text-xs">{m.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      m.roleInOrg === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                      m.roleInOrg === 'REVIEWER' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {m.roleInOrg?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                    {m.roleInOrg === 'ADMIN' && 'Full workspace control, Brand DNA edit, Team management'}
                    {m.roleInOrg === 'REVIEWER' && 'Approval queue decisions, inspection, Red-Team audit'}
                    {m.roleInOrg === 'CONTENT_CREATOR' && 'Draft marketing copy, run AI inspection, Self-Healing'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      {m.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                    {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: INVITE MEMBER */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Invite Team Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Miller"
              value={memberForm.fullName}
              onChange={(e) => setMemberForm({ ...memberForm, fullName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="jordan@company.com"
              value={memberForm.email}
              onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Role & Permissions</label>
            <select
              value={memberForm.role}
              onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="CONTENT_CREATOR">Content Creator (Create & Inspect Copy)</option>
              <option value="REVIEWER">Reviewer (Approve / Reject Submissions)</option>
              <option value="ADMIN">Administrator (Full DNA & Settings Control)</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
            >
              Invite Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamManagementPage;
