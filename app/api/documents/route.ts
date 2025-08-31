'use server'

import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';




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
    const documents = db.collection('documents');
    

    const { dept,sem,exam,year , title , fileId} = body;



    

    
    const doc = {
      title,
      dept,
      sem,
      exam,
      year,
      fileId,
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    const result = await documents.insertOne(doc);
    

    if (result && result.acknowledged) {
      return NextResponse.json({ message: 'Document created successfully', document: doc }, { status: 201 });
    } else {
      throw new Error('Failed to create document');
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

      const { searchParams } = new URL(request.url);
    const sem = searchParams.get('sem') as string;
    const dept = searchParams.get('dept') as string;
    const exam = searchParams.get('exam') as string;

    if (!sem || !dept || !exam) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
  
  
    client = new MongoClient(uri);
   await client.connect();
    const db = client.db(dbName);
    const documents = db.collection('documents');
   


 
   

    const dept_sem_examAllPapers = await documents.find({dept:dept,sem:sem,exam:exam}).toArray();

    console.log(dept_sem_examAllPapers[0])

    // If no documents found, return default data
    if (!dept_sem_examAllPapers || dept_sem_examAllPapers.length === 0) {
      try {
        // Default response: one array with one object
        const defaultYears = ["2022","2023", "2024"]; // You can customize this list
        const defaultData = defaultYears.map((year) => [
          { dept, sem, exam, year },
        ]);

        return NextResponse.json({ success: true, PYQDocs: defaultData }); 
      } catch (error) {
        console.error("Error processing default documents:", error);
        return NextResponse.json({ error: 'Failed to process Default documents' }, { status: 500 });
      } finally {
        if (client) {
          await client.close();
        }
      }
    }

     


  // get the current year as a number
  const currentYear = new Date().getFullYear();  
      
    // Group by year
    const groupedByYear = new Map<string, any[]>();

    for(let i=4; i >= 0; i--) {
      const year = (currentYear - i).toString();
      groupedByYear.set(year, [{sem: sem, exam: exam, year: year}]);
    }
      

    try {
          for (const doc of dept_sem_examAllPapers) {
      const year = doc.year;


    if(groupedByYear.has(year))groupedByYear.get(year)!.push(doc);
    }

    // Convert the map to an array of arrays
    const groupedArray = Array.from(groupedByYear.values());

       return NextResponse.json({ success: true, PYQDocs: groupedArray });
    } catch (error) {
      
      console.error("Error grouping documents:", error);
      return NextResponse.json({ error: 'Failed to group documents' }, { status: 500 });
    }finally{
        if (client) {
          await client.close();
        }
    }
      

  }

export async function DELETE(req: NextRequest) {
  let client: MongoClient | null = null;

  try {
    const body = await req.json();
    if (!body) {
      return NextResponse.json({ error: 'No data found' }, { status: 400 });
    }
    
    const { fileId, dept, sem, exam, year } = body;
    
    if (!fileId || !dept || !sem || !exam || !year) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const documents = db.collection('documents');
    
    // Delete the document with all matching criteria for security
    const result = await documents.deleteOne({
      fileId: fileId,
      dept: dept,
      sem: sem,
      exam: exam,
      year: year
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Document not found or could not be deleted' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Document deleted successfully' 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
