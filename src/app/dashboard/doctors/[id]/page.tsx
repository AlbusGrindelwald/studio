'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Star, MapPin, Calendar, Clock } from 'lucide-react';
import { findDoctorById } from '@/lib/data';
import { addAppointment } from '@/lib/appointments';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function DoctorDetailPage() {
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

  const handleBookNow = () => {
    if (selectedDate && selectedTime) {
      setIsConfirming(true);
    } else {
      toast({
        title: 'Selection required',
        description: 'Please select a date and time slot.',
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
      description: `Your appointment with ${doctor.name} on ${selectedDate} at ${selectedTime} is confirmed.`,
    });
    
    // Reset selection and navigate to appointments page
    setSelectedDate(null);
    setSelectedTime(null);
    router.push('/dashboard/appointments');
  };
  
  const availableDates = Object.keys(doctor.availability);

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex-shrink-0 text-center md:text-left">
              <Image
                src={doctor.image}
                alt={`Photo of ${doctor.name}`}
                width={128}
                height={128}
                className="mx-auto rounded-full border-4 border-primary/20"
                data-ai-hint="doctor portrait"
              />
              <h1 className="mt-4 text-2xl font-bold">{doctor.name}</h1>
              <p className="text-lg text-primary">{doctor.specialty}</p>
              <div className="mt-2 flex justify-center md:justify-start items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{doctor.rating.toFixed(1)}</span>
                </div>
                <span>({doctor.reviews} reviews)</span>
              </div>
              <div className="mt-2 flex justify-center md:justify-start items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{doctor.location}</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">About</h2>
              <p className="mt-2 text-muted-foreground">{doctor.description}</p>
              <div className="mt-6">
                <h3 className="flex items-center gap-2 text-xl font-semibold">
                  <Calendar className="h-5 w-5" />
                  Available Time Slots
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="font-medium mb-2">Select a date:</p>
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
                      <p className="font-medium mb-2">Select a time:</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {doctor.availability[selectedDate].map(time => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            onClick={() => setSelectedTime(time)}
                            className="flex items-center gap-1"
                          >
                            <Clock className="h-3 w-3" />
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button onClick={handleBookNow} size="lg" className="mt-6 w-full md:w-auto">
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
            <p><strong>Date:</strong> {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
