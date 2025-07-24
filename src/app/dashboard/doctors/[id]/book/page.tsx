
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import { findDoctorById } from '@/lib/data';
import { addAppointment } from '@/lib/appointments';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  const doctor = findDoctorById(id);
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  if (!doctor) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Doctor not found.</p>
      </div>
    );
  }
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };
  
  const availableDates = Object.keys(doctor.availability);
  
  if (availableDates.length > 0 && !selectedDate) {
      handleDateSelect(availableDates[0]);
  }


  const handleBookNow = () => {
    if (selectedDate && selectedTime) {
      setIsConfirming(true);
    } else {
      toast({
        title: 'Selection required',
        description: 'Please select a time slot.',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) return;

    addAppointment({
      doctorId: doctor.id,
      date: selectedDate,
      time: selectedTime,
    });

    setIsConfirming(false);
    toast({
      title: 'Appointment Booked!',
      description: `Your appointment with ${doctor.name} on ${format(parseISO(selectedDate), 'MMM d, yyyy')} at ${selectedTime} is confirmed.`,
    });
    
    setSelectedDate(null);
    setSelectedTime(null);
    router.push('/dashboard/appointments');
  };
  
  const allTimeSlots = selectedDate ? doctor.availability[selectedDate] : [];
  const morningSlots = allTimeSlots.filter(time => parseInt(time.split(':')[0]) < 12);
  const eveningSlots = allTimeSlots.filter(time => parseInt(time.split(':')[0]) >= 12);


  return (
    <div className="flex flex-col h-screen bg-muted/40">
       <header className="bg-primary text-primary-foreground p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">Book Appointment</h1>
      </header>

      <div className="bg-primary p-4 pt-0">
        <div className="bg-card text-card-foreground rounded-xl p-4 flex items-center gap-4 shadow-lg">
           <Image
              src={doctor.image}
              alt={`Photo of ${doctor.name}`}
              width={72}
              height={72}
              className="rounded-lg border object-cover"
              data-ai-hint="doctor portrait"
            />
            <div className="flex-1">
                <h2 className="font-bold text-lg">{doctor.name}</h2>
                <p className="text-sm text-muted-foreground">{doctor.specialty} - {doctor.location}</p>
                <p className="text-sm text-muted-foreground">MBBS, MD (Internal Medicine)</p>
            </div>
        </div>
      </div>
     
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Book Appointment</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedDate ? format(parseISO(selectedDate), 'MMMM, yyyy') : 'Select a date'}</span>
                </div>
            </div>

            <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <div className="flex gap-3 pb-4">
                    {availableDates.map(dateStr => {
                        const date = parseISO(dateStr);
                        return (
                            <button
                                key={dateStr}
                                onClick={() => handleDateSelect(dateStr)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-3 rounded-lg border w-16 h-20 transition-colors",
                                    selectedDate === dateStr
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card hover:bg-accent"
                                )}
                            >
                                <span className="text-xl font-bold">{format(date, 'dd')}</span>
                                <span className="text-xs uppercase">{format(date, 'E')}</span>
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
                    <h3 className="font-semibold mb-4">Select slot</h3>
                    <div className="grid grid-cols-2 gap-3">
                    {morningSlots.map(time => (
                        <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        className={cn("py-3 h-auto", selectedTime === time && "bg-primary text-primary-foreground")}
                        onClick={() => setSelectedTime(time)}
                        >
                        {time}
                        </Button>
                    ))}
                    </div>
                     {morningSlots.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No morning slots available.</p>}
                </div>
                 <div>
                    <h3 className="font-semibold mb-4">Evening Slot</h3>
                    <div className="grid grid-cols-2 gap-3">
                    {eveningSlots.map(time => (
                        <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                         className={cn("py-3 h-auto", selectedTime === time && "bg-primary text-primary-foreground")}
                        onClick={() => setSelectedTime(time)}
                        >
                        {time}
                        </Button>
                    ))}
                    </div>
                     {eveningSlots.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No evening slots available.</p>}
                </div>
            </div>
        )}
      </main>

      <footer className="p-4 border-t bg-background">
        <Button size="lg" className="w-full" onClick={handleBookNow}>Book appointment</Button>
      </footer>
      
      <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Appointment</DialogTitle>
            <DialogDescription>
              Please review your appointment details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <p><strong>Doctor:</strong> {doctor.name}</p>
            <p><strong>Specialty:</strong> {doctor.specialty}</p>
            <p><strong>Date:</strong> {selectedDate && format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirming(false)}>Cancel</Button>
            <Button onClick={handleConfirmBooking}>Confirm & Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
