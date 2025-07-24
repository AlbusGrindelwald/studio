
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { doctors as allDoctors } from '@/lib/data';
import { DoctorCard } from '@/components/doctors/DoctorCard';
import { Search } from 'lucide-react';
import type { Doctor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const filteredDoctors = allDoctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find a Doctor</h1>
        <p className="text-muted-foreground">Search for a specialist or browse our directory.</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search by name, specialty, or location..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {filteredDoctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
}
