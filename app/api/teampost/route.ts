import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';


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
    const teamposts = db.collection('teamposts');
   
    const teams = db.collection('teams');

    const { title, image,imgThumbnail, caption, createdBy, teamId } = body;

    

    if (!title || !teamId) {
      return NextResponse.json({ error: 'Insufficient Data' }, { status: 500 });
    }

    const team=await teams.findOne({_id: new ObjectId(teamId as string) },{projection:{post:1}});

    if(!team){
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

   

   

    
    const post = {
      title,
      from:teamId,
      image,
      imgThumbnail,
      caption,
      createdAt: new Date(), 
      updatedAt: new Date() ,
      createdBy: new ObjectId(createdBy as string),
  
      
    };

    

    const result = await teamposts.insertOne(post);

    if (result.acknowledged) {
      const updatedTeamPosts=team.posts || [];
      updatedTeamPosts.push( new ObjectId(result.insertedId));
      await teams.findOneAndUpdate(
        { _id:new ObjectId(teamId as string) },
        { $set: {posts:updatedTeamPosts},
       }
      );
      return NextResponse.json({ message: 'Team Post created successfully', team: post }, { status: 201 });
    } else {
      throw new Error('Failed to create team post');
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
    const teamPosts = db.collection('teamposts');

    const allTeamPost = await teamPosts.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(allTeamPost);
  } finally {
    if (client) {
      await client.close();
    }
  }
}
