import { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcryptjs';
import connectDB from '@/config/db';
import { User } from '@/models/User';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please fill all the details' });
  }

  try {
    await connectDB();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return res.status(500).json({ message: 'Database connection failed' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    console.log('User created successfully:', newUser);
    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Registration failed', error });
  }
};
