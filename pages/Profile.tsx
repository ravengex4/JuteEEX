import React, { useState } from 'react';
import { MarketIcon, ProfileIcon } from '../components/Icons';
import { useApp } from '../App';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

const Profile: React.FC = () => {
  const { themeMode, setThemeMode, user } = useApp();
  const [showLogModal, setShowLogModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth);
  };
  
  const transactions = [
    { id: 1, type: 'SOLD', item: 'Raw Jute (Grade A)', amount: '₹12,400', date: '2 days ago', status: 'COMPLETED' },
    { id: 2, type: 'BOUGHT', item: 'Premium Seeds', amount: '₹450', date: '1 week ago', status: 'DELIVERED' },
    { id: 3, type: 'BOUGHT', item: 'Lubricant Oil', amount: '₹800', date: '2 weeks ago', status: 'DELIVERED' },
  ];

  if (!user) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold mb-4">You are not logged in.</h1>
        <button
          onClick={() => navigate('/login')}
          className="bg-jute-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-lg font-bold"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in pb-20 pt-4 md:pt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center text-3xl font-bold text-gray-400">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold"
          >
            Logout
          </button>
        </div>

        {/* Theme Preference */}
        <div className="bg-jute-paper dark:bg-jute-darkPaper rounded-3xl p-6 shadow-soft mb-8 transition-colors duration-300">
           <h2 className="text-lg font-bold mb-4">Theme Preference</h2>
           <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-2xl">
              {['light', 'system', 'dark'].map((mode) => (
                <button 
                  key={mode}
                  onClick={() => setThemeMode(mode as any)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm capitalize transition-all duration-300 ${themeMode === mode ? 'bg-white dark:bg-white/10 shadow-sm text-black dark:text-white' : 'text-gray-400'}`}
                >
                  {mode}
                </button>
              ))}
           </div>
        </div>

        <div className="bg-jute-paper dark:bg-jute-darkPaper rounded-3xl p-6 shadow-soft mb-8 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold">Farm Stats</h2>
             <button 
                onClick={() => setShowLogModal(true)}
                className="text-xs font-bold text-white bg-jute-black dark:bg-white dark:text-black px-4 py-2 rounded-lg active:scale-95 transition-transform"
             >
                + Add Log
             </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5 transition-colors duration-300">
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Total Output</div>
                  <div className="text-2xl font-mono font-bold mt-1">450 kg</div>
              </div>
              <div className="bg-white dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5 transition-colors duration-300">
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Earnings</div>
                  <div className="text-2xl font-mono font-bold mt-1">₹45.2k</div>
              </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MarketIcon size={20} /> Transaction History
        </h2>
        <div className="space-y-4">
          {transactions.map(t => (
              <div key={t.id} className="bg-white dark:bg-jute-darkPaper p-4 rounded-2xl shadow-sm flex items-center justify-between border border-gray-100 dark:border-white/5 transition-colors duration-300">
                  <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${t.type === 'SOLD' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {t.type === 'SOLD' ? 'IN' : 'OUT'}
                      </div>
                      <div>
                          <div className="font-bold text-sm">{t.item}</div>
                          <div className="text-xs text-gray-400">{t.date}</div>
                      </div>
                  </div>
                  <div className="text-right">
                      <div className="font-mono font-bold">{t.amount}</div>
                      <div className="text-[10px] text-gray-400 uppercase">{t.status}</div>
                  </div>
              </div>
          ))}
        </div>
      </div>

      {/* Production Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6 animate-fade-in" onClick={() => setShowLogModal(false)}>
            <div className="bg-white dark:bg-jute-darkPaper p-6 md:p-8 rounded-t-3xl md:rounded-3xl w-full max-w-lg shadow-2xl animate-slide-up md:animate-fade-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold mb-2">New Production Log</h3>
                <p className="text-gray-500 text-sm mb-6">Record today's yield for tracking.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Batch ID</label>
                        <input type="text" defaultValue="BATCH-2024-X9" className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border-none font-mono" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Quantity (KG)</label>
                        <input type="number" placeholder="0.0" className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border-none text-xl font-bold" autoFocus />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Quality Grade</label>
                        <div className="flex gap-2">
                            {['A', 'B', 'C'].map(g => (
                                <button key={g} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 font-bold focus:bg-jute-darkBlue focus:text-white transition-colors">
                                    Grade {g}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button 
                        onClick={() => setShowLogModal(false)}
                        className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => setShowLogModal(false)}
                        className="flex-1 py-3 rounded-xl font-bold bg-jute-black text-white dark:bg-white dark:text-black shadow-lg transition-transform active:scale-95"
                    >
                        Save Log
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default Profile;