
'use client';

import type { Appointment } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Building, Mail, Phone, Check, X, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
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
  onStatusUpdate: (id: string, newStatus: 'completed' | 'canceled') => void;
}

const statusMap: Record<Appointment['status'], {
    text: string;
    className: string;
    icon: React.ComponentType<{ className?: string }>;
}> = {
  upcoming: { text: 'Confirmed', className: 'bg-green-100 text-green-800 border-green-200', icon: Check },
  completed: { text: 'Completed', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Check },
  canceled: { text: 'Canceled', className: 'bg-red-100 text-red-800 border-red-200', icon: X },
};

export function DetailedAppointmentCard({ appointment, onStatusUpdate }: DetailedAppointmentCardProps) {
    const statusInfo = statusMap[appointment.status] || statusMap.upcoming;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{appointment.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-bold">{appointment.user.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{appointment.time}</span>
          </div>
        </div>
        <Badge variant="outline" className={statusInfo.className}>{statusInfo.text}</Badge>
      </CardHeader>
      
      <CardContent className="flex-grow p-4 pt-0 space-y-3">
        <Separator />
        <div className="space-y-2 text-sm text-muted-foreground">
             <div className="flex items-center gap-3">
                <Building className="h-4 w-4" />
                <span>Clinic Consultation</span>
            </div>
             <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <span>{appointment.user.phone || '+1 (555) 123-4567'}</span>
            </div>
            <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>{appointment.user.email}</span>
            </div>
        </div>
      </CardContent>

      <CardFooter className="p-2 border-t bg-muted/50">
        {appointment.status === 'upcoming' && (
            <div className="flex w-full gap-2">
                 <Button className="flex-1" size="sm" onClick={() => onStatusUpdate(appointment.id, 'completed')}>
                    <Check className="mr-2 h-4 w-4" /> Mark Complete
                 </Button>
                 <Button className="flex-1" size="sm" variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" /> Reschedule
                </Button>
            </div>
        )}
        {(appointment.status === 'completed' || appointment.status === 'canceled') && (
            <div className="w-full text-center text-sm text-muted-foreground">
               {statusInfo.text} on {new Date(appointment.date).toLocaleDateString()}
            </div>
        )}
      </CardFooter>
    </Card>
  );
}

