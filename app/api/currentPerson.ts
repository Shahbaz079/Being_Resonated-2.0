import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/config/db';
import { User } from '@/models/User';
import mongoose from 'mongoose';




 export interface objectUser {
  _id:string,
   name: string;
    email: string;
     dob?: Date; 
     gradYear?: number;
      password?: string;
       image?: string;
        interests?: string[]; 
        teams?:string[];
         assignedWorks?: { work?: string; 
          completionDate: Date; 
          team: mongoose.Schema.Types.ObjectId; }[];
           role?: string; 
           authProviderId?: string;
            createdAt?: Date;
             updatedAt?: Date;}
             

            

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  const existingUser :mongoose.Document |null= await User.findById(id);
  if (!existingUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  const plainUser:objectUser= existingUser.toObject();
  plainUser._id = plainUser._id.toString();
  plainUser.teams = plainUser.teams?.map((teamId:string) => teamId.toString()) ?? []
 

  return res.status(200).json(plainUser);
};

export default handler;
