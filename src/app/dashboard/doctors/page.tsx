import { Input } from '@/components/ui/input';
import { doctors } from '@/lib/data';
import { DoctorCard } from '@/components/doctors/DoctorCard';
import { Search } from 'lucide-react';

export default function DoctorsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find a Doctor</h1>
        <p className="text-muted-foreground">Search for a specialist or browse our directory.</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search by name, specialty, or location..." className="pl-10" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
}
