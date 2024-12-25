'use client' 

import { useEffect } from 'react';

import { redirect } from 'next/navigation';

import { useAuth } from '@clerk/nextjs';
import {  SignUp } from '@clerk/nextjs';

const Register = () => {
 
  const {userId}=useAuth()

  

  useEffect(() => {
    if (!userId) {
      redirect('/');
    }
  }, [userId]);
  { /*
  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
        router.push('/');
      } else {
        console.error('Error registering:', result.message);
      }
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  const handleSignInGoogle = async () => {
    try {
      const response = await fetch('/api/auth/google', { method: 'POST' });
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
     <SignUp/>
    </div>
  );
};


export default Register;
