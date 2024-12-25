import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';


export const LogOutButton = () => {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut({ redirectUrl: '/' });
  }, [signOut]);

  return <button onClick={() => signOut({ redirectUrl: '/' })}>Sign Out</button>;
};
