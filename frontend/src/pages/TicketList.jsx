import React, { useState, useEffect, useMemo } from 'react';
import { Plus, RefreshCw, AlertTriangle, CheckCircle, LifeBuoy, Inbox, Layers } from 'lucide-react';
import { api } from '../api/client';
import SearchBar from '../components/SearchBar';
import StatusFilter from '../components/StatusFilter';
import TicketCard from '../components/TicketCard';
import NewTicketModal from './NewTicketModal';
import TicketDetailModal from './TicketDetailModal';

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Toast alert
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTickets({
        status: statusFilter,
        search: search
      });
      setTickets(data);
    } catch (err) {
      setError(err.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch whenever search or status filter changes
  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter]);

  // Compute status counts
  const counts = useMemo(() => {
    const res = { All: tickets.length, Open: 0, 'In Progress': 0, Closed: 0, SLA_Breached: 0 };
    tickets.forEach(t => {
      if (res[t.status] !== undefined) res[t.status]++;
      if (t.is_sla_breached) res.SLA_Breached++;
    });
    return res;
  }, [tickets]);

  const handleTicketCreated = (res) => {
    showToast(`Ticket ${res.ticket_id} created successfully!`);
    fetchTickets();
  };

  const handleTicketUpdated = () => {
    fetchTickets();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-7">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-slate-700">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <LifeBuoy className="w-4 h-4" />
            <span>Support Helpdesk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Datastraw CRM
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage customer support inquiries, SLA breaches, and real-time team collaboration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 shadow-sm transition-all"
            title="Refresh tickets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-2xl border shadow-sm cursor-pointer transition-all ${
            statusFilter === 'All' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${statusFilter === 'All' ? 'text-slate-400' : 'text-slate-400'}`}>Total</span>
          <div className={`text-2xl font-black mt-1 ${statusFilter === 'All' ? 'text-white' : 'text-slate-900'}`}>{counts.All}</div>
        </div>

        <div
          onClick={() => setStatusFilter('Open')}
          className={`p-4 rounded-2xl border shadow-sm cursor-pointer transition-all ${
            statusFilter === 'Open' ? 'bg-blue-600 text-white border-blue-500' : 'bg-white border-blue-100 hover:border-blue-300'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${statusFilter === 'Open' ? 'text-blue-100' : 'text-blue-600'}`}>Open</span>
          <div className={`text-2xl font-black mt-1 ${statusFilter === 'Open' ? 'text-white' : 'text-blue-600'}`}>{counts.Open}</div>
        </div>

        <div
          onClick={() => setStatusFilter('In Progress')}
          className={`p-4 rounded-2xl border shadow-sm cursor-pointer transition-all ${
            statusFilter === 'In Progress' ? 'bg-amber-600 text-white border-amber-500' : 'bg-white border-amber-100 hover:border-amber-300'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${statusFilter === 'In Progress' ? 'text-amber-100' : 'text-amber-600'}`}>In Progress</span>
          <div className={`text-2xl font-black mt-1 ${statusFilter === 'In Progress' ? 'text-white' : 'text-amber-600'}`}>{counts['In Progress']}</div>
        </div>

        <div
          onClick={() => setStatusFilter('SLA Breached')}
          className={`p-4 rounded-2xl border shadow-sm cursor-pointer transition-all ${
            statusFilter === 'SLA Breached'
              ? 'bg-rose-600 text-white border-rose-500 ring-2 ring-rose-500/20'
              : counts.SLA_Breached > 0
              ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider ${statusFilter === 'SLA Breached' ? 'text-rose-100' : 'text-rose-600'}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>SLA Breached (&gt;24h)</span>
          </div>
          <div className={`text-2xl font-black mt-1 ${statusFilter === 'SLA Breached' ? 'text-white' : 'text-rose-600'}`}>{counts.SLA_Breached}</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        <SearchBar
          value={search}
          onChange={setSearch}
        />
        <StatusFilter
          activeStatus={statusFilter}
          onChange={setStatusFilter}
          counts={{
            All: counts.All,
            Open: counts.Open,
            'In Progress': counts['In Progress'],
            Closed: counts.Closed
          }}
        />
      </div>

      {/* Main Ticket Grid / State Handling */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="w-16 h-5 bg-slate-200 rounded-md" />
                <div className="w-12 h-5 bg-slate-200 rounded-full" />
              </div>
              <div className="w-3/4 h-5 bg-slate-200 rounded" />
              <div className="w-1/2 h-3 bg-slate-100 rounded" />
              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <div className="w-20 h-3 bg-slate-100 rounded" />
                <div className="w-10 h-3 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Connection Error</h3>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchTickets}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl"
          >
            Retry Connection
          </button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="max-w-xs mx-auto">
            <h3 className="text-base font-bold text-slate-800">No Tickets Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {search || statusFilter !== 'All'
                ? "No support tickets matched your search or status filter. Try clearing filters."
                : "No customer support inquiries logged yet. Click below to create the first ticket."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {(search || statusFilter !== 'All') && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('All'); }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20"
            >
              Create Ticket
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.ticket_id}
              ticket={ticket}
              onClick={() => setSelectedTicketId(ticket.ticket_id)}
            />
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      <NewTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleTicketCreated}
      />

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticketId={selectedTicketId}
        isOpen={Boolean(selectedTicketId)}
        onClose={() => setSelectedTicketId(null)}
        onUpdated={handleTicketUpdated}
      />
    </div>
  );
}
