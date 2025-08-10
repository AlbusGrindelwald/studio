
'use client';

import { useRouter } from 'next/navigation';
import { getLoggedInDoctor } from '@/lib/doctor-auth';
import { useEffect, useState, useMemo } from 'react';
import type { DoctorUser } from '@/lib/doctor-auth';
import { getAppointmentsForDoctor, subscribe } from '@/lib/appointments';
import type { Appointment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, DollarSign, MessageSquareWarning, ChevronRight } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
                 <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
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

function TodaysAppointmentCard({ appointment }: { appointment: Appointment }) {
    const isConfirmed = appointment.time !== '02:00 PM'; // Mock logic for pending status
    return (
        <Card className="bg-card">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="font-semibold">{appointment.user.name}</p>
                        <p className="text-sm text-muted-foreground">{appointment.type || 'Consultation'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-semibold">{appointment.time}</p>
                    <Badge className={cn(
                        isConfirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700',
                        "border-none"
                    )}>
                        {isConfirmed ? 'confirmed' : 'pending'}
                    </Badge>
                </div>
            </CardContent>
        </Card>
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
      setAppointments(getAppointmentsForDoctor(loggedInDoctor.publicId || ''));
    } else {
      router.push('/doctor/login');
    }
    
    const unsubscribe = subscribe(() => {
         if (loggedInDoctor) {
            setAppointments(getAppointmentsForDoctor(loggedInDoctor.publicId || ''));
         }
    });

    setStats({
        todaysAppointments: Math.floor(Math.random() * 15) + 1,
        totalPatients: Math.floor(Math.random() * 150) + 50,
        pendingReviews: Math.floor(Math.random() * 10),
        monthlyRevenue: Math.floor(Math.random() * 20000) + 5000,
    });
    
    setIsClient(true);
    return () => unsubscribe();
  }, [router]);


  const todaysAppointments = useMemo(() => {
    return appointments.filter(a => isToday(parseISO(a.date))).sort((a,b) => a.time.localeCompare(b.time));
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
                            <p className="text-3xl font-bold">{todaysAppointments.length}</p>
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
            
            <div>
                 <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold">Today's Appointments</h2>
                    <Link href="/doctor/dashboard/appointments" className="text-sm font-medium text-primary flex items-center">
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </div>
                <Card className="bg-muted/30 p-4">
                     <div className="space-y-4">
                        {todaysAppointments.length > 0 ? todaysAppointments.map(app => (
                            <TodaysAppointmentCard key={app.id} appointment={app} />
                        )) : (
                            <p className="text-center text-muted-foreground py-8">No appointments scheduled for today.</p>
                        )}
                    </div>
                </Card>
            </div>
        </main>
    </div>
  );
}
