import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/config/db'
import { User } from '@/models/User'
import { generateToken, verifyOTPToken } from '@/lib/auth'
import { z } from 'zod'

const registerVerifySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address').refine(
    (email) => email.endsWith('@students.iiests.ac.in'),
    'Only IIEST Shibpur student emails are allowed'
  ),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  otpToken: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { name, email, otp, otpToken } = registerVerifySchema.parse(body)
    
    // Verify OTP
    const otpVerification = await verifyOTPToken(otpToken, otp)
    if (!otpVerification) {
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000))
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      )
    }
    
    // Double-check email matches
    if (otpVerification.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email mismatch' },
        { status: 400 }
      )
    }
    
    // Check if user already exists (just in case)
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Create user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      emailVerified: true, // Mark as verified since they verified via OTP
      authProviderId: `email-${Date.now()}`,
      role: 'user'
    })
    
    // Generate auth token
    const authToken = await generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      emailVerified: newUser.emailVerified,
      hasPassword: !!newUser.password
    })
    
    // Set HTTP-only cookie and return response
    const response = NextResponse.json(
      { 
        message: 'Registration successful! You are now logged in.',
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          emailVerified: newUser.emailVerified,
          hasPassword: !!newUser.password
        }
      },
      { status: 200 }
    )
    
    response.cookies.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.beingresonated.com' : undefined
    })
    
    return response
    
  } catch (error) {
    console.error('Registration verification error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}