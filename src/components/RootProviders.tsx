import { Outlet } from 'react-router';
import { AuthProvider } from '../utils/authContext';
import { UserProvider } from '../utils/userContext';
import { MockModeProvider } from '../utils/mockModeContext';

export function RootProviders() {
  return (
    <MockModeProvider>
      <AuthProvider>
        <UserProvider>
          <Outlet />
        </UserProvider>
      </AuthProvider>
    </MockModeProvider>
  );
}
