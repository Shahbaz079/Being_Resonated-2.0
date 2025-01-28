
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
             

            
          
          {/*   type ObjectUser = mongoose.Document & {
               _id: string;
               name?: string;
               email?: string;
               teams?: string[];
             };  */
}
             
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
                const { searchParams } = new URL(request.url);
                const id = searchParams.get('id') as string;

                const type=searchParams.get('type') as string;

                  // Extract `id` from query params
                  if (!ObjectId.isValid(id)) { 
                   return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 }); }
                    client = new MongoClient(uri!);
                     // Use non-null assertion to ensure uri is defined await
                      client.connect();
                       const db = client.db(dbName!); 
                       // Use non-null assertion to ensure dbName is defined 
                       const users = db.collection('users'); 
                       const events=db.collection('events');
                       const teams=db.collection('teams');
                       const userPosts=db.collection('userposts');



                       const user = await users.findOne({ _id: new ObjectId(id) });
                        if (!user) {
                          return NextResponse.json({ error: 'User not found' }, 
                           { status: 404 });
                          }

                          let affiliatedEvents: any[] = []; 
                          let affiliatedTeams:any[]=[];
                          let posts:any[]=[];
                          
                          if (user?.events) { 
                            const eventIds = user.events
                            
                            affiliatedEvents = await events.find({ _id: { $in: eventIds } }).toArray(); 
                          }
                          
                          if (user?.teams) { 
                            const teamIds = user.teams;
                            
                            affiliatedTeams = await teams.find({ _id: { $in: teamIds } }).toArray(); 
                          }
                          if(user?.posts){
                            const postIds=user.posts;
                            posts=await userPosts.find({_id:{$in:postIds}}).toArray();
                          }

                          
                          
                         user.events=affiliatedEvents;
                         user.teams=affiliatedTeams;
                         user.posts=posts;

                          return NextResponse.json(user);
                          } catch (error) {
                            console.error('Error:', error);
                             return NextResponse.json({ error: 'Failed to fetch currrent User' },
                                { status: 500 }); } 
                                finally {

                                 if (client) {
                                   await client.close(); 
                                  }
                                 } }