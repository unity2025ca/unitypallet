import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { AdminLayout } from '@/components/admin/AdminLayout';

// Define appointment types
interface Appointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

const statusStyles = {
  pending: { class: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
  confirmed: { class: 'bg-green-100 text-green-800 border-green-200', label: 'Confirmed' },
  cancelled: { class: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' },
  completed: { class: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Completed' },
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string, timeString: string) => {
  const date = new Date(`${dateString}T${timeString}`);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AdminAppointmentsPage: React.FC = () => {
  const { toast } = useToast();
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  
  // Fetch appointments
  const { data: appointments, isLoading, isError } = useQuery<Appointment[]>({
    queryKey: ['/api/admin/appointments'],
  });

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/appointments/${id}/status`, { status });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/appointments'] });
      toast({
        title: 'Status updated',
        description: 'Appointment status has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/appointments/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/appointments'] });
      toast({
        title: 'Appointment deleted',
        description: 'The appointment has been successfully deleted.',
      });
      setAppointmentToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete appointment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  const handleStatusChange = (id: number, value: string) => {
    updateStatusMutation.mutate({ id, status: value });
  };

  const confirmDelete = (id: number) => {
    setAppointmentToDelete(id);
  };

  const handleDelete = () => {
    if (appointmentToDelete !== null) {
      deleteAppointmentMutation.mutate(appointmentToDelete);
    }
  };

  return (
    <AdminLayout title="Appointments">
      <div className="mb-6">
        <p className="text-gray-600">Manage customer appointment requests</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          Failed to load appointments. Please try again.
        </div>
      ) : appointments && appointments.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableCaption>A list of all appointment requests.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Requested on</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{appointment.email}</div>
                      <div className="text-muted-foreground">{appointment.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDateTime(appointment.date, appointment.time)}</TableCell>
                  <TableCell>{formatDate(appointment.created_at)}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={appointment.status}
                      onValueChange={(value) => handleStatusChange(appointment.id, value)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>
                          <Badge 
                            variant="outline" 
                            className={statusStyles[appointment.status as keyof typeof statusStyles].class}
                          >
                            {statusStyles[appointment.status as keyof typeof statusStyles].label}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          <Badge variant="outline" className={statusStyles.pending.class}>
                            {statusStyles.pending.label}
                          </Badge>
                        </SelectItem>
                        <SelectItem value="confirmed">
                          <Badge variant="outline" className={statusStyles.confirmed.class}>
                            {statusStyles.confirmed.label}
                          </Badge>
                        </SelectItem>
                        <SelectItem value="cancelled">
                          <Badge variant="outline" className={statusStyles.cancelled.class}>
                            {statusStyles.cancelled.label}
                          </Badge>
                        </SelectItem>
                        <SelectItem value="completed">
                          <Badge variant="outline" className={statusStyles.completed.class}>
                            {statusStyles.completed.label}
                          </Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(appointment.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-xl font-semibold mb-2">No appointments found</div>
          <p className="text-muted-foreground">
            There are no customer appointment requests at this time.
          </p>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={appointmentToDelete !== null} onOpenChange={(open) => !open && setAppointmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the appointment record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteAppointmentMutation.isPending}
            >
              {deleteAppointmentMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminAppointmentsPage;