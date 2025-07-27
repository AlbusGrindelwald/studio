
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function PatientDetailsSkeleton() {
    return (
         <div className="p-6 space-y-8">
            <div className="space-y-6">
                <Skeleton className="h-8 w-40" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <div className="flex items-center gap-2 pt-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
         </div>
    )
}

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [gender, setGender] = useState('male');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleContinue = () => {
    router.push(`/dashboard/doctors/${id}/book`);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-primary p-4 flex items-center gap-4 text-primary-foreground">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-primary/80"
          onClick={() => router.back()}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">Patient Details</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/20">
       {isClient ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Patient Details</h2>

          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input id="full-name" placeholder="Patient Name" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" placeholder="22" />
            </div>
            <div className="space-y-2">
                <Label>Gender</Label>
                <div className="flex items-center gap-2 pt-2">
                    <Button
                        onClick={() => setGender('male')}
                        className={cn("flex-1", gender === 'male' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground')}
                        variant={gender === 'male' ? 'default' : 'outline'}
                    >
                        Male
                    </Button>
                    <Button
                        onClick={() => setGender('female')}
                         className={cn("flex-1", gender === 'female' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground')}
                         variant={gender === 'female' ? 'default' : 'outline'}
                    >
                        Female
                    </Button>
                    <Button
                        onClick={() => setGender('other')}
                         className={cn("flex-1", gender === 'other' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground')}
                         variant={gender === 'other' ? 'default' : 'outline'}
                    >
                        Transgender
                    </Button>
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem">Write your problem</Label>
            <Textarea
              id="problem"
              placeholder="write your problem"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relation">Relation with Patient</Label>
            <Input id="relation" placeholder="Brother/sister/mother" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Patient Mobile Number</Label>
            <Input id="mobile" type="tel" placeholder="Mobile number" />
          </div>
        </div>
       ) : (
        <PatientDetailsSkeleton />
       )}
      </main>

      <footer className="p-4 border-t bg-background space-y-3">
        <Button size="lg" className="w-full" onClick={handleContinue}>
          Add Patient Details
        </Button>
      </footer>
    </div>
  );
}
