

'use client';

import { useState, useEffect, useMemo } from 'react';
import { getPatientsForDoctor } from '@/lib/appointments';
import type { User } from '@/lib/user';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  User as UserIcon,
  Search,
  Users,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MoreVertical,
  Calendar,
  Phone,
  Stethoscope,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

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
  <Card>
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div
        className={cn(
          'p-3 rounded-lg',
          color
        )}
      >
        {icon}
      </div>
    </CardContent>
  </Card>
);


const PatientCard = ({ patient }: { patient: User }) => {
    const statusMap = {
      active: { text: 'Active', className: 'bg-green-100 text-green-700 border-green-200' },
      critical: { text: 'Critical', className: 'bg-red-100 text-red-700 border-red-200' },
      inactive: { text: 'Inactive', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    };

    const statusInfo = statusMap[patient.status as keyof typeof statusMap] || statusMap.inactive;

    return (
        <Card className="hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4 flex flex-col md:flex-row items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-full mt-1">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="font-bold text-lg">{patient.name}</h3>
                        <Badge variant="outline" className={cn('text-xs', statusInfo.className)}>{statusInfo.text}</Badge>
                        <p className="text-sm text-muted-foreground">{patient.age} years, {patient.gender}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Stethoscope className="h-4 w-4" />
                            <span>{patient.condition}</span>
                        </div>
                         <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>Last visit: {patient.lastVisit}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Phone className="h-4 w-4" />
                            <span>{patient.phone}</span>
                        </div>
                    </div>
                    {patient.nextAppointment && (
                         <div className="flex items-center gap-1.5 text-sm text-primary font-medium">
                            <Calendar className="h-4 w-4" />
                            <span>Next appointment: {patient.nextAppointment}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 self-start md:self-center mt-2 md:mt-0">
                    <Button>View Details</Button>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

const PatientsSkeleton = () => (
    <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
    </div>
);

type FilterType = 'all' | 'active' | 'critical' | 'inactive';

export default function MyPatientsPage() {
    const [patients, setPatients] = useState<User[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    useEffect(() => {
        setPatients(getPatientsForDoctor());
        setIsClient(true);
    }, []);

    const patientStats = useMemo(() => {
        return {
            total: patients.length,
            active: patients.filter(p => p.status === 'active').length,
            critical: patients.filter(p => p.status === 'critical').length,
            inactive: patients.filter(p => p.status === 'inactive').length,
        };
    }, [patients]);

    const filteredPatients = useMemo(() => {
        let results = patients;

        if (activeFilter !== 'all') {
            results = results.filter(p => p.status === activeFilter);
        }

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            results = results.filter(p =>
                p.name.toLowerCase().includes(lowercasedTerm) ||
                p.email.toLowerCase().includes(lowercasedTerm) ||
                p.condition?.toLowerCase().includes(lowercasedTerm)
            );
        }
        return results;
    }, [patients, searchTerm, activeFilter]);

    if (!isClient) {
        return <PatientsSkeleton />;
    }

    return (
        <div className="flex flex-col flex-1 h-screen bg-muted/40">
            <header className="bg-background text-foreground p-6 border-b sticky top-0 z-10">
                <h1 className="text-2xl font-bold tracking-tight">Patient Management</h1>
                <p className="text-muted-foreground">Manage your patient records and medical history</p>
            </header>

            <main className="flex-1 p-6 overflow-y-auto space-y-6">
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Patients" value={patientStats.total} icon={<Users className="h-6 w-6 text-blue-500" />} color="bg-blue-100" />
                    <StatCard title="Active" value={patientStats.active} icon={<CheckCircle className="h-6 w-6 text-green-500" />} color="bg-green-100" />
                    <StatCard title="Critical" value={patientStats.critical} icon={<AlertTriangle className="h-6 w-6 text-red-500" />} color="bg-red-100" />
                    <StatCard title="Inactive" value={patientStats.inactive} icon={<XCircle className="h-6 w-6 text-gray-500" />} color="bg-gray-100" />
                </div>
                
                 <Card>
                    <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                       <div className="relative w-full md:flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search patients by name, condition, or email..."
                                className="pl-10 h-11"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-muted rounded-full">
                            {(['all', 'active', 'critical', 'inactive'] as FilterType[]).map(filter => (
                                <Button
                                    key={filter}
                                    variant={activeFilter === filter ? 'default' : 'ghost'}
                                    onClick={() => setActiveFilter(filter)}
                                    className="capitalize rounded-full text-sm h-9 px-4"
                                >
                                    {filter}
                                    <span className={cn(
                                        "ml-2 text-xs rounded-full px-2 py-0.5",
                                        activeFilter === filter ? 'bg-primary-foreground/20' : 'bg-background text-muted-foreground'
                                    )}>
                                        {patientStats[filter as keyof typeof patientStats]}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>


                {filteredPatients.length > 0 ? (
                    <div className="space-y-4">
                        {filteredPatients.map(patient => (
                            <PatientCard key={patient.id} patient={patient} />
                        ))}
                    </div>
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
