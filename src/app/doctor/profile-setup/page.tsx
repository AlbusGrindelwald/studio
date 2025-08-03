
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getLoggedInDoctor, DoctorUser } from '@/lib/doctor-auth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

const profileStep1Schema = z.object({
  title: z.string().min(1, 'Title is required'),
  name: z.string().min(2, 'Name is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender is required' }),
  city: z.string().min(1, 'City is required'),
});

type ProfileStep1Values = z.infer<typeof profileStep1Schema>;

const specializations = [
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic Surgeon',
  'Neurologist',
  'Oncologist',
  'Psychiatrist'
];

const cities = [
    'Springfield, IL',
    'Metropolis, NY',
    'Oakwood, CA',
    'Rivertown, TX',
    'Gotham, NJ'
];


export default function ProfileSetupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);

  useEffect(() => {
    // This code runs only on the client, after the initial render.
    const loggedInDoctor = getLoggedInDoctor();
    setDoctor(loggedInDoctor);
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<ProfileStep1Values>({
    resolver: zodResolver(profileStep1Schema),
    defaultValues: {
      title: 'Dr.',
      name: '',
      specialization: '',
      city: '',
    },
  });

  const onSubmit = (data: ProfileStep1Values) => {
    setIsLoading(true);
    console.log('Profile Step 1 Data:', { doctorId: doctor?.id, ...data });

    // Here you would save the data and move to the next step
    toast({
      title: 'Profile Details Saved',
      description: 'Moving to the next step...',
    });
    
    router.push('/doctor/profile-setup/medical-registration');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
           <h1 className="text-3xl font-bold">Hello {doctor?.name || 'Dr.'}! Lets build your dedicated profile.</h1>
           <p className="text-muted-foreground mt-2">Section A: Profile details</p>
        </div>
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="flex gap-2">
                    <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Title" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dr.">Dr.</SelectItem>
                                    <SelectItem value="Mr.">Mr.</SelectItem>
                                    <SelectItem value="Ms.">Ms.</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <Input id="name" placeholder="Please enter your Name" {...field} className="flex-1"/>
                        )}
                    />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Specialization</Label>
                 <Controller
                    name="specialization"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Specialization" />
                            </SelectTrigger>
                            <SelectContent>
                                {specializations.map(spec => (
                                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                 {errors.specialization && <p className="text-sm text-destructive">{errors.specialization.message}</p>}
              </div>
              
               <div className="space-y-2">
                <Label>Gender</Label>
                <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-8 pt-2">
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="male" id="male" />
                                <Label htmlFor="male">Male</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="female" id="female" />
                                <Label htmlFor="female">Female</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="other" id="other" />
                                <Label htmlFor="other">Other</Label>
                            </div>
                        </RadioGroup>
                    )}
                />
                 {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
              </div>

               <div className="space-y-2">
                <Label>City</Label>
                 <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                            <SelectContent>
                                {cities.map(city => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                 {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" size="lg" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Continue'}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
                If you are not a doctor and own an establishment <Link href="#" className="font-medium text-primary hover:underline">Click here</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
