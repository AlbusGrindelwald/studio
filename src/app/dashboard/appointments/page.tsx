
'use client';

import { useState, useEffect } from 'react';
import {
  getAppointments,
  rescheduleAppointment,
  updateAppointmentStatus,
  subscribe,
} from '@/lib/appointments';
import type { Appointment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RescheduleDialog } from '@/components/appointments/RescheduleDialog';
import { ReviewDialog } from '@/components/appointments/ReviewDialog';
import { useRouter } from 'next/navigation';

function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
}: {
  appointment: Appointment,
  onCancel: (id: string) => void,
  onReschedule: (id: string, newDate: string, newTime: string) => void,
}) {
  const { toast } = useToast();
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const router = useRouter();

  const handleCancel = () => {
    onCancel(appointment.id);
    toast({
      title: 'Appointment Canceled',
      description: `Your appointment with ${appointment.doctor.name} has been canceled.`,
    });
  };

  const handleReschedule = (newDate: string, newTime: string) => {
    onReschedule(appointment.id, newDate, newTime);
  };
  
  const handleBookAgain = () => {
    router.push(`/dashboard/doctors/${appointment.doctor.id}`);
  };

  return (
    <Card>
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Image
          src={appointment.doctor.image}
          alt={`Photo of ${appointment.doctor.name}`}
          width={64}
          height={64}
          className="rounded-full border object-cover"
          data-ai-hint="doctor portrait"
        />
        <div className="flex-grow">
          <p className="font-bold">{appointment.doctor.name}</p>
          <p className="text-sm text-muted-foreground">{appointment.doctor.specialty}</p>
          <p className="text-sm mt-1">
            {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {appointment.time}
          </p>
          <p className="text-sm font-semibold text-primary mt-1">Token: {appointment.token}</p>
        </div>
        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
          {appointment.status === 'upcoming' && (
            <div className="flex gap-2 w-full sm:w-auto">
              <RescheduleDialog
                open={isRescheduleOpen}
                onOpenChange={setIsRescheduleOpen}
                doctor={appointment.doctor}
                onReschedule={handleReschedule}
                trigger={
                  <Button variant="outline" size="sm" className="flex-1">
                    Reschedule
                  </Button>
                }
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex-1">Cancel</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently cancel your appointment.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel}>Confirm Cancel</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          {appointment.status === 'completed' && (
             <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="secondary" size="sm" onClick={handleBookAgain} className="flex-1">Book Again</Button>
                <ReviewDialog
                    doctor={appointment.doctor}
                    trigger={
                        <Button variant="outline" size="sm" className="flex-1">Leave a Review</Button>
                    }
                />
            </div>
          )}
          {appointment.status === 'canceled' && (
             <Badge variant="destructive">Canceled</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const handleAppointmentsChange = () => {
      setAppointments(getAppointments());
    };

    const unsubscribe = subscribe(handleAppointmentsChange);
    handleAppointmentsChange(); // Initial fetch

    setIsClient(true);
    
    return () => unsubscribe();
  }, []);

  const handleCancelAppointment = (id: string) => {
    updateAppointmentStatus(id, 'canceled');
  };
  
  const handleRescheduleAppointment = (id: string, newDate: string, newTime: string) => {
    rescheduleAppointment(id, newDate, newTime);
  };

  const filterAppointments = (status: Appointment['status']) =>
    appointments.filter(app => app.status === status);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-4">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground">View and manage your appointments.</p>
      </div>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="canceled">Canceled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
            <div className="space-y-4 pt-4">
                {filterAppointments('upcoming').length > 0 ? filterAppointments('upcoming').map(app => (
                    <AppointmentCard key={app.id} appointment={app} onCancel={handleCancelAppointment} onReschedule={handleRescheduleAppointment} />
                )) : (
                    <p className="text-center text-muted-foreground py-8">No upcoming appointments.</p>
                )}
            </div>
        </TabsContent>
        <TabsContent value="completed">
            <div className="space-y-4 pt-4">
                {filterAppointments('completed').length > 0 ? filterAppointments('completed').map(app => (
                    <AppointmentCard key={app.id} appointment={app} onCancel={handleCancelAppointment} onReschedule={handleRescheduleAppointment} />
                )) : (
                     <p className="text-center text-muted-foreground py-8">No completed appointments.</p>
                )}
            </div>
        </TabsContent>
        <TabsContent value="canceled">
            <div className="space-y-4 pt-4">
                {filterAppointments('canceled').length > 0 ? filterAppointments('canceled').map(app => (
                    <AppointmentCard key={app.token} appointment={app} onCancel={handleCancelAppointment} onReschedule={handleRescheduleAppointment} />
                )) : (
                    <p className="text-center text-muted-foreground py-8">No canceled appointments.</p>
                )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
