
'use client';

import { useEffect, useState } from 'react';
import { getLoggedInDoctor } from '@/lib/doctor-auth';
import { findDoctorById, updateDoctorAvailability } from '@/lib/data';
import type { Doctor } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { X, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function ScheduleSkeleton() {
    return (
        <div className="flex flex-col flex-1">
            <header className="bg-background p-4 border-b sticky top-0 z-10 h-16 flex items-center">
                 <Skeleton className="h-8 w-48" />
            </header>
            <main className="flex-1 p-4 md:p-6 grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-40 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="aspect-video w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div>
                     <Card>
                        <CardHeader>
                           <Skeleton className="h-6 w-32 mb-2" />
                           <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-8 w-24" />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}


export default function SchedulePage() {
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const authDoc = getLoggedInDoctor();
    if (authDoc) {
      const pubDoc = findDoctorById(authDoc.publicId || '');
      setDoctor(pubDoc || null);
    }
     setIsClient(true);
  }, []);

  useEffect(() => {
    if (doctor && selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      setTimeSlots(doctor.availability[dateKey] || []);
    } else {
      setTimeSlots([]);
    }
  }, [doctor, selectedDate]);
  
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 === 0 ? 12 : h % 12;
    const formattedMinutes = m < 10 ? `0${m}` : m;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  const handleAddTime = () => {
    if (!selectedDate || !newTime) {
      toast({
        title: 'Invalid Time',
        description: 'Please select a time to add.',
        variant: 'destructive',
      });
      return;
    }
    
    const formattedTime = formatTime(newTime);
    
    if (timeSlots.includes(formattedTime)) {
        toast({
            title: 'Duplicate Slot',
            description: 'This time slot already exists for this date.',
            variant: 'destructive',
        });
        return;
    }

    const updatedSlots = [...timeSlots, formattedTime].sort((a, b) => {
        const timeA = new Date(`1970-01-01 ${a}`).getTime();
        const timeB = new Date(`1970-01-01 ${b}`).getTime();
        return timeA - timeB;
    });

    setTimeSlots(updatedSlots);
    setNewTime('');
  };

  const handleRemoveTime = (timeToRemove: string) => {
    setTimeSlots(timeSlots.filter(t => t !== timeToRemove));
  };
  
  const handleSaveChanges = () => {
    if (!doctor || !selectedDate) return;
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const updatedDoctor = updateDoctorAvailability(doctor.id, dateKey, timeSlots);
    setDoctor(updatedDoctor);
    toast({
        title: 'Schedule Updated',
        description: `Availability for ${format(selectedDate, 'PPP')} has been saved.`,
    });
  };
  
  if(!isClient || !doctor) {
    return <ScheduleSkeleton />;
  }

  return (
    <div className="flex flex-col flex-1">
        <header className="bg-background p-4 border-b sticky top-0 z-10 h-16 flex items-center">
            <h1 className="text-xl font-bold">Manage Schedule</h1>
        </header>

        <main className="flex-1 p-4 md:p-6 grid md:grid-cols-1 lg:grid-cols-3 gap-6 overflow-auto">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Date</CardTitle>
                        <CardDescription>Choose a date to view or edit your available time slots.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={{ before: new Date() }}
                            className="rounded-md border"
                        />
                    </CardContent>
                </Card>
            </div>
            
            <div>
                {selectedDate && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Availability for {format(selectedDate, 'PPP')}
                            </CardTitle>
                             <CardDescription>Add or remove time slots for the selected date.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {timeSlots.map(time => (
                                    <div key={time} className="flex items-center justify-between bg-muted p-2 rounded-md">
                                        <div className='flex items-center gap-2'>
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{time}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveTime(time)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                 {timeSlots.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No slots for this date.</p>}
                            </div>

                            <div className="flex gap-2">
                                <Input 
                                    type="time"
                                    value={newTime}
                                    onChange={e => setNewTime(e.target.value)}
                                />
                                <Button variant="outline" onClick={handleAddTime}>Add</Button>
                            </div>
                            
                            <Button className="w-full" onClick={handleSaveChanges}>Save Changes</Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    </div>
  );
}
