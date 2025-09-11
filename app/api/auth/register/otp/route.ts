import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/config/db'
import { User } from '@/models/User'
import { generateOTP, generateOTPToken } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/email'
import { z } from 'zod'

const registerOTPSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address').refine(
    (email) => email.endsWith('@students.iiests.ac.in'),
    'Only IIEST Shibpur student emails are allowed'
  ),
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { name, email } = registerOTPSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Generate and send OTP
    const otpCode = generateOTP()
    const otpTokenGenerated = await generateOTPToken(email, otpCode)
    
    try {
      await sendOTPEmail(email, otpCode)
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'OTP sent successfully! Please check your email.',
        otpToken: otpTokenGenerated,
        name,
        email
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Registration OTP request error:', error)
    
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