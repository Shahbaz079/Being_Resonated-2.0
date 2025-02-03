import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

import { ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI as string;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

if (!dbName) {
  throw new Error('Invalid/Missing environment variable: "DB_NAME"');
}

export async function GET(req: NextRequest) {
  const client = new MongoClient(uri);
  try {


    await client.connect();
    const db = client.db(dbName);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    const users = db.collection('users');

    const existingUser = await users.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { interests: referenceArray } = existingUser;
    if (!referenceArray || referenceArray.length === 0) {
      // Return empty array if no interests
      return NextResponse.json([], { status: 200 });
    }

    const AllUsers = await users.find(
      { _id: { $ne: new ObjectId(id) } },
      {
        projection: {
          name: 1,
          description: 1,
          email: 1,
          gradYear: 1,
          interests: 1,
          image: 1,
          posts: 1,
          teams: 1,
        },
      }
    ).toArray();

    const matchCount = (userInterests: string[] = []) =>
      userInterests.filter((interest) => referenceArray.includes(interest)).length;

    const filteredUsers = AllUsers
      .map((user:any) => ({
        ...user,
        matchCount: matchCount(user.interests),
      }))
      .filter((user:any) => user.matchCount > 0)
      .sort((a:any, b:any) => b.matchCount - a.matchCount);

    const plainUsers = filteredUsers.map((user:any) => ({
      ...user,
      _id: user._id.toString(),
      teams: user.teams?.map((teamId: ObjectId) => teamId.toString()) ?? [],
    }));

    return NextResponse.json(plainUsers, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }finally {
    if (client) {
      await client.close(); 
     } }
}
