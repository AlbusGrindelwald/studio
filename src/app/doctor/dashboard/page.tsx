

'use client';

import { useRouter } from 'next/navigation';
import { getLoggedInDoctor } from '@/lib/doctor-auth';
import { useEffect, useState, useMemo } from 'react';
import type { DoctorUser } from '@/lib/doctor-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

function DoctorDashboardSkeleton() {
    return (
        <div className="flex flex-col flex-1 p-6">
            <header className="mb-6">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
            </header>
            <main className="flex-1">
                {/* Content removed as per request */}
            </main>
        </div>
    );
}

function DoctorDashboardHeader({ doctor }: { doctor: DoctorUser }) {
    const [time, setTime] = useState(new Date());
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const hour = time.getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, [time]);

    return (
        <header className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-2xl font-bold text-primary">{greeting}, {doctor.name}!</h1>
                <p className="text-muted-foreground">{format(time, 'EEEE, MMMM d, yyyy')}</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold">{format(time, 'h:mm:ss a')}</p>
                <p className="text-sm text-muted-foreground">Current Time</p>
            </div>
        </header>
    );
}


export default function DoctorDashboardPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const loggedInDoctor = getLoggedInDoctor();
    if (loggedInDoctor) {
      setDoctor(loggedInDoctor);
    } else {
      router.push('/doctor/login');
    }
    
    setIsClient(true);
  }, [router]);


  if (!isClient || !doctor) {
    return <DoctorDashboardSkeleton />;
  }

  return (
    <div className="flex flex-col flex-1">
        <main className="flex-1 p-4 md:p-6">
            <DoctorDashboardHeader doctor={doctor} />
            {/* All other sections removed as per request */}
        </main>
    </div>
  );
}
