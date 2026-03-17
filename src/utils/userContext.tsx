import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './authContext';

export type UserRole = 'devops' | 'delivery' | 'client';

export interface User {
  id: string;
  userId: number;
  name: string;
  role: UserRole;
  clientId?: number; // Only for client users — maps to the client record's clientId
}

interface UserContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

// Map user IDs to client IDs (userId → clientId)
// This bridges the user account table to the client record table
const userToClientMap: Record<number, number> = {
  3: 1,  // client_acme (userId 3) → Acme Corporation (clientId 1)
  6: 2,  // client_global (userId 6) → Global Tech Industries (clientId 2)
  7: 3,  // client_innovate (userId 7) → Innovate Solutions (clientId 3)
};

const defaultUser: User = {
  id: 'user-1',
  userId: 1,
  name: 'DevOps Admin',
  role: 'devops'
};

function convertAuthToUser(user: any): User {
  if (!user) return defaultUser;

  const roleMap: Record<string, UserRole> = {
    'DevOps': 'devops',
    'Delivery': 'delivery',
    'Client': 'client'
  };

  return {
    id: user.userId.toString(),
    userId: user.userId,
    name: `${user.firstName} ${user.lastName}`,
    role: roleMap[user.role] || 'client',
    clientId: user.role === 'Client' ? userToClientMap[user.userId] ?? user.userId : undefined
  };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [currentUser, setCurrentUser] = useState<User>(() => convertAuthToUser(user));

  // Sync when auth user changes (login / logout / role switch)
  useEffect(() => {
    setCurrentUser(convertAuthToUser(user));
  }, [user]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    // Fallback for HMR/refresh edge cases — return a safe default
    return { currentUser: defaultUser, setCurrentUser: () => {} } as UserContextType;
  }
  return context;
}

// Predefined users for demo
export const demoUsers: User[] = [
  {
    id: 'user-1',
    userId: 1,
    name: 'DevOps Admin',
    role: 'devops'
  },
  {
    id: 'user-2',
    userId: 2,
    name: 'Delivery Manager',
    role: 'delivery'
  },
  {
    id: 'user-3',
    userId: 3,
    name: 'Acme Corporation',
    role: 'client',
    clientId: 1
  },
  {
    id: 'user-4',
    userId: 6,
    name: 'Global Tech Industries',
    role: 'client',
    clientId: 2
  }
];