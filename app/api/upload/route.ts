import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import { Readable } from 'stream';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { nanoid } from 'nanoid';
import upload from '@/lib/multer';
import connectDB from '@/config/db';
import { MongoClient ,ObjectId} from 'mongodb';
 // Ensure you have this function set up
  // Ensure you have a corresponding model



  const uri = process.env.MONGO_URI as string;
  const dbName = process.env.DB_NAME;
  
  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }
  
  if (!dbName) {
    throw new Error('Invalid/Missing environment variable: "DB_NAME"');
  }
  

// Multer setup


export async function POST(req: NextRequest) {
  console.log(req)

  const { imgUrl } = await req.json();

  const url = new URL(req.url);
  const id = url.searchParams.get('id') as string;

 

 
  const source=url.searchParams.get('source') as string;
 
  console.log("source",source)


  if(!imgUrl){
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  

  

  
  // Save file URL to MongoDB
let client: MongoClient | null = null;

  client = new MongoClient(uri!);

      await client.connect();

   const db = client.db(dbName!);
  
  
   if(source==="event"){

    const events = db.collection('events');

    const updatedEvent = await events.updateOne({ _id: new ObjectId(id) }, { $set: { image: imgUrl } })

    if (!updatedEvent) { 
      return NextResponse.json({ error: 'Event not found.' },
         { status: 404 }); }
         
         return NextResponse.json({ filePath: imgUrl, updatedEvent }, { status: 200 });
        
        }else{
 const teams = db.collection('teams');

    const updatedTeam = await teams.updateOne({ _id: new ObjectId(id) }, { $set: { image: imgUrl } })

    if (!updatedTeam) { 
      return NextResponse.json({ error: 'Team not found.' },
         { status: 404 }); }
         
         return NextResponse.json({ filePath: imgUrl, updatedTeam }, { status: 200 });

        }

   }
   
   

  

