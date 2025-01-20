"use Server"
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { newMember } from '@/components/expandableCards/card';

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
    const { name, description, deadline, members, leaders, timage,createdBy } = await request.json();
     client = new MongoClient(uri!);
      // Use non-null assertion to ensure uri is defined 
      await client.connect(); 
      const db = client.db(dbName!); 
      // Use non-null assertion to ensure dbName is defined
       const teams = db.collection('teams'); 
       
       const team = { name, description, 
        deadline: deadline ? new Date(deadline) : null,
        members: members.map((member: { _id: string }) => new ObjectId(member._id)),
        leaders: leaders.map((leader: { _id: string }) => new ObjectId(leader._id)),
           timage,
           createdBy:new ObjectId(createdBy) }; 
          const result = await teams.insertOne(team);
           if (result.acknowledged) { 
            // Perform additional actions if needed
             await Promise.all(
              members.map(async (member: { _id: string }) => { 
                const users = db.collection('users'); 
                const user = await users.findOne({ _id: new ObjectId(member._id) });
                 if (user) {
                   const updatedTeams = user.teams || []; 
                   updatedTeams.push(result.insertedId);
                    await users.updateOne( { _id: new ObjectId(member._id) },
                     { $set: { teams: updatedTeams } } );
                     } })); } 
                     return NextResponse.json(result); } 
                     catch (error) { 
                      console.error('Error:', error);
                       return NextResponse.json({ error: 'Failed to insert team' }, { status: 500 });
                       } finally {
                         if (client) {
                           await client.close(); 
                          } } }


                          export async function GET(request: NextRequest) {
                             let client: MongoClient | null = null;
                              try { 
                               const id = request.nextUrl.searchParams.get('id') as string;
                                // Extract `id` from query params
                                 if (!ObjectId.isValid(id)) { 
                                  return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 }); }
                                   client = new MongoClient(uri!);
                                    // Use non-null assertion to ensure uri is defined await
                                     client.connect();
                                      const db = client.db(dbName!); 
                                      // Use non-null assertion to ensure dbName is defined 

                                      const users=db.collection('users')
                                      const teams = db.collection('teams'); 

                                      const events=db.collection('events');

                                      const team = await teams.findOne({ _id: new ObjectId(id) });
                                       if (!team) {
                                         return NextResponse.json({ error: 'Team not found' }, 
                                          { status: 404 });
                                         }
                                         let teamMembers:any[]=[];
                                         let teamLeaders:any[]=[]; 
                                         let teamCreator;
                                         let teamEvents:any[]=[];
                                         if(team?.members){
                                            teamMembers=await users.find({_id:{$in:team?.members}},{ projection: { password: 0, teams: 0, events: 0 } }).toArray();
                                         }
                                         if(team?.leaders){
                                           teamLeaders=await users.find({_id:{ $in:team?.leaders}},{ projection:{password: 0, teams: 0,events:0} }).toArray();

                                            teamCreator=await users.findOne({_id:team.createdBy},{ projection: { password: 0 ,teams: 0,events:0} })

                                         }

                                         if(team?.events){
                                          teamEvents=await events.find({_id:{$in:team?.events}}).toArray();
                                         }

                                         team.members=teamMembers
                                         team.leaders=teamLeaders;
                                         team.createdBy=teamCreator;
                                         team.events=teamEvents;
                                         
                                         return NextResponse.json(team);
                                         } catch (error) {
                                           console.error('Error:', error);
                                            return NextResponse.json({ error: 'Failed to fetch team' },
                                               { status: 500 }); } finally { 
                                                if (client) { await client.close(); } } }


