import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import api from "@/config/api";
import { useToast } from "@/components/ui/use-toast";

const patrolFormSchema = z.object({
  route: z.string().min(1, "Route is required"),
  patrolDate: z.date({
    required_error: "Patrol date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  estimatedDuration: z.string().min(1, "Estimated duration is required").refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    "Duration must be a positive number"
  ),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "Priority is required",
  }),
  objectives: z.string().min(1, "At least one objective is required"),
  equipment: z.string().min(1, "At least one equipment item is required"),
  notes: z.string().optional(),
}).refine((data) => {
  // Custom validation for patrol date and time
  const now = new Date();
  const patrolDateTime = new Date(data.patrolDate);
  
  if (data.startTime) {
    const [hours, minutes] = data.startTime.split(':').map(Number);
    patrolDateTime.setHours(hours, minutes, 0, 0);
  }
  
  // For scheduling mode, prevent past dates/times
  // For other modes, allow dates up to 1 day in the past
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // This will be checked in the component based on mode
  return true;
}, {
  message: "Patrol date and time validation will be handled in the component",
  path: ["patrolDate"]
});

type PatrolFormValues = z.infer<typeof patrolFormSchema>;

interface PatrolFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  mode: "new" | "schedule" | "edit";
  patrol?: any;
}

export function PatrolForm({ onSuccess, onCancel, mode, patrol }: PatrolFormProps) {
  const { toast = () => {} } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [attendees, setAttendees] = useState([{ name: '', phone: '' }]);
  const [attendeeErrors, setAttendeeErrors] = useState<string[]>([]);

  // Helper function to check if patrol is scheduled for future
  const isFuturePatrol = (date: Date, time: string) => {
    const now = new Date();
    const patrolDateTime = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      patrolDateTime.setHours(hours, minutes, 0, 0);
    }
    return patrolDateTime > now;
  };

  const form = useForm<PatrolFormValues>({
    resolver: zodResolver(patrolFormSchema),
    defaultValues: patrol
      ? {
          route: patrol.route || "",
          patrolDate: patrol.patrolDate ? new Date(patrol.patrolDate) : new Date(),
          startTime: patrol.startTime || "",
          estimatedDuration: patrol.estimatedDuration ? patrol.estimatedDuration.toString() : "",
          priority: patrol.priority || "medium",
          objectives: patrol.objectives ? patrol.objectives.join(", ") : "",
          equipment: patrol.equipment ? patrol.equipment.join(", ") : "",
          notes: patrol.notes || "",
        }
      : {
      route: "",
      patrolDate: new Date(),
      startTime: "",
      estimatedDuration: "",
      priority: "medium",
      objectives: "",
      equipment: "",
      notes: "",
    },
  });

  const handleAttendeeChange = (index: number, field: 'name' | 'phone', value: string) => {
    setAttendees(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a));
  };

  const addAttendee = () => setAttendees(prev => [...prev, { name: '', phone: '' }]);

  const removeAttendee = (index: number) => setAttendees(prev => prev.filter((_, i) => i !== index));

  const validateAttendees = () => {
    const errors = attendees.map(a => {
      if (!a.name.trim() && !a.phone.trim()) {
        return ''; // Empty attendee is fine, will be filtered out
      }
      if (!a.name.trim()) {
        return 'Name is required.';
      }
      if (!a.phone.trim()) {
        return 'Phone number is required.';
      }
      if (!/^\d{10}$/.test(a.phone)) {
        return 'Phone number must be exactly 10 digits.';
      }
      return '';
    });
    setAttendeeErrors(errors);
    return errors.every(e => !e);
  };

  const onSubmit = async (data: PatrolFormValues) => {
    setIsSubmitting(true);
    try {
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token;
      }

      if (!validateAttendees()) {
        return;
      }

      // Custom validation for patrol date and time based on mode
      const now = new Date();
      const patrolDateTime = new Date(data.patrolDate);
      
      if (data.startTime) {
        const [hours, minutes] = data.startTime.split(':').map(Number);
        patrolDateTime.setHours(hours, minutes, 0, 0);
      }

      // For schedule mode, prevent past dates/times
      if (mode === "schedule" && patrolDateTime <= now) {
        toast({
          title: "Validation Error",
          description: "Cannot schedule patrols for past dates or times. Please select a future date and time.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // For new mode, allow dates up to 1 day in the past
      if (mode === "new") {
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        if (patrolDateTime < oneDayAgo) {
          toast({
            title: "Validation Error",
            description: "Patrol date cannot be more than 1 day in the past.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Determine status based on patrol date/time
      const isFuture = isFuturePatrol(data.patrolDate, data.startTime);
      let status = patrol?.status || "scheduled";
      
      if (mode === "new") {
        status = isFuture ? "scheduled" : "in_progress";
      } else if (mode === "schedule") {
        status = "scheduled";
      }

      const patrolData = {
        ...data,
        attendees: attendees.filter(attendee => attendee.name.trim() && attendee.phone.trim()),
        status,
        objectives: data.objectives.split(",").map(obj => obj.trim()).filter(obj => obj.length > 0),
        equipment: data.equipment.split(",").map(eq => eq.trim()).filter(eq => eq.length > 0),
        patrolDate: data.patrolDate.toISOString().split('T')[0],
        estimatedDuration: parseFloat(data.estimatedDuration),
      };

      if (mode === "edit" && patrol && patrol.id) {
        await api.patch(`/patrols/${patrol.id}`, patrolData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast({
          title: "Success",
          description: "Patrol updated successfully",
        });
      } else {
      await api.post('/patrols', patrolData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const isFuture = isFuturePatrol(data.patrolDate, data.startTime);
      toast({
        title: "Success",
        description: mode === "new" 
          ? (isFuture ? "Patrol scheduled for future successfully" : "New patrol started successfully")
          : "Patrol scheduled successfully",
      });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting patrol:', error);
      toast({
        title: "Error",
        description: "Failed to submit patrol. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-white shadow-md rounded-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Date/Time Validation Indicators */}
          {(() => {
            const currentDate = form.watch("patrolDate");
            const currentTime = form.watch("startTime");
            
            if (!currentDate || !currentTime) return null;
            
            const now = new Date();
            const patrolDateTime = new Date(currentDate);
            const [hours, minutes] = currentTime.split(':').map(Number);
            patrolDateTime.setHours(hours, minutes, 0, 0);
            
            const isFuture = patrolDateTime > now;
            const isPast = patrolDateTime <= now;
            
            // Show future indicator
            if (isFuture) {
              return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-blue-800 font-medium">
                      Future Patrol Scheduled
                    </span>
                  </div>
                  <p className="text-blue-700 text-sm mt-1">
                    This patrol will be automatically started when the scheduled time arrives.
                  </p>
                </div>
              );
            }
            
            // Show past date warning for schedule mode
            if (mode === "schedule" && isPast) {
              return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-800 font-medium">
                      Past Date/Time Selected
                    </span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    Cannot schedule patrols for past dates or times. Please select a future date and time.
                  </p>
                </div>
              );
            }
            
            return null;
          })()}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="route"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Route</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter patrol route" 
                      {...field} 
                      className="h-12 text-base"
                    />
                  </FormControl>
                  <FormDescription>
                    Specify the route or area for this patrol
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high" className="text-red-600">High</SelectItem>
                      <SelectItem value="medium" className="text-amber-600">Medium</SelectItem>
                      <SelectItem value="low" className="text-green-600">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="patrolDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-base">Patrol Date</FormLabel>
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "h-12 pl-3 text-left font-normal text-base w-full justify-between", 
                            !field.value && "text-muted-foreground"
                          )}
                          onClick={() => setIsPopoverOpen(true)}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setTimeout(() => {
                            setIsPopoverOpen(false);
                          }, 100);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select the date for this patrol
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Start Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        className="h-12 text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Duration (hours)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0.5"
                        step="0.5"
                        placeholder="e.g., 4" 
                        {...field} 
                        className="h-12 text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      Estimated duration in hours
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Objectives</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter objectives (comma-separated)"
                      {...field}
                      className="min-h-[100px] text-base"
                    />
                  </FormControl>
                  <FormDescription>
                    List the objectives for this patrol, separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Required Equipment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter required equipment (comma-separated)"
                      {...field}
                      className="min-h-[100px] text-base"
                    />
                  </FormControl>
                  <FormDescription>
                    List the equipment needed for this patrol, separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes or instructions"
                      {...field}
                      className="min-h-[100px] text-base"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter any additional notes or instructions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block font-medium mb-2">Patrol Attendees</label>
            {attendees.map((attendee, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <Input
                  type="text"
                  placeholder="Name"
                  value={attendee.name}
                  onChange={e => setAttendees(prev => prev.map((a, i) => i === idx ? { ...a, name: e.target.value } : a))}
                  className="w-1/2"
                />
                <Input
                  type="text"
                  placeholder="Phone (10 digits)"
                  value={attendee.phone}
                  onChange={e => setAttendees(prev => prev.map((a, i) => i === idx ? { ...a, phone: e.target.value } : a))}
                  className="w-1/2"
                  maxLength={10}
                  pattern="\d{10}"
                />
                {attendees.length > 1 && (
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeAttendee(idx)}>-</Button>
                )}
                {attendeeErrors[idx] && <span className="text-red-500 text-xs ml-2">{attendeeErrors[idx]}</span>}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-12 px-6 text-base"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="h-12 px-6 text-base bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : mode === "new" ? (
                "Start Patrol"
              ) : mode === "schedule" ? (
                "Schedule Patrol"
              ) : (
                "Update Patrol"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 