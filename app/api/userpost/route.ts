import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { EventPost } from '@/models/EventPost';
import { IUser } from '@/components/expandableCards/card';
import mongoose from 'mongoose';



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
  
  try { await connectDB(); 
    const body = await req.json();
    
    if (!body) { return NextResponse.json({ error: 'No data found' }, { status: 400 }); }
    
    client = new MongoClient(uri);
    
    await client.connect(); 
    
    const db = client.db(dbName);
    
    const userposts = db.collection('userposts'); 
    
    const users = db.collection('users');
    
    const { name, image, caption, createdBy } = body;
    
    const user = await users.findOne({ _id: new ObjectId(createdBy as string) }); 
    
    if (!user) { 
      return NextResponse.json({ error: 'User not found' }, { status: 404 }); } 
      
      const post = { name, image, caption, createdBy: new ObjectId(createdBy as string), };
      
      const result = await userposts.insertOne(post); 
      
      if (result.acknowledged) { 
        const updatedUserPosts = user.posts || []; 
        
        updatedUserPosts.push(result.insertedId.toString()); 
        
        await users.updateOne({ _id: new ObjectId(createdBy as string) }, { $set: { posts: updatedUserPosts } });
        
        return NextResponse.json({ message: 'Post created successfully' }, { status: 201 });
       } else { 
        
        throw new Error('Failed to create user post'); } }
        
        catch (error) {
          
          console.error(error);
          
          return NextResponse.json({ message: 'Internal server error' },
             { status: 500 });
             } finally { 
              if (client) { await client.close(); } } }

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;

  try { 
    client = new MongoClient(uri); 
    
    await client.connect(); 
    
    const db = client.db(dbName); 
    
    const userposts = db.collection('userposts'); 
    
    const allUserPosts = await userposts.find({}).sort({ createdAt: -1 }).toArray(); 
    
    return NextResponse.json(allUserPosts); 
  } catch (error) {  console.error(error);
     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
     } finally { 
      if (client) { await client.close(); } }
}
