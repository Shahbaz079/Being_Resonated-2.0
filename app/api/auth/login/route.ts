import { NextApiRequest, NextApiResponse } from 'next';
import { signIn } from 'next-auth/react';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password } = req.body;

  try {
    const result = await signIn('credentials', {
      redirect: false,
      callbackUrl: '/',
      email,
      password
    });

    if (result?.error) {
      res.status(401).json({ message: result.error });
    } else {
      res.status(200).json({ message: 'Signed in successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error signing in', error });
  }
};
