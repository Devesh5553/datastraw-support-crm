/**
 * API client for Datastraw Support CRM
 * Interfaces with FastAPI backend at /api/tickets
 */

const API_BASE = '/api';

/**
 * Helper to unwrap error messages from FastAPI responses (handling both 422 and standard details)
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.detail)) {
        // Pydantic 422 validation errors array
        errorMessage = errorData.detail.map(d => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}`).join(', ');
      } else if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (_) {
      // response wasn't JSON
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export const api = {
  /**
   * Fetch all tickets with optional status filter, search query, or SLA breach filter
   */
  async getTickets({ status = '', search = '', sla_breached = null } = {}) {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search && search.trim()) params.append('search', search.trim());
    if (sla_breached !== null) params.append('sla_breached', sla_breached);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/tickets${queryString}`);
    return handleResponse(res);
  },



  /**
   * Fetch detailed view of a single ticket by ticket_id (e.g. TKT-001)
   */
  async getTicket(ticketId) {
    const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(ticketId)}`);
    return handleResponse(res);
  },

  /**
   * Create a new ticket
   * payload: { customer_name, customer_email, subject, description, priority }
   */
  async createTicket(payload) {
    const res = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  /**
   * Update ticket status, priority, or append an internal note atomically
   * payload: { status?, notes?, priority? }
   */
  async updateTicket(ticketId, payload) {
    const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(ticketId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  /**
   * Add an internal note to a ticket
   */
  async addNote(ticketId, noteText) {
    const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(ticketId)}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note_text: noteText })
    });
    return handleResponse(res);
  }
};
