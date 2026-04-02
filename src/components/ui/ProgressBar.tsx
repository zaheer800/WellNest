import React from 'react';

type BarColor = 'indigo' | 'green' | 'yellow' | 'red';
type BarHeight = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number;
  color?: BarColor;
  height?: BarHeight;
  showLabel?: boolean;
  label?: string;
}

const colorClasses: Record<BarColor, string> = {
  indigo: 'bg-indigo-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
};

const heightClasses: Record<BarHeight, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'indigo',
  height = 'md',
  showLabel = false,
  label,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-xs font-medium text-gray-600">{label}</span>
          )}
          {showLabel && (
            <span className="text-xs font-semibold text-gray-700 ml-auto">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div
        className={['w-full bg-gray-100 rounded-full overflow-hidden', heightClasses[height]].join(
          ' '
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={[
            'rounded-full transition-all duration-500 ease-out',
            colorClasses[color],
            heightClasses[height],
          ].join(' ')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
