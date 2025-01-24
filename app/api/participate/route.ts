import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI as string;
const dbName = process.env.DB_NAME;


if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URI"');
}

if (!dbName) {
  throw new Error('Invalid/Missing environment variable: "DB_NAME"');
}

export async function PUT(req: NextRequest) {
  let client: MongoClient | null = null;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') as string;
    const eId = searchParams.get('eid') as string;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(eId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    client = new MongoClient(uri!);
    await client.connect();
    const db = client.db(dbName!);
    const users = db.collection('users');
    const events = db.collection('events');

    const user = await users.findOne({ _id: new ObjectId(id) });
    const event = await events.findOne({ _id: new ObjectId(eId) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const userUpdatedRequests = user?.requestEvents || [];
    const finalUserRequests = userUpdatedRequests.filter((e: any) => e.toString() !== eId);

    const updatedParticipations = user?.participations || [];
    const finalParticipations =updatedParticipations.length>0? [...updatedParticipations, new ObjectId(eId)]:[new ObjectId(eId)];


    const updatedParticipated = event?.participated || [];
    updatedParticipated.push(new ObjectId(id));

    const eventUpdatedRequests = event?.requests || [];
    const finalEventRequests = eventUpdatedRequests.filter((e: any) => e.toString() !== id);


    const userUpdateResult = await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { participations: finalParticipations, requestEvents: finalUserRequests } }
    );

    if (userUpdateResult.acknowledged) {
      const eventUpdateResult = await events.updateOne(
        { _id: new ObjectId(eId) },
        { $set: { participated: updatedParticipated,requests:finalEventRequests } }
      );

      if (eventUpdateResult.acknowledged) {
        return NextResponse.json({ message: 'User participation updated successfully' }, { status: 200 });
      } else {
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  } finally {
    if (client) await client.close();
  }
}

export async function GET(req:NextRequest){
  let client: MongoClient | null = null;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') as string;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    client = new MongoClient(uri!);
    await client.connect();
    const db = client.db(dbName!);
    const users = db.collection('users');

    const user = await users.findOne( { _id: new ObjectId(id) }, { projection: { participations: 1 ,requestEvents:1} } );
    
    if (!user) { return NextResponse.json({ error: 'User not found' }, { status: 404 }); }

    const resultData={
      participations:user.participations || [],
      eventRequests:user.requestEvents || []
    }
    
    return NextResponse.json(resultData, { status: 200})
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  } finally {
    if (client) await client.close();
  }
}
