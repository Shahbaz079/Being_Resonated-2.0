
import { NextResponse, NextRequest } from 'next/server'
import connectDB from '@/config/db'
import { User } from '@/models/User'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    
    // Get current user from JWT token
    const currentUser = await getCurrentUser(req)
    
    if (!currentUser) {
      return NextResponse.json({ message: 'No active session' }, { status: 401 })
    }
    
    // Get fresh user data from database
    const user = await User.findById(currentUser.id)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      message: 'Session is active',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        hasPassword: !!user.password,
        image: user.image,
        description: user.description,
        gradYear: user.gradYear,
        interests: user.interests
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
