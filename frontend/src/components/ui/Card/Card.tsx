import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card: React.FC<CardProps> = ({ padding = 'md', className = '', children, ...props }) => {
  return (
    <div {...props} className={`rounded-xl border border-line bg-surface shadow-card ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};
