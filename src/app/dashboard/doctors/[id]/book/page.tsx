
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Sun, Moon } from 'lucide-react';
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

const getNextSevenAvailableDays = (doctor: Doctor | null) => {
    if (!doctor) return [];
    const availableDates: Date[] = [];
    let currentDate = startOfDay(new Date());

    while (availableDates.length < 7 && availableDates.length < 30) { // Limit search to 30 days
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        if (doctor.availability[dateStr] && doctor.availability[dateStr].length > 0) {
            availableDates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const sevenDaySlots = useMemo(() => getNextSevenAvailableDays(doctor), [doctor]);

  useEffect(() => {
    const user = getLoggedInUser();
    if (!user) {
        router.push('/login');
    } else {
        setCurrentUser(user);
    }
  }, [router]);

  useEffect(() => {
    if (sevenDaySlots.length > 0 && !selectedDate) {
      setSelectedDate(sevenDaySlots[0]);
    }
  }, [sevenDaySlots, selectedDate]);


  if (!doctor) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Doctor not found.</p>
      </div>
    );
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
  
  return (
    <div className="flex flex-col h-screen bg-background">
       <header className="bg-background p-4 flex items-center gap-4 border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">{doctor.name}</h1>
      </header>
     
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl">Book Appointment</h3>
                {selectedDate && (
                    <div className='flex items-center gap-2 text-muted-foreground'>
                        <Calendar className="h-5 w-5" />
                        <span className="font-semibold">{format(selectedDate, 'MMMM, yyyy')}</span>
                    </div>
                )}
            </div>
            <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <div className="flex gap-3 pb-4">
                    {sevenDaySlots.map(date => {
                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => handleDateSelect(date)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-3 rounded-lg border w-20 h-24 transition-colors",
                                    selectedDate?.toISOString() === date.toISOString()
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card hover:bg-accent"
                                )}
                            >
                                <span className="text-3xl font-bold">{format(date, 'dd')}</span>
                                <span className="text-sm uppercase">{format(date, 'E')}</span>
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
                    <h3 className="font-bold text-xl mb-4">Select slot</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {allTimeSlots.map(time => (
                        <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        className={cn("py-3 h-auto", selectedTime === time && "bg-primary text-primary-foreground")}
                        onClick={() => setSelectedTime(time)}
                        >
                        {time}
                        </Button>
                    ))}
                     {allTimeSlots.length === 0 && <p className="col-span-full text-muted-foreground text-sm text-center py-4">No slots available for this date.</p>}
                    </div>
                </div>
            </div>
        )}
      </main>

      <footer className="p-4 border-t bg-background">
        <Button size="lg" className="w-full" onClick={handleBookNow} disabled={!selectedTime}>
            Book Appointment
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
