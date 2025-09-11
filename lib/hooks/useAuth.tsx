'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface User {
  _id: string
  id?: string // For compatibility with API responses
  email: string
  name: string
  role?: string
  emailVerified?: boolean
  hasPassword?: boolean
  image?: string
  description?: string
  gradYear?: number
  interests?: string[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password?: string, type?: 'password') => Promise<any>
  requestOTP: (email: string) => Promise<any>
  verifyOTP: (email: string, otp: string, otpToken: string) => Promise<any>
  logout: () => Promise<void>
  register: (name: string, email: string) => Promise<any>
  refreshUser: () => Promise<void>
  authTrigger: number // For forcing re-renders
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authTrigger, setAuthTrigger] = useState(0) // Force re-renders on auth changes

  // Normalize user data to handle id/_id inconsistencies
  const normalizeUser = (userData: any): User => {
    if (!userData) return userData
    return {
      ...userData,
      _id: userData._id || userData.id,
      id: userData.id || userData._id
    }
  }

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user ? normalizeUser(data.user) : null)
        setAuthTrigger(prev => prev + 1) // Force re-render
      } else {
        setUser(null)
        setAuthTrigger(prev => prev + 1) // Force re-render
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
      setAuthTrigger(prev => prev + 1) // Force re-render
    }
  }

  const login = async (email: string, password?: string, type: 'password' = 'password') => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, type })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Immediately update user state if user data is returned
      if (data.user) {
        setUser(normalizeUser(data.user))
        setAuthTrigger(prev => prev + 1) // Force re-render
      } else {
        // Fallback to refresh if no user data in response
        await refreshUser()
      }
      
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setAuthTrigger(prev => prev + 1) // Force re-render
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null) // Clear user even if request fails
      setAuthTrigger(prev => prev + 1) // Force re-render
    }
  }

  const requestOTP = async (email: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'otp-request' })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      return data
    } catch (error) {
      console.error('OTP request error:', error)
      throw error
    }
  }

  const verifyOTP = async (email: string, otp: string, otpToken: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, otpToken, type: 'otp-verify' })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed')
      }

      // Immediately update user state if user data is returned
      if (data.user) {
        setUser(normalizeUser(data.user))
        setAuthTrigger(prev => prev + 1) // Force re-render
      } else {
        // Fallback to refresh if no user data in response
        await refreshUser()
      }
      
      return data
    } catch (error) {
      console.error('OTP verification error:', error)
      throw error
    }
  }

  const register = async (name: string, email: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Registration doesn't auto-login (requires email verification)
      // So we don't update user state here, but we do trigger a refresh
      // in case the user is somehow already logged in
      setAuthTrigger(prev => prev + 1) // Force re-render
      
      return data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    user,
    loading,
    login,
    requestOTP,
    verifyOTP,
    logout,
    register,
    refreshUser,
    authTrigger
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()

    if (loading) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    }

    if (!user) {
      // Redirect to login or show login form
      return <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Authentication Required</h2>
          <p>Please log in to access this page.</p>
        </div>
      </div>
    }

    return <Component {...props} />
  }
}

// Hook for password management
export function usePassword() {
  const createPassword = async (password: string) => {
    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create password')
      }

      return data
    } catch (error) {
      console.error('Create password error:', error)
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      return data
    } catch (error) {
      console.error('Change password error:', error)
      throw error
    }
  }

  const removePassword = async (currentPassword: string) => {
    try {
      const response = await fetch('/api/auth/password', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove password')
      }

      return data
    } catch (error) {
      console.error('Remove password error:', error)
      throw error
    }
  }

  return { createPassword, changePassword, removePassword }
}