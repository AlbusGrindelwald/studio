
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getLoggedInDoctor } from '@/lib/doctor-auth';
import { getPatientsForDoctor } from '@/lib/appointments';
import type { User } from '@/lib/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User as UserIcon, Mail, Phone, Calendar, Search, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function PatientCardSkeleton() {
    return (
        <Card className="bg-card/80 flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-6 w-14 rounded-full" />
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                 <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    );
}

function PatientRecordCard({ patient }: { patient: User }) {
  return (
    <Card className="bg-card/80 flex flex-col shadow-lg">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-10 w-10 bg-primary/20 text-primary">
          <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-bold">{patient.name}</h3>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4" />
          <span>{patient.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4" />
          <span>{patient.phone || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4" />
          <span>Last visit: {patient.lastVisit || 'N/A'}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90">
            <Eye className="mr-2 h-4 w-4" />
            View Details
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<User[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const doctor = getLoggedInDoctor();
    if (doctor) {
      setPatients(getPatientsForDoctor(doctor.email));
    }
    setIsClient(true);
  }, []);
  
  const filteredPatients = useMemo(() => {
    return patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [patients, searchTerm]);

  return (
    <div className="flex flex-col flex-1 h-screen">
        <header className="bg-background p-4 border-b sticky top-0 z-10">
            <div className="flex items-center gap-4 mb-4">
                <div>
                    <h1 className="text-xl font-bold">Patient Records</h1>
                    <p className="text-sm text-muted-foreground">Manage your patient information</p>
                </div>
            </div>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search patients..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-muted/40">
            {isClient ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPatients.length > 0 ? filteredPatients.map(patient => (
                        <PatientRecordCard key={patient.id} patient={patient} />
                    )) : (
                        <p className="text-center text-muted-foreground col-span-full py-10">No patients found.</p>
                    )}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <PatientCardSkeleton key={i} />)}
                </div>
            )}
        </main>
    </div>
  );
}
