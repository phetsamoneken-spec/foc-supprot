import React, { useState } from 'react';
import { Lock, User, Shield, ArrowRight, AlertCircle, Sparkles, Building2 } from 'lucide-react';
import { storage } from '../services/storage';
import { translations, Language } from '../locales/translations';
import { TEAMS } from '../types';

export const LoginView: React.FC = () => {
  const settings = storage.getSettings();
  const lang: Language = settings.language;
  const t = translations[lang];

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = storage.login(username, password);
    if (!res.success) {
      setError(res.message || 'Login failed');
    }
  };

  const handleQuickLogin = (uname: string) => {
    setUsername(uname);
    setPassword(`${uname}_123`);
    storage.login(uname);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background subtle mesh gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Crest */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-1 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-blue-400 text-2xl">
              MKT
            </div>
          </div>
        </div>

        <h2 className="mt-5 text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.appName}
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-400">
          {lang === 'lo'
            ? 'ລະບົບຄຸ້ມຄອງງົບປະມານ ແລະ ຮອບສັນຍາລູກຄ້າທີມການຕະຫຼາດ B1 - B7'
            : 'Marketing Customer Budget & Contract Period Management for Teams B1-B7'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 py-8 px-6 shadow-2xl rounded-3xl border border-slate-800 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {lang === 'lo' ? 'ຊື່ຜູ້ໃຊ້ງານ (Username)' : 'Username'}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin ຫຼື b1_user..."
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {lang === 'lo' ? 'ລະຫັດຜ່ານ (Password)' : 'Password'}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition cursor-pointer active:scale-[0.98]"
            >
              <span>{t.login}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'lo' ? 'ທົດສອບດ່ວນຕາມສິດ (Quick Test)' : 'Quick Test Roles'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white">Admin</p>
                  <p className="text-[10px] text-slate-400">{t.allTeams}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('b1_user')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  B1
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white">Team B1</p>
                  <p className="text-[10px] text-slate-400">Team Restricted</p>
                </div>
              </button>
            </div>

            <div className="mt-2 grid grid-cols-6 gap-1">
              {['B2', 'B3', 'B4', 'B5', 'B6', 'B7'].map((tm) => (
                <button
                  key={tm}
                  type="button"
                  onClick={() => handleQuickLogin(`${tm.toLowerCase()}_user`)}
                  className="py-1 px-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-bold text-slate-300 hover:text-white text-center border border-slate-700/60 transition cursor-pointer"
                  title={`Login as Team ${tm} User`}
                >
                  {tm}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Google Spreadsheet ID: <code className="text-slate-400 font-mono">1hMjeyC_Xizwj3ca67dGR0To1oGJGTw3VivFnT_o-76A</code>
        </div>
      </div>
    </div>
  );
};
