
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const LandingPage = dynamic(() => import('./landing-page'), {
  ssr: false,
  loading: () => <LandingPageSkeleton />
});

function LandingPageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b">
        <Skeleton className="h-8 w-32" />
      </header>
      <main className="flex-1 p-4 space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <LandingPage />
  );
}
