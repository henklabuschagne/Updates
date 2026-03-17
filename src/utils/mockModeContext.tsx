import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MockModeContextType {
  isMockMode: boolean;
  toggleMockMode: () => void;
  setMockMode: (enabled: boolean) => void;
}

const MockModeContext = createContext<MockModeContextType | undefined>(undefined);

export function MockModeProvider({ children }: { children: ReactNode }) {
  // Check localStorage for mock mode preference, default to true for demo
  const [isMockMode, setIsMockMode] = useState(() => {
    const saved = localStorage.getItem('app_mock_mode');
    // Default to true (mock mode) if not set
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('app_mock_mode', String(isMockMode));
  }, [isMockMode]);

  const toggleMockMode = () => {
    setIsMockMode(prev => !prev);
  };

  const setMockMode = (enabled: boolean) => {
    setIsMockMode(enabled);
  };

  return (
    <MockModeContext.Provider
      value={{
        isMockMode,
        toggleMockMode,
        setMockMode,
      }}
    >
      {children}
    </MockModeContext.Provider>
  );
}

export function useMockMode() {
  const context = useContext(MockModeContext);
  if (context === undefined) {
    // Fallback for HMR/refresh edge cases — default to mock mode
    return { isMockMode: true, toggleMockMode: () => {}, setMockMode: () => {} } as MockModeContextType;
  }
  return context;
}