import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/config/db';
import { User } from '@/models/User';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';






 export interface objectUser {
  _id:string,
   name: string;
    email: string;
     dob?: Date; 
     gradYear?: number;
      password?: string;
       image?: string;
        interests?: string[]; 
        teams?:string[];
         assignedWorks?: { work?: string; 
          completionDate: Date; 
          team: mongoose.Schema.Types.ObjectId; }[];
           role?: string; 
           authProviderId?: string;
            createdAt?: Date;
             updatedAt?: Date;}
             

            
          
             type ObjectUser = mongoose.Document & {
               _id: string;
               name?: string;
               email?: string;
               teams?: string[];
             };

             
const uri = process.env.MONGO_URI as string;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

if (!dbName) {
  throw new Error('Invalid/Missing environment variable: "DB_NAME"');
}
             
             export async function GET(request: NextRequest) {

              let client: MongoClient | null = null;
               try { 
                const id ="67693a739ccd1cc6b0393d37"
                 // Extract `id` from query params
                  if (!ObjectId.isValid(id)) { 
                   return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 }); }
                    client = new MongoClient(uri!);
                     // Use non-null assertion to ensure uri is defined await
                      client.connect();
                       const db = client.db(dbName!); 
                       // Use non-null assertion to ensure dbName is defined 
                       const users = db.collection('users'); 
                       const user = await users.findOne({ _id: new ObjectId(id) });
                        if (!user) {
                          return NextResponse.json({ error: 'User not found' }, 
                           { status: 404 });
                          } return NextResponse.json(user);
                          } catch (error) {
                            console.error('Error:', error);
                             return NextResponse.json({ error: 'Failed to fetch team' },
                                { status: 500 }); } finally { 
                                 if (client) { await client.close(); } } }