
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart } from 'lucide-react';
import { getWishlist, subscribe } from '@/lib/wishlist';
import type { Doctor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { DoctorCard } from '@/components/doctors/DoctorCard';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Doctor[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const handleWishlistChange = () => {
      setWishlist(getWishlist());
    };

    const unsubscribe = subscribe(handleWishlistChange);
    handleWishlistChange(); // initial fetch

    setIsClient(true);
    
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-muted/40">
      <header className="bg-background p-4 flex items-center gap-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">My Wishlist</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4">
        {isClient && wishlist.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {wishlist.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Your Wishlist is Empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tap the heart on any doctor's profile to save them here.
            </p>
            <Button className="mt-6" onClick={() => router.push('/dashboard/doctors')}>
              Find Doctors
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
