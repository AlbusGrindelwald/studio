
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getLoggedInDoctor } from '@/lib/doctor-auth';
import { getAppointmentsForDoctor, updateAppointmentStatus } from '@/lib/appointments';
import type { Appointment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, Calendar, Check, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { DetailedAppointmentCard } from '@/components/doctor/DetailedAppointmentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

function AppointmentsSkeleton() {
    return (
        <div className="flex flex-col flex-1">
            <header className="bg-background p-6 border-b sticky top-0 z-10">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-72" />
            </header>
            <main className="flex-1 p-6 space-y-6">
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-grow" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-40" />
                </div>
                <Skeleton className="h-6 w-56 mx-auto" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-60 rounded-lg" />
                    <Skeleton className="h-60 rounded-lg" />
                    <Skeleton className="h-60 rounded-lg" />
                </div>
            </main>
        </div>
    )
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const doctor = getLoggedInDoctor();
    if (doctor && doctor.publicId) {
      setAppointments(getAppointmentsForDoctor(doctor.publicId));
    }
    setIsClient(true);
  }, []);
  
  const handleStatusUpdate = (id: string, newStatus: 'completed' | 'canceled') => {
      updateAppointmentStatus(id, newStatus);
      // Re-fetch appointments to update the UI
      const doctor = getLoggedInDoctor();
      if (doctor && doctor.publicId) {
          setAppointments(getAppointmentsForDoctor(doctor.publicId));
      }

      toast({
        title: `Appointment ${newStatus}`,
        description: `The appointment has been marked as ${newStatus}.`
      });
  };

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(app => {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = app.user.name.toLowerCase().includes(searchLower);
        const emailMatch = app.user.email.toLowerCase().includes(searchLower);
        return nameMatch || emailMatch;
      })
      .filter(app => {
        if (statusFilter === 'all') return true;
        // Map "confirmed" filter to "upcoming" status
        if (statusFilter === 'confirmed') return app.status === 'upcoming';
        return app.status === statusFilter;
      });
  }, [appointments, searchTerm, statusFilter]);
  
  const groupedAppointments = useMemo(() => {
    return filteredAppointments.reduce((acc, app) => {
        const dateKey = format(parseISO(app.date), 'yyyy-MM-dd');
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(app);
        return acc;
    }, {} as Record<string, Appointment[]>);
  }, [filteredAppointments]);
  
  const sortedDates = Object.keys(groupedAppointments).sort();

  if (!isClient) {
    return <AppointmentsSkeleton />;
  }

  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="bg-background p-6 border-b sticky top-0 z-10">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
                <p className="text-muted-foreground">Manage your patient appointments efficiently</p>
            </div>
            <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar View
            </Button>
        </div>
        <div className="flex gap-4 mt-6">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search patients..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
             <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </header>
      
      <main className="flex-1 p-6 overflow-y-auto bg-muted/40">
        {sortedDates.length > 0 ? (
            sortedDates.map(date => (
                <div key={date} className="mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-background px-4 py-1.5 rounded-full border shadow-sm">
                            <p className="text-sm font-medium">{format(parseISO(date), 'EEEE, MMMM d, yyyy')}</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {groupedAppointments[date].map(appointment => (
                            <DetailedAppointmentCard 
                                key={appointment.id} 
                                appointment={appointment} 
                                onStatusUpdate={handleStatusUpdate}
                            />
                        ))}
                    </div>
                </div>
            ))
        ) : (
             <div className="text-center py-16">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">No Appointments Found</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    There are no appointments matching your current filters.
                </p>
             </div>
        )}
      </main>
    </div>
  );
}
