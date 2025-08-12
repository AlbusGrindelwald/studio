

'use client';

import { useRouter } from 'next/navigation';
import { getLoggedInDoctor } from '@/lib/doctor-auth';
import { useEffect, useState, useMemo } from 'react';
import type { DoctorUser } from '@/lib/doctor-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { getAppointments, getPatientsForDoctor } from '@/lib/appointments';
import type { Appointment } from '@/lib/types';
import type { User } from '@/lib/user';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, ListTodo, DollarSign, User as UserIcon, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function DoctorDashboardSkeleton() {
    return (
        <div className="flex-1 space-y-6 p-6">
            <header className="flex justify-between items-start mb-6">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="text-right">
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </header>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-64 rounded-lg" />
                    <Skeleton className="h-64 rounded-lg" />
                </div>
            </div>
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

function StatCard({ icon, title, value, color, bgColor }: { icon: React.ReactNode, title: string, value: string, color: string, bgColor: string }) {
    return (
        <Card className={cn("border-l-4", color)}>
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className={cn("p-3 rounded-lg", bgColor)}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}


function TodaysAppointmentCard({ appointment }: { appointment: Appointment }) {
    const isConfirmed = appointment.status === 'upcoming';
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                    <p className="font-semibold text-sm">{appointment.user.name}</p>
                    <p className="text-xs text-muted-foreground">{appointment.type}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-medium">{appointment.time}</p>
                <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    isConfirmed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                )}>
                    {isConfirmed ? 'confirmed' : 'pending'}
                </span>
            </div>
        </div>
    );
}

function RecentPatientCard({ patient }: { patient: User }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
                 <Image
                    src={patient.image || `https://placehold.co/40x40.png?text=${patient.name.charAt(0)}`}
                    alt={patient.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    data-ai-hint="person portrait"
                />
                <div>
                    <p className="font-semibold text-sm">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">Last Visit: {patient.lastVisit}</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
        </div>
    )
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  const [stats, setStats] = useState({
      todaysAppointments: '0',
      totalPatients: '0',
      pendingReviews: '0',
      monthlyRevenue: '$0'
  });

  useEffect(() => {
    const loggedInDoctor = getLoggedInDoctor();
    if (loggedInDoctor) {
      setDoctor(loggedInDoctor);
      const allAppointments = getAppointments();
      setAppointments(allAppointments);
      const allPatients = getPatientsForDoctor();
      setPatients(allPatients);

      // Set static stats
      setStats({
          todaysAppointments: allAppointments.filter(app => format(new Date(app.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length.toString(),
          totalPatients: '156',
          pendingReviews: '3',
          monthlyRevenue: '$12,500'
      });

    } else {
      router.push('/doctor/login');
    }
    
    setIsClient(true);
  }, [router]);

  const todaysAppointments = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return appointments.filter(app => app.date === today);
  }, [appointments]);

  if (!isClient || !doctor) {
    return <DoctorDashboardSkeleton />;
  }

  return (
    <div className="flex flex-col flex-1 bg-muted/40">
        <main className="flex-1 p-4 md:p-6 space-y-6">
            <DoctorDashboardHeader doctor={doctor} />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={<Calendar className="h-6 w-6 text-blue-600" />} title="Today's Appointments" value={stats.todaysAppointments} color="border-blue-500" bgColor="bg-blue-100" />
                <StatCard icon={<Users className="h-6 w-6 text-green-600" />} title="Total Patients" value={stats.totalPatients} color="border-green-500" bgColor="bg-green-100" />
                <StatCard icon={<ListTodo className="h-6 w-6 text-orange-600" />} title="Pending Reviews" value={stats.pendingReviews} color="border-orange-500" bgColor="bg-orange-100" />
                <StatCard icon={<DollarSign className="h-6 w-6 text-purple-600" />} title="Monthly Revenue" value={stats.monthlyRevenue} color="border-purple-500" bgColor="bg-purple-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Today's Appointments</h3>
                             <Link href="#">
                                <Button variant="link" className="text-primary">View All</Button>
                            </Link>
                        </div>
                        {todaysAppointments.length > 0 ? (
                            todaysAppointments.map(app => (
                                <TodaysAppointmentCard key={app.id} appointment={app} />
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No appointments scheduled for today.</p>
                        )}
                    </CardContent>
                </Card>

                 <Card>
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Recent Patients</h3>
                            <Link href="#">
                                <Button variant="link" className="text-primary">View All</Button>
                            </Link>
                        </div>
                        {patients.length > 0 ? (
                            patients.slice(0, 3).map(patient => (
                                <RecentPatientCard key={patient.id} patient={patient} />
                            ))
                        ) : (
                             <p className="text-muted-foreground text-center py-8">No recent patients found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
