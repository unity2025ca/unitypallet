import React, { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiRequest } from '@/lib/queryClient';
import { useSettings } from '@/hooks/use-settings';

// Define the form schema with validation
const appointmentFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  date: z.string().min(1, { message: "Please select a date." }),
  time: z.string().min(1, { message: "Please select a time." }),
  message: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

const AppointmentBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { showAppointmentsBubble, getAvailableAppointmentDays, getAppointmentTimeSettings } = useSettings();
  
  // Set up the form with default values
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      message: "",
    },
  });
  
  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      // Send the appointment data to the server
      const response = await apiRequest('POST', '/api/appointments', data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule appointment');
      }
      
      toast({
        title: "Appointment scheduled!",
        description: `Thank you, ${data.name}. We'll contact you to confirm your appointment.`,
      });
      
      // Close the dialog
      setIsOpen(false);
      
      // Reset the form
      form.reset();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast({
        title: "Something went wrong.",
        description: "Your appointment could not be scheduled. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get available appointment time settings from context
  const timeSettings = useMemo(() => getAppointmentTimeSettings(), [getAppointmentTimeSettings]);
  
  // Parse start and end times
  const parseTime = (timeStr: string): { hour: number, minute: number } => {
    const [hourStr, minuteStr] = timeStr.split(':');
    return {
      hour: parseInt(hourStr, 10),
      minute: parseInt(minuteStr || '0', 10)
    };
  };
  
  // Generate time slots based on settings
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    const startTime = parseTime(timeSettings.startTime);
    const endTime = parseTime(timeSettings.endTime);
    const intervalMinutes = timeSettings.intervalMinutes;
    
    // Start with the start hour and minutes
    let currentHour = startTime.hour;
    let currentMinute = startTime.minute;
    
    // Keep generating slots until we reach or exceed end time
    while (currentHour < endTime.hour || 
           (currentHour === endTime.hour && currentMinute <= endTime.minute)) {
      
      // Format the time for display
      const formattedHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
      const amPm = currentHour < 12 ? 'AM' : 'PM';
      const formattedMinute = currentMinute.toString().padStart(2, '0');
      
      slots.push(`${formattedHour}:${formattedMinute} ${amPm}`);
      
      // Increment time by interval
      currentMinute += intervalMinutes;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }
    
    return slots;
  };
  
  // Get available days of the week
  const availableDays = useMemo(() => getAvailableAppointmentDays(), [getAvailableAppointmentDays]);
  
  // Generate time slots
  const timeSlots = useMemo(() => generateTimeSlots(), [timeSettings]);
  
  // Helper function to check if a date is an available day
  const isAvailableDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    return availableDays.includes(dayName);
  };
  
  // Date change handler to validate selected date is on an available day
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    
    if (selectedDate && !isAvailableDate(selectedDate)) {
      toast({
        title: "Unavailable Day",
        description: `Appointments are not available on this day. Please select from: ${availableDays.join(', ')}`,
        variant: "destructive",
      });
      // Clear the date input
      form.setValue('date', '');
    } else {
      form.setValue('date', selectedDate);
    }
  };
  
  // If appointments bubble is hidden, don't render anything
  if (!showAppointmentsBubble) {
    return null;
  }
  
  return (
    <>
      {/* Floating bubble button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center p-4 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 group"
      >
        <Calendar className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 ease-in-out">
          Schedule Appointment
        </span>
      </button>
      
      {/* Appointment form dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule an Appointment</DialogTitle>
            <DialogDescription>
              Fill out the form below to schedule a visit to our company.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          min={new Date().toISOString().split("T")[0]} 
                          onChange={(e) => {
                            handleDateChange(e);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Available days: {availableDays.join(', ')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time: string) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us anything else we should know about your visit"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting} className="bg-red-600 hover:bg-red-700">
                  {form.formState.isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scheduling...
                    </span>
                  ) : "Schedule Appointment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentBubble;