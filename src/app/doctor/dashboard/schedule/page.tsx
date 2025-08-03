
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, CalendarIcon, Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type DaySchedule = {
  isEnabled: boolean;
  startTime: string;
  endTime: string;
  breakTime: { start: string; end: string };
  slots: string[];
};

const defaultSchedule: DaySchedule = {
  isEnabled: true,
  startTime: '09:00',
  endTime: '17:00',
  breakTime: { start: '12:00', end: '13:00' },
  slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
};

const initialWeeklySchedule: Record<string, DaySchedule> = {
  Monday: { ...defaultSchedule },
  Tuesday: { ...defaultSchedule },
  Wednesday: { ...defaultSchedule },
  Thursday: { ...defaultSchedule },
  Friday: { ...defaultSchedule },
  Saturday: { ...defaultSchedule, isEnabled: false },
  Sunday: { ...defaultSchedule, isEnabled: false },
};

type BlockedDate = {
  date: Date;
  reason: string;
};

export default function ScheduleManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [weeklySchedule, setWeeklySchedule] = useState(initialWeeklySchedule);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState<Date | undefined>();
  const [newBlockedReason, setNewBlockedReason] = useState('');

  const handleDayToggle = (day: string, isEnabled: boolean) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], isEnabled },
    }));
  };

  const addBlockedDate = () => {
    if (newBlockedDate) {
      setBlockedDates([...blockedDates, { date: newBlockedDate, reason: newBlockedReason }]);
      setNewBlockedDate(undefined);
      setNewBlockedReason('');
      toast({
        title: 'Date Blocked',
        description: `${newBlockedDate.toLocaleDateString()} has been blocked.`,
      });
    }
  };
  
  const removeBlockedDate = (dateToRemove: Date) => {
    setBlockedDates(blockedDates.filter(d => d.date.getTime() !== dateToRemove.getTime()));
  }

  const handleSave = () => {
    console.log('Saved Schedule:', { weeklySchedule, blockedDates });
    toast({
      title: 'Schedule Saved',
      description: 'Your availability has been updated successfully.',
    });
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-muted/40">
      <header className="bg-background p-4 border-b sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Schedule Management</h1>
            <p className="text-sm text-muted-foreground">Manage your availability and working hours</p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Schedule
        </Button>
      </header>

      <main className="flex-1 p-6 overflow-y-auto flex flex-col md:flex-row gap-6">
        <div className="flex-[2] space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>Set your availability for each day of the week.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              {Object.entries(weeklySchedule).map(([day, schedule]) => (
                <Card key={day} className={!schedule.isEnabled ? 'bg-muted/50' : ''}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">{day}</CardTitle>
                    <Switch
                      checked={schedule.isEnabled}
                      onCheckedChange={(checked) => handleDayToggle(day, checked)}
                    />
                  </CardHeader>
                  <CardContent className="space-y-3 pt-2">
                    {schedule.isEnabled ? (
                      <>
                        <div className="text-sm text-muted-foreground">
                          <p>{schedule.startTime} - {schedule.endTime} (Break: {schedule.breakTime.start} - {schedule.breakTime.end})</p>
                          <p>{schedule.slots.length} slots available (30 min each)</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {schedule.slots.slice(0, 6).map(slot => (
                            <Badge key={slot} variant="outline" className="text-primary border-primary">{slot}</Badge>
                          ))}
                           {schedule.slots.length > 6 && <Badge variant="outline">+{schedule.slots.length - 6} more</Badge>}
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                            <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit Day
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-10">Unavailable</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Block Dates</CardTitle>
              <CardDescription>Block specific dates when you're unavailable.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newBlockedDate ? newBlockedDate.toLocaleDateString() : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newBlockedDate}
                    onSelect={setNewBlockedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                placeholder="Reason (optional)"
                value={newBlockedReason}
                onChange={e => setNewBlockedReason(e.target.value)}
              />
              <Button onClick={addBlockedDate} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Block Date
              </Button>
              
              {blockedDates.length > 0 && (
                <div className="space-y-2 pt-4">
                    <h4 className="font-medium text-sm">Blocked Dates:</h4>
                    {blockedDates.map(bd => (
                       <div key={bd.date.toString()} className="flex items-center justify-between bg-muted p-2 rounded-md text-sm">
                           <div>
                            <p className="font-semibold">{bd.date.toLocaleDateString()}</p>
                            {bd.reason && <p className="text-xs text-muted-foreground">{bd.reason}</p>}
                           </div>
                           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeBlockedDate(bd.date)}>
                                <X className="h-4 w-4" />
                           </Button>
                       </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
