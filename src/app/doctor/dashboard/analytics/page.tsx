
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getLoggedInDoctor } from '@/lib/doctor-auth';
import { getAppointmentsForDoctor } from '@/lib/appointments';
import type { Appointment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, Calendar, DollarSign, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueTrendChart } from '@/components/doctor/charts/RevenueTrendChart';
import { MonthlyAppointmentsChart } from '@/components/doctor/charts/MonthlyAppointmentsChart';

const AnalyticsSkeleton = () => (
    <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-md" />
                <div>
                    <Skeleton className="h-7 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-lg" />
            <Skeleton className="h-80 rounded-lg" />
        </div>
    </div>
);

export default function AnalyticsPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        const doctor = getLoggedInDoctor();
        if (doctor) {
            setAppointments(getAppointmentsForDoctor(doctor.email));
        }
        setIsClient(true);
    }, []);

    const analyticsData = useMemo(() => {
        const totalPatients = new Set(appointments.map(a => a.user.id)).size;
        const totalAppointments = appointments.length;
        const completedAppointments = appointments.filter(a => a.status === 'completed');
        const totalRevenue = completedAppointments.reduce((sum, a) => sum + (a.doctor.fees || 0), 0);
        const successRate = totalAppointments > 0 ? (completedAppointments.length / totalAppointments) * 100 : 0;
        
        return { totalPatients, totalAppointments, totalRevenue, successRate };
    }, [appointments]);

    if (!isClient) {
        return <AnalyticsSkeleton />;
    }

    return (
        <div className="flex flex-col flex-1 h-screen bg-[#1c2434]">
            <header className="bg-[#1c2434] text-white p-6 border-b border-gray-700 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                         <Button variant="outline" size="icon" className="h-9 w-9 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
                            <p className="text-gray-400">Track your practice performance</p>
                        </div>
                    </div>
                    <Select defaultValue="30">
                        <SelectTrigger className="w-[180px] bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Filter period" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-600">
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-y-auto">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card className="bg-gray-800 border-gray-700 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-5 w-5 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{analyticsData.totalPatients}</div>
                            <p className="text-xs text-green-400">+12% from last period</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-gray-800 border-gray-700 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                            <Calendar className="h-5 w-5 text-teal-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{analyticsData.totalAppointments}</div>
                            <p className="text-xs text-green-400">+8% from last period</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <DollarSign className="h-5 w-5 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">${analyticsData.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-green-400">+15% from last period</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                            <Activity className="h-5 w-5 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{analyticsData.successRate.toFixed(0)}%</div>
                            <p className="text-xs text-green-400">+2% from last period</p>
                        </CardContent>
                    </Card>
                </div>
                
                 <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                     <Card className="bg-gray-800 border-gray-700 text-white">
                        <CardHeader>
                            <CardTitle>Monthly Appointments</CardTitle>
                            <p className="text-sm text-gray-400">Appointment trends over the last 6 months</p>
                        </CardHeader>
                        <CardContent>
                            <MonthlyAppointmentsChart appointments={appointments} />
                        </CardContent>
                    </Card>
                     <Card className="bg-gray-800 border-gray-700 text-white">
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                             <p className="text-sm text-gray-400">Monthly revenue from completed appointments</p>
                        </CardHeader>
                        <CardContent>
                           <RevenueTrendChart appointments={appointments} />
                        </CardContent>
                    </Card>
                 </div>
            </main>
        </div>
    )
}
