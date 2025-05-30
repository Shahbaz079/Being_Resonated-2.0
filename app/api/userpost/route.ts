import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

import { backendClient } from '@/lib/edgeStoreClient';



const uri = process.env.MONGO_URI as string;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URI"');
}

if (!dbName) {
  throw new Error('Invalid/Missing environment variable: "DB_NAME"');
}
export async function POST(req: NextRequest) { 
  
  let client: MongoClient | null = null;
  
  try { await connectDB(); 
    const body = await req.json();
    
    if (!body) { return NextResponse.json({ error: 'No data found' }, { status: 400 }); }
    
    client = new MongoClient(uri);
    
    await client.connect(); 
    
    const db = client.db(dbName);
    
    const userposts = db.collection('userposts'); 
    
    const users = db.collection('users');
    
    const { name, image,imgThumbnail, caption, createdBy,vid } = body;
    
    const user = await users.findOne({ _id: new ObjectId(createdBy as string) }); 
    
    if (!user) { 
      return NextResponse.json({ error: 'User not found' }, { status: 404 }); } 
      
      const post = { name, image,vid, caption,imgThumbnail, createdBy: new ObjectId(createdBy as string), 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      const result = await userposts.insertOne(post); 
      
      if (result.acknowledged) { 
        const updatedUserPosts = user.posts || []; 
        
        updatedUserPosts.push(result.insertedId.toString()); 
        
        await users.updateOne({ _id: new ObjectId(createdBy as string) }, { $set: { posts: updatedUserPosts } });
        
        return NextResponse.json({ message: 'Post created successfully' }, { status: 201 });
       } else { 
        
        throw new Error('Failed to create user post'); } }
        
        catch (error) {
          
          console.error(error);
          
          return NextResponse.json({ message: 'Internal server error' },
             { status: 500 });
             } finally { 
              if (client) { await client.close(); } } }

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;


  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get('page')?.trim() || '1'; // Trim and set default
  const limitParam = searchParams.get('limit')?.trim() || '2'; // Trim and set default

 


  const page = Number(pageParam);
  const limit = Number(limitParam);

  // Validate parsed values
  if (isNaN(page) || page < 1) throw new Error("Invalid 'page' parameter");
  if (isNaN(limit) || limit < 1) throw new Error("Invalid 'limit' parameter");

  const skip=(page-1)*limit;

  try { 
    client = new MongoClient(uri); 
    
    await client.connect(); 
    
    const db = client.db(dbName); 
    
    const userposts = db.collection('userposts'); 
    const users=db.collection('users')
    
    const allUserPosts = await userposts.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(); 

    
    const finalPosts = await Promise.all(
      allUserPosts.map(async (post) => {
        const { createdBy } = post;
        const user = await users.findOne({ _id: createdBy }, { projection: { name: 1, image: 1 } });


        post.likes = post?.likes ? await users.find(
          { _id: { $in: post?.likes } },
          { projection: { _id:1,image:1,name:1 } }
        ).toArray() : [];

        return { ...post, user };
      })
    );
    
    return NextResponse.json(finalPosts); 
  } catch (error) {  console.error(error);
     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
     } finally { 
      if (client) { await client.close(); } }
}




export async function DELETE(request:NextRequest){
  let client: MongoClient | null = null;
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id') as string;
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const userposts = db.collection('userposts');
    const users=db.collection('users');
  

    const post = await userposts.findOne({ _id: new ObjectId(postId as string) });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    const user = await users.findOne({ _id: post.createdBy });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedPosts = user.posts.filter((p: string) => p !== postId);

    const postImage=post.image;

    const result = await userposts.findOneAndDelete({ _id: new ObjectId(postId as string) });



    if (result && result._id) {

      const res=await backendClient.mypublicImages.deleteFile({url:postImage});

      const userUpdateResult = await users.findOneAndUpdate(
        { _id: post.createdBy },
        {
          $set: {
            posts: updatedPosts,
          },
        },
        { returnDocument: 'after' } // ensures you get the updated document
      );
  
      if (res && userUpdateResult && userUpdateResult._id) {
        return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
      } else {
        throw new Error('Failed to update user posts');
      }
    } else {
      throw new Error('Failed to delete post');
            

  }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}


export async function PUT(request:NextRequest){
  let client: MongoClient | null = null;
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id') as string;
    const body = await request.json();
    const {likes}=body;

    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const userposts = db.collection('userposts');
   
    const post = await userposts.findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
   
    
    const newLikes = likes.map((like: string) =>new ObjectId(like));



    const result = await userposts.updateOne(
      { _id: new ObjectId(postId as string) },
      { $set: { likes: newLikes } }
    );
    if(result.acknowledged){
      return NextResponse.json({ message: 'Post updated successfully' }, { status: 200 });
    }
      
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}