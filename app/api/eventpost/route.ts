'use server'

import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { EventPost } from '@/models/EventPost';
import { backendClient } from '../edgestore/[...edgestore]/route';

type Data = {
  message: string;
  event?: typeof EventPost;
};

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

  try {
   

    const body = await req.json();
    if (!body) {
      return NextResponse.json({ error: 'No data found' }, { status: 400 });
    }
    
    client = new MongoClient(uri);
    await connectDB();
    const db = client.db(dbName);
    const eventposts = db.collection('eventposts');
    const events = db.collection('events');
    const teams = db.collection('teams');

    const { title,name, image,imgThumbnail, caption, createdBy, Location, time, date, eventId } = body;

    const team = await teams.findOne({ _id: new ObjectId(title as string) });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    
    const post = {
      title:name,
      from:new ObjectId(eventId as string),
      team:team._id,
      image,
      imgThumbnail,
      caption,
      createdBy: new ObjectId(createdBy as string),
      Location,
      time,
      date,
      createdAt: new Date(), 
      updatedAt: new Date() 
    };

    const event = await events.findOne({ _id: new ObjectId(eventId as string) });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updatedPosts = event.posts || [];
    

    const result = await eventposts.insertOne(post);

    if (result && result.acknowledged) {
      const updatedEventPosts=event.posts || [];
      updatedEventPosts.push( new ObjectId(result.insertedId));
      await events.findOneAndUpdate(
        { _id:new ObjectId(eventId as string) },
        { $set: {posts:updatedEventPosts},
       }
      );
      return NextResponse.json({ message: 'Event Post created successfully', event: post }, { status: 201 });
    } else {
      throw new Error('Failed to create event post');
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

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;

  
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const eventposts = db.collection('eventposts');
    const events=db.collection('events')

    const allEventpost = await eventposts.find({}).sort({date: -1 }).toArray();

    const finalPosts = await Promise.all(
      allEventpost.map(async (post) => {
        const { from } = post;
        const eventImg = await events.findOne({ _id: from }, { projection: { image: 1 ,leaders:1} });
        return { ...post, eventImg };
      })
    );

    return NextResponse.json(finalPosts);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function PUT(request:NextRequest){
  let client: MongoClient | null = null;
  const searchParams = new URLSearchParams(request.url);
  const type = searchParams.get('type');
  
  const body = await request.json();
    if (!body) {
      return NextResponse.json({ error: 'No data found' }, { status: 400 });
    }
    if(type==='like'){
  try {
    

    const { postId,userId,} = body;

    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const eventposts = db.collection('eventposts');
    const users = db.collection('users');

    const user = await users.findOne({ _id: new ObjectId(userId as string) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const post = await eventposts.findOne({ _id: new ObjectId(postId as string) });



    const likes = post?.likes || []
  const newLikes = likes.push(new ObjectId(userId as string));

  const userLikes=user.postLikes || [];
  const newUserLikes=userLikes.push(new ObjectId(postId as string));

    const result = await eventposts.findOneAndUpdate(
      { _id: new ObjectId(postId as string) },
      {
        $set: {
        likes:newLikes,
          updatedAt: new Date(),
        },
      }
    );

  if (result && result.lastErrorObject.n > 0) {
  const userUpdateResult = await users.findOneAndUpdate(
    { _id: new ObjectId(userId as string) },
    {
      $set: {
        postLikes: newUserLikes,
      },
    },
    { returnDocument: 'after' } // ensures you get the updated document
  );

  if (userUpdateResult && userUpdateResult.lastErrorObject.n > 0) {
    return NextResponse.json({ message: 'Post liked successfully' }, { status: 200 });
  } else {
    throw new Error('Failed to update user post likes');
  }
} else {
  throw new Error('Failed to like post');
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
if(type==='unlike'){
  try {
    

    const { postId,userId,} = body;

    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const eventposts = db.collection('eventposts');
    const users = db.collection('users');

    const user = await users.findOne({ _id: new ObjectId(userId as string) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const post = await eventposts.findOne({ _id: new ObjectId(postId as string) });
    const likes = post?.likes || [];
    const newLikes=likes.filter((like:ObjectId)=>like.toString()!==userId);

    const userLikes=user.postLikes || [];
    const newUserLikes=userLikes.filter((like:ObjectId)=>like.toString()!==postId);

    const result = await eventposts.findOneAndUpdate(
      { _id: new ObjectId(postId as string) },
      {
        $set: {
        likes:newLikes,
          updatedAt: new Date(),
        },
      }
    );
    if(result && result.ok){
      await users.findOneAndUpdate(
        { _id: new ObjectId(userId as string) },
        {
          $set: {
            postLikes:newUserLikes,
          },
        }
      );
      return NextResponse.json({ message: 'Post unliked successfully' }, { status: 200 });
    }

  }catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }finally{
    if(client){
      await client.close();
    }
  }
}

  
}

export async function DELETE(request:NextRequest){
  let client: MongoClient | null = null;
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id') as string;
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const eventposts = db.collection('eventposts');
    const events=db.collection('events');

    const post = await eventposts.findOne({ _id: new ObjectId(postId as string) });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    const event = await events.findOne({ _id: post.from });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updatedPosts = event.posts.filter((p: ObjectId) => p.toString() !== postId);

    const postImage=post.image;

    const result = await eventposts.findOneAndDelete({ _id: new ObjectId(postId as string) });

    if (result && result._id) {
      const res=await backendClient.mypublicImages.deleteFile({
        url:postImage
      })

      const eventUpdateResult= await events.findOneAndUpdate(
        { _id: event._id },
        {
          $set: {
            posts: updatedPosts,
          },
        },
        {returnDocument: "after"}
      );
      if(res && eventUpdateResult && eventUpdateResult._id){
      return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });}else{
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
