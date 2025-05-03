'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function WarningSystem() {
  const [warnings, setWarnings] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkWarnings = async () => {
      try {
        const response = await fetch('/api/auth/check-warnings')
        const data = await response.json()

        if (data.forceLogout) {
          await signOut({ redirect: false })
          router.push('/auth/login?message=You have been logged out due to suspicious activity')
          return
        }

        if (data.warnings > warnings) {
          setWarnings(data.warnings)
          setShowWarning(true)
        }
      } catch (error) {
        console.error('Error checking warnings:', error)
      }
    }

    // Check every 30 seconds
    const interval = setInterval(checkWarnings, 30000)
    checkWarnings() // Initial check

    return () => clearInterval(interval)
  }, [warnings, router])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold text-red-600 mb-4">Security Warning</h2>
        <p className="mb-4">
          {warnings === 1 && "First Warning: Unusual activity detected. Please verify your identity."}
          {warnings === 2 && "Second Warning: Multiple unusual activities detected. Please be careful."}
          {warnings === 3 && "Final Warning: You will be logged out due to suspicious activity."}
        </p>
        <button
          onClick={() => setShowWarning(false)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Acknowledge
        </button>
      </div>
    </div>
  )
} 