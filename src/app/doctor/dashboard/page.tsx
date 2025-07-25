
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getLoggedInDoctor, logoutDoctor } from '@/lib/doctor-auth';
import { useEffect, useState, useMemo } from 'react';
import type { DoctorUser } from '@/lib/doctor-auth';
import { getAppointmentsForDoctor } from '@/lib/appointments';
import type { Appointment } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DoctorAppointmentCard } from '@/components/doctor/AppointmentCard';
import { Logo } from '@/components/Logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const loggedInDoctor = getLoggedInDoctor();
    if (!loggedInDoctor) {
      router.push('/doctor/login');
    } else {
      setDoctor(loggedInDoctor);
      setAppointments(getAppointmentsForDoctor(loggedInDoctor.email));
    }
    setIsClient(true);
  }, [router]);

  const handleLogout = () => {
    logoutDoctor();
    router.push('/doctor/login');
  };

  const filteredAppointments = useMemo(() => {
    return {
      upcoming: appointments.filter(a => a.status === 'upcoming'),
      completed: appointments.filter(a => a.status === 'completed'),
      canceled: appointments.filter(a => a.status === 'canceled'),
    };
  }, [appointments]);

  if (!isClient || !doctor) {
    return <div>Loading...</div>; // Or a proper skeleton loader
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-muted/40">
        <header className="bg-background p-4 flex items-center justify-between border-b sticky top-0 z-10">
            <Logo className="text-2xl" />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback>
                               <UserIcon />
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{doctor.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {doctor.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>

        <main className="flex-1 p-4 md:p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Welcome, {doctor.name}</h1>
                <p className="text-muted-foreground">Here are your appointments for today and beyond.</p>
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
