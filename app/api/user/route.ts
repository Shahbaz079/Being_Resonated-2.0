"use server"
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId, WithId } from 'mongodb';
import { IUser } from '@/components/expandableCards/card';




interface IUserUpdate { interests?: string[]; dob?: Date; gradYear?: number; image?: string; email: string; }

const uri = process.env.MONGO_URI as string;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

if (!dbName) {
  throw new Error('Invalid/Missing environment variable: "DB_NAME"');
}


export async function PUT(req:NextRequest){
  const body:IUserUpdate=await req.json();
  
  
 
  const client = new MongoClient(uri);
  if (!body) { return NextResponse.json({ message: 'No data provided for update' }, { status: 400 }); }
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection<IUser>('users');
    
    const email = body.email
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') as string;
    
    console.log("got id",id)

   // if (!id || !ObjectId.isValid(id as string )) {
     // return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
   // }

    const validFields = ['interests','name', 'dob', 'gradYear', 'image','description'];
     const validData = validFields.reduce((acc, field) => { 
      if (body[field as keyof IUserUpdate] !== undefined && body[field as keyof IUserUpdate] !== null) { acc[field] = body[field as keyof IUserUpdate]; }

      return acc;
     }, {} as { [key: string] : any});

     const updatedUser:IUser|null = await collection.findOneAndUpdate( {email }, { $set: validData }, { returnDocument: 'after' } );
      



    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ message: 'Unknown error' }, { status: 500 });
    }
  } finally {
    await client.close();
  }
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


  const userPosts = db.collection('userposts');



  const user = await users.findOne({ _id: new ObjectId(id) }, {projection:{name:1,description:1,email:1,gradYear:1,interests:1,image:1,posts:1}});
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, 
      { status: 404 });
    }


    let finalPosts:any[]=[];
    
  
    
    if(user?.posts){


      const postIds=user.posts;
      const finalIds=postIds.map((id:string)=>new ObjectId(id));

      const posts=await userPosts.find({_id:{$in:finalIds}}).sort({createdAt:-1}).toArray();

      finalPosts = await Promise.all(
      posts.map(async (post) => {
        
  
          post.likes = post?.likes ? await users.find(
            { _id: { $in: post?.likes } },
            { projection: { _id:1,image:1,name:1 } }
          ).toArray() : [];
  
          return { ...post };
        })
      );
    }

    
    
  
    user.posts=finalPosts;

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



