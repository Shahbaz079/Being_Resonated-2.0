import { NextApiRequest, NextApiResponse } from 'next';
import { signOut } from 'next-auth/react';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await signOut({ redirect: false });
    res.status(200).json({ message: 'Signed out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error signing out', error });
  }
};
