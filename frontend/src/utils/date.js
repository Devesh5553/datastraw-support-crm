/**
 * Utility for formatting timestamps in Indian Standard Time (IST)
 */
export function formatIST(isoDateString) {
  if (!isoDateString) return '—';
  try {
    const date = new Date(isoDateString);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (_) {
    return isoDateString;
  }
}

export function formatTimeAgo(isoDateString) {
  if (!isoDateString) return '';
  try {
    const now = new Date();
    const date = new Date(isoDateString);
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch (_) {
    return '';
  }
}
