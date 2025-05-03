"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

interface MedicalRecord {
  id: number
  patient_id: number
  patient_name: string
  doctor_id: number
  doctor_name: string
  visit_date: string
  diagnosis: string
  treatment: string
  prescription: string
  notes: string
  follow_up_date: string
}

interface FormData {
  patient_id: string
  doctor_id: string
  visit_date: string
  diagnosis: string
  treatment: string
  prescription: string
  notes: string
  follow_up_date: string
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [formData, setFormData] = useState<FormData>({
    patient_id: "",
    doctor_id: "",
    visit_date: "",
    diagnosis: "",
    treatment: "",
    prescription: "",
    notes: "",
    follow_up_date: ""
  })

  useEffect(() => {
    fetchRecords()
    fetchPatients()
    fetchDoctors()
  }, [])

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/hospital/medical-records')
      const data = await response.json()
      setRecords(data)
    } catch (error) {
      console.error('Error fetching medical records:', error)
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
      const response = await fetch('/api/hospital/medical-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to add medical record')
      }

      // Reset form and refresh records list
      setFormData({
        patient_id: "",
        doctor_id: "",
        visit_date: "",
        diagnosis: "",
        treatment: "",
        prescription: "",
        notes: "",
        follow_up_date: ""
      })
      setIsDialogOpen(false)
      fetchRecords()
    } catch (error) {
      console.error('Error adding medical record:', error)
    }
  }

  const filteredRecords = records.filter(record => 
    record.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Medical Records</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Record</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medical Record</DialogTitle>
              <DialogDescription>
                Enter the patient's medical record details below.
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
                <Label htmlFor="doctor_id">Doctor</Label>
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
                <Label htmlFor="visit_date">Visit Date</Label>
                <Input
                  type="date"
                  id="visit_date"
                  value={formData.visit_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="treatment">Treatment</Label>
                <Textarea
                  id="treatment"
                  placeholder="Enter treatment details"
                  value={formData.treatment}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="prescription">Prescription</Label>
                <Textarea
                  id="prescription"
                  placeholder="Enter prescription details"
                  value={formData.prescription}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="follow_up_date">Follow-up Date</Label>
                <Input
                  type="date"
                  id="follow_up_date"
                  value={formData.follow_up_date}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" className="w-full">Add Record</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search by patient or doctor name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
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
        ) : filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No medical records found
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {record.patient_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Doctor: {record.doctor_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Visit Date: {format(new Date(record.visit_date), 'PPP')}
                    </p>
                    <div className="mt-4 space-y-2">
                      <div>
                        <h4 className="font-medium">Diagnosis</h4>
                        <p className="text-sm">{record.diagnosis}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Treatment</h4>
                        <p className="text-sm">{record.treatment}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Prescription</h4>
                        <p className="text-sm">{record.prescription}</p>
                      </div>
                      {record.notes && (
                        <div>
                          <h4 className="font-medium">Notes</h4>
                          <p className="text-sm">{record.notes}</p>
                        </div>
                      )}
                      {record.follow_up_date && (
                        <div>
                          <h4 className="font-medium">Follow-up Date</h4>
                          <p className="text-sm">
                            {format(new Date(record.follow_up_date), 'PPP')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Edit</Button>
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