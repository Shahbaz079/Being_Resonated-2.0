'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const Header = () => {
  const { user, logout, loading, authTrigger } = useAuth()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)

  // Force re-render when auth state changes
  useEffect(() => {
    // Component will automatically re-render when authTrigger changes
  }, [authTrigger])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <header className="fixed top-0 right-[4%] my-4 rounded-full items-center text-white flex flex-row justify-between z-[999]">
        <div className="w-10 h-10 bg-gray-600 rounded-full animate-pulse"></div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 right-[4%] my-4 rounded-full items-center text-white flex flex-row justify-between z-[999]">
      <div className="">
        {!user ? (
          <div className="bg-orange-400 hover:bg-orange-500 text-black font-semibold py-2 px-4 rounded-full text-lg cursor-pointer transition-colors">
            <button onClick={() => router.push('/login')}>
              Sign In
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                  {user.gradYear && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Grad Year: {user.gradYear}
                    </p>
                  )}
                </div>
                
                <div className="py-1">
                  <button
                    onClick={() => {
                      router.push('/profile')
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    View Profile
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push('/profile?tab=password')
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {user.hasPassword ? 'Change Password' : 'Set Password'}
                  </button>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                  <button
                    onClick={() => {
                      handleLogout()
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  )
}

export default Header;