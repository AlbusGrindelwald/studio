
'use client';

import { useRouter } from 'next/navigation';
import { getLoggedInDoctor } from '@/lib/doctor-auth';
import { useEffect, useState, useMemo } from 'react';
import type { DoctorUser } from '@/lib/doctor-auth';
import { getAppointmentsForDoctor, subscribe } from '@/lib/appointments';
import type { Appointment } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DoctorAppointmentCard } from '@/components/doctor/AppointmentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Calendar, DollarSign, MessageSquareWarning } from 'lucide-react';
import { format } from 'date-fns';

function DoctorDashboardSkeleton() {
    return (
        <div className="flex flex-col flex-1 p-6">
            <header className="mb-6">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
            </header>
            <main className="flex-1">
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <Skeleton className="h-28 w-full" />
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

function DoctorDashboardHeader({ doctor }: { doctor: DoctorUser }) {
    const [time, setTime] = useState(new Date());
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const hour = time.getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, [time]);

    return (
        <header className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-2xl font-bold text-primary">{greeting}, {doctor.name}!</h1>
                <p className="text-muted-foreground">{format(time, 'EEEE, MMMM d, yyyy')}</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold">{format(time, 'h:mm:ss a')}</p>
                <p className="text-sm text-muted-foreground">Current Time</p>
            </div>
        </header>
    );
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    totalPatients: 0,
    pendingReviews: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    const loggedInDoctor = getLoggedInDoctor();
    if (loggedInDoctor) {
      setDoctor(loggedInDoctor);
      setAppointments(getAppointmentsForDoctor(loggedInDoctor.email));
    } else {
      router.push('/doctor/login');
    }
    
    const unsubscribe = subscribe(() => {
         if (loggedInDoctor) {
            setAppointments(getAppointmentsForDoctor(loggedInDoctor.email));
         }
    });

    // Generate random stats on client mount
    setStats({
        todaysAppointments: Math.floor(Math.random() * 15) + 1,
        totalPatients: Math.floor(Math.random() * 150) + 50,
        pendingReviews: Math.floor(Math.random() * 10),
        monthlyRevenue: Math.floor(Math.random() * 20000) + 5000,
    });
    
    setIsClient(true);
    return () => unsubscribe();
  }, [router]);


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

  return (
    <div className="flex flex-col flex-1">
        <main className="flex-1 p-4 md:p-6">
            <DoctorDashboardHeader doctor={doctor} />
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Today's Appointments</p>
                            <p className="text-3xl font-bold">{stats.todaysAppointments}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Patients</p>
                            <p className="text-3xl font-bold">{stats.totalPatients}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Users className="h-6 w-6 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Pending Reviews</p>
                            <p className="text-3xl font-bold">{stats.pendingReviews}</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <MessageSquareWarning className="h-6 w-6 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                            <p className="text-3xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-purple-500" />
                        </div>
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
