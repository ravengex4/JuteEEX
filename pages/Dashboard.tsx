import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { PlayIcon, StopIcon, HelpIcon, ShareIcon } from '../components/Icons';
import { Machine, UserRole } from '../types';
import { MODE_CONFIG } from '../constants';

const MachineCard: React.FC<{ machine: Machine }> = ({ machine }) => {
  const navigate = useNavigate();
  const { user, toggleMachineState } = useApp();
  const isRunning = machine.status === 'RUNNING';
  const modeConfig = MODE_CONFIG[machine.currentMode];

  const isOwner = user?.role === UserRole.OWNER;
  const isRented = machine.rentalStatus === 'RENTED';

  const toggleMachine = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(80);
    toggleMachineState(machine.id);
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/share/${machine.id}`);
  };

  return (
    <div 
      onClick={() => navigate(`/run/${machine.id}`)}
      className={`
        snap-start shrink-0 group relative flex flex-col justify-between 
        w-[85vw] max-w-sm md:w-72 h-44 p-5 rounded-[2rem] 
        bg-jute-paper dark:bg-jute-darkPaper shadow-soft hover:shadow-2xl 
        transition-all duration-300 cursor-pointer overflow-hidden
        border-2 
        ${isRunning ? modeConfig.border : 'border-transparent'}
      `}
      style={{
        boxShadow: isRunning ? `0 10px 30px -10px ${modeConfig.hex}30` : undefined
      }}
    >
      {/* Subtle Mode Background */}
      {isRunning && (
        <div className={`absolute inset-0 opacity-5 dark:opacity-10 ${modeConfig.bg}`} />
      )}

      {/* Top Section */}
      <div className="flex justify-between items-start z-10 relative gap-3">
        <div className="min-w-0">
           <div className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${isRunning ? modeConfig.color : 'text-gray-400'}`}>
             {machine.currentMode}
           </div>
           <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-300 line-clamp-1">{machine.name}</h3>
           {isRented && (
              <div className="mt-1 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900 w-fit">
                RENTED
              </div>
            )}
        </div>
        
        <div className={`shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide transition-colors duration-300 ${
          isRunning ? 'bg-white/50 dark:bg-black/20 backdrop-blur-sm' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500'
        }`} style={{ color: isRunning ? modeConfig.hex : undefined }}>
          <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'animate-pulse' : 'bg-gray-400'}`} style={{ backgroundColor: isRunning ? modeConfig.hex : undefined }} />
          {machine.status}
        </div>
      </div>

      {/* Decorative Background */}
      <div className="absolute right-4 top-12 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none text-current">
         <svg viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="40" />
            <path d="M50 10 L50 90" stroke="currentColor" strokeWidth="20"/>
         </svg>
      </div>

      {/* Bottom Section */}
      <div className="flex items-end justify-between mt-auto z-10">
        <div>
          <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Runtime</div>
          <div className="font-mono text-sm font-medium transition-colors duration-300">
            {Math.floor(machine.telemetry.runtime / 60)}m {machine.telemetry.runtime % 60}s
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            {isOwner && !isRented && (
              <button 
                onClick={handleShare}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 active:scale-95"
              >
                <ShareIcon size={20} />
              </button>
            )}
            <button 
                onClick={toggleMachine}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg active:scale-95 ${
                isRunning 
                    ? 'bg-white text-red-500 hover:bg-red-50 dark:bg-white/10 dark:text-red-400 dark:hover:bg-white/20' 
                    : 'bg-jute-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                }`}
            >
            {isRunning ? <StopIcon size={20} /> : <PlayIcon size={20} className="ml-1" />}
            </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { machines, runLogs, isDark, user } = useApp();
  const navigate = useNavigate();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Scroll reset on mount or when items populate
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
  }, [machines.length]);

  // Show only top 3 on dashboard
  const recentLogs = runLogs.slice(0, 3);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000 / 60; // minutes
    if(diff < 60) return `${Math.floor(diff)}m ago`;
    if(diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return '1d+ ago';
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in pb-20 md:pb-0 pt-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 -mx-4 md:-mx-8 px-4 md:px-8 py-4 bg-gray-50/80 dark:bg-white/5 border-b border-gray-200/50 dark:border-white/5 transition-all duration-300">
        <div>
          <img src={isDark ? "/images/icon black.jpg" : "/images/icon white mode.jpg"} alt="JuteEX logo" className="h-10" />
          <p className="text-gray-500 text-sm">Welcome back, {user?.name.split(' ')[0]}</p>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/help')}
              className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm text-gray-500 hover:text-jute-darkBlue transition-colors"
            >
               <HelpIcon size={20} />
            </button>
        </div>
      </div>

      {/* Active Fleet Section */}
      <div>
         <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl font-bold flex items-center gap-2">
               Active Fleet <span className="text-xs bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-full text-gray-500">{machines.length}</span>
            </h2>
         </div>
         
         <div 
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-8 -mx-4 pl-8 pr-6 snap-x scrollbar-hide"
         >
            {machines.map(m => <MachineCard key={m.id} machine={m} />)}
            {/* Add Machine Button */}
            <div className="snap-start shrink-0 w-16 md:w-20 rounded-[2rem] bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer">
               <span className="text-2xl">+</span>
            </div>
         </div>
      </div>

      {/* Recent Logs Section */}
      <div>
         <div className="flex items-center justify-between mb-4 px-1">
             <h2 className="text-xl font-bold">Recent Run Logs</h2>
             <button onClick={() => setShowHistoryModal(true)} className="text-sm font-bold text-jute-darkBlue hover:underline">View All</button>
         </div>
         
         <div className="space-y-3">
            {recentLogs.map(log => (
               <div 
                 key={log.id} 
                 onClick={() => navigate(`/log/${log.id}`)}
                 className="group bg-jute-paper dark:bg-jute-darkPaper p-4 rounded-2xl shadow-soft hover:shadow-lg transition-all border border-gray-100 dark:border-white/5 flex items-center justify-between cursor-pointer"
               >
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${log.jams > 0 ? 'bg-red-100 text-red-500 dark:bg-red-900/20' : 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900/20'}`}>
                        {log.jams > 0 ? <StopIcon size={20} /> : <PlayIcon size={20} />}
                     </div>
                     <div>
                        <div className="font-bold text-gray-900 dark:text-white">{log.machineName}</div>
                        <div className="text-xs text-gray-500">{getTimeAgo(log.date)} • {log.mode}</div>
                     </div>
                  </div>
                  
                  <div className="text-right">
                     <div className="font-mono font-bold text-sm">{formatTime(log.duration)}</div>
                     <div className="text-[10px] text-gray-400">Duration</div>
                  </div>
               </div>
            ))}
            {recentLogs.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No recent runs recorded.</div>
            )}
         </div>
      </div>
      
      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6 animate-fade-in" onClick={() => setShowHistoryModal(false)}>
            <div className="bg-jute-paper dark:bg-jute-darkPaper p-6 md:p-8 rounded-t-3xl md:rounded-3xl w-full max-w-2xl h-[85vh] md:h-auto md:max-h-[80vh] flex flex-col shadow-2xl animate-slide-up md:animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Run History</h3>
                    <button 
                        onClick={() => setShowHistoryModal(false)}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                        ✕
                    </button>
                </div>
                
                <div className="overflow-y-auto space-y-3 pr-2 scrollbar-hide grow">
                    {runLogs.map(log => (
                       <div 
                         key={log.id} 
                         onClick={() => {
                             setShowHistoryModal(false);
                             navigate(`/log/${log.id}`);
                         }}
                         className="group bg-white dark:bg-black/20 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-white/5 flex items-center justify-between cursor-pointer"
                       >
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${log.jams > 0 ? 'bg-red-100 text-red-500 dark:bg-red-900/20' : 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900/20'}`}>
                                {log.jams > 0 ? <StopIcon size={20} /> : <PlayIcon size={20} />}
                             </div>
                             <div>
                                <div className="font-bold text-gray-900 dark:text-white">{log.machineName}</div>
                                <div className="text-xs text-gray-500">{new Date(log.date).toLocaleDateString()} • {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                             </div>
                          </div>
                          
                          <div className="text-right">
                             <div className="font-mono font-bold text-sm">{formatTime(log.duration)}</div>
                             <div className="text-[10px] text-gray-400">{log.mode}</div>
                          </div>
                       </div>
                    ))}
                    {runLogs.length === 0 && (
                        <div className="text-center py-12 text-gray-400">No logs recorded yet.</div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;