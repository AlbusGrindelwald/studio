
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import type { Doctor } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface RescheduleDialogProps {
  doctor: Doctor;
  trigger: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule: (newDate: string, newTime: string) => void;
}

export function RescheduleDialog({ doctor, trigger, open, onOpenChange, onReschedule }: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { toast } = useToast();
  
  const availableDates = Object.keys(doctor.availability);

  const handleReschedule = () => {
    if (selectedDate && selectedTime) {
      onReschedule(selectedDate, selectedTime);
      onOpenChange(false);
      toast({
        title: 'Appointment Rescheduled!',
        description: `Your appointment with ${doctor.name} has been moved to ${new Date(selectedDate).toLocaleDateString()} at ${selectedTime}.`,
      });
      setSelectedDate(null);
      setSelectedTime(null);
    } else {
       toast({
        title: 'Selection required',
        description: 'Please select a new date and time slot.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for your appointment with {doctor.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Select a new date:
              </p>
              <div className="flex flex-wrap gap-2">
                {availableDates.map(date => (
                  <Button
                    key={date}
                    variant={selectedDate === date ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                    }}
                  >
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div>
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Select a new time:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {doctor.availability[selectedDate].map(time => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReschedule}>Confirm Reschedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
