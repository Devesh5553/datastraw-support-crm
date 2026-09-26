import React from 'react';
import { Clock, MessageSquare, AlertTriangle, ArrowRight, User } from 'lucide-react';
import { formatIST, formatTimeAgo } from '../utils/date';

export default function TicketCard({ ticket, onClick }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/10';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/10';
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/10';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100/80 text-rose-800 font-bold';
      case 'High':
        return 'bg-orange-100/80 text-orange-800 font-semibold';
      case 'Medium':
        return 'bg-sky-100/80 text-sky-800 font-medium';
      case 'Low':
        return 'bg-slate-100 text-slate-600 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 font-medium';
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white border border-slate-200/80 hover:border-blue-400/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Meta Header */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 tracking-tight">
              {ticket.ticket_id}
            </span>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getStatusBadge(ticket.status)} font-semibold`}>
              {ticket.status}
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-md ${getPriorityBadge(ticket.priority)}`}>
              {ticket.priority || 'Medium'}
            </span>
          </div>

          {/* SLA Alert Badge */}
          {ticket.is_sla_breached && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>SLA Breached ({ticket.sla_hours_elapsed ? `${ticket.sla_hours_elapsed}h open` : '&gt;24h'})</span>
            </div>
          )}
        </div>

        {/* Subject */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5">
          {ticket.subject}
        </h3>

        {/* Customer Information */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1 font-medium text-slate-700">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{ticket.customer_name}</span>
          </div>
          <span>•</span>
          <span className="text-slate-400 truncate max-w-[200px]">{ticket.customer_email}</span>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" title={`Created: ${formatIST(ticket.created_at)}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimeAgo(ticket.created_at) || formatIST(ticket.created_at)}</span>
          </div>
          {ticket.notes_count > 0 && (
            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>{ticket.notes_count} note{ticket.notes_count !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
