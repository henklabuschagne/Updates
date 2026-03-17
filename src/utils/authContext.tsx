import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, UserDto } from '../services/api';
import { useMockMode } from './mockModeContext';

interface AuthContextType {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isMockMode } = useMockMode();

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          const storedUser = apiClient.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // Try to get current user from API
            const currentUser = await apiClient.getCurrentUser();
            setUser(currentUser);
          }
        } else if (isMockMode) {
          // Auto-login as admin in mock mode
          try {
            const response = await apiClient.login({ 
              username: 'devops_admin', 
              password: 'demo' 
            });
            setUser(response.user);
          } catch (error) {
            console.error('Auto-login failed:', error);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [isMockMode]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.login({ username, password });
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Fallback for HMR/refresh edge cases
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: async () => {},
      logout: async () => {},
      refreshUser: async () => {},
    } as AuthContextType;
  }
  return context;
}