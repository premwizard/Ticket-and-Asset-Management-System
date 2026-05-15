/**
 * src/utils/formatters.js
 *
 * Shared formatting utilities for displaying data in the UI.
 * Centralizes all display logic to keep components clean.
 */

/**
 * Format an ISO date string to a human-readable relative time or date.
 * @param {string} dateStr — ISO 8601 date string
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now  = new Date();
  const diffMs   = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs  = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1)    return 'just now';
  if (diffMins < 60)   return `${diffMins}m ago`;
  if (diffHrs  < 24)   return `${diffHrs}h ago`;
  if (diffDays < 7)    return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Truncate a string to a max length and append ellipsis if needed.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export const truncate = (str, maxLen = 80) => {
  if (!str) return '—';
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
};

/**
 * Map a priority value (id or string) to a display label.
 * @param {string|number} priority
 * @returns {string}
 */
export const priorityLabel = (priority) => {
  const map = { 1: 'Low', 2: 'Medium', 3: 'High', low: 'Low', medium: 'Medium', high: 'High' };
  return map[priority] || String(priority) || '—';
};

/**
 * Map a status value (id or string) to a display label.
 * @param {string|number} status
 * @returns {string}
 */
export const statusLabel = (status) => {
  const map = {
    1: 'Open', 2: 'In Progress', 3: 'Closed',
    open: 'Open', 'in-progress': 'In Progress', 'in_progress': 'In Progress', closed: 'Closed',
  };
  return map[status] || String(status) || '—';
};

/**
 * Returns the badge CSS class for a ticket status.
 * @param {string|number} status
 * @returns {string}
 */
export const statusBadgeClass = (status) => {
  const s = String(status).toLowerCase();
  if (s === '1' || s === 'open')                     return 'badge badge-open';
  if (s === '2' || s === 'in-progress' || s === 'in_progress') return 'badge badge-in-progress';
  if (s === '3' || s === 'closed')                   return 'badge badge-closed';
  return 'badge badge-closed';
};

/**
 * Returns the badge CSS class for a ticket priority.
 * @param {string|number} priority
 * @returns {string}
 */
export const priorityBadgeClass = (priority) => {
  const p = String(priority).toLowerCase();
  if (p === '3' || p === 'high')   return 'badge badge-high';
  if (p === '2' || p === 'medium') return 'badge badge-medium';
  return 'badge badge-low';
};

/**
 * Format currency value.
 * @param {number} value
 * @returns {string}
 */
export const formatCurrency = (value) => {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};
