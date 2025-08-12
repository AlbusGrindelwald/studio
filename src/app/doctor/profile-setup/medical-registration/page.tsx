
'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import MedicalRegistrationForm from './form';

function RegistrationSkeleton() {
    return (
        <div className="w-full max-w-2xl space-y-6">
            <div className="text-center">
                <Skeleton className="h-8 w-72 mx-auto" />
                <Skeleton className="h-5 w-56 mx-auto mt-2" />
            </div>
            <div className="p-8 space-y-6">
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
        </div>
    );
}


export default function MedicalRegistrationPage() {
    return (
        <Suspense fallback={<RegistrationSkeleton />}>
            <MedicalRegistrationForm />
        </Suspense>
    )
}
