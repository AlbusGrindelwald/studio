
'use client';

import { Sidebar } from '@/components/doctor/Sidebar';
import { getLoggedInDoctor } from '@/lib/doctor-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const loggedInDoctor = getLoggedInDoctor();
    if (!loggedInDoctor) {
      router.push('/doctor/login');
    }
    setIsClient(true);
  }, [router]);

  if (!isClient) {
    return (
       <div className="flex min-h-screen w-full bg-muted/40">
        <div className="w-64 border-r bg-background p-4 space-y-4">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <main className="flex-1 p-6">
          <Skeleton className="h-full w-full" />
        </main>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
