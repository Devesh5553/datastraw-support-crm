import React, { useState, useEffect } from 'react';
import { X, Clock, User, Mail, MessageSquare, AlertTriangle, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { formatIST } from '../utils/date';

export default function TicketDetailModal({ ticketId, isOpen, onClose, onUpdated }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchTicket = async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTicket(ticketId);
      setTicket(data);
    } catch (err) {
      setError(err.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicket();
    } else {
      setTicket(null);
      setNewNote('');
      setActionSuccess(null);
    }
  }, [isOpen, ticketId]);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus) => {
    if (!ticket || ticket.status === newStatus) return;
    setIsUpdatingStatus(true);
    setActionSuccess(null);
    try {
      await api.updateTicket(ticket.ticket_id, { status: newStatus });
      setTicket(prev => ({ ...prev, status: newStatus }));
      setActionSuccess(`Status updated to ${newStatus}`);
      if (onUpdated) onUpdated();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    setActionSuccess(null);
    try {
      const added = await api.addNote(ticket.ticket_id, newNote.trim());
      setTicket(prev => ({
        ...prev,
        notes: [...(prev.notes || []), added]
      }));
      setNewNote('');
      setActionSuccess('Internal note recorded.');
      if (onUpdated) onUpdated();
    } catch (err) {
      alert(`Error adding note: ${err.message}`);
    } finally {
      setIsAddingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full p-7 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] transition-all animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                {ticketId}
              </span>
              {ticket && (
                <>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    ticket.status === 'Open' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    ticket.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {ticket.status}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                    {ticket.priority} Priority
                  </span>
                </>
              )}
            </div>
            {ticket?.is_sla_breached && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SLA Breached: Ticket open for over 24 hours without resolution.</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {actionSuccess && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Content Body */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading ticket data...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">{error}</p>
            <button
              onClick={fetchTicket}
              className="px-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
            >
              Retry
            </button>
          </div>
        ) : ticket && (
          <div className="overflow-y-auto space-y-6 pt-4 pr-1">
            {/* Subject & Description */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {ticket.subject}
              </h3>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/60 border border-slate-100 rounded-2xl p-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Customer</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ticket.customer_name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ticket.customer_email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Timestamps (IST)</span>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Created: {formatIST(ticket.created_at)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span>Updated: {formatIST(ticket.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Status Transition Action Bar */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Manage Status:</span>
                <span className="text-slate-500 text-[11px]">Transition state to update resolution workflow</span>
              </div>
              <div className="flex items-center gap-2">
                {['Open', 'In Progress', 'Closed'].map((s) => (
                  <button
                    key={s}
                    disabled={isUpdatingStatus || ticket.status === s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      ticket.status === s
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Notes & Comments Thread */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Internal Notes & Audit Log ({ticket.notes?.length || 0})</span>
              </div>

              {ticket.notes && ticket.notes.length > 0 ? (
                <div className="space-y-2.5">
                  {ticket.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-700">Support Agent Note</span>
                        <span>{formatIST(note.created_at)}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {note.note_text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  No internal notes recorded yet. Add an update below.
                </div>
              )}

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2 pt-2">
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add an internal note or progress update..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNote.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 active:scale-95 disabled:opacity-50 rounded-xl transition-all shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isAddingNote ? 'Saving...' : 'Add Note'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
