import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/config/db'
import { User } from '@/models/User'
import { getCurrentUser, hashPassword, comparePassword } from '@/lib/auth'
import { z } from 'zod'

const createPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one lowercase letter, one uppercase letter, and one number')
})

// Create password for users who don't have one
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Get current user
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { password } = createPasswordSchema.parse(body)
    
    // Find user
    const user = await User.findById(currentUser.id).select('+password')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if user already has a password
    if (user.password) {
      return NextResponse.json(
        { error: 'User already has a password. Use PUT method to change it.' },
        { status: 400 }
      )
    }
    
    // Hash and save password
    const hashedPassword = await hashPassword(password)
    user.password = hashedPassword
    await user.save()
    
    return NextResponse.json(
      { message: 'Password created successfully' },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Create password error:', error)
    
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

// Change existing password
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    // Get current user
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)
    
    // Find user with password
    const user = await User.findById(currentUser.id).select('+password')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if user has a password
    if (!user.password) {
      return NextResponse.json(
        { error: 'User does not have a password set. Use POST method to create one.' },
        { status: 400 }
      )
    }
    
    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }
    
    // Hash and save new password
    const hashedNewPassword = await hashPassword(newPassword)
    user.password = hashedNewPassword
    await user.save()
    
    return NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Change password error:', error)
    
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

// Remove password (allow user to go back to email-only login)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    // Get current user
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { currentPassword } = body
    
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required to remove password' },
        { status: 400 }
      )
    }
    
    // Find user with password
    const user = await User.findById(currentUser.id).select('+password')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if user has a password
    if (!user.password) {
      return NextResponse.json(
        { error: 'User does not have a password set' },
        { status: 400 }
      )
    }
    
    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }
    
    // Remove password
    user.password = undefined
    await user.save()
    
    return NextResponse.json(
      { message: 'Password removed successfully. You can now only login using email verification.' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Remove password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}