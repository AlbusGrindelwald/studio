
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { recommendDoctors, RecommendDoctorsOutput } from '@/ai/flows/doctor-recommendation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { DoctorCard } from '@/components/doctors/DoctorCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Doctor } from '@/lib/types';

const formSchema = z.object({
  symptoms: z.string().min(10, 'Please describe your symptoms in at least 10 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function RecommendPage() {
  const [recommendations, setRecommendations] = useState<Doctor[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const result = await recommendDoctors({ symptoms: data.symptoms });
      const recommendedDoctors: Doctor[] = result.doctors.map((doc, index) => ({
        id: `rec-${index}`,
        name: doc.name,
        specialty: doc.specialty,
        description: doc.description,
        location: 'Various Locations',
        rating: 4.5 + (index * 0.1) % 0.5, // deterministic rating
        reviews: 50 + index * 10, // deterministic reviews
        image: `https://placehold.co/128x128?text=${doc.name.charAt(0)}`,
        availability: {}
      }));
      setRecommendations(recommendedDoctors);
    } catch (e) {
      setError('Sorry, we were unable to get recommendations at this time. Please try again later.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Doctor Recommendation</h1>
        <p className="text-muted-foreground">Describe your symptoms, and our AI will suggest the right specialists for you.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="symptoms" className="text-lg">Your Symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        id="symptoms"
                        placeholder="e.g., 'I have a persistent cough, shortness of breath, and chest pain...'"
                        rows={5}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Getting Recommendations...' : 'Get AI Recommendations'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-10 w-full mt-2" />
                    </CardContent>
                </Card>
            ))}
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {recommendations && recommendations.length > 0 && (
         <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Recommended Doctors</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} />
            ))}
            </div>
        </div>
      )}
    </div>
  );
}
