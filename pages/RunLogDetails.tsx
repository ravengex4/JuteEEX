import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { PlayIcon, StopIcon, FileIcon } from '../components/Icons';

const RunLogDetails: React.FC = () => {
  const { logId } = useParams();
  const { runLogs } = useApp();
  const navigate = useNavigate();

  const log = runLogs.find(l => l.id === logId);

  if (!log) {
    return (
      <div className="p-10 text-center space-y-4">
        <h2 className="text-xl font-bold">Log Not Found</h2>
        <button onClick={() => navigate('/')} className="text-blue-500 underline">Back home</button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  // Mock calculation for Energy Consumption based on speed/mode
  const estimatedAmps = Math.max(1.5, (log.avgSpeed / 100) * 8.5); 
  const totalAh = (estimatedAmps * (log.duration / 3600)).toFixed(2);

  const modeColors = {
    'ECO': 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    'POWER': 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    'AUTO': 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    'IDLE': 'text-gray-500 bg-gray-50 border-gray-200'
  };

  const getModeColorClass = (mode: string) => {
      if (mode === 'ECO') return 'text-emerald-500';
      if (mode === 'POWER') return 'text-amber-500';
      return 'text-blue-500';
  };

  return (
    <div className="animate-fade-in pb-20 max-w-xl mx-auto pt-8 px-4 md:px-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center hover:bg-gray-100 transition-colors duration-300"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Run Report</h1>
          <p className="text-gray-500 text-sm">Detailed session analytics</p>
        </div>
      </div>

      {/* Main Rectangular Card */}
      <div className="bg-jute-paper dark:bg-jute-darkPaper rounded-xl p-6 md:p-8 shadow-soft border border-gray-200 dark:border-white/5 transition-colors duration-300 flex flex-col gap-6">
        
        {/* Top Summary Row */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-white/5">
           <div>
              <div className="text-2xl font-bold leading-tight">{log.machineName}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">
                 {new Date(log.date).toLocaleDateString()} • {new Date(log.date).toLocaleTimeString()}
              </div>
           </div>
           <div className={`px-4 py-2 rounded-lg border text-sm font-bold tracking-wide ${modeColors[log.mode] || modeColors.IDLE}`}>
              {log.mode}
           </div>
        </div>

        {/* Detailed Stats Grid (Comprehensive) */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-black/20 p-4 rounded-lg border border-gray-100 dark:border-white/5">
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Duration</div>
                <div className="text-xl font-mono font-bold text-gray-900 dark:text-gray-100">{formatTime(log.duration)}</div>
            </div>
            
            <div className="bg-white dark:bg-black/20 p-4 rounded-lg border border-gray-100 dark:border-white/5">
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Avg Speed</div>
                <div className="text-xl font-mono font-bold text-gray-900 dark:text-gray-100">{log.avgSpeed}%</div>
            </div>

            <div className="bg-white dark:bg-black/20 p-4 rounded-lg border border-gray-100 dark:border-white/5">
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Energy</div>
                <div className="text-xl font-mono font-bold text-gray-900 dark:text-gray-100">{totalAh} <span className="text-sm font-normal text-gray-500">Ah</span></div>
            </div>

            <div className="bg-white dark:bg-black/20 p-4 rounded-lg border border-gray-100 dark:border-white/5">
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Jam Events</div>
                <div className={`text-xl font-mono font-bold ${log.jams > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {log.jams}
                </div>
            </div>
        </div>
        
        {/* Footer Info */}
        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg text-xs text-gray-500 leading-relaxed border border-gray-100 dark:border-white/5">
           Run completed in <span className="font-bold">{log.mode}</span> mode. 
           {log.jams > 0 ? ` Encountered ${log.jams} jam(s) requiring intervention.` : ' System operated smoothly with no interruptions.'}
        </div>

        {/* Action Footer */}
        <div className="flex gap-4 mt-2">
             <button className="flex-1 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <FileIcon size={16} /> Export
             </button>
             <button 
                onClick={() => navigate(`/run/${log.machineId}`)}
                className="flex-1 py-3 bg-jute-darkBlue text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
             >
                <PlayIcon size={16} /> Restart
             </button>
        </div>
      </div>
    </div>
  );
};

export default RunLogDetails;