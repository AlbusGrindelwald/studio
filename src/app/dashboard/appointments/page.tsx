'use client';

import { useState, useEffect } from 'react';
import { appointments as mockAppointments } from '@/lib/data';
import type { Appointment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const { toast } = useToast();
  const [isReschedulable, setIsReschedulable] = useState(false);

  useEffect(() => {
    if (appointment.status === 'upcoming') {
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time.replace(' AM', ':00').replace(' PM', ':00')}`);
      if (appointment.time.includes('PM') && !appointment.time.startsWith('12')) {
        appointmentDateTime.setHours(appointmentDateTime.getHours() + 12);
      }
      const now = new Date();
      const oneHourBefore = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);
      setIsReschedulable(now < oneHourBefore);
    }
  }, [appointment]);
  
  const handleCancel = () => {
    toast({
        title: 'Appointment Canceled',
        description: `Your appointment with ${appointment.doctor.name} has been canceled.`,
    });
  };

  return (
    <Card>
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Image
          src={appointment.doctor.image}
          alt={`Photo of ${appointment.doctor.name}`}
          width={64}
          height={64}
          className="rounded-full border"
          data-ai-hint="doctor portrait"
        />
        <div className="flex-grow">
          <p className="font-bold">{appointment.doctor.name}</p>
          <p className="text-sm text-muted-foreground">{appointment.doctor.specialty}</p>
          <p className="text-sm mt-1">
            {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {appointment.time}
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
          {appointment.status === 'upcoming' && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="flex-1" disabled={!isReschedulable} title={!isReschedulable ? "Cannot reschedule within 1 hour of appointment" : ""}>
                Reschedule
              </Button>
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
            <Button variant="outline" size="sm">Leave a Review</Button>
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
  const filterAppointments = (status: Appointment['status']) => 
    mockAppointments.filter(app => app.status === status);

  return (
    <div className="flex flex-col gap-6">
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
                    <AppointmentCard key={app.id} appointment={app} />
                )) : (
                    <p className="text-center text-muted-foreground py-8">No upcoming appointments.</p>
                )}
            </div>
        </TabsContent>
        <TabsContent value="completed">
            <div className="space-y-4 pt-4">
                {filterAppointments('completed').length > 0 ? filterAppointments('completed').map(app => (
                    <AppointmentCard key={app.id} appointment={app} />
                )) : (
                     <p className="text-center text-muted-foreground py-8">No completed appointments.</p>
                )}
            </div>
        </TabsContent>
        <TabsContent value="canceled">
            <div className="space-y-4 pt-4">
                {filterAppointments('canceled').length > 0 ? filterAppointments('canceled').map(app => (
                    <AppointmentCard key={app.id} appointment={app} />
                )) : (
                    <p className="text-center text-muted-foreground py-8">No canceled appointments.</p>
                )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
