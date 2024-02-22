// AuthContext.tsx
import { Donor } from '@prisma/client';
import { createContext, useContext, ReactNode } from 'react';

type AuthContextType = {
  donor?: Donor;
  authReloadStatus: boolean;
  triggerAuthReload: (value: boolean) => void;
  authContextLoading: boolean;
};

type AuthProviderContextType = AuthContextType & {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderContextType> = ({ donor, authReloadStatus, triggerAuthReload, authContextLoading, children }) => {
  return <AuthContext.Provider value={{ donor, authReloadStatus, triggerAuthReload, authContextLoading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
