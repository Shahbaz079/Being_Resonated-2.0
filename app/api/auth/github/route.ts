import { NextApiRequest, NextApiResponse } from 'next';
import { signIn } from 'next-auth/react';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await signIn('github');
    res.status(200).json({ message: 'Signed in with GitHub' });
  } catch (error) {
    res.status(500).json({ message: 'Error signing in with GitHub', error });
  }
};
