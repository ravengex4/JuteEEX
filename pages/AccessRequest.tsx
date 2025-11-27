import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { Machine } from '../types';
import { WifiIcon, ShareIcon } from '../components/Icons';

const AccessRequest: React.FC = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  
  const [machine, setMachine] = useState<Machine | null>(null);
  const [duration, setDuration] = useState<number>(1);
  const [unit, setUnit] = useState<'HOURS' | 'DAYS'>('HOURS');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (machineId) {
      const m = mockBackend.getMachine(machineId);
      if (m) {
        setMachine(m);
      }
    }
    setIsLoading(false);
  }, [machineId]);

  const handlePinChange = (index: number, value: string) => {
    if (!/^[0-9]$/.test(value) && value !== '') return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    
    if (value && index < 5) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  };

  const handleAccessRequest = async () => {
    if (pin.some(p => p === '') || !machineId) {
      setError('Please enter the full 6-digit PIN.');
      return;
    }
    
    setIsValidating(true);
    setError(null);

    try {
      const success = await mockBackend.validateAndActivate(
        machineId,
        pin.join(''),
        duration,
        unit
      );

      if (success) {
        navigate(`/run/${machineId}`);
      } else {
        setError('Invalid PIN or the PIN has expired. Please try again.');
        setPin(['', '', '', '', '', '']);
        document.getElementById('pin-0')?.focus();
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };
  
  if (isLoading) return <div className="p-10 text-center">Loading...</div>
  if (!machine) return <div className="p-10 text-center">Machine not found.</div>

  return (
    <div className="max-w-xl mx-auto animate-fade-in pb-20 pt-10 px-4 md:px-0 md:pt-24">
      <div className="bg-jute-paper dark:bg-jute-darkPaper rounded-3xl p-6 md:p-8 shadow-soft border border-black/5 dark:border-white/5 relative overflow-hidden">
        
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-2xl flex items-center gap-4 mb-8 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                <WifiIcon size={24} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{machine.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Ready for Access</span>
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">
                    Desired Rental Duration
                </label>
                <div className="relative flex items-center justify-center gap-6">
                    <button 
                        onClick={() => setDuration(Math.max(1, duration - 1))}
                        className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-2xl font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors active:scale-95"
                    >
                        -
                    </button>
                    <div className="w-32 text-center">
                        <span className="text-6xl font-mono font-bold text-jute-darkBlue dark:text-white tracking-tighter">{duration}</span>
                        <span className="text-xs font-bold text-gray-400 block mt-2 tracking-widest uppercase">{unit}</span>
                    </div>
                    <button 
                        onClick={() => setDuration(duration + 1)}
                        className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-2xl font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors active:scale-95"
                    >
                        +
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">
                    Enter 6-Digit PIN
                </label>
                <div className="flex justify-center gap-1 md:gap-2 mb-2">
                   {pin.map((digit, idx) => (
                     <input
                       key={idx}
                       id={`pin-${idx}`}
                       type="text"
                       inputMode="numeric"
                       maxLength={1}
                       value={digit}
                       onChange={(e) => handlePinChange(idx, e.target.value)}
                       className="w-10 h-14 md:w-12 md:h-16 text-center text-xl md:text-2xl font-bold bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 focus:border-jute-darkBlue focus:ring-2 focus:ring-jute-darkBlue/20 outline-none transition-all dark:text-white"
                     />
                   ))}
                </div>
                {error && <p className="text-center text-xs text-red-500 mt-2">{error}</p>}
            </div>

            <button 
                onClick={handleAccessRequest}
                disabled={isValidating}
                className="w-full py-5 bg-jute-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg shadow-xl shadow-black/10 dark:shadow-white/5 active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-70"
            >
                {isValidating ? (
                    <>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Validating...
                    </>
                ) : (
                    <>
                       Activate & Start <ShareIcon size={20} />
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AccessRequest;