import React, { useState } from 'react';
import {
  UserCog,
  Plus,
  Shield,
  User,
  KeyRound,
  CheckCircle2,
  XCircle,
  History,
  AlertCircle,
  Search,
  Lock
} from 'lucide-react';
import { storage } from '../services/storage';
import { translations, Language } from '../locales/translations';
import { Team, TEAMS, User as UserType, UserRole } from '../types';

export const UsersView: React.FC = () => {
  const settings = storage.getSettings();
  const lang: Language = settings.language;
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'USERS' | 'ACTIVITY_LOG'>('USERS');
  const [users, setUsers] = useState<UserType[]>(storage.getUsers());
  const [logs, setLogs] = useState(storage.getLogs(100));

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('TEAM_USER');
  const [newTeam, setNewTeam] = useState<Team>('B1');
  const [newEmail, setNewEmail] = useState('');

  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const res = storage.addUser({
      username: newUsername,
      fullName: newFullName,
      role: newRole,
      team: newRole === 'ADMIN' ? 'ALL' : newTeam,
      email: newEmail
    });

    if (res.success) {
      setUsers(storage.getUsers());
      setShowAddUserModal(false);
      setNewUsername('');
      setNewFullName('');
      setNewEmail('');
    } else {
      alert(res.message);
    }
  };

  const handleToggleStatus = (u: UserType) => {
    storage.updateUser(u.id, { isActive: !u.isActive });
    setUsers(storage.getUsers());
  };

  return (
    <div className="space-y-5">
      
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t.navUsers}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Admin Only
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {lang === 'lo'
              ? 'ຈັດການບັນຊີຜູ້ໃຊ້, ກຳນົດສິດທີມ B1-B7, ແລະ ກວດສອບ Activity Log'
              : 'User accounts, role assignment (B1-B7 teams), and comprehensive security audit trail'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'USERS' && (
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition cursor-pointer shadow-md shadow-blue-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'lo' ? 'ເພີ່ມຜູ້ໃຊ້ງານໃໝ່' : 'Add New User'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Nav */}
      <div className="bg-white p-2 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'USERS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{lang === 'lo' ? 'ລາຍຊື່ຜູ້ໃຊ້ງານ (Users)' : 'User Accounts'}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('ACTIVITY_LOG');
            setLogs(storage.getLogs(150));
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'ACTIVITY_LOG'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{lang === 'lo' ? 'ປະຫວັດການເຄື່ອນໄຫວລະບົບ (Activity Log)' : 'Activity Log'}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {logs.length}
          </span>
        </button>
      </div>

      {/* Users Tab Content */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Assigned Team</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-3">Last Login</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {users.map((u) => {
                  const isAdmin = u.role === 'ADMIN';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {u.username}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {u.fullName}
                      </td>
                      <td className="py-3 px-3">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Shield className="w-3 h-3" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                            <span>Team User</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-slate-100 text-slate-700">
                          {u.team === 'ALL' ? t.allTeams : `Team ${u.team}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {u.email || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {u.lastLogin || '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700">
                            <XCircle className="w-3 h-3" />
                            <span>Disabled</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.username !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              u.isActive
                                ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                            }`}
                          >
                            {u.isActive ? (lang === 'lo' ? 'ປິດໃຊ້ງານ' : 'Disable') : (lang === 'lo' ? 'ເປີດໃຊ້ງານ' : 'Enable')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Log Tab Content */}
      {activeTab === 'ACTIVITY_LOG' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-600 font-semibold">
              {lang === 'lo' ? 'ບັນທຶກການເຄື່ອນໄຫວລ່າສຸດ (Audit Trail):' : 'Recent System Audit Trail:'}
            </span>
            <span className="text-slate-400 font-mono">Real-time Logging</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {log.user}
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-slate-100 text-slate-600">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCog className="w-5 h-5 text-blue-600" />
              <span>{lang === 'lo' ? 'ສ້າງບັນຊີຜູ້ໃຊ້ງານໃໝ່' : 'Create New User Account'}</span>
            </h3>

            <form onSubmit={handleAddUser} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'lo' ? 'ຊື່ເຂົ້າໃຊ້ (Username)' : 'Username'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., b2_leader"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'lo' ? 'ຊື່ ແລະ ນາມສະກຸນ (Full Name)' : 'Full Name'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'lo' ? 'ຊື່ ແລະ ນາມສະກຸນພະນັກງານ' : 'Staff full name'}
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'lo' ? 'ອີເມວ (Email)' : 'Email Address'}
                </label>
                <input
                  type="email"
                  placeholder="name@laocompany.la"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'lo' ? 'ບົດບາດ (Role)' : 'Role'}
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TEAM_USER">{t.roleTeamUser}</option>
                    <option value="ADMIN">{t.roleAdmin}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'lo' ? 'ທີມທີ່ຮັບຜິດຊອບ' : 'Assigned Team'}
                  </label>
                  {newRole === 'ADMIN' ? (
                    <div className="p-2.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                      {t.allTeams}
                    </div>
                  ) : (
                    <select
                      value={newTeam}
                      onChange={(e) => setNewTeam(e.target.value as Team)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {TEAMS.map((tm) => (
                        <option key={tm} value={tm}>
                          Team {tm}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/30"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
