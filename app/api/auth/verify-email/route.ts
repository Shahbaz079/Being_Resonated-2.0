import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/config/db'
import { User } from '@/models/User'
import { verifyEmailToken, generateToken, setAuthCookie } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }
    
    // Verify the token
    const decoded = await verifyEmailToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }
    
    // Find and update user
    const user = await User.findOne({ email: decoded.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }
    
    // Update user as verified
    user.emailVerified = true
    await user.save()
    
    // Generate auth token and set cookie for auto-login
    const authToken = await generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: true,
      hasPassword: !!user.password
    })
    
    // Set HTTP-only cookie
    const response = NextResponse.redirect(
      new URL('/?verified=true', request.url)
    )
    
    response.cookies.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
    
    return response
    
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also handle POST requests for API calls
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { token } = body
    
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }
    
    // Verify the token
    const decoded = await verifyEmailToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }
    
    // Find and update user
    const user = await User.findOne({ email: decoded.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email already verified', user: {
          id: user._id,
          email: user.email,
          name: user.name,
          emailVerified: true
        }},
        { status: 200 }
      )
    }
    
    // Update user as verified
    user.emailVerified = true
    await user.save()
    
    // Generate auth token
    const authToken = await generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: true,
      hasPassword: !!user.password
    })
    
    return NextResponse.json(
      { 
        message: 'Email verified successfully! You are now logged in.',
        token: authToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: true,
          hasPassword: !!user.password
        }
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}