"use server"
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { IUser } from '@/components/expandableCards/card';
import connectDB from '@/config/db';

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
    const { name, description, date, members, leaders, image, createdBy, team, time, location,dateTime } = await request.json();

    client = new MongoClient(uri!);
    await connectDB();
    const db = client.db(dbName!);
    const events = db.collection('events');
    const teams = db.collection('teams');
    
    const event = {
      name,
      description,
      date,
      members: members.map((member: { _id: string }) => new ObjectId(member._id)),
      leaders: leaders.map((leader: { _id: string }) => new ObjectId(leader._id)),
      image,
      team: new ObjectId(team as string),
      createdBy: new ObjectId(createdBy as string),
      time,
      location,
      createdAt: new Date(), 
      updatedAt: new Date(),
       dateTime: new Date(dateTime), // store as real Date object 
    };

    const reqTeam = await teams.findOne({ _id: new ObjectId(team as string) });
    const result = await events.insertOne(event);

    if (result.acknowledged) {
      // Perform additional actions if needed
      await Promise.all(
        members.map(async (member: { _id: string }) => {
          const users = db.collection('users');
          const user = await users.findOne({ _id: new ObjectId(member._id) });

          if (user) {
            const updatedEvents = user.events || [];
            updatedEvents.push(result.insertedId);
            await users.updateOne(
              { _id: new ObjectId(member._id) },
              { $set: { events: updatedEvents } }
            );
          }
        })
      );

      if (reqTeam) {
       const updatedEvents = reqTeam.events || [];
        updatedEvents.push(result.insertedId);
        await teams.updateOne(
          { _id: new ObjectId(team as string) },
          { $set: { events: updatedEvents } }
        );
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to insert Event' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}



export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;

  const eventId = request.nextUrl.searchParams.get('id');
  const type=request.nextUrl.searchParams.get('type')
  if(!eventId && !type){
    return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
  }
  try {
    client = new MongoClient(uri!);
    await client.connect();
    const db = client.db(dbName!);
    const events = db.collection('events');
    const users = db.collection('users');
    const teams = db.collection('teams');
    const eventPosts=db.collection('eventposts');
     
            if(type!=='all') {

    const event = await events.findOne({ _id: new ObjectId(eventId as string) });

    if(!event){
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const eventMembers = event?.members ? await users.find(
      { _id: { $in: event?.members } },
      { projection: { password: 0, teams: 0, events: 0, participations: 0 } }
    ).toArray() : [];

    const eventLeaders = event?.leaders ? await users.find(
      { _id: { $in: event?.leaders } },
      { projection: { password: 0, teams: 0, events: 0, participations: 0 } }
    ).toArray() : [];

    const eventCreator = await users.findOne(
      { _id: event.createdBy },
      { projection: { password: 0, teams: 0, events: 0, participations: 0 } }
    );

    const eventParticipations = event?.participated ? await users.find(
      { _id: { $in: event?.participated } },
      { projection: { password: 0, teams: 0, events: 0, participations: 0 } }
    ).toArray() : [];

    const eventRequests = event?.requests ? await users.find(
      { _id: { $in: event?.requests } },
      { projection: { password: 0, teams: 0, events: 0, participations: 0 } }
    ).toArray() : [];

    const posts = event?.posts ? await eventPosts.find(
      { _id: { $in: event?.posts } }
    ).sort({createdAt:-1}).toArray() : [];

    const finalPosts = await Promise.all(
      posts.map(async (post) => {
        const { from } = post;
        const eventImg = await events.findOne({ _id: from }, { projection: { image: 1 ,leaders:1} });
    
        post.likes = post?.likes ? await users.find(
          { _id: { $in: post?.likes } },
          { projection: { _id:1,image:1,name:1 } }
        ).toArray() : [];

        return { ...post, eventImg };
      })
    );

    const team = event?.team ? await teams.findOne(
      { _id: event?.team }
    ) : null;

    // Construct a clean object without circular references
    const eventData = {
      _id: event._id.toString(),
      name: event.name,
      image: event.image,
      date: event.date,
      description: event.description,
      time: event.time,
      location: event.location,
      isLive: event.isLive,
      members: eventMembers,
      leaders: eventLeaders,
      createdBy: eventCreator,
      team,
      requests: eventRequests,
      participated: eventParticipations,
      posts: finalPosts,
    };

    return NextResponse.json(eventData);
  
  }else{
      
 

      const upcomingEvents =await events.find({
  dateTime: { $gte: new Date() },
}).sort({ dateTime: 1 }).toArray();

      
      return NextResponse.json(upcomingEvents)
    }
  } finally {
    if (client) {
      await client.close();
    }
  }
}


export async function PUT(request: NextRequest) {

  const eventId = request.nextUrl.searchParams.get('id');
  const type=request.nextUrl.searchParams.get('type');

  const {userId, name, description, date, members, leaders, image, createdBy, team, time, location,participated,requests } = await request.json();

  let client: MongoClient | null = null;


  if(!eventId){
    return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
  }

  
  try {
    client = new MongoClient(uri!);
    await client.connect();
    const db = client.db(dbName!);
    const events = db.collection('events');
    const users = db.collection('users');


    const event = await events.findOne({ _id: new ObjectId(eventId as string) });



    if(!event){
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if(type==='remparticipant'){
    
     
      
      const user = await users.findOne({ _id: new ObjectId(userId as string) });

      if(!user){
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const updatedParticipations = user?.participations || [];
    const finalParticipations=updatedParticipations.filter((e:any)=>(
            e.toString()!==eventId
    ))

      const updatedParticipated = event?.participated || [];
    
    const finalParticipated = updatedParticipated.filter((e:any)=>(
      e.toString()!==userId
    ))


      const userUpdateResult = await users.updateOne(
            { _id: new ObjectId(userId as string) },
            { $set: { participations: finalParticipations } }
          );
      
          if (userUpdateResult.acknowledged) {

            const eventUpdateResult = await events.updateOne(
              { _id: new ObjectId(eventId as string) },
              { $set: { participated: finalParticipated } }
            );
      
            if (eventUpdateResult.acknowledged) {
              return NextResponse.json({ message: 'User removed form event successfully' }, { status: 200 });
            } else {
              return NextResponse.json({ error: 'Failed to remove user from event' }, { status: 500 });
            }
          } else {
            return NextResponse.json({ error: 'Failed to update status of user regarding event participation' }, { status: 500 });
          }

    }


    if(type==='remrequest'){
    
     
      
      const user = await users.findOne({ _id: new ObjectId(userId as string) });

      if(!user){
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

     const userUpdatedRequests = user?.requestEvents || [];
    const finalUserRequests = userUpdatedRequests.filter((e: any) => e.toString() !== eventId);


    const eventUpdatedRequests = event?.requests || [];
    const finalEventRequests = eventUpdatedRequests.filter((e: any) => e.toString() !== userId);

      const userUpdateResult = await users.updateOne(
            { _id: new ObjectId(userId as string) },
            { $set: { requestEvents: finalUserRequests } }
          );
      
          if (userUpdateResult.acknowledged) {

            const eventUpdateResult = await events.updateOne(
              { _id: new ObjectId(eventId as string) },
              { $set: { requests:finalEventRequests } }
            );
      
            if (eventUpdateResult.acknowledged) {
              return NextResponse.json({ message: 'Request to participate declined successfully' }, { status: 200 });
            } else {
              return NextResponse.json({ error: 'Failed to decline request of participants' }, { status: 500 });
            }
          } else {
            return NextResponse.json({ error: 'Failed to update status of user regarding event participation' }, { status: 500 });
          }

    }


    
    if(type==='addrequest'){
    
     
      
      const user = await users.findOne({ _id: new ObjectId(userId as string) });

      if(!user){
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

     const userUpdatedRequests:ObjectId[] = user?.requestEvents || [];
    const finalUserRequests:ObjectId[] =userUpdatedRequests.length>0? [...userUpdatedRequests, new ObjectId(eventId as string)]:[new ObjectId(eventId as string)];


    const eventUpdatedRequests = event?.requests || [];
    const finalEventRequests = eventUpdatedRequests.length>0? [...eventUpdatedRequests, new ObjectId(userId as string)]:[new ObjectId(userId as string)];

      const userUpdateResult = await users.updateOne(
            { _id: new ObjectId(userId as string) },
            { $set: { requestEvents: finalUserRequests } }
          );
      
          if (userUpdateResult.acknowledged) {

            const eventUpdateResult = await events.updateOne(
              { _id: new ObjectId(eventId as string) },
              { $set: { requests:finalEventRequests } }
            );
      
            if (eventUpdateResult.acknowledged) {
              return NextResponse.json({ message: 'Request to participate declined successfully' }, { status: 200 });
            } else {
              return NextResponse.json({ error: 'Failed to decline request of participants' }, { status: 500 });
            }
          } else {
            return NextResponse.json({ error: 'Failed to update status of user regarding event participation' }, { status: 500 });
          }

    }

    const updatedEvent = {
      name: name || event.name,
      description: description || event.description,
      date: date || event.date,
      members: members || event.members,
      leaders: leaders || event.leaders,
      image: image || event.image,
      team: team || event.team,
      createdBy: createdBy || event.createdBy,
      time: time || event.time,
      location: location || event.location,
      participated:participated?.map((p:any)=>new ObjectId(p._id as string))  || event.participated,
      requests:requests?.map((p:any)=>new ObjectId(p._id as string)) || event.requests
    }

    const result = await events.updateOne(
      { _id: new ObjectId(eventId as string) },
      { $set: updatedEvent }
    );

    if(result.acknowledged){
      return NextResponse.json(updatedEvent);
    }else{
      return NextResponse.json({ error: 'Failed to update Event' }, { status: 500 });
    }
    
  } finally {
    if (client) {
      await client.close();
    }
  }
}