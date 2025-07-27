
'use client';

import { useState, useMemo } from 'react';
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
import { Calendar, Sun, Moon } from 'lucide-react';
import type { Doctor } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, startOfDay } from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


interface RescheduleDialogProps {
  doctor: Doctor;
  trigger: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule: (newDate: string, newTime: string) => void;
}

const getNextSevenDays = () => {
  const dates: Date[] = [];
  let currentDate = startOfDay(new Date());
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  return dates;
};

const dummyMorningSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'];
const dummyEveningSlots = ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];


export function RescheduleDialog({ doctor, trigger, open, onOpenChange, onReschedule }: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { toast } = useToast();
  
  const sevenDaySlots = useMemo(() => getNextSevenDays(), []);

  const handleReschedule = () => {
    if (selectedDate && selectedTime) {
      onReschedule(format(selectedDate, 'yyyy-MM-dd'), selectedTime);
      onOpenChange(false);
      toast({
        title: 'Appointment Rescheduled!',
        description: `Your appointment with ${doctor.name} has been moved to ${format(selectedDate, 'MMM d, yyyy')} at ${selectedTime}.`,
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
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
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
            <div>
                <h3 className="font-medium text-sm mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Choose a new date
                </h3>
                <ScrollArea className="w-full whitespace-nowrap rounded-md -mx-1">
                    <div className="flex gap-3 pb-4 px-1">
                        {sevenDaySlots.map(date => {
                            const isSelected = selectedDate?.toISOString().split('T')[0] === date.toISOString().split('T')[0];
                            return (
                                <button
                                    key={date.toISOString()}
                                    onClick={() => handleDateSelect(date)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-2 rounded-lg border w-16 h-20 transition-colors shrink-0",
                                        isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-background text-foreground"
                                    )}
                                >
                                    <span className="text-2xl font-bold">{format(date, 'dd')}</span>
                                    <span className="text-xs uppercase font-medium">{format(date, 'E')}</span>
                                </button>
                            )
                        })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>

            {selectedDate && (
                <div className="space-y-6">
                    <div>
                        <h3 className="font-medium text-sm mb-4 flex items-center gap-2">
                            <Sun className="h-4 w-4 text-yellow-500" />
                            Morning Slots
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {dummyMorningSlots.map(time => (
                            <Button
                                key={time}
                                variant={selectedTime === time ? 'default' : 'outline'}
                                className="py-2 h-auto text-xs"
                                onClick={() => setSelectedTime(time)}
                            >
                                {time}
                            </Button>
                        ))}
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-medium text-sm mb-4 flex items-center gap-2">
                            <Moon className="h-4 w-4 text-blue-500" />
                            Evening Slots
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {dummyEveningSlots.map(time => (
                            <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            className="py-2 h-auto text-xs"
                            onClick={() => setSelectedTime(time)}
                            >
                            {time}
                            </Button>
                        ))}
                        </div>
                    </div>
                </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReschedule} disabled={!selectedTime}>Confirm Reschedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
