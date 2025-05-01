import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Trash2, Edit, MapPin, Navigation, DollarSign } from "lucide-react";

// Form schema definitions
const zoneSchema = z.object({
  name: z.string().min(1, "Zone name is required"),
  description: z.string().optional(),
});

const rateSchema = z.object({
  zoneId: z.number().min(1, "Zone is required"),
  minDistance: z.number().min(0, "Min distance must be 0 or greater"),
  maxDistance: z.number().min(1, "Max distance must be at least 1 km"),
  baseRate: z.number().min(0, "Base rate must be 0 or greater"),
  additionalRatePerKm: z.number().min(0, "Additional rate must be 0 or greater"),
  minWeight: z.number().optional(),
  maxWeight: z.number().optional(),
  additionalRatePerKg: z.number().optional(),
  isActive: z.boolean().default(true),
});

const locationSchema = z.object({
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().optional(),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
  isWarehouse: z.boolean().default(false),
  zoneId: z.number().optional(),
});

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return `C$${(amount / 100).toFixed(2)}`;
};

const ShippingManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("zones");
  const [openZoneDialog, setOpenZoneDialog] = useState(false);
  const [openRateDialog, setOpenRateDialog] = useState(false);
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [editingRate, setEditingRate] = useState<any>(null);
  const [editingLocation, setEditingLocation] = useState<any>(null);

  // Forms
  const zoneForm = useForm<z.infer<typeof zoneSchema>>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const rateForm = useForm<z.infer<typeof rateSchema>>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      zoneId: 0,
      minDistance: 0,
      maxDistance: 0,
      baseRate: 0,
      additionalRatePerKm: 0,
      minWeight: undefined,
      maxWeight: undefined,
      additionalRatePerKg: 0,
      isActive: true,
    },
  });

  const locationForm = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      city: "",
      province: "",
      country: "Canada",
      postalCode: "",
      latitude: "",
      longitude: "",
      isWarehouse: false,
      zoneId: undefined,
    },
  });

  // Queries
  const { data: zones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ["/api/admin/shipping/zones"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/shipping/zones");
      return await response.json();
    },
  });

  const { data: rates = [], isLoading: ratesLoading } = useQuery({
    queryKey: ["/api/admin/shipping/rates"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/shipping/rates");
      return await response.json();
    },
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ["/api/admin/shipping/locations"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/shipping/locations");
      return await response.json();
    },
  });

  // Mutation for zones
  const createZoneMutation = useMutation({
    mutationFn: async (data: z.infer<typeof zoneSchema>) => {
      const response = await apiRequest("POST", "/api/admin/shipping/zones", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shipping/zones"] });
      setOpenZoneDialog(false);
      zoneForm.reset();
      toast({
        title: "Zone Created",
        description: "The shipping zone has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create shipping zone",
        variant: "destructive",
      });
    },
  });

  const updateZoneMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof zoneSchema> }) => {
      const response = await apiRequest("PUT", `/api/admin/shipping/zones/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shipping/zones"] });
      setOpenZoneDialog(false);
      setEditingZone(null);
      zoneForm.reset();
      toast({
        title: "Zone Updated",
        description: "The shipping zone has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update shipping zone",
        variant: "destructive",
      });
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/shipping/zones/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shipping/zones"] });
      toast({
        title: "Zone Deleted",
        description: "The shipping zone has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete shipping zone",
        variant: "destructive",
      });
    },
  });

  // Mutation for rates
  const createRateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof rateSchema>) => {
      const response = await apiRequest("POST", "/api/admin/shipping/rates", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shipping/rates"] });
      setOpenRateDialog(false);
      rateForm.reset();
      toast({
        title: "Rate Created",
        description: "The shipping rate has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create shipping rate",
        variant: "destructive",
      });
    },
  });

  const updateRateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof rateSchema> }) => {
      const response = await apiRequest("PUT", `/api/admin/shipping/rates/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shipping/rates"] });
      setOpenRateDialog(false);
      setEditingRate(null);
      rateForm.reset();
      toast({
        title: "Rate Updated",
        description: "The shipping rate has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update shipping rate",
        variant: "destructive",
      });
    },
  });

  const deleteRateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/shipping/rates/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shipping/rates"] });
      toast({
        title: "Rate Deleted",
        description: "The shipping rate has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete shipping rate",
        variant: "destructive",
      });
    },
  });

  // Mutation for locations
  const createLocationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof locationSchema>) => {
      const response = await apiRequest("POST", "/api/admin/shipping/locations", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shipping/locations"] });
      setOpenLocationDialog(false);
      locationForm.reset();
      toast({
        title: "Location Created",
        description: "The location has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create location",
        variant: "destructive",
      });
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof locationSchema> }) => {
      const response = await apiRequest("PUT", `/api/admin/shipping/locations/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shipping/locations"] });
      setOpenLocationDialog(false);
      setEditingLocation(null);
      locationForm.reset();
      toast({
        title: "Location Updated",
        description: "The location has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update location",
        variant: "destructive",
      });
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/shipping/locations/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shipping/locations"] });
      toast({
        title: "Location Deleted",
        description: "The location has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete location",
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onZoneSubmit = async (values: z.infer<typeof zoneSchema>) => {
    if (editingZone) {
      await updateZoneMutation.mutateAsync({ id: editingZone.id, data: values });
    } else {
      await createZoneMutation.mutateAsync(values);
    }
  };

  const onRateSubmit = async (values: z.infer<typeof rateSchema>) => {
    // Convert string inputs to numbers for API
    const formattedValues = {
      ...values,
      minDistance: Number(values.minDistance),
      maxDistance: Number(values.maxDistance),
      baseRate: Number(values.baseRate),
      additionalRatePerKm: Number(values.additionalRatePerKm),
      minWeight: values.minWeight ? Number(values.minWeight) : undefined,
      maxWeight: values.maxWeight ? Number(values.maxWeight) : undefined,
      additionalRatePerKg: values.additionalRatePerKg ? Number(values.additionalRatePerKg) : 0,
    };

    if (editingRate) {
      await updateRateMutation.mutateAsync({ id: editingRate.id, data: formattedValues });
    } else {
      await createRateMutation.mutateAsync(formattedValues);
    }
  };

  const onLocationSubmit = async (values: z.infer<typeof locationSchema>) => {
    if (editingLocation) {
      await updateLocationMutation.mutateAsync({ id: editingLocation.id, data: values });
    } else {
      await createLocationMutation.mutateAsync(values);
    }
  };

  // Edit handlers
  const handleEditZone = (zone: any) => {
    setEditingZone(zone);
    zoneForm.reset({
      name: zone.name,
      description: zone.description || "",
    });
    setOpenZoneDialog(true);
  };

  const handleEditRate = (rate: any) => {
    setEditingRate(rate);
    rateForm.reset({
      zoneId: rate.zoneId,
      minDistance: rate.minDistance,
      maxDistance: rate.maxDistance,
      baseRate: rate.baseRate,
      additionalRatePerKm: rate.additionalRatePerKm,
      minWeight: rate.minWeight,
      maxWeight: rate.maxWeight,
      additionalRatePerKg: rate.additionalRatePerKg || 0,
      isActive: rate.isActive,
    });
    setOpenRateDialog(true);
  };

  const handleEditLocation = (location: any) => {
    setEditingLocation(location);
    locationForm.reset({
      city: location.city,
      province: location.province,
      country: location.country,
      postalCode: location.postalCode || "",
      latitude: location.latitude,
      longitude: location.longitude,
      isWarehouse: location.isWarehouse,
      zoneId: location.zoneId,
    });
    setOpenLocationDialog(true);
  };

  // Dialog close handlers
  const handleZoneDialogClose = () => {
    setOpenZoneDialog(false);
    setEditingZone(null);
    zoneForm.reset();
  };

  const handleRateDialogClose = () => {
    setOpenRateDialog(false);
    setEditingRate(null);
    rateForm.reset();
  };

  const handleLocationDialogClose = () => {
    setOpenLocationDialog(false);
    setEditingLocation(null);
    locationForm.reset();
  };

  // Find zone name by ID for display
  const getZoneName = (zoneId: number) => {
    const zone = zones.find((z: any) => z.id === zoneId);
    return zone ? zone.name : "Unknown Zone";
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-4">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Management</CardTitle>
            <CardDescription>
              Manage shipping zones, rates, and locations for calculating shipping costs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="zones"
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList>
                <TabsTrigger value="zones">Zones</TabsTrigger>
                <TabsTrigger value="rates">Rates</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
              </TabsList>

              {/* Shipping Zones Tab */}
              <TabsContent value="zones">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">Shipping Zones</h3>
                  <Button onClick={() => setOpenZoneDialog(true)}>Add Zone</Button>
                </div>

                {zonesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : zones.length === 0 ? (
                  <div className="text-center py-8">
                    <p>No shipping zones found. Create your first zone to get started.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zones.map((zone: any) => (
                        <TableRow key={zone.id}>
                          <TableCell className="font-medium">{zone.name}</TableCell>
                          <TableCell>{zone.description || "—"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditZone(zone)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteZoneMutation.mutate(zone.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Shipping Rates Tab */}
              <TabsContent value="rates">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">Shipping Rates</h3>
                  <Button
                    onClick={() => setOpenRateDialog(true)}
                    disabled={zones.length === 0}
                  >
                    Add Rate
                  </Button>
                </div>

                {ratesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : zones.length === 0 ? (
                  <div className="text-center py-8">
                    <p>You need to create at least one shipping zone first.</p>
                  </div>
                ) : rates.length === 0 ? (
                  <div className="text-center py-8">
                    <p>No shipping rates found. Create your first rate to get started.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Zone</TableHead>
                        <TableHead>Distance Range (km)</TableHead>
                        <TableHead>Base Rate</TableHead>
                        <TableHead>Per km</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rates.map((rate: any) => (
                        <TableRow key={rate.id}>
                          <TableCell>{getZoneName(rate.zoneId)}</TableCell>
                          <TableCell>
                            {rate.minDistance} - {rate.maxDistance}
                          </TableCell>
                          <TableCell>{formatCurrency(rate.baseRate)}</TableCell>
                          <TableCell>{formatCurrency(rate.additionalRatePerKm)}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                rate.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {rate.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditRate(rate)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteRateMutation.mutate(rate.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Locations Tab */}
              <TabsContent value="locations">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">Locations</h3>
                  <Button onClick={() => setOpenLocationDialog(true)}>Add Location</Button>
                </div>

                {locationsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : locations.length === 0 ? (
                  <div className="text-center py-8">
                    <p>No locations found. Create your first location to get started.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>City</TableHead>
                        <TableHead>Province</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Zone</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations.map((location: any) => (
                        <TableRow key={location.id}>
                          <TableCell className="font-medium">{location.city}</TableCell>
                          <TableCell>{location.province}</TableCell>
                          <TableCell>{location.country}</TableCell>
                          <TableCell>
                            {location.isWarehouse ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                Warehouse
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                Destination
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {location.zoneId ? getZoneName(location.zoneId) : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditLocation(location)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteLocationMutation.mutate(location.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Zone Dialog */}
      <Dialog open={openZoneDialog} onOpenChange={handleZoneDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingZone ? "Edit Shipping Zone" : "Add Shipping Zone"}</DialogTitle>
            <DialogDescription>
              Shipping zones allow you to group locations and apply specific rates.
            </DialogDescription>
          </DialogHeader>

          <Form {...zoneForm}>
            <form onSubmit={zoneForm.handleSubmit(onZoneSubmit)} className="space-y-4">
              <FormField
                control={zoneForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Ontario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={zoneForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description of this shipping zone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleZoneDialogClose}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createZoneMutation.isPending || updateZoneMutation.isPending}>
                  {createZoneMutation.isPending || updateZoneMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Zone"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Rate Dialog */}
      <Dialog open={openRateDialog} onOpenChange={handleRateDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRate ? "Edit Shipping Rate" : "Add Shipping Rate"}</DialogTitle>
            <DialogDescription>
              Define shipping rates based on distance and weight for specific zones.
            </DialogDescription>
          </DialogHeader>

          <Form {...rateForm}>
            <form onSubmit={rateForm.handleSubmit(onRateSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={rateForm.control}
                  name="zoneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Zone</FormLabel>
                      <FormControl>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          value={field.value}
                        >
                          <option value={0} disabled>
                            Select a zone
                          </option>
                          {zones.map((zone: any) => (
                            <option key={zone.id} value={zone.id}>
                              {zone.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={rateForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Only active rates are used in shipping calculations
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={rateForm.control}
                  name="minDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Distance (km)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={rateForm.control}
                  name="maxDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Distance (km)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="100"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={rateForm.control}
                  name="baseRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Rate (cents)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="1000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Base shipping cost in cents (e.g., 1000 = $10.00)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={rateForm.control}
                  name="additionalRatePerKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Per km (cents)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="25"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional cost per kilometer in cents
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={rateForm.control}
                  name="minWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Weight (g) - Optional</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Optional"
                          {...field}
                          value={field.value === undefined ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : e.target.valueAsNumber;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={rateForm.control}
                  name="maxWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Weight (g) - Optional</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Optional"
                          {...field}
                          value={field.value === undefined ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : e.target.valueAsNumber;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={rateForm.control}
                  name="additionalRatePerKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Per kg (cents)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Optional"
                          {...field}
                          value={field.value === undefined ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : e.target.valueAsNumber;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional cost per kilogram in cents
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRateDialogClose}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createRateMutation.isPending || updateRateMutation.isPending}>
                  {createRateMutation.isPending || updateRateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Rate"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={openLocationDialog} onOpenChange={handleLocationDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? "Edit Location" : "Add Location"}
            </DialogTitle>
            <DialogDescription>
              Add cities, warehouses and other locations for shipping calculations.
            </DialogDescription>
          </DialogHeader>

          <Form {...locationForm}>
            <form onSubmit={locationForm.handleSubmit(onLocationSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={locationForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Toronto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={locationForm.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Input placeholder="Ontario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={locationForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Canada" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={locationForm.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="M5V 2N4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={locationForm.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input placeholder="43.6532" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={locationForm.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input placeholder="-79.3832" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={locationForm.control}
                  name="zoneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Zone (Optional)</FormLabel>
                      <FormControl>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : Number(e.target.value);
                            field.onChange(value);
                          }}
                          value={field.value || ""}
                        >
                          <option value="">No zone</option>
                          {zones.map((zone: any) => (
                            <option key={zone.id} value={zone.id}>
                              {zone.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={locationForm.control}
                  name="isWarehouse"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Warehouse Location</FormLabel>
                        <FormDescription>
                          Is this a warehouse or shipping origin location?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLocationDialogClose}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLocationMutation.isPending || updateLocationMutation.isPending}>
                  {createLocationMutation.isPending || updateLocationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Location"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ShippingManagement;