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
  estimatedDuration: z.string().min(1, "Estimated duration is required"),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "Priority is required",
  }),
  objectives: z.string().min(1, "At least one objective is required"),
  equipment: z.string().min(1, "At least one equipment item is required"),
  notes: z.string().optional(),
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

  const form = useForm<PatrolFormValues>({
    resolver: zodResolver(patrolFormSchema),
    defaultValues: patrol
      ? {
          route: patrol.route || "",
          patrolDate: patrol.patrolDate ? new Date(patrol.patrolDate) : new Date(),
          startTime: patrol.startTime || "",
          estimatedDuration: patrol.estimatedDuration || "",
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

  const onSubmit = async (data: PatrolFormValues) => {
    setIsSubmitting(true);
    try {
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token;
      }

      const patrolData = {
        ...data,
        status: mode === "new" ? "in_progress" : mode === "schedule" ? "scheduled" : patrol.status,
        objectives: data.objectives.split(",").map(obj => obj.trim()),
        equipment: data.equipment.split(",").map(eq => eq.trim()),
        patrolDate: data.patrolDate.toISOString().split('T')[0],
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
        toast({
          title: "Success",
          description: mode === "new" 
            ? "New patrol started successfully" 
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
                          console.log("Calendar onSelect - Selected date:", date);
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
                    <FormLabel className="text-base">Duration</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 4 hours" 
                        {...field} 
                        className="h-12 text-base"
                      />
                    </FormControl>
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