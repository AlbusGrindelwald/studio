
'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLoggedInDoctor, updateDoctor, DoctorUser } from '@/lib/doctor-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { findDoctorById as findPublicDoctor, updatePublicDoctor, Doctor } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  specialty: z.string().min(1, 'Specialty is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  specialities: z.string().min(1, 'Please list at least one speciality'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfileSkeleton() {
     return (
        <div className="flex flex-col flex-1">
            <header className="bg-background p-4 flex items-center justify-between border-b sticky top-0 z-10 h-16">
                 <Skeleton className="h-8 w-48" />
            </header>
            <main className="flex-1 p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-40 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-24 w-full" />
                        </div>
                        <Skeleton className="h-12 w-32" />
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

export default function DoctorProfilePage() {
  const { toast } = useToast();
  const [doctorAuth, setDoctorAuth] = useState<DoctorUser | null>(null);
  const [publicDoctor, setPublicDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      specialty: '',
      location: '',
      description: '',
      specialities: '',
    },
  });

  useEffect(() => {
    const authDoc = getLoggedInDoctor();
    if (authDoc) {
      const pubDoc = findPublicDoctor(authDoc.publicId || '');
      setDoctorAuth(authDoc);
      setPublicDoctor(pubDoc || null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (doctorAuth && publicDoctor) {
      form.reset({
        name: doctorAuth.name,
        email: doctorAuth.email,
        specialty: publicDoctor.specialty,
        location: publicDoctor.location,
        description: publicDoctor.description,
        specialities: publicDoctor.specialities.join(', '),
      });
    }
  }, [doctorAuth, publicDoctor, form]);

  const onSubmit: SubmitHandler<ProfileFormValues> = (data) => {
    if (!doctorAuth || !publicDoctor) return;

    try {
      // Update auth user info
      const updatedAuth = updateDoctor(doctorAuth.id, { name: data.name, email: data.email });
      
      // Update public doctor profile
      const updatedPublic = updatePublicDoctor(publicDoctor.id, {
          ...publicDoctor,
          name: data.name,
          specialty: data.specialty,
          location: data.location,
          description: data.description,
          specialities: data.specialities.split(',').map(s => s.trim()),
      });
      
      // Update local state to reflect changes immediately
      setDoctorAuth(updatedAuth);
      setPublicDoctor(updatedPublic);

      toast({
        title: 'Profile Updated',
        description: 'Your professional profile has been successfully updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }
  
  if (!doctorAuth || !publicDoctor) {
     return <div className="p-6">Could not load doctor profile. Please try logging in again.</div>
  }

  return (
    <div className="flex flex-col flex-1">
        <header className="bg-background p-4 border-b sticky top-0 z-10 h-16 flex items-center">
            <h1 className="text-xl font-bold">Edit Profile</h1>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Professional Information</CardTitle>
                    <CardDescription>
                        This information will be visible to patients on your public profile.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" {...form.register('name')} />
                                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" {...form.register('email')} />
                                 {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="specialty">Specialty</Label>
                                <Input id="specialty" {...form.register('specialty')} />
                                 {form.formState.errors.specialty && <p className="text-sm text-destructive">{form.formState.errors.specialty.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" {...form.register('location')} />
                                 {form.formState.errors.location && <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="specialities">Sub-specialities</Label>
                            <Input id="specialities" {...form.register('specialities')} placeholder="e.g., Hypertension, Heart Failure, Echocardiography" />
                            <p className="text-xs text-muted-foreground">Enter a comma-separated list of your specialities.</p>
                            {form.formState.errors.specialities && <p className="text-sm text-destructive">{form.formState.errors.specialities.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">About Me</Label>
                            <Textarea id="description" rows={5} {...form.register('description')} />
                            {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
                        </div>

                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
