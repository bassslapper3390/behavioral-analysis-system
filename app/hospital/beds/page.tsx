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

interface Bed {
  id: number
  ward_id: number
  ward_name: string
  bed_number: number
  status: string
  patient_id: number | null
  patient_name: string | null
  admission_date: string | null
  expected_discharge_date: string | null
}

export default function BedsPage() {
  const { toast } = useToast()
  const [beds, setBeds] = useState<Bed[]>([])
  const [loading, setLoading] = useState(true)
  const [editBed, setEditBed] = useState<Bed | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [wards, setWards] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    fetchBeds()
    fetchWards()
  }, [])

  const fetchBeds = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/hospital/beds")
      const data = await response.json()
      setBeds(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch beds", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchWards = async () => {
    try {
      const response = await fetch("/api/hospital/wards")
      const data = await response.json()
      setWards(data.map((ward: any) => ({ id: ward.id, name: ward.name })))
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch wards", variant: "destructive" })
    }
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editBed) return
    const { name, value } = e.target
    setEditBed({ ...editBed, [name]: value })
  }

  const handleEditSelect = (name: string, value: string) => {
    if (!editBed) return
    setEditBed({ ...editBed, [name]: value })
  }

  const handleEditSave = async () => {
    if (!editBed) return
    setEditLoading(true)
    try {
      const response = await fetch(`/api/hospital/beds/${editBed.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editBed),
      })
      if (!response.ok) throw new Error("Failed to update bed")
      toast({ title: "Success", description: "Bed updated successfully" })
      setEditBed(null)
      fetchBeds()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update bed", variant: "destructive" })
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Beds</h1>
      <div className="grid gap-4">
        {loading ? (
          <Card><CardContent className="p-6 text-center">Loading...</CardContent></Card>
        ) : beds.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-gray-500">No beds found</CardContent></Card>
        ) : (
          beds.map((bed) => (
            <Card key={bed.id}>
              <CardContent className="p-6 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Bed {bed.bed_number}</h3>
                  <p className="text-sm text-gray-500">Ward: {bed.ward_name}</p>
                  <p className="text-sm">Status: {bed.status}</p>
                  {bed.patient_name && (
                    <>
                      <p className="text-sm">Patient: {bed.patient_name}</p>
                      <p className="text-sm">Admission Date: {new Date(bed.admission_date!).toLocaleDateString()}</p>
                      <p className="text-sm">Expected Discharge: {new Date(bed.expected_discharge_date!).toLocaleDateString()}</p>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    bed.status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : bed.status === 'occupied'
                      ? 'bg-blue-100 text-blue-800'
                      : bed.status === 'maintenance'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {bed.status}
                  </span>
                  <Dialog open={editBed?.id === bed.id} onOpenChange={open => setEditBed(open ? bed : null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Edit</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Bed</DialogTitle>
                      </DialogHeader>
                      <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                        <div className="space-y-2">
                          <Label htmlFor="ward_id">Ward</Label>
                          <Select value={editBed?.ward_id.toString() || ""} onValueChange={value => handleEditSelect('ward_id', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ward" />
                            </SelectTrigger>
                            <SelectContent>
                              {wards.map(ward => (
                                <SelectItem key={ward.id} value={ward.id.toString()}>
                                  {ward.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bed_number">Bed Number</Label>
                          <Input type="number" id="bed_number" name="bed_number" value={editBed?.bed_number || ""} onChange={handleEditChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select value={editBed?.status || "available"} onValueChange={value => handleEditSelect('status', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="occupied">Occupied</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="reserved">Reserved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" disabled={editLoading}>{editLoading ? "Saving..." : "Save Changes"}</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 