
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Doctor } from '@/lib/types';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { toggleWishlist, isDoctorInWishlist, subscribe } from '@/lib/wishlist';
import { useEffect, useState } from 'react';

export function DoctorCard({ doctor }: { doctor: Doctor }) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    
    useEffect(() => {
        const updateWishlistStatus = () => {
            setIsWishlisted(isDoctorInWishlist(doctor.id));
        };

        const unsubscribe = subscribe(updateWishlistStatus);
        updateWishlistStatus(); // Initial check

        return () => unsubscribe();
    }, [doctor.id]);
    
    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.preventDefault(); // prevent navigation
        toggleWishlist(doctor.id);
    };

    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-lg w-full">
            <Link href={`/dashboard/doctors/${doctor.id}`} passHref>
                <div className='relative'>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                            <Image
                                src={doctor.image}
                                alt={`Photo of ${doctor.name}`}
                                width={80}
                                height={80}
                                className="rounded-lg object-cover h-24 w-24 border"
                                data-ai-hint="doctor portrait"
                            />
                            <div className="flex-1 space-y-1">
                                <h3 className="font-bold text-base">{doctor.name}</h3>
                                <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{doctor.rating.toFixed(1)}</span>
                                    <span>({doctor.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>{doctor.location}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <Badge variant="outline">Available Today</Badge>
                            <Button size="sm">Book Now</Button>
                        </div>
                    </CardContent>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute top-2 right-2 rounded-full h-8 w-8 bg-background/50 backdrop-blur-sm"
                        onClick={handleWishlistToggle}
                    >
                        <Heart className={cn("h-5 w-5 text-destructive transition-all", isWishlisted && "fill-destructive")} />
                    </Button>
                </div>
            </Link>
        </Card>
    );
}
