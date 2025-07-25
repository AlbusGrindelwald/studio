
'use client';

import { useRouter } from 'next/navigation';
import { getLoggedInDoctor } from '@/lib/doctor-auth';
import { useEffect, useState, useMemo } from 'react';
import type { DoctorUser } from '@/lib/doctor-auth';
import { getAppointmentsForDoctor } from '@/lib/appointments';
import type { Appointment } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DoctorAppointmentCard } from '@/components/doctor/AppointmentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, CalendarCheck, CircleX } from 'lucide-react';

function DoctorDashboardSkeleton() {
    return (
        <div className="flex flex-col flex-1">
            <header className="bg-background p-4 flex items-center justify-between border-b sticky top-0 z-10 h-16">
                 <Skeleton className="h-8 w-48" />
            </header>
            <main className="flex-1 p-4 md:p-6">
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
                <div className="grid w-full grid-cols-3 gap-2 mb-4">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                </div>
                <div className="space-y-4 pt-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </main>
        </div>
    );
}


export default function DoctorDashboardPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const loggedInDoctor = getLoggedInDoctor();
    if (loggedInDoctor) {
      setDoctor(loggedInDoctor);
      setAppointments(getAppointmentsForDoctor(loggedInDoctor.email));
    }
    setIsClient(true);
  }, []);


  const filteredAppointments = useMemo(() => {
    return {
      upcoming: appointments.filter(a => a.status === 'upcoming'),
      completed: appointments.filter(a => a.status === 'completed'),
      canceled: appointments.filter(a => a.status === 'canceled'),
    };
  }, [appointments]);

  if (!isClient || !doctor) {
    return <DoctorDashboardSkeleton />;
  }
  
  const totalPatients = new Set(appointments.map(a => a.user.id)).size;

  return (
    <div className="flex flex-col flex-1">
        <header className="bg-background p-4 flex items-center justify-between border-b sticky top-0 z-10 h-16">
            <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        </header>

        <main className="flex-1 p-4 md:p-6">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPatients}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredAppointments.upcoming.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Canceled Appointments</CardTitle>
                        <CircleX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredAppointments.canceled.length}</div>
                    </CardContent>
                </Card>
            </div>
            
            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upcoming">Upcoming ({filteredAppointments.upcoming.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({filteredAppointments.completed.length})</TabsTrigger>
                    <TabsTrigger value="canceled">Canceled ({filteredAppointments.canceled.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming">
                    <div className="space-y-4 pt-4">
                        {filteredAppointments.upcoming.length > 0 ? filteredAppointments.upcoming.map(app => (
                            <DoctorAppointmentCard key={app.id} appointment={app} />
                        )) : (
                            <p className="text-center text-muted-foreground py-8">No upcoming appointments.</p>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="completed">
                    <div className="space-y-4 pt-4">
                        {filteredAppointments.completed.length > 0 ? filteredAppointments.completed.map(app => (
                            <DoctorAppointmentCard key={app.id} appointment={app} />
                        )) : (
                            <p className="text-center text-muted-foreground py-8">No completed appointments.</p>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="canceled">
                     <div className="space-y-4 pt-4">
                        {filteredAppointments.canceled.length > 0 ? filteredAppointments.canceled.map(app => (
                            <DoctorAppointmentCard key={app.id} appointment={app} />
                        )) : (
                            <p className="text-center text-muted-foreground py-8">No canceled appointments.</p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </main>
    </div>
  );
}
