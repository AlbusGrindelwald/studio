
'use client';

import Link from 'next/link';
import { CalendarCheck, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { appointments as mockAppointments } from '@/lib/data';
import type { Appointment } from '@/lib/types';
import { useEffect, useState } from 'react';

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CalendarCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold">{appointment.doctor.name}</p>
          <p className="text-sm text-muted-foreground">{appointment.doctor.specialty}</p>
          <p className="text-sm text-muted-foreground">{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {appointment.time}</p>
        </div>
      </div>
      <Button variant="outline" size="sm">
        Details
      </Button>
    </div>
  );
}


export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setAppointments(mockAppointments);
    setIsClient(true);
  }, []);

  const upcomingAppointments = appointments.filter(a => a.status === 'upcoming').slice(0, 2);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Welcome back!</h1>
        <p className="text-muted-foreground">Here&apos;s a quick overview of your health schedule.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Need a Doctor?</CardTitle>
            <CardDescription>Find and book the best doctors near you.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <Stethoscope className="h-24 w-24 text-primary/20" />
          </CardContent>
          <div className="p-6 pt-0">
             <Link href="/dashboard/doctors" passHref>
                <Button className="w-full">Find a Doctor</Button>
            </Link>
          </div>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>AI Recommendation</CardTitle>
            <CardDescription>Get doctor recommendations based on your symptoms.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="h-24 w-24 text-primary/20"><path d="M12 2a10 10 0 1 0 10 10c0-4.42-2.87-8.17-7-9.58"/><path d="M16 11.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/><path d="M12 3v2"/><path d="M21 12h-2"/><path d="M12 21v-2"/><path d="M3 12H1"/><path d="m19.07 4.93-1.41 1.41"/><path d="m4.93 19.07-1.41-1.41"/><path d="m19.07 19.07-1.41-1.41"/><path d="m4.93 4.93-1.41 1.41"/></svg>
          </CardContent>
          <div className="p-6 pt-0">
            <Link href="/dashboard/recommend" passHref>
                <Button className="w-full">Get Recommendation</Button>
            </Link>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Upcoming Appointments</h2>
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
    </div>
  );
}
