

"use Server"
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI as string;
const dbName = process.env.DB_NAME;


export async function PUT(req:NextRequest){
  let client: MongoClient | null = null;

  try {
     const { searchParams } = new URL(req.url);
                    const id = searchParams.get('id') as string;
                    const eId=searchParams.get("eid") as string;
                     // Extract `id` from query params
                      if (!ObjectId.isValid(id) || !ObjectId.isValid(eId) ) { 
                       return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 }); }
                        client = new MongoClient(uri!);
                         // Use non-null assertion to ensure uri is defined await
                          await client.connect();
                           const db = client.db(dbName!); 
                           // Use non-null assertion to ensure dbName is defined 
                           const users = db.collection('users'); 
                           const events=db.collection('events');
                          

                          await users.updateOne(
                            { _id: new ObjectId(id) },
                            { $set: { participations: new ObjectId(eId) } }
                          );
                          await events.updateOne({_id:new ObjectId(eId)},{$set:{participated:new ObjectId(id)}})

                          return NextResponse.json({ message: 'User participation updated successfully' }, { status: 200 });

  } catch (error) {
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
