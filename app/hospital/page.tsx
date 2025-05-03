"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Calendar, 
  Users, 
  Activity, 
  FileText,
  BedDouble,
  UserCheck,
  Clock,
  FileWarning,
  Stethoscope,
  ClipboardList,
  Shield,
  BarChart2,
  Settings,
  Bell
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HospitalStats {
  availableBeds: number
  doctorsOnDuty: number
  todayAppointments: number
  pendingReports: number
}

interface Activity {
  type: string
  message: string
  minutes_ago: number
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState<HospitalStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState<string>("")

  useEffect(() => {
    fetchHospitalStats()
    const storedUsername = localStorage.getItem("username")
    setUsername(storedUsername || "User")
  }, [])

  const fetchHospitalStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/hospital/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch hospital stats')
      }
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      setStats(data)
      setRecentActivity(data.recentActivity || [])
    } catch (error) {
      console.error('Error fetching hospital stats:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch hospital stats')
      toast({
        title: "Error",
        description: "Failed to fetch hospital statistics",
        variant: "destructive",
      })
      setStats(null)
      setRecentActivity([])
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <Activity className="w-5 h-5 text-red-500" />
      case 'lab':
        return <FileText className="w-5 h-5 text-blue-500" />
      case 'medication':
        return <Clock className="w-5 h-5 text-purple-500" />
      default:
        return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  const formatTimeAgo = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes ago`
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(minutes / 1440)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid gap-4">
          <Card><CardContent className="p-6 text-center">Loading...</CardContent></Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">City Hospital</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Welcome, {username}</span>
        </div>
      </div>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/hospital/appointments">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Calendar className="w-8 h-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Appointments</h3>
                    <p className="text-sm text-gray-500">Schedule and manage appointments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/hospital/patients">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Users className="w-8 h-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Patients</h3>
                    <p className="text-sm text-gray-500">Manage patient profiles and records</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/hospital/emergency">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Activity className="w-8 h-8 text-red-500" />
                  <div>
                    <h3 className="font-semibold">Emergency</h3>
                    <p className="text-sm text-gray-500">Emergency department management</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/hospital/lab-reports">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <FileText className="w-8 h-8 text-purple-500" />
                  <div>
                    <h3 className="font-semibold">Lab Reports</h3>
                    <p className="text-sm text-gray-500">Manage and view test results</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/hospital/wards">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <BedDouble className="w-8 h-8 text-indigo-500" />
                  <div>
                    <h3 className="font-semibold">Wards & Beds</h3>
                    <p className="text-sm text-gray-500">Track bed availability and assignments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/hospital/doctors">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Stethoscope className="w-8 h-8 text-teal-500" />
                  <div>
                    <h3 className="font-semibold">Doctors</h3>
                    <p className="text-sm text-gray-500">Manage doctor profiles and schedules</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/hospital/admissions">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <ClipboardList className="w-8 h-8 text-orange-500" />
                  <div>
                    <h3 className="font-semibold">Admissions</h3>
                    <p className="text-sm text-gray-500">Manage patient admissions and discharges</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/hospital/medical-records">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <FileText className="w-8 h-8 text-pink-500" />
                  <div>
                    <h3 className="font-semibold">Medical Records</h3>
                    <p className="text-sm text-gray-500">Access and manage patient history</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/security/behavior">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <BarChart2 className="w-8 h-8 text-cyan-500" />
                  <div>
                    <h3 className="font-semibold">Behavior Monitoring</h3>
                    <p className="text-sm text-gray-500">Track and analyze user behavior</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/logs">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <FileText className="w-8 h-8 text-gray-500" />
                  <div>
                    <h3 className="font-semibold">Audit Logs</h3>
                    <p className="text-sm text-gray-500">View system activity and changes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Hospital Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Beds</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.availableBeds ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Doctors On Duty</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.doctorsOnDuty ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.todayAppointments ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.pendingReports ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : !recentActivity || recentActivity.length === 0 ? (
              <p className="text-center text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-6">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(activity.minutes_ago)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
} 