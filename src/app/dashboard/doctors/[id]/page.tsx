
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Calendar } from 'lucide-react';
import { findDoctorById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  const doctor = findDoctorById(id);

  const [earliestSlot, setEarliestSlot] = useState<{ date: string; time: string } | null>(null);

  useEffect(() => {
    if (doctor) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sortedDates = Object.keys(doctor.availability)
        .map(dateStr => parseISO(dateStr))
        .filter(date => date >= today)
        .sort((a, b) => a.getTime() - b.getTime());

      for (const date of sortedDates) {
        const dateStr = format(date, 'yyyy-MM-dd');
        const now = new Date();
        const slots = doctor.availability[dateStr]
          .map(time => {
            const [hourMinute, ampm] = time.split(' ');
            let [hour, minute] = hourMinute.split(':').map(Number);
            if (ampm === 'PM' && hour !== 12) {
              hour += 12;
            }
            if (ampm === 'AM' && hour === 12) {
              hour = 0;
            }
            const d = new Date(date);
            d.setHours(hour, minute, 0, 0);
            return { time, dateTime: d };
          })
          .filter(({ dateTime }) => dateTime > now)
          .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
        
        if (slots.length > 0) {
          setEarliestSlot({ date: dateStr, time: slots[0].time });
          return;
        }
      }
    }
  }, [doctor]);

  if (!doctor) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Doctor not found.</p>
      </div>
    );
  }

  const handleBookNow = () => {
    router.push(`/dashboard/doctors/${doctor.id}/book`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="bg-background p-4 flex items-center gap-4 fixed top-0 left-0 right-0 z-10 border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">Doctor Profile</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto pt-20 pb-40 space-y-6 bg-background">
        <div className="p-4">
            <div className="bg-card text-card-foreground rounded-xl p-4 flex items-start gap-4 shadow-sm border">
                <Image
                    src={doctor.image}
                    alt={`Photo of ${doctor.name}`}
                    width={80}
                    height={80}
                    className="rounded-lg border object-cover"
                    data-ai-hint="doctor portrait"
                />
                <div className="flex-1">
                    <h2 className="font-bold text-lg">{doctor.name}</h2>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    <p className="text-sm text-primary font-medium">MBBS, MS (Surgeon)</p>
                    <p className="text-xs text-muted-foreground mt-1">Fellow of Sanskara netralaya, chennai</p>
                </div>
            </div>
        </div>

        <div className="px-4 space-y-6">
            <section>
                <h3 className="font-semibold mb-3">Speciality</h3>
                <div className="flex flex-wrap gap-2">
                    {doctor.specialities.map(s => <Badge key={s} variant="outline" className="py-1 px-3 rounded-full border-primary text-primary">{s}</Badge>)}
                </div>
            </section>

            <section>
                <h3 className="font-semibold mb-2">About Doctor</h3>
                <p className="text-sm text-muted-foreground">
                    {doctor.description}
                </p>
            </section>
            
            <section>
                <h3 className="font-semibold mb-2">Availability For Consulting</h3>
                <p className="text-sm text-muted-foreground">Monday to Friday | 10 AM to 1 PM</p>
                <p className="text-sm text-muted-foreground">Saturday | 2 PM to 5 PM</p>
            </section>
        </div>
      </main>

      <footer className="p-4 border-t bg-background fixed bottom-0 left-0 right-0 z-10 space-y-4">
        {earliestSlot ? (
            <Link href={`/dashboard/doctors/${doctor.id}/book`} passHref>
                <div className="bg-card p-3 rounded-lg flex items-center justify-between cursor-pointer border hover:bg-accent">
                    <div className='flex items-center gap-4'>
                        <Calendar className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-sm text-primary font-semibold">Earliest Available</p>
                            <p className="text-sm font-bold">{format(parseISO(earliestSlot.date), 'dd MMM, yyyy')} at {earliestSlot.time}</p>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                </div>
            </Link>
        ) : (
             <div className="bg-card p-3 rounded-lg flex items-center justify-center border">
                <p className="text-sm text-muted-foreground">No upcoming appointments available.</p>
            </div>
        )}
        <Button size="lg" className="w-full" onClick={handleBookNow}>Book appointment</Button>
      </footer>
    </div>
  );
}
