"use Server"
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId, WithId } from 'mongodb';
import { IUser } from '@/components/expandableCards/card';




interface IUserUpdate { interests?: string[]; dob?: Date; gradYear?: number; image?: string; email: string; }

const uri = process.env.MONGO_URI as string;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

if (!dbName) {
  throw new Error('Invalid/Missing environment variable: "DB_NAME"');
}


export async function POST(req:NextRequest){
  const body:IUserUpdate=await req.json();
  
  
 
  const client = new MongoClient(uri);
  if (!body) { return NextResponse.json({ message: 'No data provided for update' }, { status: 400 }); }
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection<IUser>('users');
    
    const email = body.email
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') as string;
    
    console.log("got id",id)

    if (!id || !ObjectId.isValid(id as string )) {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }

    const validFields = ['interests', 'dob', 'gradYear', 'image'];
     const validData = validFields.reduce((acc, field) => { 
      if (body[field as keyof IUserUpdate] !== undefined && body[field as keyof IUserUpdate] !== null) { acc[field] = body[field as keyof IUserUpdate]; }

      return acc;
     }, {} as { [key: string] : any});

     const updatedUser:IUser|null = await collection.findOneAndUpdate( {email }, { $set: validData }, { returnDocument: 'after' } );
      



    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
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

