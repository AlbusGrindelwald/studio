
'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { doctors } from '@/lib/data';
import type { Filters } from '@/app/dashboard/doctors/page';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';


const uniqueLocations = ['all', ...Array.from(new Set(doctors.map(d => d.location)))];
const uniqueSpecialties = ['all', ...Array.from(new Set(doctors.map(d => d.specialty)))];
const appointmentTypes: { id: Filters['appointmentTypes'][number], label: string }[] = [
    { id: 'in-person', label: 'In-person' },
    { id: 'online', label: 'Online' },
    { id: 'home-visit', label: 'Home Visit' },
];

interface DoctorFiltersProps {
  currentFilters: Filters;
  onApply: (filters: Filters) => void;
}

export function DoctorFilters({ currentFilters, onApply }: DoctorFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(currentFilters);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleValueChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onApply(newFilters);
  };
  
  const handleCheckboxChange = (
    key: 'availability' | 'appointmentTypes',
    value: string,
    checked: boolean
  ) => {
    const currentValues = localFilters[key] as string[];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    handleValueChange(key, newValues);
  };
  
  const handleRatingChange = (newRating: number) => {
    handleValueChange('rating', newRating);
  };

  return (
    <div className="space-y-8 py-4 px-1">
      <div className="space-y-2">
        <Label>Location</Label>
        <Select
          value={localFilters.location}
          onValueChange={value => handleValueChange('location', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {uniqueLocations.map(loc => (
              <SelectItem key={loc} value={loc}>
                {loc === 'all' ? 'All Locations' : loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Specialization</Label>
        <Select
          value={localFilters.specialty}
          onValueChange={value => handleValueChange('specialty', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select specialty" />
          </SelectTrigger>
          <SelectContent>
            {uniqueSpecialties.map(spec => (
              <SelectItem key={spec} value={spec}>
                {spec === 'all' ? 'All Specialties' : spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
       <div className="space-y-3">
        <Label>Minimum Rating</Label>
        <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="flex items-center gap-1 p-1 rounded-md transition-colors hover:bg-accent"
                >
                    <span className="font-semibold">{star}</span>
                    <Star className={cn("h-5 w-5", localFilters.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')}/>
                </button>
            ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="fees">Consultation Fee</Label>
        <Slider
          id="fees"
          min={0}
          max={500}
          step={10}
          value={localFilters.fees}
          onValueChange={value => handleValueChange('fees', value)}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${localFilters.fees[0]}</span>
          <span>${localFilters.fees[1]}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Appointment Type</Label>
        <div className="space-y-2">
            {appointmentTypes.map(type => (
                <div key={type.id} className="flex items-center gap-2">
                    <Checkbox
                        id={`type-${type.id}`}
                        checked={localFilters.appointmentTypes.includes(type.id)}
                        onCheckedChange={checked => handleCheckboxChange('appointmentTypes', type.id, !!checked)}
                    />
                    <Label htmlFor={`type-${type.id}`} className="font-normal">{type.label}</Label>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}
