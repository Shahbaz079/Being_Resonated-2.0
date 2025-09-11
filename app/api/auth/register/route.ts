import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/config/db'
import { User } from '@/models/User'
import { generateVerificationToken } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { name, email } = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Create user with email verification pending
    const newUser = await User.create({
      name,
      email,
      emailVerified: false,
      authProviderId: `email-${Date.now()}`, // Temporary provider ID
      role: 'user'
    })
    
    // Generate verification token
    const verificationToken = generateVerificationToken(email)
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken)
    
    return NextResponse.json(
      { 
        message: 'Registration successful! Please check your email to verify your account.',
        userId: newUser._id 
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Registration error:', error)
    
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