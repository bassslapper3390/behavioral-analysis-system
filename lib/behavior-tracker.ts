// Types for behavior tracking
export interface MouseMovement {
  x: number
  y: number
  timestamp: number
}

export interface KeyPress {
  key: string
  duration: number
  timestamp: number
}

export interface ClickEvent {
  x: number
  y: number
  button: number
  timestamp: number
}

export interface BehavioralProfile {
  typingSpeed: number
  typingRhythm: number[]
  mouseMovementPattern: MouseMovement[]
  clickPattern: ClickEvent[]
}

// Enhanced behavioral metrics
export interface EnhancedBehavioralProfile extends BehavioralProfile {
  mouseSpeed: number;
  mouseAcceleration: number[];
  clickFrequency: number;
  scrollPattern: number[];
  idleTime: number;
  sessionDuration: number;
  focusTime: number;
}

// Track mouse movements
export function trackMouseMovements(element: HTMLElement, duration = 10000): Promise<MouseMovement[]> {
  return new Promise((resolve) => {
    const movements: MouseMovement[] = []
    let lastTimestamp = Date.now()
    let lastX = 0
    let lastY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = Date.now()
      const timeDiff = currentTime - lastTimestamp
      
      // Only record if enough time has passed (reduce noise)
      if (timeDiff > 16) { // ~60fps
        movements.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: currentTime,
        })
        lastTimestamp = currentTime
        lastX = e.clientX
        lastY = e.clientY
      }
    }

    element.addEventListener("mousemove", handleMouseMove)

    setTimeout(() => {
      element.removeEventListener("mousemove", handleMouseMove)
      console.log(`Tracked ${movements.length} mouse movements`)
      resolve(movements)
    }, duration)
  })
}

// Track key presses
export function trackKeyPresses(element: HTMLElement, duration = 10000): Promise<KeyPress[]> {
  return new Promise((resolve) => {
    const keyPresses: KeyPress[] = []
    const keyDownTimes: Record<string, number> = {}

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!keyDownTimes[e.key]) {
        keyDownTimes[e.key] = Date.now()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keyDownTimes[e.key]) {
        const duration = Date.now() - keyDownTimes[e.key]
        keyPresses.push({
          key: e.key,
          duration,
          timestamp: keyDownTimes[e.key],
        })
        delete keyDownTimes[e.key]
      }
    }

    element.addEventListener("keydown", handleKeyDown)
    element.addEventListener("keyup", handleKeyUp)

    setTimeout(() => {
      element.removeEventListener("keydown", handleKeyDown)
      element.removeEventListener("keyup", handleKeyUp)
      console.log(`Tracked ${keyPresses.length} key presses`)
      resolve(keyPresses)
    }, duration)
  })
}

// Track click events
export function trackClickEvents(element: HTMLElement, duration = 10000): Promise<ClickEvent[]> {
  return new Promise((resolve) => {
    const clicks: ClickEvent[] = []

    const handleClick = (e: MouseEvent) => {
      clicks.push({
        x: e.clientX,
        y: e.clientY,
        button: e.button,
        timestamp: Date.now(),
      })
    }

    element.addEventListener("click", handleClick)

    setTimeout(() => {
      element.removeEventListener("click", handleClick)
      console.log(`Tracked ${clicks.length} click events`)
      resolve(clicks)
    }, duration)
  })
}

// Generate behavioral profile from tracking data
export function generateBehavioralProfile(
  keyPresses: KeyPress[],
  mouseMovements: MouseMovement[],
  clickEvents: ClickEvent[],
): BehavioralProfile {
  // Calculate typing speed (characters per minute)
  const typingSpeed = keyPresses.length > 0
    ? (keyPresses.length * 60000) / (keyPresses[keyPresses.length - 1].timestamp - keyPresses[0].timestamp)
    : 0

  // Calculate typing rhythm (time between key presses)
  const typingRhythm = []
  for (let i = 1; i < keyPresses.length; i++) {
    typingRhythm.push(keyPresses[i].timestamp - keyPresses[i - 1].timestamp)
  }

  // Calculate mouse movement patterns
  const movementPattern = mouseMovements.map((m, i) => {
    if (i === 0) return { x: m.x, y: m.y, timestamp: m.timestamp }
    const prev = mouseMovements[i - 1]
    return {
      x: m.x - prev.x,
      y: m.y - prev.y,
      timestamp: m.timestamp - prev.timestamp
    }
  })

  // Calculate click patterns
  const clickPattern = clickEvents.map((c, i) => {
    if (i === 0) return { x: c.x, y: c.y, button: c.button, timestamp: c.timestamp }
    const prev = clickEvents[i - 1]
    return {
      x: c.x - prev.x,
      y: c.y - prev.y,
      button: c.button,
      timestamp: c.timestamp - prev.timestamp
    }
  })

  return {
    typingSpeed,
    typingRhythm,
    mouseMovementPattern: movementPattern,
    clickPattern: clickPattern,
  }
}

// Enhanced behavioral profile generation
export function generateEnhancedBehavioralProfile(
  keyPresses: KeyPress[],
  mouseMovements: MouseMovement[],
  clickEvents: ClickEvent[],
): EnhancedBehavioralProfile {
  const baseProfile = generateBehavioralProfile(keyPresses, mouseMovements, clickEvents)
  
  // Calculate mouse speed and acceleration
  const mouseSpeed = calculateMouseSpeed(mouseMovements)
  const mouseAcceleration = calculateMouseAcceleration(mouseMovements)
  
  // Calculate click frequency (clicks per minute)
  const clickFrequency = clickEvents.length > 0
    ? (clickEvents.length * 60000) / (clickEvents[clickEvents.length - 1].timestamp - clickEvents[0].timestamp)
    : 0

  // Calculate scroll pattern
  const scrollPattern = calculateScrollPattern(mouseMovements)

  // Calculate idle time (time between last interaction and now)
  const lastInteraction = Math.max(
    ...mouseMovements.map(m => m.timestamp),
    ...keyPresses.map(k => k.timestamp),
    ...clickEvents.map(c => c.timestamp)
  )
  const idleTime = Date.now() - lastInteraction

  // Calculate session duration
  const sessionStart = Math.min(
    ...mouseMovements.map(m => m.timestamp),
    ...keyPresses.map(k => k.timestamp),
    ...clickEvents.map(c => c.timestamp)
  )
  const sessionDuration = Date.now() - sessionStart

  // Calculate focus time (time spent actively interacting)
  const focusTime = calculateFocusTime(mouseMovements, keyPresses, clickEvents)

  return {
    ...baseProfile,
    mouseSpeed,
    mouseAcceleration,
    clickFrequency,
    scrollPattern,
    idleTime,
    sessionDuration,
    focusTime
  }
}

// Helper functions for enhanced metrics
function calculateMouseSpeed(movements: MouseMovement[]): number {
  if (movements.length < 2) return 0
  
  let totalDistance = 0
  let totalTime = 0
  
  for (let i = 1; i < movements.length; i++) {
    const prev = movements[i - 1]
    const curr = movements[i]
    
    const distance = Math.sqrt(
      Math.pow(curr.x - prev.x, 2) + 
      Math.pow(curr.y - prev.y, 2)
    )
    const time = curr.timestamp - prev.timestamp
    
    totalDistance += distance
    totalTime += time
  }
  
  return totalTime > 0 ? totalDistance / totalTime : 0
}

function calculateMouseAcceleration(movements: MouseMovement[]): number[] {
  if (movements.length < 3) return []
  
  const accelerations: number[] = []
  
  for (let i = 2; i < movements.length; i++) {
    const prev2 = movements[i - 2]
    const prev1 = movements[i - 1]
    const curr = movements[i]
    
    const v1 = Math.sqrt(
      Math.pow(prev1.x - prev2.x, 2) + 
      Math.pow(prev1.y - prev2.y, 2)
    ) / (prev1.timestamp - prev2.timestamp)
    
    const v2 = Math.sqrt(
      Math.pow(curr.x - prev1.x, 2) + 
      Math.pow(curr.y - prev1.y, 2)
    ) / (curr.timestamp - prev1.timestamp)
    
    const acceleration = (v2 - v1) / (curr.timestamp - prev1.timestamp)
    accelerations.push(acceleration)
  }
  
  return accelerations
}

function calculateScrollPattern(movements: MouseMovement[]): number[] {
  const scrollPattern: number[] = []
  let lastY = movements[0]?.y || 0
  
  for (const movement of movements) {
    const yDiff = movement.y - lastY
    if (Math.abs(yDiff) > 5) { // Threshold to detect actual scrolling
      scrollPattern.push(yDiff)
    }
    lastY = movement.y
  }
  
  return scrollPattern
}

function calculateFocusTime(
  mouseMovements: MouseMovement[],
  keyPresses: KeyPress[],
  clickEvents: ClickEvent[]
): number {
  const events = [
    ...mouseMovements,
    ...keyPresses,
    ...clickEvents
  ].sort((a, b) => a.timestamp - b.timestamp)
  
  if (events.length < 2) return 0
  
  let focusTime = 0
  let lastEventTime = events[0].timestamp
  
  for (let i = 1; i < events.length; i++) {
    const currentTime = events[i].timestamp
    const timeDiff = currentTime - lastEventTime
    
    // Consider user active if events are within 2 seconds of each other
    if (timeDiff <= 2000) {
      focusTime += timeDiff
    }
    
    lastEventTime = currentTime
  }
  
  return focusTime
}

// Compare two behavioral profiles and return a similarity score (0-1)
export function compareBehavioralProfiles(profile1: BehavioralProfile, profile2: BehavioralProfile): number {
  console.log("Comparing behavioral profiles")

  // Compare typing speed (weight: 0.3)
  const typingSpeedDiff = Math.abs(profile1.typingSpeed - profile2.typingSpeed)
  const typingSpeedSimilarity = Math.max(
    0,
    1 - typingSpeedDiff / Math.max(profile1.typingSpeed, profile2.typingSpeed, 1),
  )

  // Compare typing rhythm (weight: 0.3)
  let rhythmSimilarity = 0
  if (profile1.typingRhythm.length > 0 && profile2.typingRhythm.length > 0) {
    const minLength = Math.min(profile1.typingRhythm.length, profile2.typingRhythm.length)
    let totalDiff = 0
    for (let i = 0; i < minLength; i++) {
      totalDiff += Math.abs(profile1.typingRhythm[i] - profile2.typingRhythm[i])
    }
    const avgDiff = totalDiff / minLength
    rhythmSimilarity = Math.max(0, 1 - avgDiff / 1000) // Normalize by assuming 1000ms is max difference
  }

  // Compare mouse movements (weight: 0.2)
  let movementSimilarity = 0
  if (profile1.mouseMovementPattern.length > 0 && profile2.mouseMovementPattern.length > 0) {
    const minLength = Math.min(profile1.mouseMovementPattern.length, profile2.mouseMovementPattern.length)
    let totalDiff = 0
    for (let i = 0; i < minLength; i++) {
      const m1 = profile1.mouseMovementPattern[i]
      const m2 = profile2.mouseMovementPattern[i]
      const distance = Math.sqrt(Math.pow(m1.x - m2.x, 2) + Math.pow(m1.y - m2.y, 2))
      totalDiff += distance
    }
    const avgDiff = totalDiff / minLength
    movementSimilarity = Math.max(0, 1 - avgDiff / 100) // Normalize by assuming 100px is max difference
  }

  // Compare click patterns (weight: 0.2)
  let clickSimilarity = 0
  if (profile1.clickPattern.length > 0 && profile2.clickPattern.length > 0) {
    const minLength = Math.min(profile1.clickPattern.length, profile2.clickPattern.length)
    let totalDiff = 0
    for (let i = 0; i < minLength; i++) {
      const c1 = profile1.clickPattern[i]
      const c2 = profile2.clickPattern[i]
      const distance = Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2))
      const timeDiff = Math.abs(c1.timestamp - c2.timestamp)
      totalDiff += (distance + timeDiff) / 2
    }
    const avgDiff = totalDiff / minLength
    clickSimilarity = Math.max(0, 1 - avgDiff / 200) // Normalize by assuming 200 is max difference
  }

  // Weighted average
  const similarityScore =
    typingSpeedSimilarity * 0.3 + rhythmSimilarity * 0.3 + movementSimilarity * 0.2 + clickSimilarity * 0.2

  console.log("Similarity score:", similarityScore, {
    typingSpeedSimilarity,
    rhythmSimilarity,
    movementSimilarity,
    clickSimilarity,
  })

  return similarityScore
}

// Detect if current behavior is anomalous compared to stored profile
export function detectAnomalies(
  currentProfile: EnhancedBehavioralProfile,
  historicalProfiles: EnhancedBehavioralProfile[]
): { isAnomaly: boolean; confidence: number; details: string } {
  if (historicalProfiles.length === 0) {
    return { isAnomaly: false, confidence: 0, details: "No historical data for comparison" }
  }

  const weights = {
    typingSpeed: 0.2,
    mouseSpeed: 0.2,
    clickFrequency: 0.15,
    focusTime: 0.15,
    mouseAcceleration: 0.15,
    scrollPattern: 0.15
  }

  let totalScore = 0
  let totalWeight = 0
  const details: string[] = []

  // Compare each metric
  for (const [metric, weight] of Object.entries(weights)) {
    const currentValue = currentProfile[metric as keyof EnhancedBehavioralProfile]
    const historicalValues = historicalProfiles.map(p => p[metric as keyof EnhancedBehavioralProfile])
    
    const avg = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length
    const stdDev = Math.sqrt(
      historicalValues.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / historicalValues.length
    )
    
    const zScore = Math.abs((currentValue as number - avg) / stdDev)
    const score = Math.min(zScore / 3, 1) // Normalize to 0-1 range
    
    if (score > 0.7) {
      details.push(`${metric} is significantly different (z-score: ${zScore.toFixed(2)})`)
    }
    
    totalScore += score * weight
    totalWeight += weight
  }

  const finalScore = totalScore / totalWeight
  const isAnomaly = finalScore > 0.7
  const confidence = Math.min(finalScore * 100, 100)

  return {
    isAnomaly,
    confidence,
    details: details.join(", ") || "No significant anomalies detected"
  }
}

// Track significant events
export interface SignificantEvent {
  type: 'submit' | 'form_complete' | 'navigation' | 'file_upload';
  elementId?: string;
  timestamp: number;
  details?: Record<string, any>;
}

export function trackSignificantEvents(element: HTMLElement): Promise<SignificantEvent[]> {
  return new Promise((resolve) => {
    const events: SignificantEvent[] = [];

    const handleSubmit = (e: Event) => {
      const target = e.target as HTMLElement;
      events.push({
        type: 'submit',
        elementId: target.id,
        timestamp: Date.now(),
        details: {
          formData: target instanceof HTMLFormElement ? new FormData(target) : null
        }
      });
    };

    const handleNavigation = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        events.push({
          type: 'navigation',
          elementId: target.id,
          timestamp: Date.now(),
          details: {
            href: (target as HTMLAnchorElement).href
          }
        });
      }
    };

    const handleFileUpload = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.type === 'file') {
        events.push({
          type: 'file_upload',
          elementId: target.id,
          timestamp: Date.now(),
          details: {
            fileCount: target.files?.length
          }
        });
      }
    };

    element.addEventListener('submit', handleSubmit);
    element.addEventListener('click', handleNavigation);
    element.addEventListener('change', handleFileUpload);

    // Return cleanup function
    return () => {
      element.removeEventListener('submit', handleSubmit);
      element.removeEventListener('click', handleNavigation);
      element.removeEventListener('change', handleFileUpload);
      resolve(events);
    };
  });
}
