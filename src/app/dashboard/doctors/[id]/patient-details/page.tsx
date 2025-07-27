
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [gender, setGender] = useState('male');

  const handleContinue = () => {
    router.push(`/dashboard/doctors/${id}/book`);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-primary p-4 flex items-center gap-4 text-primary-foreground">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-primary/80"
          onClick={() => router.back()}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">Patient Details</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/20">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Patient Details</h2>

          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input id="full-name" placeholder="Patient Name" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" placeholder="22" />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup
                defaultValue="male"
                className="flex gap-4 pt-2"
                onValueChange={setGender}
              >
                <Button
                  variant={gender === 'male' ? 'default' : 'outline'}
                  onClick={() => setGender('male')}
                  className={cn("flex-1", gender !== 'male' && "bg-white")}
                >
                  Male
                </Button>
                <Button
                   variant={gender === 'female' ? 'default' : 'outline'}
                   onClick={() => setGender('female')}
                   className={cn("flex-1", gender !== 'female' && "bg-white")}
                >
                  Female
                </Button>
                <Button
                  variant={gender === 'other' ? 'default' : 'outline'}
                  onClick={() => setGender('other')}
                  className={cn("flex-1", gender !== 'other' && "bg-white")}
                >
                  Transgender
                </Button>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem">Write your problem</Label>
            <Textarea
              id="problem"
              placeholder="write your problem"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relation">Relation with Patient</Label>
            <Input id="relation" placeholder="Brother/sister/mother" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Patient Mobile Number</Label>
            <Input id="mobile" type="tel" placeholder="Mobile number" />
          </div>
        </div>
      </main>

      <footer className="p-4 border-t bg-background space-y-3">
        <Button size="lg" className="w-full" onClick={handleContinue}>
          Add Patient Details
        </Button>
      </footer>
    </div>
  );
}
