
'use client';

import { useState, useEffect } from 'react';
import { getLoggedInDoctor } from '@/lib/doctor-auth';
import { getPatientsForDoctor } from '@/lib/appointments';
import type { User } from '@/lib/user';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { User as UserIcon, Mail, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function PatientListSkeleton() {
    return (
        <div className="flex flex-col flex-1">
            <header className="bg-background p-4 flex items-center justify-between border-b sticky top-0 z-10 h-16">
                 <Skeleton className="h-8 w-48" />
            </header>
            <main className="flex-1 p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-40" />
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-2">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-48" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<User[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const doctor = getLoggedInDoctor();
    if (doctor) {
      setPatients(getPatientsForDoctor(doctor.email));
    }
    setIsClient(true);
  }, []);
  
  if(!isClient) {
    return <PatientListSkeleton />;
  }

  return (
    <div className="flex flex-col flex-1">
        <header className="bg-background p-4 border-b sticky top-0 z-10 h-16 flex items-center">
            <h1 className="text-xl font-bold">My Patients</h1>
        </header>

        <main className="flex-1 p-4 md:p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Patient List ({patients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Contact</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients.length > 0 ? patients.map(patient => (
                                <TableRow key={patient.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {patient.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{patient.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className='space-y-1'>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-3 w-3" />
                                                <span>{patient.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-3 w-3" />
                                                <span>{patient.phone || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center h-24">No patients found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}

