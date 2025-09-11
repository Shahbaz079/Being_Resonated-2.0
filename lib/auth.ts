import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || process.env.AUTH_SECRET || 'your-jwt-secret-key')
const JWT_EXPIRES_IN = '7d'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  emailVerified: boolean
  hasPassword: boolean
}

// JWT Token Management
export const generateToken = async (user: AuthUser): Promise<string> => {
  console.log('Generating token for user:', { userId: user.id, email: user.email });
  
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    hasPassword: user.hasPassword
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET)
    
  return token
}

export const verifyToken = async (token: string): Promise<AuthUser | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const decoded = payload as unknown as AuthUser
    console.log('Token verification successful:', { userId: decoded.id, email: decoded.email });
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error);
    return null
  }
}

// Session Management
export const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

export const getAuthCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('auth-token')
  return authCookie?.value || null
}

export const removeAuthCookie = async () => {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

// Get current user from request
export const getCurrentUser = async (request?: NextRequest): Promise<AuthUser | null> => {
  try {
    let token: string | null = null
    
    if (request) {
      // For middleware usage
      token = request.cookies.get('auth-token')?.value || null
    } else {
      // For server components/API routes
      token = await getAuthCookie()
    }
    
    if (!token) return null
    
    const user = await verifyToken(token)
    return user
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null
  }
}

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12)
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

// Email verification token
export const generateVerificationToken = (email: string): string => {
  return jwt.sign(
    { email, type: 'email-verification' },
    JWT_SECRET,
    { expiresIn: '24h' } // Email verification expires in 24 hours
  )
}

export const verifyEmailToken = (token: string): { email: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string, type: string }
    if (decoded.type === 'email-verification') {
      return { email: decoded.email }
    }
    return null
  } catch (error) {
    return null
  }
}

// OTP utilities
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const generateOTPToken = async (email: string, otp: string): Promise<string> => {
  console.log('Generating OTP token for email:', email);
  
  const token = await new SignJWT({ email, otp, type: 'otp-login' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m') // OTP expires in 10 minutes
    .sign(JWT_SECRET)
    
  return token
}

export const verifyOTPToken = async (token: string, providedOTP: string): Promise<{ email: string } | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const decoded = payload as { email: string, otp: string, type: string }
    console.log('Verifying OTP token:', { email: decoded.email, otpMatch: decoded.otp === providedOTP });
    if (decoded.type === 'otp-login' && decoded.otp === providedOTP) {
      return { email: decoded.email }
    }
    return null
  } catch (error) {
    console.error('OTP token verification failed:', error);
    return null
  }
}