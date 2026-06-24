import { useApp } from '../context/AppContext';

/**
 * Authentication hook. Wraps the relevant slice of AppContext so screens can
 * import a focused API.
 */
export function useAuth() {
  const { user, isAuthenticated, login, register, updateProfile, logout } = useApp();
  return { user, isAuthenticated, login, register, updateProfile, logout };
}
