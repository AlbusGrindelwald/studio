
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Sun, Moon } from 'lucide-react';
import { findDoctorById } from '@/lib/data';
import { addAppointment } from '@/lib/appointments';
import { addNotification } from '@/lib/notifications';
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
import { format, parseISO, addDays, isBefore, startOfDay } from 'date-fns';
import { getLoggedInUser } from '@/lib/user';
import type { User } from '@/lib/user';
import type { Doctor } from '@/lib/types';

const getTimePeriod = (time: string) => {
    const hour = parseInt(time.split(':')[0], 10);
    const isPM = time.toUpperCase().includes('PM');
    if (isPM && hour < 12) { // 1 PM to 11 PM
        return 'evening';
    }
    if (!isPM && hour === 12) { // 12:xx AM is morning
        return 'morning';
    }
    return hour < 12 ? 'morning' : 'evening';
};

const getNextSevenAvailableDays = (doctor: Doctor | null) => {
    if (!doctor) return [];
    const availableDates = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < 7; i++) {
        const date = addDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        if (doctor.availability[dateStr] && doctor.availability[dateStr].length > 0) {
            availableDates.push(dateStr);
        }
    }
    return availableDates;
};


export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  const doctor = findDoctorById(id);
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  
  const sevenDaySlots = useMemo(() => getNextSevenAvailableDays(doctor), [doctor]);

  const selectedSlotRef = useRef({ date: selectedDate, time: selectedTime, doctorName: doctor?.name });
  selectedSlotRef.current = { date: selectedDate, time: selectedTime, doctorName: doctor?.name };

  useEffect(() => {
    const user = getLoggedInUser();
    if (!user) {
        router.push('/login');
    } else {
        setCurrentUser(user);
    }
  }, [router]);

  useEffect(() => {
    // Automatically select the first available date when the component mounts or slots change
    if (sevenDaySlots.length > 0 && !selectedDate) {
      setSelectedDate(sevenDaySlots[0]);
    }
  }, [sevenDaySlots, selectedDate]);


  useEffect(() => {
    return () => {
      if (selectedSlotRef.current.date && selectedSlotRef.current.time && !bookingConfirmed) {
        const description = `Your appointment with ${selectedSlotRef.current.doctorName} was not confirmed. Please complete the booking process.`;
        addNotification({
            title: 'Booking Incomplete',
            description,
            type: 'destructive'
        });
        toast({
            title: 'Booking Incomplete',
            description,
            variant: 'destructive',
        });
      }
    };
  }, [bookingConfirmed, toast]);

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
    if (!selectedDate || !selectedTime || !currentUser) return;

    try {
      addAppointment({
        doctorId: doctor.id,
        date: selectedDate,
        time: selectedTime,
        userId: currentUser.id
      });

      setBookingConfirmed(true);

      toast({
        title: 'Appointment Booked!',
        description: `Your appointment with ${doctor.name} on ${format(parseISO(selectedDate), 'MMM d, yyyy')} at ${selectedTime} is confirmed.`,
      });
      
      router.push('/dashboard/appointments');

    } catch (error: any) {
        toast({
            title: 'Booking Failed',
            description: error.message || 'This slot is no longer available. Please try another.',
            variant: 'destructive'
        });
        addNotification({
            title: 'Booking Failed',
            description: `Your appointment with ${doctor.name} could not be booked. Please try again.`,
            type: 'destructive'
        });
    }

    setIsConfirming(false);
  };
  
  const timeSlots = selectedDate ? doctor.availability[selectedDate] || [] : [];
  const morningSlots = timeSlots.filter(time => getTimePeriod(time) === 'morning');
  const eveningSlots = timeSlots.filter(time => getTimePeriod(time) === 'evening');

  return (
    <div className="flex flex-col h-screen bg-muted/40">
       <header className="bg-background p-4 flex items-center gap-4 border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">Book Appointment</h1>
      </header>

      <div className="bg-background p-4">
        <div className="bg-card text-card-foreground rounded-xl p-4 flex items-center gap-4 shadow-sm border">
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
                <h3 className="font-semibold">Choose your slot</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedDate ? format(parseISO(selectedDate), 'MMMM, yyyy') : 'Select a date'}</span>
                </div>
            </div>

            <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <div className="flex gap-3 pb-4">
                    {sevenDaySlots.map(dateStr => {
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
                {morningSlots.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2"><Sun className="h-5 w-5 text-orange-400" /> Morning</h3>
                        <div className="grid grid-cols-3 gap-3">
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
                    </div>
                )}
                 {eveningSlots.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2"><Moon className="h-5 w-5 text-indigo-400" /> Evening</h3>
                        <div className="grid grid-cols-3 gap-3">
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
                    </div>
                )}
                {timeSlots.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No slots available for this date.</p>}
            </div>
        )}
      </main>

      <footer className="p-4 border-t bg-background">
        <Button size="lg" className="w-full" onClick={handleBookNow} disabled={!selectedTime}>
            {selectedTime ? `Pay $${doctor.fees} & Book` : 'Book Appointment'}
        </Button>
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
            <p className="font-bold"><strong>Fee:</strong> <span className="text-primary">${doctor.fees}</span></p>
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
