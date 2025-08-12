
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getLoggedInDoctor, completeDoctorProfile } from '@/lib/doctor-auth';
import type { DoctorUser } from '@/lib/doctor-auth';

const registrationSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required'),
  registrationCouncil: z.string().min(1, 'Registration council is required'),
  registrationYear: z.string().min(1, 'Registration year is required'),
});

type RegistrationValues = z.infer<typeof registrationSchema>;

const registrationCouncils = [
    'Medical Council of India',
    'Maharashtra Medical Council',
    'Delhi Medical Council',
    'Tamil Nadu Medical Council',
    'Karnataka Medical Council',
];

const registrationYears = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

function RegistrationSkeleton() {
    return (
        <Card>
            <CardContent className="p-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}

export default function MedicalRegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  
  // Store profile data from the previous step
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    const loggedInDoctor = getLoggedInDoctor();
    if (!loggedInDoctor) {
        toast({ title: "Session Expired", description: "Please log in again.", variant: 'destructive' });
        router.push('/doctor/login');
        return;
    }
    setDoctor(loggedInDoctor);

    const data = searchParams.get('data');
    if (data) {
        setProfileData(JSON.parse(data));
    } else {
        toast({ title: "Missing Information", description: "Profile details are missing. Please start over.", variant: 'destructive' });
        router.push('/doctor/profile-setup');
    }

  }, [router, searchParams, toast]);

  const { control, handleSubmit, formState: { errors } } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
        registrationNumber: '',
        registrationCouncil: '',
        registrationYear: '',
    }
  });

  const onSubmit = (data: RegistrationValues) => {
    if (!doctor || !profileData) {
        toast({ title: 'Error', description: 'Session data is missing.', variant: 'destructive' });
        return;
    }
    setIsLoading(true);

    const fullProfile = {
        ...profileData,
        email: doctor.email,
        ...data
    };

    console.log('Completing Profile with Data:', fullProfile);

    // This function will create the public profile and link it to the doctor user
    completeDoctorProfile(doctor.id, fullProfile);

    toast({
      title: 'Profile Complete!',
      description: 'Your profile has been created. Please log in to continue.',
    });
    
    setTimeout(() => {
        router.push('/doctor/login');
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
           <h1 className="text-3xl font-bold">Medical Registration</h1>
           <p className="text-muted-foreground mt-2">Section B: Registration details</p>
        </div>
        
        {isClient ? (
            <Card>
            <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    <Controller
                        name="registrationNumber"
                        control={control}
                        render={({ field }) => (
                            <Input id="registrationNumber" placeholder="Type registration number" {...field} />
                        )}
                    />
                    {errors.registrationNumber && <p className="text-sm text-destructive">{errors.registrationNumber.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label>Registration Council</Label>
                    <Controller
                        name="registrationCouncil"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Type & select registration council" />
                                </SelectTrigger>
                                <SelectContent>
                                    {registrationCouncils.map(council => (
                                        <SelectItem key={council} value={council}>{council}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.registrationCouncil && <p className="text-sm text-destructive">{errors.registrationCouncil.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label>Registration Year</Label>
                    <Controller
                        name="registrationYear"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Type registration year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {registrationYears.map(year => (
                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.registrationYear && <p className="text-sm text-destructive">{errors.registrationYear.message}</p>}
                </div>


                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" size="lg" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Done'}
                </Button>
                </form>
            </CardContent>
            </Card>
        ) : (
            <RegistrationSkeleton />
        )}

      </div>
    </div>
  );
}
