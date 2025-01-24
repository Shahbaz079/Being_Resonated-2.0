import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { EventPost } from '@/models/EventPost';

type Data = {
  message: string;
  event?: typeof EventPost;
};

const uri = process.env.MONGO_URI as string;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URI"');
}

if (!dbName) {
  throw new Error('Invalid/Missing environment variable: "DB_NAME"');
}

export async function POST(req: NextRequest) {
  let client: MongoClient | null = null;

  try {
    await connectDB();

    const body = await req.json();
    if (!body) {
      return NextResponse.json({ error: 'No data found' }, { status: 400 });
    }

    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const eventposts = db.collection('eventposts');
    const events = db.collection('events');
    const teams = db.collection('teams');

    const { title,name, image, caption, createdBy, Location, time, date, eventId } = body;

    const team = await teams.findOne({ _id: new ObjectId(title as string) });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    
    const post = {
      title:name,
      from:team.name,
      
      image,
      caption,
      createdBy: new ObjectId(createdBy as string),
      Location,
      time,
      date,
    };

    const event = await events.findOne({ _id: new ObjectId(eventId as string) });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const result = await eventposts.insertOne(post);

    if (result.acknowledged) {
      await events.findOneAndUpdate(
        { _id: event._id },
        { $set: { isLive: true ,Post:result.insertedId},
       }
      );
      return NextResponse.json({ message: 'Event Post created successfully', event: post }, { status: 201 });
    } else {
      throw new Error('Failed to create event post');
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;

  
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const eventposts = db.collection('eventposts');

    const allEventpost = await eventposts.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(allEventpost);
  } finally {
    if (client) {
      await client.close();
    }
  }
}
