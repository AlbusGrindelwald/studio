
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { format, addDays, startOfDay } from 'date-fns';
import { getLoggedInUser } from '@/lib/user';
import type { User } from '@/lib/user';
import type { Doctor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const getNextSevenAvailableDays = (doctor: Doctor | null) => {
  if (!doctor) return [];
  const availableDates: Date[] = [];
  let currentDate = startOfDay(new Date());

  for (let i = 0; i < 30 && availableDates.length < 7; i++) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    if (doctor.availability[dateStr] && doctor.availability[dateStr].length > 0) {
      availableDates.push(new Date(currentDate));
    }
    currentDate = addDays(currentDate, 1);
  }
  return availableDates;
};

const groupSlots = (slots: string[]) => {
    const morningSlots = slots.filter(time => {
        const hour = parseInt(time.split(':')[0]);
        const isPM = time.includes('PM');
        return !isPM || hour === 12;
    });

    const eveningSlots = slots.filter(time => {
        const hour = parseInt(time.split(':')[0]);
        const isPM = time.includes('PM');
        return isPM && hour !== 12;
    });
    return { morningSlots, eveningSlots };
}

function BookingPageSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-muted/20">
      <header className="bg-primary text-primary-foreground p-4 flex items-center gap-4">
        <Skeleton className="h-8 w-8 bg-primary/50" />
        <Skeleton className="h-6 w-32 bg-primary/50" />
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <Skeleton className="h-28 w-full rounded-xl" />

        <div>
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex gap-3 pb-4">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="w-16 h-20 rounded-lg" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
      </main>
      <footer className="p-4 border-t bg-background">
        <Skeleton className="h-12 w-full rounded-md" />
      </footer>
    </div>
  );
}


export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const sevenDaySlots = useMemo(() => getNextSevenAvailableDays(doctor), [doctor]);

  useEffect(() => {
    setDoctor(findDoctorById(id));
    const user = getLoggedInUser();
    if (!user) {
        router.push('/login');
    } else {
        setCurrentUser(user);
    }
    setIsClient(true);
  }, [id, router]);

  useEffect(() => {
    if (sevenDaySlots.length > 0 && !selectedDate) {
      setSelectedDate(sevenDaySlots[0]);
    }
  }, [sevenDaySlots, selectedDate]);


  if (!isClient || !doctor) {
    return <BookingPageSkeleton />;
  }
  
  const handleDateSelect = (date: Date) => {
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
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        userId: currentUser.id
      });

      toast({
        title: 'Appointment Booked!',
        description: `Your appointment with ${doctor.name} on ${format(selectedDate, 'MMM d, yyyy')} at ${selectedTime} is confirmed.`,
      });
      
      router.push('/dashboard/appointments');

    } catch (error: any) {
        toast({
            title: 'Booking Failed',
            description: error.message || 'This slot is no longer available. Please try another.',
            variant: 'destructive'
        });
    }

    setIsConfirming(false);
  };
  
  const allTimeSlots = selectedDate ? doctor.availability[format(selectedDate, 'yyyy-MM-dd')] || [] : [];
  const { morningSlots, eveningSlots } = groupSlots(allTimeSlots);
  
  return (
    <div className="flex flex-col h-screen bg-muted/20">
       <header className="bg-primary text-primary-foreground p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/80" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">Book Appointment</h1>
      </header>
     
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-card text-card-foreground rounded-xl p-4 flex items-start gap-4 shadow-md border">
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
                <p className="text-sm text-primary font-medium mt-1">MBBS, MD (Internal Medicine)</p>
            </div>
        </div>

        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Book Appointment</h3>
                {selectedDate && (
                    <div className='flex items-center gap-2 text-muted-foreground'>
                        <span className="font-semibold text-sm">{format(selectedDate, 'MMMM, yyyy')}</span>
                        <Calendar className="h-4 w-4" />
                    </div>
                )}
            </div>
            <ScrollArea className="w-full whitespace-nowrap rounded-md -mx-1">
                <div className="flex gap-3 pb-4 px-1">
                    {sevenDaySlots.map(date => {
                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => handleDateSelect(date)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2 rounded-lg border w-16 h-20 transition-colors shrink-0",
                                    selectedDate?.toISOString() === date.toISOString()
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card hover:bg-accent"
                                )}
                            >
                                <span className="text-2xl font-bold">{format(date, 'dd')}</span>
                                <span className="text-xs uppercase font-medium">{format(date, 'E')}</span>
                            </button>
                        )
                    })}
                     {sevenDaySlots.length === 0 && <p className="text-muted-foreground text-sm text-center py-4 w-full">No available dates found.</p>}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>

        {selectedDate && (
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-lg mb-4">Select slot</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {morningSlots.map(time => (
                        <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            className={cn("py-2 h-auto text-xs", selectedTime === time && "bg-primary text-primary-foreground")}
                            onClick={() => setSelectedTime(time)}
                        >
                            {time}
                        </Button>
                    ))}
                    {morningSlots.length === 0 && <p className="col-span-full text-muted-foreground text-sm text-center py-4">No morning slots available.</p>}
                    </div>
                </div>
                 {eveningSlots.length > 0 && (
                     <div>
                        <h3 className="font-bold text-lg mb-4">Evening Slot</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {eveningSlots.map(time => (
                            <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            className={cn("py-2 h-auto text-xs", selectedTime === time && "bg-primary text-primary-foreground")}
                            onClick={() => setSelectedTime(time)}
                            >
                            {time}
                            </Button>
                        ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </main>

      <footer className="p-4 border-t bg-background">
        <Button size="lg" className="w-full" onClick={handleBookNow} disabled={!selectedTime}>
            Book appointment
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
            <p><strong>Date:</strong> {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            {doctor.fees && <p className="font-bold"><strong>Fee:</strong> <span className="text-primary">${doctor.fees}</span></p>}
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

    