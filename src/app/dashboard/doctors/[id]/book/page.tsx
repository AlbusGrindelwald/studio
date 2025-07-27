
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
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

const getNextSevenDays = () => {
  const dates: Date[] = [];
  let currentDate = startOfDay(new Date());
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  return dates;
};

const groupSlots = (slots: string[]) => {
    const morningSlots = slots.filter(time => {
        const hour = parseInt(time.split(':')[0]);
        const period = time.split(' ')[1];
        return period === 'AM' || (period === 'PM' && hour === 12);
    });

    const eveningSlots = slots.filter(time => {
        const period = time.split(' ')[1];
        return period === 'PM' && parseInt(time.split(':')[0]) !== 12;
    });
    return { morningSlots, eveningSlots };
}

function BookingPageSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-muted/20">
      <header className="bg-background p-4 flex items-center gap-4 border-b">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-6 w-32" />
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <Skeleton className="h-28 w-full rounded-xl" />

        <div>
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex gap-3 pb-4">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="w-16 h-20 rounded-lg" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const sevenDaySlots = useMemo(() => getNextSevenDays(), []);

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
    if (doctor && sevenDaySlots.length > 0 && !selectedDate) {
      setSelectedDate(sevenDaySlots[0]);
    }
  }, [doctor, sevenDaySlots, selectedDate]);


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
       <header className="bg-background p-4 flex items-center gap-4 border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">Book Appointment</h1>
      </header>
     
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-card text-card-foreground rounded-xl p-4 flex items-start gap-4 shadow-sm border">
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
                <p className="text-sm text-primary">{doctor.specialty}</p>
                <p className="text-sm text-muted-foreground mt-1">{doctor.location}</p>
            </div>
        </div>

        <div>
            <h3 className="font-bold text-lg mb-4">Choose your slot</h3>
            <ScrollArea className="w-full whitespace-nowrap rounded-md -mx-1">
                <div className="flex gap-3 pb-4 px-1">
                    {sevenDaySlots.map(date => {
                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => handleDateSelect(date)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2 rounded-lg border w-16 h-20 transition-colors shrink-0 cursor-pointer",
                                    selectedDate?.toISOString() === date.toISOString()
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
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Sun className="h-5 w-5 text-yellow-500" />
                        Morning
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {morningSlots.map(time => (
                        <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            className="py-2 h-auto"
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
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Moon className="h-5 w-5 text-blue-500" />
                            Evening
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {eveningSlots.map(time => (
                            <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            className="py-2 h-auto"
                            onClick={() => setSelectedTime(time)}
                            >
                            {time}
                            </Button>
                        ))}
                        </div>
                    </div>
                )}
                 {allTimeSlots.length > 0 && eveningSlots.length === 0 && (
                     <div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Moon className="h-5 w-5 text-blue-500" />
                            Evening
                        </h3>
                         <p className="col-span-full text-muted-foreground text-sm text-center py-4">No evening slots available.</p>
                    </div>
                 )}
            </div>
        )}
      </main>

      <footer className="p-4 border-t bg-background">
        <Button size="lg" className="w-full h-12 text-base" onClick={handleBookNow} disabled={!selectedTime}>
             {selectedTime ? `Pay $${doctor.fees} & Book` : 'Book appointment'}
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
