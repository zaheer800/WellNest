import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'caution' | 'critical';
type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'indigo';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  caution: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700 animate-pulse',
};

const colorClasses: Record<BadgeColor, string> = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
  indigo: 'bg-indigo-100 text-indigo-700',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

const Badge: React.FC<BadgeProps> = ({
  label,
  variant,
  color = 'gray',
  size = 'sm',
}) => (
  <span
    className={[
      'inline-flex items-center font-medium rounded-full',
      variant ? variantClasses[variant] : colorClasses[color],
      sizeClasses[size],
    ].join(' ')}
  >
    {label}
  </span>
);

export default Badge;
