"use server"
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
    const { name, description, members, leaders, image,createdBy,requests } = await request.json();
     client = new MongoClient(uri!);
      // Use non-null assertion to ensure uri is defined 
      await client.connect(); 
      const db = client.db(dbName!); 
      // Use non-null assertion to ensure dbName is defined
       const teams = db.collection('teams'); 
       
       const team = { name, description, 
        
        members: members?.map((member: { _id: string }) => new ObjectId(member._id)),
        leaders: leaders?.map((leader: { _id: string }) => new ObjectId(leader._id)),
        requests: requests?.map((request: { _id: string }) => new ObjectId(request._id)),
           image,
           createdAt: new Date(), 
           updatedAt: new Date() ,
           createdBy:new ObjectId(createdBy as string) }; 
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
                             const type=request.nextUrl.searchParams.get('type') as string;
                             
                             if(type==='topTeams'){

                              try {
                                client = new MongoClient(uri!);
                                // Use non-null assertion to ensure uri is defined await
                                 client.connect();
                                  const db = client.db(dbName!); 
                                  // Use non-null assertion to ensure dbName is defined 

                                  const teams=db.collection('teams')

                                  const allTeams = await teams.aggregate([
                                    {
                                      $addFields: {
                                        memberCount: { $size: "$members" }
                                      }
                                    },
                                    {
                                      $sort: { memberCount: -1 }
                                    }
                                  ]).toArray();
                              
                                

                                  return NextResponse.json(allTeams);

                              } catch (error) {
                                console.error('Error:', error);
                                return NextResponse.json({ error: 'Failed to fetch team' },
                                   { status: 500 });
                                
                              }finally { 
                                if (client) { await client.close(); }
                               }


                             }else{
                             
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
                                      const teamPosts=db.collection('teamposts');

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
                                         let requests:any[]=[];
                                         let posts:any[]=[];
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

                                         if(team?.requests){
                                          requests=await users.find({_id:{$in:team?.requests}},{ projection: { password: 0, teams: 0, events: 0 } }).toArray();
                                         }
                                         if(team?.posts){
                                          posts=await teamPosts.find({_id:{$in:team?.posts}}).toArray();
                                         }

                                         team.members=teamMembers
                                         team.leaders=teamLeaders;
                                         team.createdBy=teamCreator;
                                         team.events=teamEvents;
                                         team.requests=requests;
                                         team.posts=posts;
                                         
                                         return NextResponse.json(team);
                                         } catch (error) {
                                           console.error('Error:', error);
                                            return NextResponse.json({ error: 'Failed to fetch team' },
                                               { status: 500 }); } finally { 
                                                if (client) { await client.close(); } }
                                              
                                               }
                                              }



export async function PUT(request: NextRequest) {

  const teamId = request.nextUrl.searchParams.get('id');
  const type=request.nextUrl.searchParams.get('type');

  const { name, description, members, leaders, image,requests,userId } = await request.json();

  let client: MongoClient | null = null;


  if(!teamId){
    return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
  }

  
  try {
    client = new MongoClient(uri!);
    await client.connect();
    const db = client.db(dbName!);
    const teams = db.collection('teams');
    const users = db.collection('users');


    const team = await teams.findOne({ _id: new ObjectId(teamId as string) });



    if(!team){
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if(type==='join'){
    
     
      
      const user = await users.findOne({ _id: new ObjectId(userId as string) });

      if(!user){
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const updatedRequests = team.requests || [];
      updatedRequests.push(new ObjectId(userId as string));

      const result = await teams.updateOne(
        { _id: new ObjectId(teamId as string) },
        { $set: { requests: updatedRequests } }
      );

      if(result.acknowledged){
        const requestTeams=user.requestTeams || [];
        requestTeams.push(new ObjectId(teamId as string));
        await users.updateOne(
          { _id: new ObjectId(userId as string) },
          { $set: { requestTeams } }
        );
        return NextResponse.json({ message: 'Request sent' });
      }else{
        return NextResponse.json({ error: 'Failed to sent requests' }, { status: 500 });
      }

    }

    const updatedTeam = {
      name: name || team.name,
      description: description || team.description,
      
      members: members || team.members,
      leaders: leaders || team.leaders,
      image: image || team.image,
      
      
     
      
    
      requests:requests?.map((p:any)=>new ObjectId(p._id as string)) || team.requests
    }

    const result = await teams.updateOne(
      { _id: new ObjectId(teamId as string) },
      { $set: updatedTeam }
    );

    if(result.acknowledged){
      return NextResponse.json(updatedTeam);
    }else{
      return NextResponse.json({ error: 'Failed to update Event' }, { status: 500 });
    }
    
  } finally {
    if (client) {
      await client.close();
    }
  }
}