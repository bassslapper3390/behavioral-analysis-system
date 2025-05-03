"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Activity, MousePointer, Keyboard } from "lucide-react"
import { useRouter } from "next/navigation"
import { behaviorMonitor } from '@/lib/monitoring'

const stats = [
  { name: 'Total Patients', value: '1,284' },
  { name: 'Today\'s Appointments', value: '42' },
  { name: 'Available Staff', value: '18' },
  { name: 'Pending Reports', value: '7' },
]

const recentActivities = [
  { id: 1, type: 'appointment', description: 'New appointment scheduled for John Doe', time: '2 minutes ago' },
  { id: 2, type: 'admission', description: 'Patient admitted to Ward 3', time: '15 minutes ago' },
  { id: 3, type: 'discharge', description: 'Patient discharged from Ward 1', time: '1 hour ago' },
  { id: 4, type: 'report', description: 'Lab results uploaded for Jane Smith', time: '2 hours ago' },
]

export default function Dashboard() {
  const router = useRouter()
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [behavioralStats, setBehavioralStats] = useState({
    typingSpeed: 0,
    mouseMovements: 0,
    clickCount: 0,
    anomalyRate: 0,
  }) 

  useEffect(() => {
    // Check if user is logged in
    const username = localStorage.getItem("username")
    const token = localStorage.getItem("token")

    if (!username || !token) {
      router.push("/login")
      return
    }

    setIsAuthenticated(true)

    // Fetch anomalies from the backend
    const fetchAnomalies = async () => {
      try {
        const response = await fetch("/api/anomalies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch anomalies")
        }

        const data = await response.json()
        console.log("Fetched anomalies:", data)
        setAnomalies(data)

        // Calculate stats
        if (data.length > 0) {
          const anomalyCount = data.filter((a: any) => a.is_anomaly === 1).length
          setBehavioralStats({
            typingSpeed: Math.floor(Math.random() * 60) + 40, // Mock data
            mouseMovements: Math.floor(Math.random() * 500) + 200, // Mock data
            clickCount: Math.floor(Math.random() * 50) + 10, // Mock data
            anomalyRate: (anomalyCount / data.length) * 100,
          })
        }
      } catch (err: any) {
        console.error("Error fetching anomalies:", err)
        setError(err.message || "Failed to load anomalies.")
      } finally {
        setLoading(false)
      }
    }

    fetchAnomalies()

    // Initialize behavior monitoring
    const userId = localStorage.getItem('userId')
    if (userId) {
      behaviorMonitor.setUserId(userId)
    }
  }, [router])

  if (!isAuthenticated) {
    return null // Don't render anything while checking authentication
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Behavioral Analysis Dashboard</h1>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Typing Behavior</CardTitle>
              <Keyboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{behavioralStats.typingSpeed} WPM</div>
              <p className="text-xs text-muted-foreground">Average typing speed</p>
              <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded">
                <div
                  className="h-1 bg-primary"
                  style={{ width: `${Math.min((behavioralStats.typingSpeed / 100) * 100, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mouse Behavior</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{behavioralStats.mouseMovements}</div>
              <p className="text-xs text-muted-foreground">Mouse movements tracked</p>
              <div className="mt-2 text-sm">
                <span className="font-medium">{behavioralStats.clickCount}</span> clicks recorded
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anomaly Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{behavioralStats.anomalyRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {behavioralStats.anomalyRate < 5
                  ? "Normal behavior pattern"
                  : behavioralStats.anomalyRate < 20
                    ? "Some unusual patterns detected"
                    : "Significant anomalies detected"}
              </p>
              <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded">
                <div
                  className={`h-1 ${
                    behavioralStats.anomalyRate < 5
                      ? "bg-green-500"
                      : behavioralStats.anomalyRate < 20
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(behavioralStats.anomalyRate, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Anomalies</CardTitle>
              <CardDescription>Latest detected anomalies in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium">Timestamp</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Confidence</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {anomalies.length > 0 ? (
                      anomalies
                        .slice(-10)
                        .reverse()
                        .map((anomaly: any, index) => (
                          <tr
                            key={index}
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                          >
                            <td className="p-4 align-middle">{new Date(anomaly.timestamp).toLocaleString()}</td>
                            <td className="p-4 align-middle">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  anomaly.is_anomaly === 1
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {anomaly.is_anomaly === 1 ? "Anomaly" : "Normal"}
                              </span>
                            </td>
                            <td className="p-4 align-middle">
                              {anomaly.confidence_score ? (
                                <div className="flex items-center">
                                  <span className="mr-2">{(anomaly.confidence_score * 100).toFixed(0)}%</span>
                                  <div className="h-1.5 w-16 bg-muted overflow-hidden rounded">
                                    <div
                                      className={`h-1.5 ${anomaly.is_anomaly === 1 ? "bg-red-500" : "bg-green-500"}`}
                                      style={{ width: `${anomaly.confidence_score * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="p-4 align-middle">{anomaly.details || "No details available"}</td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          No anomalies detected yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 mt-8">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {recentActivities.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== recentActivities.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <span className="text-white text-sm">
                          {activity.type[0].toUpperCase()}
                        </span>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time>{activity.time}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
