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

interface LabReport {
  id: number
  patient_id: number
  patient_name: string
  test_type: string
  test_date: string
  result_date: string
  results: string
  reference_range: string
  status: string
  notes: string
}

interface FormData {
  patient_id: string
  test_type: string
  test_date: string
  result_date: string
  results: string
  reference_range: string
  status: string
  notes: string
}

export default function LabReportsPage() {
  const [reports, setReports] = useState<LabReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [patients, setPatients] = useState([])
  const [formData, setFormData] = useState<FormData>({
    patient_id: "",
    test_type: "",
    test_date: "",
    result_date: "",
    results: "",
    reference_range: "",
    status: "pending",
    notes: ""
  })

  useEffect(() => {
    fetchReports()
    fetchPatients()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/hospital/lab-reports')
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching lab reports:', error)
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
      const response = await fetch('/api/hospital/lab-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to add lab report')
      }

      // Reset form and refresh reports list
      setFormData({
        patient_id: "",
        test_type: "",
        test_date: "",
        result_date: "",
        results: "",
        reference_range: "",
        status: "pending",
        notes: ""
      })
      setIsDialogOpen(false)
      fetchReports()
    } catch (error) {
      console.error('Error adding lab report:', error)
    }
  }

  const filteredReports = reports.filter(report => 
    report.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.test_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lab Reports</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Report</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lab Report</DialogTitle>
              <DialogDescription>
                Enter the patient's lab test details below.
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
                <Label htmlFor="test_type">Test Type</Label>
                <Input
                  type="text"
                  id="test_type"
                  placeholder="Enter test type"
                  value={formData.test_type}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="test_date">Test Date</Label>
                <Input
                  type="date"
                  id="test_date"
                  value={formData.test_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="result_date">Result Date</Label>
                <Input
                  type="date"
                  id="result_date"
                  value={formData.result_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="results">Results</Label>
                <Textarea
                  id="results"
                  placeholder="Enter test results"
                  value={formData.results}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reference_range">Reference Range</Label>
                <Input
                  type="text"
                  id="reference_range"
                  placeholder="Enter reference range"
                  value={formData.reference_range}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="abnormal">Abnormal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" className="w-full">Add Report</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search by patient name or test type..."
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
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No lab reports found
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {report.patient_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Test Type: {report.test_type}
                    </p>
                    <p className="text-sm text-gray-500">
                      Test Date: {format(new Date(report.test_date), 'PPP')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Result Date: {format(new Date(report.result_date), 'PPP')}
                    </p>
                    <div className="mt-4 space-y-2">
                      <div>
                        <h4 className="font-medium">Results</h4>
                        <p className="text-sm">{report.results}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Reference Range</h4>
                        <p className="text-sm">{report.reference_range}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Status</h4>
                        <p className="text-sm">{report.status}</p>
                      </div>
                      {report.notes && (
                        <div>
                          <h4 className="font-medium">Notes</h4>
                          <p className="text-sm">{report.notes}</p>
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