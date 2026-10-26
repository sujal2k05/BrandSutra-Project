import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { organizationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';

const TeamManagementPage = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId || 1;

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({
    email: '',
    fullName: '',
    role: 'CONTENT_CREATOR'
  });
  const [notification, setNotification] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchMembers();
  }, [orgId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await organizationService.getMembers(orgId);
      setMembers(res.data);
    } catch (err) {
      console.error(err);
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
      setNotification({ text: `Invited ${res.data.fullName} as ${res.data.roleInOrg}! Default password is Welcome@123`, type: 'success' });
      setTimeout(() => setNotification({ text: '', type: '' }), 5000);
    } catch (err) {
      console.error(err);
      setNotification({ text: err.response?.data?.message || 'Failed to add member.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading organization team roster...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Team Management & Role Access</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Assign Administrator, Content Creator, and Human Reviewer permissions within {user?.organizationName || 'your organization'}.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Alert Notification */}
      {notification.text && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-2.5 ${
          notification.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Team Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Assigned Role</th>
                <th className="px-6 py-3.5">Permissions Scope</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {m.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{m.fullName}</div>
                        <div className="text-xs text-slate-500 font-mono">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      m.roleInOrg === 'ADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      m.roleInOrg === 'REVIEWER' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {m.roleInOrg?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {m.roleInOrg === 'ADMIN' && 'Full workspace control, Brand DNA edit, Team management'}
                    {m.roleInOrg === 'REVIEWER' && 'Approval queue decisions, inspection, comments'}
                    {m.roleInOrg === 'CONTENT_CREATOR' && 'Draft marketing copy, run AI inspection, revise drafts'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {m.status}
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
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Team Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Miller"
              value={memberForm.fullName}
              onChange={(e) => setMemberForm({ ...memberForm, fullName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="jordan@company.com"
              value={memberForm.email}
              onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Role & Permissions</label>
            <select
              value={memberForm.role}
              onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-sm"
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
