

"use server"
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
    const tId = searchParams.get('tid') as string;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(tId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    client = new MongoClient(uri!);
    await client.connect();
    const db = client.db(dbName!);
    const users = db.collection('users');
    const teams = db.collection('events');

    const user = await users.findOne({ _id: new ObjectId(id) });
    const team = await teams.findOne({ _id: new ObjectId(tId) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const userUpdatedRequests = user?.requestTeams || [];
    const finalUserRequests = userUpdatedRequests.filter((e: any) => e.toString() !== tId);

    const updatedTeams = user?.teams || [];
    const finalTeams =updatedTeams.length>0? [...updatedTeams, new ObjectId(tId)]:[new ObjectId(tId)];


    const updatedMembers = team?.members || [];
    updatedMembers.push(new ObjectId(id));

    const teamUpdatedRequests = team?.requests || [];
    const finalTeamRequests = teamUpdatedRequests.filter((e: any) => e.toString() !== id);


    const userUpdateResult = await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { teams: finalTeams, requestTeams: finalUserRequests } }
    );

    if (userUpdateResult.acknowledged) {
      const teamUpdateResult = await teams.updateOne(
        { _id: new ObjectId(tId) },
        { $set: { members: updatedMembers,requests:finalTeamRequests } }
      );

      if (teamUpdateResult.acknowledged) {
        return NextResponse.json({ message: 'User joined successfully' }, { status: 200 });
      } else {
        return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
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
{ /** 
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
  */}