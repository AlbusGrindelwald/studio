
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { logoutDoctor, getLoggedInDoctor } from '@/lib/doctor-auth';
import { useEffect, useState } from 'react';
import type { DoctorUser } from '@/lib/doctor-auth';

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);

  useEffect(() => {
    const loggedInDoctor = getLoggedInDoctor();
    if (!loggedInDoctor) {
      router.push('/doctor/login');
    } else {
      setDoctor(loggedInDoctor);
    }
  }, [router]);

  const handleLogout = () => {
    logoutDoctor();
    router.push('/doctor/login');
  };
  
  if (!doctor) {
    return <div>Loading...</div>; // Or a proper skeleton loader
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome, {doctor.name}</h1>
      <p className="text-lg text-muted-foreground mb-8">This is your dashboard. More features coming soon!</p>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}
