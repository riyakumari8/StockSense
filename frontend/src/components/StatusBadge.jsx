import React from 'react';
import {
  FileEdit,
  PackageCheck,
  Box,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const getBadgeConfig = (statusKey) => {
    switch (statusKey) {
      case 'DRAFT':
        return {
          label: 'Draft',
          icon: FileEdit,
          classes: 'bg-slate-100 text-slate-700 border-slate-300'
        };
      case 'PICKED':
        return {
          label: 'Picked',
          icon: PackageCheck,
          classes: 'bg-sky-50 text-sky-700 border-sky-300'
        };
      case 'PACKED':
        return {
          label: 'Packed',
          icon: Box,
          classes: 'bg-amber-50 text-amber-800 border-amber-300'
        };
      case 'VALIDATED':
        return {
          label: 'Validated',
          icon: CheckCircle2,
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-300'
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          icon: XCircle,
          classes: 'bg-rose-50 text-rose-700 border-rose-300'
        };
      default:
        return {
          label: statusKey || 'Unknown',
          icon: HelpCircle,
          classes: 'bg-slate-100 text-slate-600 border-slate-200'
        };
    }
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : size === 'lg'
    ? 'px-3.5 py-1.5 text-sm font-semibold'
    : 'px-2.5 py-1 text-xs font-medium';

  const iconSizes = size === 'sm' ? 'w-3 h-3 mr-1' : size === 'lg' ? 'w-4 h-4 mr-1.5' : 'w-3.5 h-3.5 mr-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border shadow-xs ${config.classes} ${sizeClasses}`}>
      <Icon className={iconSizes} />
      <span>{config.label}</span>
    </span>
  );
}
