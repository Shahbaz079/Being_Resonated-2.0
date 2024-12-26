import { NextRequest,NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import connectDB from "@/config/db";
import { clerkClient } from "@clerk/nextjs/server";
             
const uri = process.env.MONGO_URI as string;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

if (!dbName) {
  throw new Error('Invalid/Missing environment variable: "DB_NAME"');
}
    
export async function POST(req: NextRequest) {
  let client: MongoClient | null = null;
  try {
   const body = await req.json();
   client = new MongoClient(uri);
   const clientConnect = await clerkClient();
    
   await connectDB();
    const db = client.db(dbName);

    const newUser={email:body.email as string,
      userId:body.userId as string,
    };

    const users = db.collection('users');

    console.log("retrieving")

    const existingUser = await users.findOne({email:newUser.email});

    if(!existingUser){
      return NextResponse.json({error:'User does not exist'},{status:400});
    }
    
      
      await clientConnect.users.updateUserMetadata(existingUser.userId, {
        publicMetadata:{
          mongoId:existingUser._id.toString()
        }
      })



      return NextResponse.json({success:true},{status:200});

    

   
  
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  } finally {
    await client?.close();
  } 
}