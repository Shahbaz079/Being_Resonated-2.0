// Legacy Clerk retrieve API - commented out after Clerk removal  
// This file is kept for reference but is no longer functional

/*
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { clerkClient } from '@clerk/nextjs/server';

const uri = process.env.MONGO_URI as string;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URI"');
}

if (!dbName) {
  throw new Error('Invalid/Missing environment variable: "DB_NAME"');
}

export async function PUT(req: NextRequest) {
  let client: MongoClient | null = null;
  try {
    const body = await req.json();
    const { email, userId,gradYear,name,image } = body;

    console.log('Received email:', email);
    console.log('Received userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    client = new MongoClient(uri);
    await client.connect();
    const clientConnect = await clerkClient();

    const db = client.db(dbName);

    const users = db.collection('users');

    console.log('Retrieving user from MongoDB');

    const existingUser = await users.findOne({ email: email });

    if (!existingUser) {
      return NextResponse.json({ error: 'User does not exist' }, { status: 400 });
    }

    

    await users.updateOne({ email }, { $set: { gradYear,name,image} })

    console.log('Found existing user:', existingUser);

    await clientConnect.users.updateUserMetadata(userId, {
      publicMetadata: {
        mongoId: existingUser._id.toString(),
      },
    });

    console.log('Updated user metadata for:', userId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  } finally {
    if (client) {
      await client.close();
    }
  }
}
*/

// Placeholder to prevent 404 errors
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: 'Retrieve endpoint disabled - Clerk removed' }, { status: 410 })
}