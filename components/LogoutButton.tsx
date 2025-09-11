import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect } from 'react';


export const LogOutButton = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return <button onClick={() => logout()}>Sign Out</button>;
};
