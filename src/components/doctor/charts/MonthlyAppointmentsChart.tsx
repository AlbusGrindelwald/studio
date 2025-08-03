
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Appointment } from '@/lib/types';
import { useMemo } from 'react';
import { format, parseISO, subMonths } from 'date-fns';

interface MonthlyAppointmentsChartProps {
    appointments: Appointment[];
}

const chartColor = "#2BC8BE"; // Sea Serpent

export function MonthlyAppointmentsChart({ appointments }: MonthlyAppointmentsChartProps) {
    const data = useMemo(() => {
        const sixMonthsAgo = subMonths(new Date(), 5);
        const dataMap = new Map<string, number>();

        for (let i = 0; i < 6; i++) {
            const month = format(addMonths(sixMonthsAgo, i), 'MMM');
            dataMap.set(month, 0);
        }

        appointments.forEach(app => {
            const appointmentDate = parseISO(app.date);
            if (appointmentDate >= sixMonthsAgo) {
                const month = format(appointmentDate, 'MMM');
                dataMap.set(month, (dataMap.get(month) || 0) + 1);
            }
        });
        
        return Array.from(dataMap.entries()).map(([name, value]) => ({ name, appointments: value }));
    }, [appointments]);
    
    const maxAppointments = Math.max(...data.map(d => d.appointments), 0);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis type="number" hide domain={[0, maxAppointments > 0 ? maxAppointments : 1]} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                    <Tooltip
                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                        contentStyle={{
                            background: '#334155',
                            border: '1px solid #475569',
                            borderRadius: '0.5rem',
                            color: '#e2e8f0',
                        }}
                    />
                    <Bar dataKey="appointments" barSize={10} radius={[0, 5, 5, 0]}>
                         {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColor} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
