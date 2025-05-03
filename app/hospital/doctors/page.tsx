"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { useToast } from "@/src/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"

interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
  qualification: string
  experience: number
  contact_number: string
  email: string
  available_days: string
  consultation_fee: number
  status: string
  address: string
}

interface DoctorFormData {
  first_name: string
  last_name: string
  specialization: string
  qualification: string
  experience: string
  contact_number: string
  email: string
  available_days: string
  consultation_fee: string
  status: string
  address: string
}

export default function DoctorsPage() {
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState<DoctorFormData>({
    first_name: "",
    last_name: "",
    specialization: "",
    qualification: "",
    experience: "",
    contact_number: "",
    email: "",
    available_days: "",
    consultation_fee: "",
    status: "active",
    address: "",
  })

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/hospital/doctors")
      const data = await response.json()
      setDoctors(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch doctors", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editDoctor) return
    const { name, value } = e.target
    setEditDoctor({ ...editDoctor, [name]: value })
  }

  const handleEditSelect = (name: string, value: string) => {
    if (!editDoctor) return
    setEditDoctor({ ...editDoctor, [name]: value })
  }

  const handleEditSave = async () => {
    if (!editDoctor) return
    setEditLoading(true)
    try {
      const response = await fetch(`/api/hospital/doctors/${editDoctor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDoctor),
      })
      if (!response.ok) throw new Error("Failed to update doctor")
      toast({ title: "Success", description: "Doctor updated successfully" })
      setEditDoctor(null)
      fetchDoctors()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update doctor", variant: "destructive" })
    } finally {
      setEditLoading(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFormSelect = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    try {
      const response = await fetch("/api/hospital/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          experience: parseInt(formData.experience),
          consultation_fee: parseFloat(formData.consultation_fee),
        }),
      })
      if (!response.ok) throw new Error("Failed to add doctor")
      toast({ title: "Success", description: "Doctor added successfully" })
      setFormData({
        first_name: "",
        last_name: "",
        specialization: "",
        qualification: "",
        experience: "",
        contact_number: "",
        email: "",
        available_days: "",
        consultation_fee: "",
        status: "active",
        address: "",
      })
      setIsAddDialogOpen(false)
      fetchDoctors()
    } catch (error) {
      toast({ title: "Error", description: "Failed to add doctor", variant: "destructive" })
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Doctor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleAddSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleFormChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleFormChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" name="specialization" value={formData.specialization} onChange={handleFormChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input id="qualification" name="qualification" value={formData.qualification} onChange={handleFormChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input type="number" id="experience" name="experience" value={formData.experience} onChange={handleFormChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input id="contact_number" name="contact_number" value={formData.contact_number} onChange={handleFormChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="available_days">Available Days</Label>
                  <Select value={formData.available_days} onValueChange={value => handleFormSelect('available_days', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select available days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mon-Fri">Monday to Friday</SelectItem>
                      <SelectItem value="Mon-Sat">Monday to Saturday</SelectItem>
                      <SelectItem value="All">All Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultation_fee">Consultation Fee</Label>
                  <Input type="number" id="consultation_fee" name="consultation_fee" value={formData.consultation_fee} onChange={handleFormChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={value => handleFormSelect('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" value={formData.address} onChange={handleFormChange} required />
              </div>
              <Button type="submit" disabled={addLoading}>{addLoading ? "Adding..." : "Add Doctor"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card><CardContent className="p-6 text-center">Loading...</CardContent></Card>
        ) : doctors.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-gray-500">No doctors found</CardContent></Card>
        ) : (
          doctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Dr. {doctor.first_name} {doctor.last_name}</h3>
                    <p className="text-sm text-gray-500">{doctor.specialization}</p>
                    <p className="text-sm text-gray-500">{doctor.qualification} | {doctor.experience} years</p>
                    <p className="text-sm">Available: {doctor.available_days}</p>
                    <p className="text-sm">Consultation Fee: ${doctor.consultation_fee}</p>
                    <p className="text-sm">Contact: {doctor.contact_number}</p>
                    <p className="text-sm">Email: {doctor.email}</p>
                    <p className="text-sm">Address: {doctor.address}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      doctor.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : doctor.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doctor.status}
                    </span>
                    <Dialog open={editDoctor?.id === doctor.id} onOpenChange={open => setEditDoctor(open ? doctor : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Doctor</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="first_name">First Name</Label>
                              <Input id="first_name" name="first_name" value={editDoctor?.first_name || ""} onChange={handleEditChange} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="last_name">Last Name</Label>
                              <Input id="last_name" name="last_name" value={editDoctor?.last_name || ""} onChange={handleEditChange} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="specialization">Specialization</Label>
                              <Input id="specialization" name="specialization" value={editDoctor?.specialization || ""} onChange={handleEditChange} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="qualification">Qualification</Label>
                              <Input id="qualification" name="qualification" value={editDoctor?.qualification || ""} onChange={handleEditChange} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="experience">Years of Experience</Label>
                              <Input type="number" id="experience" name="experience" value={editDoctor?.experience || ""} onChange={handleEditChange} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contact_number">Contact Number</Label>
                              <Input id="contact_number" name="contact_number" value={editDoctor?.contact_number || ""} onChange={handleEditChange} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input type="email" id="email" name="email" value={editDoctor?.email || ""} onChange={handleEditChange} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="available_days">Available Days</Label>
                              <Select value={editDoctor?.available_days || ""} onValueChange={value => handleEditSelect('available_days', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select available days" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Mon-Fri">Monday to Friday</SelectItem>
                                  <SelectItem value="Mon-Sat">Monday to Saturday</SelectItem>
                                  <SelectItem value="All">All Days</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="consultation_fee">Consultation Fee</Label>
                              <Input type="number" id="consultation_fee" name="consultation_fee" value={editDoctor?.consultation_fee || ""} onChange={handleEditChange} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="status">Status</Label>
                              <Select value={editDoctor?.status || "active"} onValueChange={value => handleEditSelect('status', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                  <SelectItem value="on_leave">On Leave</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" name="address" value={editDoctor?.address || ""} onChange={handleEditChange} required />
                          </div>
                          <Button type="submit" disabled={editLoading}>{editLoading ? "Saving..." : "Save Changes"}</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
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