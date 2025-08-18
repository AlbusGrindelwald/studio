
'use client';

import Link from 'next/link';
import { CalendarCheck, ChevronRight, User, Stethoscope, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAppointmentsForUser } from '@/lib/appointments';
import { getLoggedInUser } from '@/lib/user';
import type { Appointment } from '@/lib/types';
import type { User as PatientUser } from '@/lib/user';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-3">
      <div className="flex items-center gap-4">
        <Image 
          src={appointment.doctor.image}
          alt={appointment.doctor.name}
          width={48}
          height={48}
          className="rounded-full object-cover"
          data-ai-hint="doctor portrait"
        />
        <div>
          <p className="font-semibold">{appointment.doctor.name}</p>
          <p className="text-sm text-muted-foreground">{appointment.doctor.specialty}</p>
          <p className="text-xs text-muted-foreground mt-1">{new Date(appointment.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, {appointment.time}</p>
        </div>
      </div>
       <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/appointments')}>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}


export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [user, setUser] = useState<PatientUser | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = getLoggedInUser();
    setUser(loggedInUser);

    if (loggedInUser) {
      setAppointments(getAppointmentsForUser(loggedInUser.id));
    }
    
    setIsClient(true);
  }, []);

  const upcomingAppointments = appointments.filter(a => a.status === 'upcoming').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 1);

  if (!isClient) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <header className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
            </header>
            <Skeleton className="h-12 w-full rounded-full" />
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <div>
                <div className="flex justify-between items-center mb-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-24 w-full" />
            </div>
             <div>
                <Skeleton className="h-6 w-40 mb-3" />
                <Skeleton className="h-36 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hi, {user?.name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-muted-foreground">How are you feeling today?</p>
        </div>
        <div className="relative">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.push('/dashboard/wishlist')}>
                <Heart className="h-5 w-5" />
            </Button>
        </div>
      </header>

       <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center p-4 text-center bg-blue-50 border-blue-200" onClick={() => router.push('/dashboard/doctors')}>
          <div className="p-3 bg-blue-100 rounded-full mb-2">
             <Stethoscope className="h-6 w-6 text-blue-600" />
          </div>
          <p className="font-semibold text-sm">Doctors</p>
          <p className="text-xs text-muted-foreground">Find a specialist</p>
        </Card>
        <Card className="flex flex-col items-center justify-center p-4 text-center bg-purple-50 border-purple-200" onClick={() => router.push('/dashboard/appointments')}>
          <div className="p-3 bg-purple-100 rounded-full mb-2">
            <CalendarCheck className="h-6 w-6 text-purple-600" />
          </div>
          <p className="font-semibold text-sm">Appointments</p>
          <p className="text-xs text-muted-foreground">Manage bookings</p>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold tracking-tight">Upcoming Appointment</h2>
          <Link href="/dashboard/appointments" className="text-sm text-primary font-medium">See All</Link>
        </div>
        <div className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(app => <AppointmentCard key={app.id} appointment={app} />)
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                You have no upcoming appointments.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

       <div>
        <h2 className="text-lg font-semibold tracking-tight mb-3">AI Recommendation</h2>
          <Card className="bg-teal-50 border-teal-200">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-teal-600"><path d="M12 2a10 10 0 1 0 10 10c0-4.42-2.87-8.17-7-9.58"/><path d="M16 11.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/><path d="M12 3v2"/><path d="M21 12h-2"/><path d="M12 21v-2"/><path d="M3 12H1"/><path d="m19.07 4.93-1.41 1.41"/><path d="m4.93 19.07-1.41-1.41"/><path d="m19.07 19.07-1.41-1.41"/><path d="m4.93 4.93-1.41 1.41"/></svg>
              </div>
              <div>
                <CardTitle className="text-base">Feeling Unwell?</CardTitle>
                <CardDescription className="text-xs">Get doctor recommendations based on your symptoms.</CardDescription>
              </div>
            </CardHeader>
             <CardContent>
               <Link href="/dashboard/recommend" passHref>
                  <Button className="w-full bg-teal-500 hover:bg-teal-600">Get Recommendation</Button>
              </Link>
             </CardContent>
          </Card>
      </div>

    </div>
  );
}
