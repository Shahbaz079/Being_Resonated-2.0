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

    const reqTeam = await teams.findOne({ _id: new ObjectId(team) });
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
            await users.updateOne(
              { _id: new ObjectId(member._id) },
              { $set: { events: updatedEvents } }
            );
          }
        })
      );

      if (reqTeam) {
        reqTeam.events = reqTeam.events || [];
        reqTeam.events.push(event);
        await teams.updateOne(
          { _id: new ObjectId(team as string) },
          { $set: { events: reqTeam.events } }
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
