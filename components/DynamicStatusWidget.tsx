import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Machine, MachineMode } from '../types';
import { PlayIcon, StopIcon } from './Icons';
import { MODE_CONFIG } from '../constants';
import { useApp } from '../App';

interface DynamicStatusWidgetProps {
  machines: Machine[];
}

const DynamicStatusWidget: React.FC<DynamicStatusWidgetProps> = ({ machines }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [manualSelectionId, setManualSelectionId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleMachineState } = useApp();
  const touchStartY = useRef<number | null>(null);

  // Close on route change
  useEffect(() => {
    setIsExpanded(false);
    setManualSelectionId(null);
  }, [location.pathname]);

  const currentPathId = location.pathname.split('/run/')[1];

  // Logic to determine which machine to display
  // Priority: Manual Selection > URL Context > First Running > First Available
  const primaryMachine = useMemo(() => {
    if (manualSelectionId) {
      const m = machines.find(m => m.id === manualSelectionId);
      if (m) return m;
    }

    if (currentPathId) {
      const m = machines.find(m => m.id === currentPathId);
      if (m) return m;
    }

    return machines.find(m => m.status === 'RUNNING') || machines[0];
  }, [machines, manualSelectionId, currentPathId]);

  // Only show if at least one machine is actively running
  const hasRunningMachine = machines.some(m => m.status === 'RUNNING');
  
  // Determined if we should render content, but DO NOT return early yet
  const shouldRender = hasRunningMachine && !!primaryMachine;

  // Safe access to mode config with fallback
  const modeConfig = (shouldRender && primaryMachine) 
    ? MODE_CONFIG[primaryMachine.currentMode] 
    : MODE_CONFIG[MachineMode.IDLE];

  // Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    // Swipe Up > 30px -> Expand
    if (diff > 30) {
      setIsExpanded(true);
    }
    // Swipe Down > 30px -> Collapse
    else if (diff < -30) {
      setIsExpanded(false);
    }
    touchStartY.current = null;
  };

  const navigateToMachine = (id: string) => {
    navigate(`/run/${id}`);
    setIsExpanded(false);
  };

  const handleToggleState = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (primaryMachine) {
        if (navigator.vibrate) navigator.vibrate(80);
        toggleMachineState(primaryMachine.id);
    }
  };

  // Click handler for the main widget container
  const handleWidgetClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleMachineSwitch = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setManualSelectionId(id);
  };

  // Safe return at the end
  if (!shouldRender || !primaryMachine) return null;

  return (
    <>
      {/* Backdrop for Expanded State */}
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsExpanded(false)}
      />

      {/* Widget Container */}
      <div 
        className="fixed left-0 right-0 z-[60] flex justify-center pointer-events-none lg:!bottom-6"
        style={{ bottom: 'calc(65px + env(safe-area-inset-bottom))' }} 
      >
        <div
            className="pointer-events-auto touch-pan-x"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleWidgetClick}
        >
            <div 
                className={`
                    relative flex flex-col justify-end
                    transition-all duration-500 ease-in-out
                    overflow-hidden
                    mx-auto
                    ${isExpanded 
                        ? 'w-80 h-80 rounded-[2rem] border border-white/20 bg-jute-paper dark:bg-zinc-900 shadow-2xl shadow-black/50' 
                        : 'w-72 h-2 rounded-[2rem] cursor-pointer bg-transparent shadow-none'
                    }
                `}
                style={{ willChange: 'width, height' }}
            >
                
                {/* Compact Indicator (Visible when collapsed) */}
                <div 
                    className={`absolute bottom-0 left-0 right-0 h-full w-full transition-opacity duration-300 ${isExpanded ? 'opacity-0' : 'opacity-100'}`}
                >
                    <div 
                        className={`w-full h-full rounded-[2rem] animate-pulse transition-colors duration-300`} 
                        style={{ 
                            backgroundColor: modeConfig.hex,
                            boxShadow: `0 -2px 12px ${modeConfig.hex}, 0 0 6px ${modeConfig.hex}` 
                        }}
                    />
                </div>

                {/* Expanded Content */}
                <div className={`flex flex-col w-full h-full px-5 pt-5 pb-4 transition-all duration-300 ${isExpanded ? 'opacity-100 delay-75' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2 shrink-0">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                             <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]`} style={{ backgroundColor: modeConfig.hex }}></span>
                             Status Monitor
                        </span>
                        {/* Drag Handle Visual */}
                        <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/10" /> 
                    </div>

                    {/* Active Machine Info (Large) */}
                    <div 
                        className="flex items-center gap-5 my-auto p-4 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors shrink-0 border border-gray-100 dark:border-white/5 shadow-sm cursor-pointer"
                        onClick={(e) => {
                             e.stopPropagation();
                             navigateToMachine(primaryMachine.id);
                        }}
                    >
                        {/* Toggle Button */}
                        <button 
                            className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 hover:scale-105 active:scale-90 transition-all z-20`} 
                            style={{ backgroundColor: modeConfig.hex }}
                            onClick={handleToggleState}
                        >
                            {primaryMachine.status === 'RUNNING' ? <StopIcon size={28} /> : <PlayIcon size={28} />}
                        </button>
                        
                        {/* Info Area */}
                        <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-bold leading-none truncate text-gray-900 dark:text-white">{primaryMachine.name}</h3>
                            <div className="text-sm opacity-60 mt-1.5 flex items-center gap-2">
                                <span className="font-mono">{Math.round(primaryMachine.telemetry.rpm)} RPM</span>
                                <span>•</span>
                                <span className="font-bold">{primaryMachine.currentMode}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Switcher / Carousel */}
                    <div className="mt-4 flex flex-col gap-2 shrink-0">
                        <div className="text-[10px] font-bold text-gray-400 uppercase px-1 shrink-0">Switch Machine</div>
                        <div 
                            className="flex gap-3 overflow-x-auto pb-2 -mx-5 pl-7 pr-6 scrollbar-hide snap-x items-center touch-pan-x"
                            onTouchStart={(e) => e.stopPropagation()} 
                        >
                            {machines.map(m => (
                                <button
                                    key={m.id}
                                    onClick={(e) => handleMachineSwitch(e, m.id)}
                                    className={`
                                        snap-start
                                        shrink-0
                                        h-10 px-6 rounded-xl text-xs font-bold whitespace-nowrap border transition-all active:scale-95 flex items-center
                                        ${m.id === primaryMachine.id 
                                            ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-lg ring-2 ring-offset-2 ring-black dark:ring-white ring-offset-jute-paper dark:ring-offset-zinc-900' 
                                            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
                                        }
                                    `}
                                >
                                    {m.name}
                                </button>
                            ))}
                            <div className="w-2 shrink-0" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Extended Hit Area */}
            {!isExpanded && <div className="absolute -top-6 -bottom-6 -left-8 -right-8 z-10" />}
        </div>
      </div>
    </>
  );
};

export default DynamicStatusWidget;