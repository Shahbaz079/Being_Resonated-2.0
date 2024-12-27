import { NextRequest,NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { User } from '@/models/User';

import { IUser } from '@/components/expandableCards/card';

import { objectUser } from '../currentperson/route';

{/*

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { id } = req.query;
  

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  const existingUser:IUser | null = await User.findById(id);
  if (!existingUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  const referenceArray:string[]|undefined = existingUser.interests;
  const users = await User.find({});
  const matchCount = (arr: string[]) => arr.filter(element => referenceArray?.includes(element)).length;
  const sortedUsers = users.sort((a, b) => matchCount(b.interests) - matchCount(a.interests));

  const plainUsers:objectUser[] = sortedUsers.map(user => {
    const plainUser:objectUser = user.toObject();
    plainUser._id = plainUser._id.toString();
    plainUser.teams = plainUser.teams?.map((teamId:string) => teamId.toString()) ?? [];
    //plainUser.assignedWorks = plainUser.assignedWorks?.map((work: any) => ({ ...work, team: work.team.toString() }));
    return plainUser;
  });

  return res.status(200).json(plainUsers);
};

export default handler;
}

*/}


export async function GET(req: NextRequest, ) {
  

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') as string;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ message: 'Invalid user ID' });
    }

    

    const existingUser: IUser | null = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' },{status:404});
    }

    const referenceArray: string[] | undefined = existingUser.interests;
    if (!referenceArray) {
      return NextResponse.json([],{status:200}); // Return empty array if no interests
    }

    const users = await User.find({});
    const matchCount = (arr: string[]) => arr.filter(element => referenceArray.includes(element)).length;
    const sortedUsers = users.sort((a, b) => matchCount(b.interests) - matchCount(a.interests));

    const filteredUsers = sortedUsers.filter(user => matchCount(user.interests) > 0 && user._id.toString() !== id);

    const plainUsers: objectUser[] = filteredUsers.map(user => {
      const plainUser: objectUser = user.toObject();
      plainUser._id = plainUser._id.toString();
      plainUser.teams = plainUser.teams?.map((teamId: string) => teamId.toString()) ?? [];
      return plainUser;
    });

    return NextResponse.json(plainUsers,{status:200});
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ message: 'Internal server error' },{status:500});
  }
}
