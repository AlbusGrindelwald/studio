
'use client';

import { useState, useEffect } from 'react';
import { getAppointmentsForDoctor } from '@/lib/appointments';
import type { Appointment } from '@/lib/types';
import { DoctorAppointmentCard } from '@/components/doctor/AppointmentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const AppointmentsSkeleton = () => (
    <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48 mb-2" />
        </div>
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-4">
                         <Skeleton className="h-16 w-16 rounded-full" />
                         <div className='flex-1 space-y-2'>
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                         </div>
                         <Skeleton className="h-6 w-24 rounded-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setAppointments(getAppointmentsForDoctor());
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <AppointmentsSkeleton />;
    }

    return (
        <div className="flex flex-col flex-1 h-screen bg-muted/40">
             <header className="bg-background text-foreground p-6 border-b sticky top-0 z-10">
                <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
                <p className="text-muted-foreground">Manage and view all patient appointments.</p>
            </header>

            <main className="flex-1 p-6 overflow-y-auto space-y-4">
                {appointments.length > 0 ? (
                    appointments.map(app => (
                        <DoctorAppointmentCard key={app.id} appointment={app} />
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground">No appointments found.</p>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
