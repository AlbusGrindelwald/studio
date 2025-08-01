
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope, User } from 'lucide-react';
import { Logo } from '@/components/Logo';
import Image from 'next/image';

export default function RoleSelectionPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <Image
        src="https://storage.googleapis.com/ember-vigil-427113.appspot.com/6c207920-5349-436f-8703-a1f107954b80"
        alt="Doctor's waiting room"
        layout="fill"
        objectFit="cover"
        className="z-0 brightness-75"
        data-ai-hint="waiting room"
      />
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      
      <div className="w-full max-w-md text-center z-20">
        <Logo className="mx-auto mb-2 text-4xl text-white" />
        <p className="text-white/80 mb-8">Your Health, Your Schedule.</p>
        
        <h1 className="text-2xl font-bold mb-6 text-white">Continue as a...</h1>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:border-primary bg-background/20 backdrop-blur-sm border-white/20 text-white"
            onClick={() => router.push('/login')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
              <div className="p-4 bg-primary/20 rounded-full border border-primary/30">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Patient</h2>
              <p className="text-sm text-white/70">Book and manage your appointments.</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:border-primary bg-background/20 backdrop-blur-sm border-white/20 text-white"
            onClick={() => router.push('/doctor/login')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
               <div className="p-4 bg-primary/20 rounded-full border border-primary/30">
                <Stethoscope className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Doctor</h2>
              <p className="text-sm text-white/70">Manage your schedule and patients.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
