
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import type { Doctor } from '@/lib/types';

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Link href={`/dashboard/doctors/${doctor.id}`} passHref>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg w-full cursor-pointer">
        <CardContent className="p-3">
          <div className="flex items-center gap-4">
              <Image
                  src={doctor.image}
                  alt={`Photo of ${doctor.name}`}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover h-24 w-24"
                  data-ai-hint="doctor portrait"
              />
              <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-base">{doctor.name}</h3>
                  <p className="text-sm text-primary">{doctor.specialty}</p>
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
          <Button className="w-full mt-4">Book Now</Button>
        </CardContent>
      </Card>
    </Link>
  );
}
