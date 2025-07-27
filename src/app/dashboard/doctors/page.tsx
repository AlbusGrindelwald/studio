
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { doctors as allDoctors } from '@/lib/data';
import { DoctorCard } from '@/components/doctors/DoctorCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { Doctor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { DoctorFilters } from '@/components/doctors/DoctorFilters';

export type Filters = {
  location: string;
  specialty: string;
  rating: number;
  feeRange: string;
  availability?: ('today' | 'tomorrow' | 'weekend')[];
  appointmentTypes?: ('in-person' | 'online' | 'home-visit')[];
};

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    location: 'all',
    specialty: 'all',
    rating: 0,
    feeRange: 'any',
    availability: [],
    appointmentTypes: [],
  });
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const filteredDoctors = allDoctors.filter(doctor => {
    const searchMatch = 
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const locationMatch = filters.location === 'all' || doctor.location === filters.location;
    const specialtyMatch = filters.specialty === 'all' || doctor.specialty === filters.specialty;
    const ratingMatch = doctor.rating >= filters.rating;
    
    const feesMatch = (() => {
        if (filters.feeRange === 'any') return true;
        const doctorFee = doctor.fees || 0;
        const [min, max] = filters.feeRange.split('-').map(Number);
        if (max) {
            return doctorFee >= min && doctorFee <= max;
        }
        return doctorFee >= min; // For "300+" case
    })();

    const appointmentTypesMatch = !filters.appointmentTypes || filters.appointmentTypes.length === 0 ||
        filters.appointmentTypes.every(type => doctor.appointmentTypes?.includes(type));

    // Basic availability check (can be expanded)
    const availabilityMatch = !filters.availability || filters.availability.length === 0 ||
        filters.availability.some(avail => {
            if (avail === 'today') {
                const today = new Date().toISOString().split('T')[0];
                return doctor.availability[today] && doctor.availability[today].length > 0;
            }
            // More complex logic for tomorrow/weekend would be needed here
            return true;
        });

    return searchMatch && locationMatch && specialtyMatch && ratingMatch && feesMatch && appointmentTypesMatch && availabilityMatch;
  });

  if (!isClient) {
    return (
       <div className="flex flex-col gap-6 p-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(8)].map((_, i) => (
              <Card key={i}>
                  <CardContent className="p-4 space-y-4">
                      <div className="flex items-center gap-4">
                          <Skeleton className="h-20 w-20 rounded-lg" />
                          <div className="space-y-2 flex-1">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                          </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-8 w-24" />
                      </div>
                  </CardContent>
              </Card>
          ))}
      </div>
      </div>
    );
  }

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
  };
  
  const handleResetFilters = () => {
    setFilters({
        location: 'all',
        specialty: 'all',
        rating: 0,
        feeRange: 'any',
        availability: [],
        appointmentTypes: [],
    });
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find a Doctor</h1>
        <p className="text-muted-foreground">Search for a specialist or browse our directory.</p>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
            placeholder="Search by name, specialty, or location..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
         <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                        Refine your search to find the perfect doctor.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                    <DoctorFilters
                        currentFilters={filters}
                        onApply={handleApplyFilters}
                    />
                </div>
                <SheetFooter className="mt-auto pt-4 border-t">
                    <Button variant="ghost" onClick={handleResetFilters}>Reset</Button>
                    <SheetClose asChild>
                         <Button>Apply Filters</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {filteredDoctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
}
