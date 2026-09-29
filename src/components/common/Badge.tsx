import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'appointment' | 'invoice' | 'stock' | 'role';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'appointment', size = 'sm' }) => {
  const getStyle = () => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'checked in':
      case 'partial':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'scheduled':
      case 'pending':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'cancelled':
      case 'unpaid':
      case 'overdue':
      case 'low stock':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'in stock':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'admin':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'dentist':
        return 'text-teal-700 bg-teal-50 border-teal-200';
      case 'trainee':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'receptionist':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${getStyle()} ${sizeClasses} whitespace-nowrap`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status.toLowerCase() === 'completed' || status.toLowerCase() === 'paid' || status.toLowerCase() === 'in stock'
            ? 'bg-emerald-500'
            : status.toLowerCase() === 'checked in' || status.toLowerCase() === 'partial'
            ? 'bg-sky-500'
            : status.toLowerCase() === 'scheduled' || status.toLowerCase() === 'pending'
            ? 'bg-indigo-500'
            : status.toLowerCase() === 'cancelled' || status.toLowerCase() === 'overdue' || status.toLowerCase() === 'low stock'
            ? 'bg-rose-500'
            : 'bg-slate-400'
        }`}
      />
      {status}
    </span>
  );
};
