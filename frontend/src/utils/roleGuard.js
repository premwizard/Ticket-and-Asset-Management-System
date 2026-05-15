/**
 * src/utils/roleGuard.js
 *
 * Utility functions for role-based access control (RBAC) on the frontend.
 * These mirror the backend's RBAC rules and are used to show/hide UI elements.
 *
 * IMPORTANT: Frontend RBAC is for UX only — never rely on it for security.
 * The backend always enforces actual authorization.
 */

/** Returns true if the current user has admin privileges */
export const isAdmin = (user) => user?.role === 'admin';

/** Returns true if the current user can edit/delete (admin only) */
export const canEdit = (user) => isAdmin(user);

/** Returns true if the user can create tickets or assets (all authenticated users) */
export const canCreate = (user) => Boolean(user);

/**
 * Returns the display label for a role string
 * @param {string} role
 * @returns {string}
 */
export const roleLabel = (role) => {
  const labels = {
    admin: 'Administrator',
    user: 'User',
  };
  return labels[role] || role || 'Unknown';
};

/**
 * Returns Tailwind classes for the role badge
 * @param {string} role
 * @returns {string}
 */
export const roleBadgeClass = (role) => {
  if (role === 'admin') return 'bg-purple-100 text-purple-700';
  return 'bg-blue-100 text-blue-700';
};
