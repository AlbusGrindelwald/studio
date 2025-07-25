
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope, User } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function RoleSelectionPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md text-center">
        <Logo className="mx-auto mb-2 text-4xl" />
        <p className="text-muted-foreground mb-8">Your Health, Your Schedule.</p>
        
        <h1 className="text-2xl font-bold mb-6">Continue as a...</h1>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
            onClick={() => router.push('/login')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Patient</h2>
              <p className="text-sm text-muted-foreground">Book and manage your appointments.</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
            onClick={() => router.push('/doctor/login')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
               <div className="p-4 bg-primary/10 rounded-full">
                <Stethoscope className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Doctor</h2>
              <p className="text-sm text-muted-foreground">Manage your schedule and patients.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
