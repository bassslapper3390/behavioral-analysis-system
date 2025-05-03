"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import {
  trackMouseMovements,
  trackKeyPresses,
  trackClickEvents,
  generateBehavioralProfile,
  type MouseMovement,
  type KeyPress,
  type ClickEvent,
  type BehavioralProfile,
} from "@/lib/behavior-tracker"

interface BehaviorTrackerProps {
  onProfileGenerated?: (profile: BehavioralProfile) => void
  duration?: number
  autoStart?: boolean
  children: React.ReactNode
}

export default function BehaviorTracker({
  onProfileGenerated,
  duration = 10000,
  autoStart = true,
  children,
}: BehaviorTrackerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [mouseMovements, setMouseMovements] = useState<MouseMovement[]>([])
  const [keyPresses, setKeyPresses] = useState<KeyPress[]>([])
  const [clickEvents, setClickEvents] = useState<ClickEvent[]>([])
  const [profileGenerated, setProfileGenerated] = useState(false)

  const startTracking = async () => {
    if (!containerRef.current || isTracking) return

    setIsTracking(true)
    console.log("Starting behavior tracking for", duration, "ms")

    try {
      // Track all behaviors simultaneously
      const [movements, presses, clicks] = await Promise.all([
        trackMouseMovements(containerRef.current, duration),
        trackKeyPresses(containerRef.current, duration),
        trackClickEvents(containerRef.current, duration),
      ])

      console.log("Tracking complete:", {
        mouseMovements: movements.length,
        keyPresses: presses.length,
        clickEvents: clicks.length,
      })

      setMouseMovements(movements)
      setKeyPresses(presses)
      setClickEvents(clicks)

      // Generate profile
      const profile = generateBehavioralProfile(presses, movements, clicks)
      console.log("Generated behavioral profile:", {
        typingSpeed: profile.typingSpeed,
        typingRhythmCount: profile.typingRhythm.length,
        mouseMovementCount: profile.mouseMovementPattern.length,
        clickPatternCount: profile.clickPattern.length,
      })

      setProfileGenerated(true)

      // Call callback if provided
      if (onProfileGenerated) {
        onProfileGenerated(profile)
      }
    } catch (error) {
      console.error("Error tracking behavior:", error)
    } finally {
      setIsTracking(false)
    }
  }

  useEffect(() => {
    if (autoStart && !profileGenerated) {
      startTracking()
    }
  }, [autoStart, profileGenerated])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      tabIndex={0} // Make div focusable for key events
    >
      {children}

      {isTracking && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs animate-pulse">
          Analyzing behavior...
        </div>
      )}
    </div>
  )
}
