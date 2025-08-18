
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAppointmentsForDoctor, updateAppointmentStatus } from '@/lib/appointments';
import type { Appointment } from '@/lib/types';
import { DetailedAppointmentCard } from '@/components/doctor/DetailedAppointmentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckCircle, Clock, XCircle, BadgeHelp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isToday, isFuture, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <Card className={cn('bg-white border-l-4', color)}>
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div
        className={cn(
          'p-2 rounded-lg',
          color === 'border-blue-500' && 'bg-blue-100',
          color === 'border-green-500' && 'bg-green-100',
          color === 'border-yellow-500' && 'bg-yellow-100',
          color === 'border-red-500' && 'bg-red-100'
        )}
      >
        {icon}
      </div>
    </CardContent>
  </Card>
);

const AppointmentsSkeleton = () => (
    <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-80" />
            </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
        </div>
    </div>
);

type FilterType = 'today' | 'upcoming' | 'pending' | 'all';

export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterType>('today');

    useEffect(() => {
        setAppointments(getAppointmentsForDoctor());
        setIsClient(true);
    }, []);
    
    const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
        updateAppointmentStatus(appointmentId, newStatus);
        // Re-fetch appointments to update the UI
        setAppointments(getAppointmentsForDoctor());
    };

    const stats = useMemo(() => {
        const todayApps = appointments.filter(app => isToday(parseISO(app.date)));
        return {
            total: todayApps.length,
            confirmed: appointments.filter(app => app.status === 'upcoming').length,
            pending: appointments.filter(app => app.status === 'pending').length,
            canceled: appointments.filter(app => app.status === 'canceled').length,
        };
    }, [appointments]);

    const filteredAppointments = useMemo(() => {
        switch (activeFilter) {
            case 'today':
                return appointments.filter(app => isToday(parseISO(app.date)));
            case 'upcoming':
                return appointments.filter(app => app.status === 'upcoming' && (isToday(parseISO(app.date)) || isFuture(parseISO(app.date))));
            case 'pending':
                return appointments.filter(app => app.status === 'pending');
            case 'all':
            default:
                return appointments;
        }
    }, [appointments, activeFilter]);
    
    const filterCounts = useMemo(() => ({
        today: appointments.filter(app => isToday(parseISO(app.date))).length,
        upcoming: appointments.filter(app => app.status === 'upcoming' && (isToday(parseISO(app.date)) || isFuture(parseISO(app.date)))).length,
        pending: appointments.filter(app => app.status === 'pending').length,
        all: appointments.length
    }), [appointments]);


    if (!isClient) {
        return <AppointmentsSkeleton />;
    }
    

    return (
        <div className="flex flex-col flex-1 h-screen bg-muted/40">
             <header className="bg-background text-foreground p-6 border-b sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Appointments Management</h1>
                    <p className="text-muted-foreground">Manage your patient appointments and schedule</p>
                </div>
                <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    Calendar View
                </Button>
            </header>

            <main className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Today's Total" value={stats.total} icon={<Calendar className="h-6 w-6 text-blue-500" />} color="border-blue-500" />
                    <StatCard title="Confirmed" value={stats.confirmed} icon={<CheckCircle className="h-6 w-6 text-green-500" />} color="border-green-500" />
                    <StatCard title="Pending" value={stats.pending} icon={<Clock className="h-6 w-6 text-yellow-500" />} color="border-yellow-500" />
                    <StatCard title="Cancelled" value={stats.canceled} icon={<XCircle className="h-6 w-6 text-red-500" />} color="border-red-500" />
                </div>
                
                <Card className="bg-background">
                    <CardContent className="p-2">
                        <div className="flex items-center gap-2">
                            {(['today', 'upcoming', 'pending', 'all'] as FilterType[]).map(filter => (
                                <Button 
                                    key={filter}
                                    variant={activeFilter === filter ? 'default' : 'ghost'}
                                    onClick={() => setActiveFilter(filter)}
                                    className="capitalize rounded-full text-sm h-9 px-4"
                                >
                                    {filter}
                                    <span className={cn(
                                        "ml-2 text-xs rounded-full px-2 py-0.5",
                                        activeFilter === filter ? 'bg-primary-foreground/20' : 'bg-muted text-muted-foreground'
                                    )}>
                                        {filterCounts[filter]}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {filteredAppointments.length > 0 ? (
                    <div className="space-y-4">
                        {filteredAppointments.map(app => (
                            <DetailedAppointmentCard key={app.id} appointment={app} onStatusChange={handleStatusChange} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <BadgeHelp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No appointments match the selected filter.</p>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
