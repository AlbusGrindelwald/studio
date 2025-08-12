
'use client';

import { useState, useEffect } from 'react';
import { getPatientsForDoctor } from '@/lib/appointments';
import type { User } from '@/lib/user';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


const PatientCard = ({ patient }: { patient: User }) => {
    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-full">
                        <UserIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                        <p className="font-bold">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.condition}</p>
                    </div>
                </div>
                 <Badge
                    className={cn(
                        "capitalize",
                        patient.status === 'stable' && 'bg-green-100 text-green-700 border-green-200',
                        patient.status === 'monitoring' && 'bg-yellow-100 text-yellow-700 border-yellow-200',
                        patient.status === 'critical' && 'bg-red-100 text-red-700 border-red-200'
                    )}
                >
                    {patient.status}
                </Badge>
            </CardContent>
        </Card>
    );
}


const PatientsSkeleton = () => (
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
                         </div>
                         <Skeleton className="h-6 w-24 rounded-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);


export default function MyPatientsPage() {
    const [patients, setPatients] = useState<User[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setPatients(getPatientsForDoctor());
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <PatientsSkeleton />;
    }

    return (
        <div className="flex flex-col flex-1 h-screen bg-muted/40">
            <header className="bg-background text-foreground p-6 border-b sticky top-0 z-10">
                <h1 className="text-2xl font-bold tracking-tight">My Patients</h1>
                <p className="text-muted-foreground">View and manage your patient list.</p>
            </header>

            <main className="flex-1 p-6 overflow-y-auto space-y-4">
                {patients.length > 0 ? (
                    patients.map(patient => (
                        <PatientCard key={patient.id} patient={patient} />
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground">No patients found.</p>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
