
'use client';

import type { Appointment } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { User, Calendar, Clock } from 'lucide-react';

export function DoctorAppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Image
          src={`https://placehold.co/64x64.png?text=${appointment.user.name.charAt(0)}`}
          alt={`Photo of ${appointment.user.name}`}
          width={64}
          height={64}
          className="rounded-full border object-cover bg-muted"
          data-ai-hint="person portrait"
        />
        <div className="flex-grow space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <p className="font-bold">{appointment.user.name}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <p>{format(parseISO(appointment.date), 'EEEE, MMMM d, yyyy')}</p>
          </div>
           <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <p>{appointment.time}</p>
          </div>
        </div>
        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
          {appointment.status === 'upcoming' && <Badge variant="default">Upcoming</Badge>}
          {appointment.status === 'completed' && <Badge variant="secondary">Completed</Badge>}
          {appointment.status === 'canceled' && <Badge variant="destructive">Canceled</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
