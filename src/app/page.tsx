
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const LandingPage = dynamic(() => import('./landing-page'), {
  ssr: false,
  loading: () => <LandingPageSkeleton />,
});

function LandingPageSkeleton() {
    return (
        <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden p-6 space-y-8">
            <header className="flex justify-between items-center">
                <Skeleton className="h-8 w-24" />
                <div className="hidden md:flex items-center gap-6">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-10 w-24 rounded-md" />
            </header>
            <main className="text-center pt-24 space-y-6">
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-8 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
                <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
                 <div className="flex justify-center gap-4">
                    <Skeleton className="h-14 w-40 rounded-full" />
                    <Skeleton className="h-14 w-40 rounded-full" />
                </div>
                 <Skeleton className="mt-12 w-full max-w-4xl h-96 mx-auto rounded-2xl" />
            </main>
        </div>
    );
}

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <LandingPage /> : <LandingPageSkeleton />;
}
