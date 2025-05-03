"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Activity, AlertTriangle, Shield, User } from "lucide-react"

interface UserActivity {
  id: number
  user_id: number
  username: string
  action: string
  timestamp: string
  ip_address: string
  status: 'normal' | 'suspicious' | 'blocked'
}

interface SuspiciousActivity {
  id: number
  user_id: number
  username: string
  pattern: string
  severity: 'low' | 'medium' | 'high'
  timestamp: string
  status: 'pending' | 'investigated' | 'resolved'
}

interface Anomaly {
  id: number
  user_id: number
  timestamp: string
  is_anomaly: number
  confidence_score: number
  details: string
}

interface BehavioralProfile {
  id: number
  user_id: number
  typing_speed: number
  typing_rhythm: string
  mouse_movement_pattern: string
  click_pattern: string
  created_at: string
  updated_at: string
}

export default function BehaviorMonitoringPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState("anomalies")
  const [userActivities, setUserActivities] = useState<UserActivity[]>([])
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([])
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [profiles, setProfiles] = useState<BehavioralProfile[]>([])
  const [loadingAnomalies, setLoadingAnomalies] = useState(true)
  const [loadingProfiles, setLoadingProfiles] = useState(true)

  useEffect(() => {
    fetchBehaviorData()
    fetchAnomalies()
    fetchProfiles()
  }, [])

  const fetchBehaviorData = async () => {
    try {
      const [activitiesResponse, suspiciousResponse] = await Promise.all([
        fetch('/api/security/activities'),
        fetch('/api/security/suspicious')
      ])

      if (!activitiesResponse.ok || !suspiciousResponse.ok) {
        throw new Error('Failed to fetch behavior data')
      }

      const [activitiesData, suspiciousData] = await Promise.all([
        activitiesResponse.json(),
        suspiciousResponse.json()
      ])

      setUserActivities(activitiesData)
      setSuspiciousActivities(suspiciousData)
    } catch (error) {
      console.error('Error fetching behavior data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch behavior monitoring data",
        variant: "destructive",
      })
    }
  }

  const fetchAnomalies = async () => {
    setLoadingAnomalies(true)
    try {
      const response = await fetch("/api/security/anomalies")
      if (!response.ok) throw new Error("Failed to fetch anomalies")
      const data = await response.json()
      setAnomalies(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch anomalies", variant: "destructive" })
    } finally {
      setLoadingAnomalies(false)
    }
  }

  const fetchProfiles = async () => {
    setLoadingProfiles(true)
    try {
      const response = await fetch("/api/security/behavioral-profiles")
      if (!response.ok) throw new Error("Failed to fetch behavioral profiles")
      const data = await response.json()
      setProfiles(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch behavioral profiles", variant: "destructive" })
    } finally {
      setLoadingProfiles(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-500'
      case 'suspicious':
        return 'text-yellow-500'
      case 'blocked':
        return 'text-red-500'
      case 'pending':
        return 'text-yellow-500'
      case 'investigated':
        return 'text-blue-500'
      case 'resolved':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-500'
      case 'medium':
        return 'text-yellow-500'
      case 'high':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  if (loadingAnomalies || loadingProfiles) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Behavior Monitoring</h1>
        <div className="grid gap-4">
          <Card><CardContent className="p-6 text-center">Loading...</CardContent></Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Behavior Monitoring</h1>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-500">Real-time monitoring</span>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>
        <TabsContent value="anomalies">
          <Card className="shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle>Anomalies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Anomaly</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingAnomalies ? (
                      <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
                    ) : anomalies.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-gray-500">No anomalies detected</TableCell></TableRow>
                    ) : (
                      anomalies.slice(0, 20).map(a => (
                        <TableRow key={a.id}>
                          <TableCell>{a.id}</TableCell>
                          <TableCell>{a.user_id}</TableCell>
                          <TableCell>{new Date(a.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{a.is_anomaly ? "Yes" : "No"}</TableCell>
                          <TableCell>{a.confidence_score}</TableCell>
                          <TableCell className="max-w-xs truncate">{a.details}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="mt-6">
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle>Behavioral Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Typing Speed</TableHead>
                    <TableHead>Typing Rhythm</TableHead>
                    <TableHead>Mouse Movement</TableHead>
                    <TableHead>Click Pattern</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingProfiles ? (
                    <TableRow><TableCell colSpan={8}>Loading...</TableCell></TableRow>
                  ) : profiles.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-gray-500">No behavioral profiles found</TableCell></TableRow>
                  ) : (
                    profiles.slice(0, 20).map(p => (
                      <TableRow key={p.id}>
                        <TableCell>{p.id}</TableCell>
                        <TableCell>{p.user_id}</TableCell>
                        <TableCell>{p.typing_speed}</TableCell>
                        <TableCell className="max-w-xs truncate">{p.typing_rhythm}</TableCell>
                        <TableCell className="max-w-xs truncate">{p.mouse_movement_pattern}</TableCell>
                        <TableCell className="max-w-xs truncate">{p.click_pattern}</TableCell>
                        <TableCell>{new Date(p.created_at).toLocaleString()}</TableCell>
                        <TableCell>{new Date(p.updated_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 