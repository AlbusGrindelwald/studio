
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Doctor } from '@/lib/types';

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
        <Image
          src={doctor.image}
          alt={`Photo of ${doctor.name}`}
          width={80}
          height={80}
          className="rounded-full border object-cover"
          data-ai-hint="doctor portrait"
        />
        <div className="flex-1">
          <CardTitle className="text-lg">{doctor.name}</CardTitle>
          <CardDescription>{doctor.specialty}</CardDescription>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{doctor.rating.toFixed(1)}</span>
            </div>
            <span>({doctor.reviews} reviews)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{doctor.description}</p>
        <div className="mb-4 flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{doctor.location}</span>
        </div>
        <Link href={`/dashboard/doctors/${doctor.id}`} passHref>
          <Button className="w-full">Book Appointment</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
