import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { mockBackend } from '../services/mockBackend';
import { Machine } from '../types';
import { ShareIcon } from '../components/Icons';


const ShareAccess: React.FC = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const { machines } = useApp();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');


  useEffect(() => {
    if(!machineId) return;

    const currentMachine = mockBackend.getMachine(machineId);
    if (currentMachine) {
      setMachine(currentMachine);
      // Only generate a new PIN if one doesn't exist or is expired
      if (!currentMachine.pin || Date.now() > currentMachine.pin.expiry) {
        generateNewPin();
      } else {
        setPin(currentMachine.pin.code);
        setExpiry(currentMachine.pin.expiry);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [machineId]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (expiry) {
        const newTimeLeft = Math.max(0, expiry - Date.now());
        const minutes = Math.floor(newTimeLeft / 60000);
        const seconds = Math.floor((newTimeLeft % 60000) / 1000);
        setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiry]);

  const generateNewPin = async () => {
    if (!machineId) return;
    setIsLoading(true);
    try {
      const { pin, expiry } = await mockBackend.generatePin(machineId);
      setPin(pin);
      setExpiry(expiry);
    } catch (error) {
      console.error("Failed to generate PIN", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getShareableUrl = () => {
    return `${window.location.origin}/#/borrower-access/${machineId}`;
  };
  
  if (!machine) {
    return (
      <div className="text-center p-10">
        {isLoading ? 'Loading machine data...' : 'Machine not found.'}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in pb-20 pt-10 md:pt-24">
      <div className="bg-jute-paper dark:bg-jute-darkPaper rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-soft border border-black/5 dark:border-white/5">
        <div className="text-center">
            <ShareIcon size={32} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold">Share Access for {machine.name}</h1>
            <p className="text-gray-500 text-sm mt-2">
                Generate a temporary PIN to grant someone else control of your machine.
            </p>
        </div>

        <div className="my-8 space-y-4">
            <div className="bg-white dark:bg-black/40 rounded-2xl p-6 text-center border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-jute-darkBlue to-blue-400"></div>
                
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold flex items-center justify-center gap-2">
                    Temporary Access PIN
                </div>
                
                <div className="text-5xl font-mono font-bold tracking-widest text-jute-darkBlue dark:text-jute-lightBlue mb-2">
                    {isLoading ? '...' : pin?.match(/.{1,3}/g)?.join(' ')}
                </div>
                
                {expiry && !isLoading && (
                    <div className="flex items-center justify-center gap-2 text-xs text-red-500 font-medium mb-6">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Expires in {timeLeft}
                    </div>
                )}

                <button 
                    onClick={generateNewPin}
                    disabled={isLoading}
                    className="w-full py-3 bg-gray-50 dark:bg-white/5 text-jute-black dark:text-white rounded-xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/10 disabled:opacity-50"
                >
                    {isLoading ? 'Generating...' : 'Regenerate PIN'}
                </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Shareable URL</label>
                <div className="flex items-center gap-2 mt-1">
                    <input 
                        type="text" 
                        readOnly 
                        value={getShareableUrl()}
                        className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 p-0 border-0 focus:ring-0"
                    />
                    <button 
                        onClick={() => navigator.clipboard.writeText(getShareableUrl())}
                        className="text-xs font-bold bg-white dark:bg-white/10 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                        Copy
                    </button>
                </div>
            </div>
        </div>

        <div className="text-center pt-4 border-t border-gray-200 dark:border-white/10">
             <button onClick={() => navigate('/')} className="text-sm font-medium text-gray-500 hover:text-jute-darkBlue">
                Back to Dashboard
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShareAccess;