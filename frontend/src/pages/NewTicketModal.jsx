import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export default function NewTicketModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'Medium'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.customer_name.trim() || formData.customer_name.trim().length < 2) {
      newErrors.customer_name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.customer_email.trim() || !emailRegex.test(formData.customer_email.trim())) {
      newErrors.customer_email = 'Please provide a valid email address';
    }

    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    }

    if (!formData.description.trim() || formData.description.trim().length < 5) {
      newErrors.description = 'Please describe the issue in at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await api.createTicket({
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: formData.priority
      });
      // Reset form
      setFormData({
        customer_name: '',
        customer_email: '',
        subject: '',
        description: '',
        priority: 'Medium'
      });
      setErrors({});
      onCreated(res);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Failed to create ticket. Please check details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-xl w-full p-7 shadow-2xl border border-slate-100 transition-all animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create Support Ticket</h2>
            <p className="text-xs text-slate-500 mt-0.5">Submit customer issue into Datastraw CRM</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global API Error */}
        {apiError && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="e.g. John Doe"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                  errors.customer_name
                    ? 'border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
              />
              {errors.customer_name && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.customer_name}</p>
              )}
            </div>

            {/* Customer Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Customer Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                placeholder="e.g. john@example.com"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                  errors.customer_email
                    ? 'border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
              />
              {errors.customer_email && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.customer_email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Subject */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject / Issue Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Cannot log into account"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                  errors.subject
                    ? 'border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
              />
              {errors.subject && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.subject}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Issue Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide complete context, steps to reproduce, or order IDs..."
              className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-all resize-none ${
                errors.description
                  ? 'border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-60 rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Create Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
