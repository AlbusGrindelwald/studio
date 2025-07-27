
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

const feeRanges = [
    { id: 'any', label: 'Any' },
    { id: '0-100', label: '$0 - $100' },
    { id: '100-200', label: '$100 - $200' },
    { id: '200-300', label: '$200 - $300' },
    { id: '300', label: 'Over $300' },
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
        <Label>Consultation Fee</Label>
        <RadioGroup
          value={localFilters.fees}
          onValueChange={(value) => handleValueChange('fees', value)}
          className="space-y-2"
        >
          {feeRanges.map((range) => (
            <div key={range.id} className="flex items-center space-x-2">
              <RadioGroupItem value={range.id} id={`fees-${range.id}`} />
              <Label htmlFor={`fees-${range.id}`} className="font-normal">
                {range.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Appointment Type</Label>
        <div className="space-y-2">
            {appointmentTypes.map(type => (
                <div key={type.id} className="flex items-center gap-2">
                    <RadioGroupItem
                        id={`type-${type.id}`}
                        value={type.id}
                        checked={localFilters.appointmentTypes.includes(type.id)}
                        onClick={() => {
                            const newTypes = localFilters.appointmentTypes.includes(type.id)
                                ? localFilters.appointmentTypes.filter(t => t !== type.id)
                                : [...localFilters.appointmentTypes, type.id];
                            handleValueChange('appointmentTypes', newTypes);
                        }}
                    />
                    <Label htmlFor={`type-${type.id}`} className="font-normal">{type.label}</Label>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}
