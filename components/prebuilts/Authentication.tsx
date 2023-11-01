// AuthContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { Donor } from '../../system/classes/donor';
import { Donation } from '../../system/classes/donation';

type AuthContextType = {
  donor: Donor;
  triggerAuthReload: (value: boolean) => void;
  donorDonations: Donation[];
  authContextLoading: boolean;
};

type AuthProviderContextType = AuthContextType & {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderContextType> = ({ donor, triggerAuthReload, donorDonations, authContextLoading, children }) => {
  return <AuthContext.Provider value={{ donor, triggerAuthReload, donorDonations, authContextLoading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
