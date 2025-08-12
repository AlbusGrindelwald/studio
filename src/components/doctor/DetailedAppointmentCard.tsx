
'use client';

import type { Appointment } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, Clock, Calendar, Phone, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
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


interface DetailedAppointmentCardProps {
    appointment: Appointment;
    onStatusChange: (appointmentId: string, newStatus: Appointment['status']) => void;
}

export function DetailedAppointmentCard({ appointment, onStatusChange }: DetailedAppointmentCardProps) {
  const { id, user, status, type, time, duration, date, notes, reason } = appointment;

  const statusMap: Record<Appointment['status'], { text: string; className: string }> = {
    upcoming: { text: 'Confirmed', className: 'bg-green-100 text-green-700 border-green-200' },
    pending: { text: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    canceled: { text: 'Canceled', className: 'bg-red-100 text-red-700 border-red-200' },
    completed: { text: 'Completed', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  };

  return (
    <Card className="bg-background">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-full mt-1">
                <UserIcon className="h-6 w-6 text-blue-600" />
            </div>

            <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{user.name}</h3>
                    <Badge variant="outline" className={cn(statusMap[status].className)}>
                        {statusMap[status].text}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-600 bg-blue-50">{type}</Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{time} ({duration} min)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{date}</span>
                    </div>
                     <div className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone}</span>
                    </div>
                </div>

                <div className="text-sm pt-2">
                    <p><span className="font-semibold">Reason:</span> {reason}</p>
                    <p><span className="font-semibold">Notes:</span> {notes}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {status === 'pending' && (
                    <div className="flex items-center gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">Cancel</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will cancel the appointment for {user.name}.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onStatusChange(id, 'canceled')}>Confirm Cancel</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                         <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => onStatusChange(id, 'upcoming')}>Confirm</Button>
                    </div>
                )}
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
