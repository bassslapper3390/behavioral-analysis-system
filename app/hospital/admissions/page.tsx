"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Admission {
  id: number
  patient_id: number
  patient_name: string
  ward_id: number
  ward_name: string
  bed_id: number
  bed_number: string
  admission_date: string
  expected_discharge_date: string
  status: string
  diagnosis: string
  notes: string
}

interface Ward {
  id: number
  name: string
  type: string
  capacity: number
  current_occupancy: number
}

interface Bed {
  id: number
  ward_id: number
  bed_number: string
  status: string
}

interface Patient {
  id: number
  first_name: string
  last_name: string
}

export default function AdmissionsPage() {
  const { toast } = useToast()
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [beds, setBeds] = useState<Bed[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [newAdmission, setNewAdmission] = useState<Partial<Admission>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [admissionsRes, wardsRes, patientsRes] = await Promise.all([
        fetch("/api/hospital/admissions"),
        fetch("/api/hospital/wards"),
        fetch("/api/hospital/patients")
      ])

      if (!admissionsRes.ok || !wardsRes.ok || !patientsRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const [admissionsData, wardsData, patientsData] = await Promise.all([
        admissionsRes.json(),
        wardsRes.json(),
        patientsRes.json()
      ])

      setAdmissions(admissionsData)
      setWards(wardsData)
      setPatients(patientsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBeds = async (wardId: number) => {
    try {
      const response = await fetch(`/api/hospital/wards/${wardId}/beds`)
      if (!response.ok) throw new Error("Failed to fetch beds")
      const data = await response.json()
      setBeds(data)
    } catch (error) {
      console.error("Error fetching beds:", error)
      toast({
        title: "Error",
        description: "Failed to fetch beds",
        variant: "destructive",
      })
    }
  }

  const handleWardChange = async (wardId: number) => {
    setNewAdmission({ ...newAdmission, ward_id: wardId, bed_id: undefined })
    await fetchBeds(wardId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/hospital/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAdmission,
          patient_id: newAdmission.patient_id ? parseInt(newAdmission.patient_id as any, 10) : undefined,
          ward_id: newAdmission.ward_id ? parseInt(newAdmission.ward_id as any, 10) : undefined,
          bed_id: newAdmission.bed_id ? parseInt(newAdmission.bed_id as any, 10) : undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to create admission")

      toast({
        title: "Success",
        description: "Admission created successfully",
      })

      setIsDialogOpen(false)
      setNewAdmission({})
      fetchData()
    } catch (error) {
      console.error("Error creating admission:", error)
      toast({
        title: "Error",
        description: "Failed to create admission",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Admissions</h1>
        <div className="grid gap-4">
          <Card><CardContent className="p-6 text-center">Loading...</CardContent></Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admissions</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Admission</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Admission</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient_id">Patient</Label>
                <Select
                  value={newAdmission.patient_id?.toString()}
                  onValueChange={(value) => setNewAdmission({ ...newAdmission, patient_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward_id">Ward</Label>
                <Select
                  value={newAdmission.ward_id?.toString()}
                  onValueChange={(value) => handleWardChange(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => {
                      const availableBeds = ward.capacity - ward.current_occupancy;
                      const safeAvailableBeds = isNaN(availableBeds) || availableBeds < 0 ? 0 : availableBeds;
                      return (
                        <SelectItem key={ward.id} value={ward.id.toString()}>
                          {ward.name} ({ward.type}) - {safeAvailableBeds} beds available
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bed_id">Bed</Label>
                <Select
                  value={newAdmission.bed_id?.toString()}
                  onValueChange={(value) => setNewAdmission({ ...newAdmission, bed_id: parseInt(value) })}
                  disabled={!newAdmission.ward_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bed" />
                  </SelectTrigger>
                  <SelectContent>
                    {beds.map((bed) => (
                      <SelectItem key={bed.id} value={bed.id.toString()}>
                        Bed {bed.bed_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_discharge_date">Expected Discharge Date</Label>
                <Input
                  type="date"
                  id="expected_discharge_date"
                  value={newAdmission.expected_discharge_date || ""}
                  onChange={(e) => setNewAdmission({ ...newAdmission, expected_discharge_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  value={newAdmission.diagnosis || ""}
                  onChange={(e) => setNewAdmission({ ...newAdmission, diagnosis: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newAdmission.notes || ""}
                  onChange={(e) => setNewAdmission({ ...newAdmission, notes: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">Create Admission</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {admissions.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-gray-500">No admissions found</CardContent></Card>
        ) : (
          admissions.map((admission) => (
            <Card key={admission.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{admission.patient_name}</h3>
                    <p className="text-sm text-gray-500">Ward: {admission.ward_name}</p>
                    <p className="text-sm">Bed: {admission.bed_number}</p>
                    <p className="text-sm">Admission Date: {new Date(admission.admission_date).toLocaleDateString()}</p>
                    <p className="text-sm">Expected Discharge: {new Date(admission.expected_discharge_date).toLocaleDateString()}</p>
                    <p className="text-sm">Diagnosis: {admission.diagnosis}</p>
                    {admission.notes && <p className="text-sm">Notes: {admission.notes}</p>}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    admission.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : admission.status === 'discharged'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {admission.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 