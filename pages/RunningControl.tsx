import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import AnalogGauge from '../components/AnalogGauge';
import { ReverseIcon, PlayIcon, StopIcon, AlertIcon, ShareIcon } from '../components/Icons';
import { MachineMode, RentalSession, UserRole } from '../types';
import { MODE_CONFIG } from '../constants';
import { mockBackend } from '../services/mockBackend';

const RentalTimer: React.FC<{ session: RentalSession }> = ({ session }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const durationMs = session.duration * (session.durationUnit === 'HOURS' ? 3600000 : 86400000);
      const endTime = session.startTime + durationMs;
      const remaining = endTime - Date.now();
      
      if (remaining <= 0) {
        setIsExpired(true);
        return '00:00:00';
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((remaining / 1000 / 60) % 60);
      const seconds = Math.floor((remaining / 1000) % 60);

      if (days > 0) return `${days}d ${hours}h ${minutes}m`;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    setTimeLeft(calculate());
    const interval = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(interval);
  }, [session]);

  return (
    <div className={`mb-4 p-3 md:p-4 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-sm relative overflow-hidden transition-colors duration-500 ${isExpired ? 'bg-red-500 text-white' : 'bg-jute-darkBlue text-white shadow-blue-900/20'}`}>
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl pointer-events-none"></div>
        <div className="relative z-10">
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-80 mb-0.5">
                {isExpired ? 'Rental Expired' : 'Rental Time Remaining'}
            </div>
            <div className="font-mono text-xl md:text-2xl font-bold tracking-tight">{timeLeft}</div>
        </div>
        <div className={`relative z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center ${!isExpired && 'animate-pulse'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        </div>
    </div>
  );
};

const RunningControl: React.FC = () => {
  const { machineId } = useParams();
  const { machines, isDark, user } = useApp();
  const navigate = useNavigate();
  const machine = machines.find(m => m.id === machineId);

  const [showPowerConfirm, setShowPowerConfirm] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const lastSpeedRef = useRef(machine?.telemetry.speed || 0);

  if (!machine) return <div className="p-10">Machine not found</div>;

  const isRunning = machine.status === 'RUNNING';
  const isOwner = user?.role === UserRole.OWNER;
  const isRented = machine.rentalStatus === 'RENTED';
  const isLocked = isOwner && isRented;

  const activeConfig = isRunning ? MODE_CONFIG[machine.currentMode] : MODE_CONFIG[MachineMode.IDLE];
  
  const themeColor = activeConfig.hex;
  const bgAlpha = isDark ? '26' : '1A'; 
  const containerStyle = {
    borderColor: themeColor,
    backgroundColor: `${themeColor}${bgAlpha}`,
  };

  const handleToggleRun = () => {
    if (isLocked) return;
    if (navigator.vibrate) navigator.vibrate(80);
    mockBackend.toggleMachineState(machine.id);
  };

  const handleModeChange = (mode: MachineMode) => {
    if (isLocked) return;
    if (navigator.vibrate) navigator.vibrate(80);

    if (mode === MachineMode.POWER && machine.currentMode !== MachineMode.POWER) {
      setShowPowerConfirm(true);
    } else {
      mockBackend.setMode(machine.id, mode);
    }
  };

  const confirmPowerMode = () => {
    if (isLocked) return;
    if (navigator.vibrate) navigator.vibrate(80);
    mockBackend.setMode(machine.id, MachineMode.POWER);
    setShowPowerConfirm(false);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    let newVal = parseInt(e.target.value);
    const oldVal = lastSpeedRef.current;
    
    if (navigator.vibrate) {
        if (newVal > oldVal) {
            const intensity = 15 + (newVal * 0.8);
            navigator.vibrate(Math.floor(intensity));
        } else {
            navigator.vibrate(10);
        }
    }
    lastSpeedRef.current = newVal;
    
    if (machine.currentMode === MachineMode.AUTO) {
       if (newVal > 65) mockBackend.setMode(machine.id, MachineMode.POWER);
       else mockBackend.setMode(machine.id, MachineMode.ECO);
    }

    if (machine.currentMode === MachineMode.ECO && newVal > 65) mockBackend.setMode(machine.id, MachineMode.POWER);
    if (machine.currentMode === MachineMode.POWER && newVal < 50) mockBackend.setMode(machine.id, MachineMode.ECO);

    mockBackend.setSpeed(machine.id, newVal);
  };

  const handleAntiJam = () => {
    if (isLocked || isReversing) return;
    if (navigator.vibrate) navigator.vibrate([80, 50, 80]); 
    
    mockBackend.triggerAntiJam(machine.id);
    setIsReversing(true);
    
    setShowToast(true);
    setTimeout(() => {
        setShowToast(false);
        setIsReversing(false);
    }, 3000);
  };

  return (
    <>
    {/* Anti-Jam Toast Notification */}
    <div className={`fixed top-24 left-0 right-0 z-[100] flex justify-center pointer-events-none transition-all duration-500 ease-in-out ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
        <div className="bg-amber-500 text-white px-6 py-3 rounded-full shadow-2xl shadow-amber-500/40 flex items-center gap-3 backdrop-blur-md">
            <div className="animate-spin duration-1000"><ReverseIcon size={20} /></div>
            <span className="font-bold tracking-wide text-sm">Reversing Motor Sequence Initiated</span>
        </div>
    </div>

    <div className={`mb-4 mt-2 z-20 relative ${!isRunning ? 'max-w-md mx-auto w-full' : ''}`}>
      <button onClick={() => navigate('/')} className="text-sm font-medium opacity-70 hover:opacity-100 flex items-center gap-2 py-2 px-4 bg-gray-100 dark:bg-white/5 rounded-full transition-all duration-300 hover:bg-gray-200 dark:hover:bg-white/10 w-fit shadow-sm">
        <span>←</span>
        <span>Back to Dashboard</span>
      </button>
    </div>

    <div 
        className={`relative transform-gpu transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-2xl overflow-hidden ${isLocked ? 'grayscale' : ''} ${isRunning ? 'w-full min-h-[80vh] rounded-[2rem] md:rounded-[3rem] p-4 md:p-8 border-2 md:border-4 flex flex-col' : 'w-[96%] w-full max-w-md mx-auto h-[55vh] min-h-[460px] max-h-[640px] rounded-[2.5rem] p-6 border-2'}`}
        style={containerStyle}
    >
        {isLocked && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center">
                <ShareIcon size={40} className="text-white opacity-80 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Controls Locked</h3>
                <p className="text-white/80">This machine is currently being operated by a borrower. You can monitor its status in read-only mode.</p>
            </div>
        )}

      {!isRunning ? (
        // STOPPED VIEW
        <div className="relative z-10 flex flex-col h-full animate-fade-in">
           {machine.rentalSession && <RentalTimer session={machine.rentalSession} />}
           <div className="flex flex-col justify-between h-full pb-4">
              <div>
                  <div className="flex items-center gap-2 mb-2 transition-opacity duration-300">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-400" />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500">System Standby</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1 leading-tight transition-colors duration-300">{machine.name}</h1>
                  <p className="text-base md:text-lg opacity-60 transition-colors duration-300">{machine.model}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[10px] md:text-xs font-bold transition-colors duration-300">Last Run: {Math.floor(machine.telemetry.runtime / 60)}m ago</span>
                    <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 transition-colors duration-300 ${machine.telemetry.connectionStatus === 'LIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>{machine.telemetry.connectionStatus}</span>
                  </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-4 my-2">
                  <button onClick={handleToggleRun} className={`group relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-jute-black dark:bg-white text-white dark:text-black shadow-xl shadow-black/20 dark:shadow-white/10 flex items-center justify-center transition-all duration-300 active:scale-95 ${isLocked ? 'cursor-not-allowed' : ''}`}>
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-400/30 animate-[spin_10s_linear_infinite] group-hover:border-emerald-500/50" />
                    <PlayIcon size={32} className="ml-1 group-hover:scale-110 transition-transform duration-300" />
                  </button>
                  <div className="text-xs font-medium opacity-50 uppercase tracking-widest text-center">Tap to Initialize</div>
              </div>
              <div className="text-center opacity-40 text-[10px] md:text-xs">Ensure safety guards are in place.</div>
           </div>
        </div>
      ) : (
        // RUNNING VIEW
        <div className="relative z-10 flex flex-col h-full animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-6 gap-4 shrink-0">
                <div className="w-full">
                  {machine.rentalSession && <RentalTimer session={machine.rentalSession} />}
                  <div className="flex items-center justify-between">
                     <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight transition-colors duration-300">{machine.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`w-2 h-2 rounded-full ${machine.telemetry.connectionStatus === 'LIVE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                           <span className="text-xs font-mono opacity-70 transition-colors duration-300">{machine.telemetry.connectionStatus} • Live Telemetry</span>
                        </div>
                     </div>
                  </div>
                </div>
                <div className={`flex w-full md:w-auto bg-white/50 dark:bg-black/20 backdrop-blur-md p-1 rounded-full border border-black/5 dark:border-white/5 overflow-x-auto shrink-0 scrollbar-hide transition-colors duration-300 ${isLocked ? 'cursor-not-allowed' : ''}`}>
                {[MachineMode.ECO, MachineMode.AUTO, MachineMode.POWER].map((m) => (
                    <button key={m} onClick={() => handleModeChange(m)} className={`flex-1 md:flex-none px-4 py-3 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap ${machine.currentMode === m ? MODE_CONFIG[m].bg + ' text-white shadow-lg scale-100 md:scale-105' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'} ${isLocked ? 'pointer-events-none' : ''}`}>
                    {m}
                    </button>
                ))}
                </div>
            </div>
            <div className="flex flex-col grow gap-6 pb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="flex flex-col items-center justify-center min-h-[160px] shrink-0"><AnalogGauge value={machine.telemetry.rpm} max={3500} label="RPM" unit="RPM" color={activeConfig.hex} size={180}/></div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/50 dark:bg-white/5 p-4 rounded-2xl flex flex-col items-center border border-white/10 transition-colors duration-300"><div className="text-xs opacity-50 uppercase mb-1">Temp</div><div className={`text-lg md:text-xl font-mono font-bold transition-colors duration-300 ${machine.telemetry.motorTemp > 85 ? 'text-red-600 dark:text-red-500' : ''}`}>{Math.round(machine.telemetry.motorTemp)}°C</div></div>
                            <div className="bg-white/50 dark:bg-white/5 p-4 rounded-2xl flex flex-col items-center border border-white/10 transition-colors duration-300"><div className="text-xs opacity-50 uppercase mb-1">Current</div><div className={`text-lg md:text-xl font-mono font-bold transition-colors duration-300 ${machine.telemetry.current > 18 ? 'text-red-600 dark:text-red-500' : ''}`}>{machine.telemetry.current}A</div></div>
                        </div>
                        <button onClick={handleAntiJam} className={`w-full h-16 md:h-20 rounded-3xl border-2 border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center gap-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-300 touch-manipulation active:bg-gray-100 dark:active:bg-white/5 ${isReversing ? 'border-red-500 bg-red-50 text-red-600 animate-pulse' : ''} ${isLocked ? 'cursor-not-allowed pointer-events-none' : ''}`}>
                            <ReverseIcon size={24} className={isReversing ? 'animate-spin' : ''} />
                            <div className="text-left"><div className="font-bold text-sm">{isReversing ? 'REVERSING MOTOR...' : 'ANTI-JAM'}</div><div className="text-[10px] opacity-60 hidden md:block">Reverses motor for 3s (Immediate)</div></div>
                        </button>
                    </div>
                </div>
                <div className="grow" />
                <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-white/20 dark:border-white/10 shadow-lg mt-4 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4"><span className="font-medium opacity-70 text-xs md:text-sm transition-colors duration-300">{machine.currentMode === 'AUTO' ? 'Auto Pilot' : 'Manual Throttle'}</span><span className="font-mono text-xl font-bold transition-colors duration-300">{machine.telemetry.speed}%</span></div>
                    <div className="py-2 md:py-4">
                    <input type="range" min="0" max="100" value={machine.telemetry.speed} onChange={handleSpeedChange} disabled={!isRunning || isLocked} className="w-full h-12 rounded-full appearance-none bg-gray-200 dark:bg-gray-700 slider-thumb-lg mb-4 cursor-pointer touch-none transition-all duration-300" style={{ backgroundImage: `linear-gradient(to right, ${activeConfig.hex}40 0%, transparent 100%)`}}/>
                    <div className="flex justify-between text-xs text-gray-400 px-2 font-medium"><span>0%</span><span className="pl-8 hidden md:inline">Eco Limit (65%)</span><span>100%</span></div>
                    </div>
                    <button onClick={handleToggleRun} disabled={isLocked} className={`mt-2 w-full py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl tracking-widest shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 touch-manipulation bg-white text-red-600 hover:bg-red-50 dark:bg-white/10 dark:text-red-400 border-2 border-transparent hover:border-red-200/50 ${isLocked ? 'cursor-not-allowed' : ''}`}><StopIcon /> STOP</button>
                </div>
            </div>
        </div>
      )}

      {showPowerConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-jute-paper dark:bg-jute-darkPaper p-6 md:p-8 rounded-3xl max-w-sm w-full border border-amber-500 shadow-2xl shadow-amber-500/20 transition-colors duration-300">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 mx-auto"><AlertIcon /></div>
            <h3 className="text-xl md:text-2xl font-bold text-center mb-2 transition-colors duration-300">Engage Power Mode?</h3>
            <p className="text-center text-sm md:text-base text-gray-500 mb-6 transition-colors duration-300">This increases motor output significantly. Ensure input feed is clear. Efficiency may drop.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowPowerConfirm(false)} className="py-3 rounded-xl font-medium hover:bg-black/5 dark:hover:bg-white/5 bg-gray-100 dark:bg-white/5 transition-colors duration-300">Cancel</button>
              <button onClick={confirmPowerMode} className="py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/30 transition-colors duration-300">Confirm</button>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
};

export default RunningControl;