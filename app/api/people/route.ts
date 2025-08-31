import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

import { ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI as string;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

if (!dbName) {
  throw new Error('Invalid/Missing environment variable: "DB_NAME"');
}

export async function GET(req: NextRequest) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    
    // Validate parameters
    if (!id) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }
    
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json({ message: 'Invalid pagination parameters' }, { status: 400 });
    }

    const users = db.collection('users');

    const existingUser = await users.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { interests: referenceArray } = existingUser;
    if (!referenceArray || referenceArray.length === 0) {
      // Return empty paginated response if no interests
      return NextResponse.json({
        users: [],
        totalUsers: 0,
        totalPages: 0,
        currentPage: page,
        hasNextPage: false,
        hasPreviousPage: false
      }, { status: 200 });
    }

    // Optimized aggregation pipeline: get count and paginated data in single operation
    const aggregationPipeline = [
      {
        // Stage 1: Filter users (exclude current user and must have matching interests)
        $match: {
          _id: { $ne: new ObjectId(id) },
          interests: { $exists: true, $ne: [], $in: referenceArray }
        }
      },
      {
        // Stage 2: Add match count field
        $addFields: {
          matchCount: {
            $size: {
              $setIntersection: ["$interests", referenceArray]
            }
          }
        }
      },
      {
        // Stage 3: Filter users with at least 1 match
        $match: { matchCount: { $gt: 0 } }
      },
      {
        // Stage 4: Sort by match count (descending)
        $sort: { matchCount: -1, _id: 1 }
      }
    ];

    // Use facet to get count and paginated data in single database operation
    const result = await users.aggregate([
      ...aggregationPipeline,
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          paginatedData: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                name: 1,
                description: 1,
                email: 1,
                gradYear: 1,
                interests: 1,
                image: 1,
                posts: 1,
                teams: 1,
                matchCount: 1
              }
            }
          ]
        }
      }
    ]).toArray();

    const totalUsers = result[0]?.totalCount[0]?.count || 0;
    const paginatedUsers = result[0]?.paginatedData || [];
    
    if (totalUsers === 0) {
      return NextResponse.json({
        users: [],
        totalUsers: 0,
        totalPages: 0,
        currentPage: page,
        hasNextPage: false,
        hasPreviousPage: false
      }, { status: 200 });
    }

    const totalPages = Math.ceil(totalUsers / limit);
    
    const plainUsers = paginatedUsers.map((user:any) => ({
      ...user,
      _id: user._id.toString(),
      teams: user.teams?.map((teamId: ObjectId) => teamId.toString()) ?? [],
    }));

    // Return paginated response
    const response = {
      users: plainUsers,
      totalUsers,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }finally {
    if (client) {
      await client.close(); 
     } }
}
