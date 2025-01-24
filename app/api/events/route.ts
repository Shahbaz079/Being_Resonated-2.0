"use server"
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { IUser } from '@/components/expandableCards/card';

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
    const { name, description, date, members, leaders, image, createdBy, team, time, location } = await request.json();
    client = new MongoClient(uri!);
    await client.connect();
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
    const eventPosts=db.collection('eventPosts');
     
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

    const eventParticipations = event?.participations ? await users.find(
      { _id: { $in: event?.participations } },
      { projection: { password: 0, teams: 0, events: 0, participations: 0 } }
    ).toArray() : [];

    const eventRequests = event?.requests ? await users.find(
      { _id: { $in: event?.requests } },
      { projection: { password: 0, teams: 0, events: 0, participations: 0 } }
    ).toArray() : [];

    const posts = event?.posts ? await eventPosts.find(
      { _id: { $in: event?.posts } }
    ).toArray() : [];

    const team = event?.team ? await events.findOne(
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
      posts,
    };

    return NextResponse.json(eventData);
  
  }else{
      
      const allEvents = await events.find({}).sort({ createdAt: -1 }).toArray();
      
      return NextResponse.json(allEvents)
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

    if(type==='participate'){
    
     
      
      const user = await users.findOne({ _id: new ObjectId(userId as string) });

      if(!user){
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const updatedRequests = event.requests || [];
      updatedRequests.push(new ObjectId(userId as string));

      const result = await events.updateOne(
        { _id: new ObjectId(eventId as string) },
        { $set: { requests: updatedRequests } }
      );

      if(result.acknowledged){
        const requestEvents=user.requestEvents || [];
        requestEvents.push(new ObjectId(eventId as string));
        await users.updateOne(
          { _id: new ObjectId(userId as string) },
          { $set: { requestEvents } }
        );
        return NextResponse.json({ message: 'Request sent' });
      }else{
        return NextResponse.json({ error: 'Failed to sent requests' }, { status: 500 });
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