import React from 'react';
import { AlertTriangle } from 'lucide-react';

const STATUS_OPTIONS = [
  { label: 'All Tickets', value: 'All' },
  { label: 'Open', value: 'Open' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Closed', value: 'Closed' },
  { label: 'SLA Breached', value: 'SLA Breached', isAlert: true }
];

export default function StatusFilter({ activeStatus, onChange, counts = {} }) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 overflow-x-auto">
      {STATUS_OPTIONS.map((opt) => {
        const isActive = activeStatus === opt.value;
        const count = counts[opt.value];

        let activeStyle = 'bg-white text-blue-700 shadow-sm border border-slate-200/80';
        let badgeStyle = isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600';

        if (opt.isAlert) {
          activeStyle = isActive
            ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/20'
            : 'text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/60';
          badgeStyle = isActive ? 'bg-white/20 text-white' : 'bg-rose-200/60 text-rose-800';
        }

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
              isActive && !opt.isAlert ? activeStyle : !isActive ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60' : activeStyle
            }`}
          >
            {opt.isAlert && <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{opt.label}</span>
            {count !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle}`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
