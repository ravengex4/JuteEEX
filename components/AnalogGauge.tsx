import React from 'react';

interface AnalogGaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color?: string;
  size?: number;
}

const AnalogGauge: React.FC<AnalogGaugeProps> = ({ 
  value, 
  max, 
  label, 
  unit, 
  color = '#8FABD4', 
  size = 180 
}) => {
  const radius = size / 2;
  const strokeWidth = 12;
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percent = normalizedValue / max;
  
  // Angle logic: -135deg to +135deg
  const startAngle = -135;
  const endAngle = 135;
  const angleRange = endAngle - startAngle;
  const currentAngle = startAngle + (percent * angleRange);

  // Tick marks
  const ticks = Array.from({ length: 9 }).map((_, i) => {
    const tickPercent = i / 8;
    const tickAngle = startAngle + (tickPercent * angleRange);
    const isMajor = i % 2 === 0;
    return {
      angle: tickAngle,
      isMajor
    };
  });

  return (
    <div className="relative flex flex-col items-center justify-center p-2 w-full max-w-[180px]">
      <div className="w-full aspect-square relative">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
          {/* Background Arc */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth={strokeWidth}
            className="text-gray-500 dark:text-gray-400"
          />
          
          {/* Ticks */}
          {ticks.map((tick, i) => (
            <g key={i} transform={`rotate(${tick.angle} ${radius} ${radius})`}>
              <line
                x1={radius}
                y1={strokeWidth * 2}
                x2={radius}
                y2={strokeWidth * (tick.isMajor ? 3.5 : 2.5)}
                stroke="currentColor"
                strokeWidth={tick.isMajor ? 2 : 1}
                className="text-gray-400"
              />
            </g>
          ))}

          {/* Needle Group - Pivots around center using CSS transform */}
          <g 
            className="gauge-needle" 
            style={{ 
              transform: `rotate(${currentAngle}deg)`, 
              transformOrigin: `${radius}px ${radius}px`,
              willChange: 'transform'
            }}
          >
            {/* Center Hub */}
            <circle 
              cx={radius} 
              cy={radius} 
              r={8} 
              style={{ fill: color, transition: 'fill 500ms ease' }} 
              className="shadow-sm" 
            />
            
            {/* Needle Shape - Drawn pointing UP (0deg visual baseline) */}
            <path 
              d={`M${radius - 4} ${radius} L${radius} ${strokeWidth * 2.5} L${radius + 4} ${radius} L${radius} ${radius + 8} Z`} 
              style={{ fill: color, transition: 'fill 500ms ease' }}
            />
          </g>

          {/* Value Text */}
          <text
            x={radius}
            y={size - (size * 0.25)}
            textAnchor="middle"
            className="fill-gray-900 dark:fill-white font-mono font-bold"
            style={{ fontSize: size * 0.22 }}
          >
            {Math.round(value)}
          </text>
          
          {/* Unit Label */}
          <text
            x={radius}
            y={size - (size * 0.12)}
            textAnchor="middle"
            className="fill-gray-400 font-bold uppercase tracking-widest"
            style={{ fontSize: size * 0.08 }}
          >
            {unit}
          </text>
        </svg>
      </div>
    </div>
  );
};

export default AnalogGauge;