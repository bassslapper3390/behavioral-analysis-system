"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { format } from "date-fns"

interface EmergencyCase {
  id: number
  patient_name: string
  patient_id: number
  condition: string
  severity: string
  arrival_time: string
  status: string
  assigned_doctor: string
  doctor_id: number
  notes: string
}

interface FormData {
  patient_id: string
  condition: string
  severity: string
  notes: string
  doctor_id: string
}

export default function EmergencyPage() {
  const [cases, setCases] = useState<EmergencyCase[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [formData, setFormData] = useState<FormData>({
    patient_id: "",
    condition: "",
    severity: "moderate",
    notes: "",
    doctor_id: ""
  })

  useEffect(() => {
    fetchEmergencyCases()
    fetchPatients()
    fetchDoctors()
  }, [])

  const fetchEmergencyCases = async () => {
    try {
      const response = await fetch('/api/hospital/emergency')
      const data = await response.json()
      setCases(data)
    } catch (error) {
      console.error('Error fetching emergency cases:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/hospital/patients')
      const data = await response.json()
      setPatients(data)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/hospital/doctors')
      const data = await response.json()
      setDoctors(data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/hospital/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          patient_id: parseInt(formData.patient_id, 10),
          doctor_id: parseInt(formData.doctor_id, 10),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add emergency case')
      }

      // Reset form and refresh cases list
      setFormData({
        patient_id: "",
        condition: "",
        severity: "moderate",
        notes: "",
        doctor_id: ""
      })
      setIsDialogOpen(false)
      fetchEmergencyCases()
    } catch (error) {
      console.error('Error adding emergency case:', error)
    }
  }

  const handleStatusUpdate = async (caseId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/hospital/emergency/${caseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update case status')
      }

      fetchEmergencyCases()
    } catch (error) {
      console.error('Error updating case status:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'severe':
        return 'bg-orange-100 text-orange-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'stable':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_treatment':
        return 'bg-blue-100 text-blue-800'
      case 'discharged':
        return 'bg-green-100 text-green-800'
      case 'transferred':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Emergency Department</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Register New Case</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Emergency Case</DialogTitle>
              <DialogDescription>
                Enter the emergency case details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patient_id">Patient</Label>
                <Select
                  value={formData.patient_id}
                  onValueChange={(value) => handleSelectChange('patient_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient: any) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="condition">Condition/Symptoms</Label>
                <Textarea
                  id="condition"
                  placeholder="Describe the condition or symptoms"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => handleSelectChange('severity', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="doctor_id">Assign Doctor</Label>
                <Select
                  value={formData.doctor_id}
                  onValueChange={(value) => handleSelectChange('doctor_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor: any) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" className="w-full">Register Case</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            </CardContent>
          </Card>
        ) : cases.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No emergency cases found
            </CardContent>
          </Card>
        ) : (
          cases.map((case_) => (
            <Card key={case_.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {case_.patient_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Doctor: {case_.assigned_doctor}
                    </p>
                    <p className="text-sm text-gray-500">
                      Arrival: {format(new Date(case_.arrival_time), 'PPp')}
                    </p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(case_.severity)}`}>
                        {case_.severity}
                      </span>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                        {case_.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <h4 className="font-medium">Condition</h4>
                      <p className="text-sm">{case_.condition}</p>
                    </div>
                    {case_.notes && (
                      <div className="mt-2">
                        <h4 className="font-medium">Notes</h4>
                        <p className="text-sm">{case_.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Select
                      value={case_.status}
                      onValueChange={(value) => handleStatusUpdate(case_.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="in_treatment">In Treatment</SelectItem>
                        <SelectItem value="discharged">Discharged</SelectItem>
                        <SelectItem value="transferred">Transferred</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 