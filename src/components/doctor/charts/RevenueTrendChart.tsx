
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Appointment } from '@/lib/types';
import { useMemo } from 'react';
import { format, parseISO, subMonths, addMonths } from 'date-fns';

interface RevenueTrendChartProps {
    appointments: Appointment[];
}

const chartColor = "#34d399"; // A nice green color

export function RevenueTrendChart({ appointments }: RevenueTrendChartProps) {
    const data = useMemo(() => {
        const sixMonthsAgo = subMonths(new Date(), 5);
        const dataMap = new Map<string, number>();

        for (let i = 0; i < 6; i++) {
            const month = format(addMonths(sixMonthsAgo, i), 'MMM');
            dataMap.set(month, 0);
        }

        const completedAppointments = appointments.filter(a => a.status === 'completed');

        completedAppointments.forEach(app => {
            const appointmentDate = parseISO(app.date);
            if (appointmentDate >= sixMonthsAgo) {
                const month = format(appointmentDate, 'MMM');
                dataMap.set(month, (dataMap.get(month) || 0) + (app.doctor.fees || 0));
            }
        });
        
        return Array.from(dataMap.entries()).map(([name, value]) => ({ name, revenue: value }));
    }, [appointments]);

    const maxRevenue = Math.max(...data.map(d => d.revenue), 0);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis type="number" hide domain={[0, maxRevenue > 0 ? maxRevenue : 1]} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }}/>
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--accent))' }}
                        contentStyle={{
                            background: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem',
                            color: 'hsl(var(--foreground))',
                        }}
                        formatter={(value) => `$${Number(value).toLocaleString()}`}
                    />
                    <Bar dataKey="revenue" barSize={10} radius={[0, 5, 5, 0]}>
                         {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColor} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
