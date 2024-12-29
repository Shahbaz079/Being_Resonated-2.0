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

export async function POST(request: NextRequest) {
   let client: MongoClient | null = null; 
   try { 
    const { name, description, date, members, leaders, image,createdBy,team } = await request.json();
     client = new MongoClient(uri!);
      // Use non-null assertion to ensure uri is defined 
      await client.connect(); 
      const db = client.db(dbName!); 
      // Use non-null assertion to ensure dbName is defined
       const events = db.collection('events'); 
       
       const event = { name, description, 
        date,
         members: members,
          leaders,
           image,
           team,
           createdBy:new ObjectId(createdBy) }; 
          const result = await events.insertOne(event);
           if (result.acknowledged) { 
            // Perform additional actions if needed
             await Promise.all(
              members.map(async (member: { _id: string }) => { 
                const users = db.collection('users'); 
                const user = await users.findOne({ _id: new ObjectId(member._id) });
                 if (user) {
                   const updatedEvents = user.events || []; 
                   updatedEvents.push(event);
                    await users.updateOne( { _id: new ObjectId(member._id) },
                     { $set: { events: updatedEvents } } );
                     } })); } 
                     return NextResponse.json(result); } 
                     catch (error) { 
                      console.error('Error:', error);
                       return NextResponse.json({ error: 'Failed to insert Event' }, { status: 500 });
                       } finally {
                         if (client) {
                           await client.close(); 
                          } } }