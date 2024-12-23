'use client'
import { useEffect } from 'react';
import { SignIn } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

const Login = () => {
  
  const {userId}=useAuth();

  useEffect(() => {
    if (!userId) {
      redirect('/');
    }
  }, [userId]);


  {
    /*
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
        router.push('/');
      } else {
        console.error('Error logging in:', result.message);
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleSignInGithub = async () => {
    try {
      const response = await fetch('/api/auth/github-signin', { method: 'POST' });
      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
      } else {
        console.error('Error signing in with GitHub:', result.message);
      }
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
    }
  };

  const handleSignInGoogle = async () => {
    try {
      const response = await fetch('/api/auth/google-signin', { method: 'POST' });
      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
      } else {
        console.error('Error signing in with Google:', result.message);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

*/}

  return (
    <div className="w-[40vw] mx-32 my-10 rounded-none md:rounded-2xl p-10 md:p-8 shadow-input bg-white dark:bg-black">
      <SignIn />
    </div>
  );
};


export default Login;
