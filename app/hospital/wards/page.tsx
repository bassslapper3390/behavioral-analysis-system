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

interface Ward {
  id: number
  name: string
  type: string
  capacity: number
  charge_per_day: number
  status: string
  description: string
  occupied_beds: number
}

export default function WardsPage() {
  const { toast } = useToast()
  const [wards, setWards] = useState<Ward[]>([])
  const [loading, setLoading] = useState(true)
  const [editWard, setEditWard] = useState<Ward | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newWard, setNewWard] = useState({
    name: "",
    type: "",
    capacity: 0,
    charge_per_day: 0,
    status: "active",
    description: ""
  })
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    fetchWards()
  }, [])

  const fetchWards = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/hospital/wards")
      if (!response.ok) throw new Error("Failed to fetch wards")
      const data = await response.json()
      setWards(data as Ward[])
    } catch (error) {
      console.error("Error fetching wards:", error)
      toast({ title: "Error", description: "Failed to fetch wards", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editWard) return
    const { name, value } = e.target
    setEditWard({ ...editWard, [name]: value })
  }

  const handleEditSelect = (name: string, value: string) => {
    if (!editWard) return
    setEditWard({ ...editWard, [name]: value })
  }

  const handleEditSave = async () => {
    if (!editWard) return
    setEditLoading(true)
    try {
      const response = await fetch(`/api/hospital/wards/${editWard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editWard),
      })
      if (!response.ok) throw new Error("Failed to update ward")
      toast({ title: "Success", description: "Ward updated successfully" })
      setEditWard(null)
      fetchWards()
    } catch (error) {
      console.error("Error updating ward:", error)
      toast({ title: "Error", description: "Failed to update ward", variant: "destructive" })
    } finally {
      setEditLoading(false)
    }
  }

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewWard({ ...newWard, [name]: value });
  };

  const handleAddSelect = (name: string, value: string) => {
    setNewWard({ ...newWard, [name]: value });
  };

  const handleAddWard = async () => {
    setAddLoading(true);
    try {
      const response = await fetch("/api/hospital/wards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWard),
      });
      if (!response.ok) throw new Error("Failed to add ward");
      toast({ title: "Success", description: "Ward added successfully" });
      setAddDialogOpen(false);
      setNewWard({
        name: "",
        type: "",
        capacity: 0,
        charge_per_day: 0,
        status: "active",
        description: ""
      });
      fetchWards();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add ward", variant: "destructive" });
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Wards</h1>
      <div className="grid gap-4">
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4">Add Ward</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Ward</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAddWard(); }}>
              <div className="space-y-2">
                <Label htmlFor="name">Ward Name</Label>
                <Input id="name" name="name" value={newWard.name} onChange={handleAddChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Ward Type</Label>
                <Select value={newWard.type} onValueChange={value => handleAddSelect('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                    <SelectItem value="pediatric">Pediatric</SelectItem>
                    <SelectItem value="maternity">Maternity</SelectItem>
                    <SelectItem value="surgical">Surgical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input type="number" id="capacity" name="capacity" value={newWard.capacity} onChange={handleAddChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="charge_per_day">Charge per Day</Label>
                <Input type="number" id="charge_per_day" name="charge_per_day" value={newWard.charge_per_day} onChange={handleAddChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newWard.status} onValueChange={value => handleAddSelect('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" value={newWard.description} onChange={handleAddChange} required />
              </div>
              <Button type="submit" disabled={addLoading}>{addLoading ? "Adding..." : "Add Ward"}</Button>
            </form>
          </DialogContent>
        </Dialog>
        {loading ? (
          <Card><CardContent className="p-6 text-center">Loading...</CardContent></Card>
        ) : wards.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-gray-500">No wards found</CardContent></Card>
        ) : (
          wards.map((ward) => (
            <Card key={ward.id}>
              <CardContent className="p-6 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{ward.name}</h3>
                  <p className="text-sm text-gray-500">Type: {ward.type}</p>
                  <p className="text-sm">Capacity: {ward.capacity} beds</p>
                  <p className="text-sm">Occupied: {ward.occupied_beds} beds</p>
                  <p className="text-sm">Available: {ward.capacity - ward.occupied_beds} beds</p>
                  <p className="text-sm">Charge per day: ${ward.charge_per_day}</p>
                  <p className="text-sm">Status: {ward.status}</p>
                  <p className="text-sm">Description: {ward.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    ward.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : ward.status === 'maintenance'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {ward.status}
                  </span>
                  <Dialog open={editWard?.id === ward.id} onOpenChange={open => setEditWard(open ? ward : null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Edit</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Ward</DialogTitle>
                      </DialogHeader>
                      <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                        <div className="space-y-2">
                          <Label htmlFor="name">Ward Name</Label>
                          <Input id="name" name="name" value={editWard?.name || ""} onChange={handleEditChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Ward Type</Label>
                          <Select value={editWard?.type || ""} onValueChange={value => handleEditSelect('type', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ward type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="icu">ICU</SelectItem>
                              <SelectItem value="pediatric">Pediatric</SelectItem>
                              <SelectItem value="maternity">Maternity</SelectItem>
                              <SelectItem value="surgical">Surgical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="capacity">Capacity</Label>
                          <Input type="number" id="capacity" name="capacity" value={editWard?.capacity || ""} onChange={handleEditChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="charge_per_day">Charge per Day</Label>
                          <Input type="number" id="charge_per_day" name="charge_per_day" value={editWard?.charge_per_day || ""} onChange={handleEditChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select value={editWard?.status || "active"} onValueChange={value => handleEditSelect('status', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input id="description" name="description" value={editWard?.description || ""} onChange={handleEditChange} required />
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