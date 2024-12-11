"use Server"
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI as string;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

if (!dbName) {
  throw new Error('Invalid/Missing environment variable: "DB_NAME"');
}

export async function GET(req: NextRequest,res:NextResponse) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('users');
    
    const path=req.nextUrl.pathname
    const id = path.split('/').pop();
    console.log(id)

    if (!id || !ObjectId.isValid(id as string )) {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }

    const user = await collection.findOne({ _id: new ObjectId(id as string) });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ message: 'Unknown error' }, { status: 500 });
    }
  } finally {
    await client.close();
  }
}
