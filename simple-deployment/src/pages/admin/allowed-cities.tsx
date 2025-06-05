import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, PlusCircle, Edit, Trash2, MapPin } from "lucide-react";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define types
type AllowedCity = {
  id: number;
  cityName: string;
  province: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// Create form schema
const cityFormSchema = z.object({
  cityName: z.string().min(2, "City name is required"),
  province: z.string().min(2, "Province is required"),
  isActive: z.boolean().default(true),
});

type CityFormValues = z.infer<typeof cityFormSchema>;

export default function AllowedCitiesPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<AllowedCity | null>(null);

  // Fetch allowed cities
  const {
    data: cities,
    isLoading,
    error,
  } = useQuery<AllowedCity[]>({
    queryKey: ["/api/admin/allowed-cities"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/allowed-cities");
      return res.json();
    },
  });

  // Add city mutation
  const addCityMutation = useMutation({
    mutationFn: async (data: CityFormValues) => {
      const res = await apiRequest("POST", "/api/admin/allowed-cities", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "City added",
        description: "The city was added successfully",
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/allowed-cities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding city",
        description: error.message || "Failed to add city",
        variant: "destructive",
      });
    },
  });

  // Update city mutation
  const updateCityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CityFormValues }) => {
      const res = await apiRequest("PUT", `/api/admin/allowed-cities/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "City updated",
        description: "The city was updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedCity(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/allowed-cities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating city",
        description: error.message || "Failed to update city",
        variant: "destructive",
      });
    },
  });

  // Toggle city status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/allowed-cities/${id}/status`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "The city status was updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/allowed-cities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating status",
        description: error.message || "Failed to update city status",
        variant: "destructive",
      });
    },
  });

  // Delete city mutation
  const deleteCityMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/allowed-cities/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete city");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "City deleted",
        description: "The city was deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/allowed-cities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting city",
        description: error.message || "Failed to delete city",
        variant: "destructive",
      });
    },
  });

  // Add city form
  const addForm = useForm<CityFormValues>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: {
      cityName: "",
      province: "Ontario",
      isActive: true,
    },
  });

  // Edit city form
  const editForm = useForm<CityFormValues>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: {
      cityName: "",
      province: "Ontario",
      isActive: true,
    },
  });

  // Reset and set up edit form when selected city changes
  useEffect(() => {
    if (selectedCity) {
      editForm.reset({
        cityName: selectedCity.cityName,
        province: selectedCity.province,
        isActive: selectedCity.isActive,
      });
    }
  }, [selectedCity, editForm]);

  const handleAddSubmit = (data: CityFormValues) => {
    addCityMutation.mutate(data);
  };

  const handleEditSubmit = (data: CityFormValues) => {
    if (selectedCity) {
      updateCityMutation.mutate({ id: selectedCity.id, data });
    }
  };

  const handleDelete = (id: number) => {
    deleteCityMutation.mutate(id);
  };

  const handleToggleStatus = (id: number, isActive: boolean) => {
    toggleStatusMutation.mutate({ id, isActive: !isActive });
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Allowed Delivery Cities</CardTitle>
          <CardDescription>
            Manage cities where delivery is available. Only the cities in this list will be 
            accepted for delivery in the shipping calculator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add City
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New City</DialogTitle>
                  <DialogDescription>
                    Add a new city that will be allowed for delivery.
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form
                    onSubmit={addForm.handleSubmit(handleAddSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={addForm.control}
                      name="cityName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City Name</FormLabel>
                          <FormControl>
                            <Input placeholder="City name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province</FormLabel>
                          <FormControl>
                            <Input placeholder="Province" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <FormDescription>
                              Whether this city is currently allowed for delivery
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={addCityMutation.isPending}
                      >
                        {addCityMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Add City
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-4 text-destructive">
              Error loading cities: {(error as Error).message}
            </div>
          ) : cities && cities.length > 0 ? (
            <Table>
              <TableCaption>List of cities allowed for delivery</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead>Province</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                        {city.cityName}
                      </div>
                    </TableCell>
                    <TableCell>{city.province}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={city.isActive}
                        onCheckedChange={() =>
                          handleToggleStatus(city.id, city.isActive)
                        }
                        aria-label={`Toggle status for ${city.cityName}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCity(city);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you sure you want to delete this city?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove {city.cityName} from the allowed cities list.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(city.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No cities found. Add your first city to allow deliveries.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit City Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit City</DialogTitle>
            <DialogDescription>
              Update the city information for delivery permissions.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="cityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City Name</FormLabel>
                    <FormControl>
                      <Input placeholder="City name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Input placeholder="Province" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Whether this city is currently allowed for delivery
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedCity(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateCityMutation.isPending}
                >
                  {updateCityMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update City
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}