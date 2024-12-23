import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/config/db';
import { User } from '@/models/User';
import mongoose from 'mongoose';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  const existingUser = await User.findById(id);
  if (!existingUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  const referenceArray = existingUser.interests;
  const users = await User.find({});
  const matchCount = (arr: string[]) => arr.filter(element => referenceArray.includes(element)).length;
  const sortedUsers = users.sort((a, b) => matchCount(b.interests) - matchCount(a.interests));

  const plainUsers:any = sortedUsers.map(user => {
    const plainUser = user.toObject();
    plainUser._id = plainUser._id.toString();
    plainUser.teams = plainUser.teams?.map((teamId: mongoose.Types.ObjectId) => teamId.toString());
    plainUser.assignedWorks = plainUser.assignedWorks?.map((work: any) => ({ ...work, team: work.team.toString() }));
    return plainUser;
  });

  return res.status(200).json(plainUsers);
};

export default handler;
