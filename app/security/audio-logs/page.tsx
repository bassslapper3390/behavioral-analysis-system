"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Play, Pause, Download, AlertTriangle, User } from "lucide-react"

interface AudioLog {
  id: number
  user_id: number
  username: string
  start_time: string
  end_time: string
  duration: number
  file_path: string
  status: 'normal' | 'suspicious' | 'flagged'
  suspicious_patterns: string[]
}

export default function AudioLogsPage() {
  const { toast } = useToast()
  const [audioLogs, setAudioLogs] = useState<AudioLog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchAudioLogs()
    return () => {
      if (audioElement) {
        audioElement.pause()
      }
    }
  }, [])

  const fetchAudioLogs = async () => {
    try {
      const response = await fetch('/api/security/audio-logs')
      if (!response.ok) {
        throw new Error('Failed to fetch audio logs')
      }
      const data = await response.json()
      setAudioLogs(data)
    } catch (error) {
      console.error('Error fetching audio logs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch audio logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPause = (log: AudioLog) => {
    if (currentlyPlaying === log.id) {
      if (audioElement) {
        audioElement.pause()
        setCurrentlyPlaying(null)
      }
    } else {
      if (audioElement) {
        audioElement.pause()
      }
      const newAudio = new Audio(log.file_path)
      newAudio.play()
      setAudioElement(newAudio)
      setCurrentlyPlaying(log.id)
      
      newAudio.onended = () => {
        setCurrentlyPlaying(null)
      }
    }
  }

  const handleDownload = (log: AudioLog) => {
    const link = document.createElement('a')
    link.href = log.file_path
    link.download = `audio_log_${log.id}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-500'
      case 'suspicious':
        return 'text-yellow-500'
      case 'flagged':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Audio Logs</h1>
        <div className="grid gap-4">
          <Card><CardContent className="p-6 text-center">Loading...</CardContent></Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Audio Logs</h1>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-gray-500">Audio monitoring system</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Recorded Audio Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Patterns</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audioLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No audio logs available
                  </TableCell>
                </TableRow>
              ) : (
                audioLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {log.username}
                    </TableCell>
                    <TableCell>{new Date(log.start_time).toLocaleString()}</TableCell>
                    <TableCell>{formatDuration(log.duration)}</TableCell>
                    <TableCell>
                      <span className={getStatusColor(log.status)}>
                        {log.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.suspicious_patterns.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {log.suspicious_patterns.map((pattern, index) => (
                            <li key={index} className="text-sm text-yellow-600">
                              {pattern}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePlayPause(log)}
                        >
                          {currentlyPlaying === log.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(log)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 