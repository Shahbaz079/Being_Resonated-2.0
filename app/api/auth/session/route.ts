
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse,NextRequest} from 'next/server';

export async function GET(req: NextRequest,res: NextResponse) {
  try {
    const auth = getAuth(req);
    const sessionId = auth.sessionId;
    
    if (sessionId) {
      return NextResponse.json({ message: 'Session is active', sessionId }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'No active session' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
