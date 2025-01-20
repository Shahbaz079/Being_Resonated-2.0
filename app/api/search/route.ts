import { NextRequest, NextResponse } from 'next/server';

import { User } from '@/models/User';
import {Event} from '@/models/Events';
import{ Team} from '@/models/Team';
import connectDB from '@/config/db';

export async function GET(req: NextRequest) {
  await connectDB();
  
  const searchTerm = req.nextUrl.searchParams.get('q') || '';
 const type=req.nextUrl.searchParams.get('type');

 if(type=='user'){
  const userResults = await User.find({ name: { $regex: searchTerm, $options: 'i' } });
  return NextResponse.json({ users: userResults });
 }



  const userResults = await User.find({ name: { $regex: searchTerm, $options: 'i' } });
  const eventResults = await Event.find({ name: { $regex: searchTerm, $options: 'i' } });
  const teamResults = await Team.find({ name: { $regex: searchTerm, $options: 'i' } });

  return NextResponse.json({ users: userResults, events: eventResults, teams: teamResults });
}
