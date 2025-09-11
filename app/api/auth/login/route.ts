import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/config/db'
import { User } from '@/models/User'
import { generateToken, comparePassword, generateOTP, generateOTPToken, verifyOTPToken } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/email'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address').refine(
    (email) => email.endsWith('@students.iiests.ac.in'),
    'Only IIEST Shibpur student emails are allowed'
  ),
  password: z.string().optional(),
  otp: z.string().optional(),
  otpToken: z.string().optional(),
  type: z.enum(['password', 'otp-request', 'otp-verify']).default('password')
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { email, password, otp, otpToken, type } = loginSchema.parse(body)
    
    // Handle OTP request - when user wants to receive an OTP
    if (type === 'otp-request') {
      // Find user (case insensitive) - only allow login for existing users
      const user = await User.findOne({ email: email.toLowerCase() })
      
      // If user doesn't exist, return error
      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this email address. Please register first.' },
          { status: 404 }
        )
      }
      
      // Generate and send OTP
      const otpCode = generateOTP()
      const otpTokenGenerated = await generateOTPToken(email, otpCode)
      
      try {
        await sendOTPEmail(email, otpCode)
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError)
        // Continue with the flow even if email fails
      }
      
      return NextResponse.json(
        { 
          message: 'OTP sent successfully! Please check your email.',
          otpToken: otpTokenGenerated
        },
        { status: 200 }
      )
    }
    
    // Handle OTP verification - when user submits the OTP
    if (type === 'otp-verify') {
      if (!otp || !otpToken) {
        return NextResponse.json(
          { error: 'OTP and token are required for verification' },
          { status: 400 }
        )
      }
      
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
      
      // Find user (case insensitive) - only allow login for existing users
      const user = await User.findOne({ email: otpVerification.email.toLowerCase() })
      
      // If user doesn't exist, return error
      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this email address. Please register first.' },
          { status: 404 }
        )
      }
      
      // Generate auth token and set cookie
      const authToken = await generateToken({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        hasPassword: !!user.password
      })
      
      const response = NextResponse.json(
        { 
          message: 'Login successful',
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            emailVerified: user.emailVerified,
            hasPassword: !!user.password
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
    }
    
    // Handle password login
    if (type === 'password') {
      // Find user for password login
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this email address' },
          { status: 404 }
        )
      }
      
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required for password login' },
          { status: 400 }
        )
      }
      
      if (!user.password) {
        return NextResponse.json(
          { error: 'This account does not have a password set. Please use OTP login or set a password in your profile.' },
          { status: 400 }
        )
      }
      
      try {
        const isPasswordValid = await comparePassword(password, user.password)
        if (!isPasswordValid) {
          // Add delay to prevent timing attacks
          await new Promise(resolve => setTimeout(resolve, 1000))
          return NextResponse.json(
            { error: 'Invalid password' },
            { status: 401 }
          )
        }
      } catch (error) {
        console.error('Password comparison error:', error)
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 500 }
        )
      }
      
      // Generate auth token
      const authToken = await generateToken({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        hasPassword: !!user.password
      })
      
      // Set HTTP-only cookie
      const response = NextResponse.json(
        { 
          message: 'Login successful',
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            emailVerified: user.emailVerified,
            hasPassword: !!user.password
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
    }
    
    return NextResponse.json(
      { error: 'Invalid login type' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Login error:', error)
    
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