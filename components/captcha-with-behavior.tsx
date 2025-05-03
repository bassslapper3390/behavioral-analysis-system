"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import BehaviorTracker from "@/components/behavior-tracker"
import type { BehavioralProfile } from "@/lib/behavior-tracker"

// Array of sample sentences for CAPTCHA
const captchaSentences = [
  "The quick brown fox jumps over the lazy dog",
  "All that glitters is not gold",
  "A journey of a thousand miles begins with a single step",
  "Actions speak louder than words",
  "Better late than never",
  "Don't judge a book by its cover",
  "Every cloud has a silver lining",
  "Fortune favors the bold",
  "Honesty is the best policy",
  "Knowledge is power",
]

interface CaptchaWithBehaviorProps {
  onComplete: (result: {
    success: boolean
    behavioralProfile?: BehavioralProfile
    captchaText?: string
  }) => void
  errorMessage?: string
}

export default function CaptchaWithBehavior({ onComplete, errorMessage }: CaptchaWithBehaviorProps) {
  const [captchaSentence, setCaptchaSentence] = useState("")
  const [userInput, setUserInput] = useState("")
  const [isMatching, setIsMatching] = useState<boolean | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [behavioralProfile, setBehavioralProfile] = useState<BehavioralProfile | null>(null)

  // Generate a random sentence for CAPTCHA
  const generateCaptcha = () => {
    const randomIndex = Math.floor(Math.random() * captchaSentences.length)
    setCaptchaSentence(captchaSentences[randomIndex])
    setUserInput("")
    setIsMatching(null)
    setIsComplete(false)
    setBehavioralProfile(null)
  }

  const checkInput = (input: string) => {
    if (!input) {
      setIsMatching(null)
      setIsComplete(false)
      return
    }

    const captchaLower = captchaSentence.toLowerCase()
    const inputLower = input.toLowerCase()

    // Check if input matches the beginning of the captcha
    const isMatch = captchaLower.startsWith(inputLower)
    setIsMatching(isMatch)

    // Check if input is complete and matches
    setIsComplete(inputLower === captchaLower)
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (isComplete && behavioralProfile) {
      console.log("CAPTCHA completed successfully with behavioral profile")
      onComplete({
        success: true,
        behavioralProfile,
        captchaText: captchaSentence,
      })
    } else {
      console.log("CAPTCHA verification failed", { isComplete, hasBehavioralProfile: !!behavioralProfile })
      onComplete({ success: false })
    }
  }

  const handleProfileGenerated = (profile: BehavioralProfile) => {
    console.log("Behavioral profile generated in CAPTCHA component")
    setBehavioralProfile(profile)
  }

  return (
    <BehaviorTracker onProfileGenerated={handleProfileGenerated} duration={30000}>
      <div className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <div className="bg-muted p-4 rounded-md text-center mb-2">
            <p className="font-medium">{captchaSentence}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={generateCaptcha}
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Generate New Sentence</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="captcha-input">Type the sentence above</Label>
            <Input
              id="captcha-input"
              value={userInput}
              onChange={(e) => {
                const newValue = e.target.value
                setUserInput(newValue)
                checkInput(newValue)
              }}
              className={`${
                isMatching === null
                  ? ""
                  : isMatching
                    ? "border-green-500 focus-visible:ring-green-500"
                    : "border-red-500 focus-visible:ring-red-500"
              }`}
              required
            />
            {userInput && (
              <p className={`text-sm ${isMatching ? "text-green-500" : "text-red-500"}`}>
                {isMatching
                  ? isComplete
                    ? "Perfect match! You can submit now."
                    : "Correct so far, keep typing..."
                  : "Doesn't match. Please check your typing."}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={!isComplete || !behavioralProfile}>
            {!behavioralProfile ? "Analyzing your behavior..." : "Verify"}
          </Button>

          {behavioralProfile && !isComplete && (
            <p className="text-sm text-muted-foreground text-center">
              Behavior analysis complete. Please finish typing the sentence.
            </p>
          )}
        </form>
      </div>
    </BehaviorTracker>
  )
}
