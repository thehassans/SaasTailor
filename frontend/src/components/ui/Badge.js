import React from 'react';

const variants = {
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-700'
};

export const Badge = ({ children, variant = 'primary', className = '' }) => {
  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${variants[variant]}
      ${className}
    `}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { variant: 'warning', label: 'Pending' },
    assigned: { variant: 'info', label: 'Assigned' },
    in_progress: { variant: 'primary', label: 'In Progress' },
    completed: { variant: 'success', label: 'Completed' },
    delivered: { variant: 'gray', label: 'Delivered' },
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'danger', label: 'Inactive' },
    trial: { variant: 'warning', label: 'Trial' },
    yearly: { variant: 'primary', label: 'Yearly' },
    lifetime: { variant: 'success', label: 'Lifetime' }
  };

  const config = statusConfig[status] || { variant: 'gray', label: status };
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default Badge;
