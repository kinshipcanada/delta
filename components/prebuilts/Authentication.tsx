// AuthContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { Donor } from '../../system/classes/donor';

type AuthContextType = {
  donor: Donor;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ donor: any; children: ReactNode }> = ({ donor, children }) => {
  return <AuthContext.Provider value={{ donor }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
