
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMemo } from 'react';

const chartColor = "#2BC8BE"; // Sea Serpent

// Static data for demonstration
const demoData = [
    { name: 'Jan', appointments: 18 },
    { name: 'Feb', appointments: 25 },
    { name: 'Mar', appointments: 22 },
    { name: 'Apr', appointments: 30 },
    { name: 'May', appointments: 28 },
    { name: 'Jun', appointments: 35 },
];

export function MonthlyAppointmentsChart() {
    const maxAppointments = Math.max(...demoData.map(d => d.appointments), 0);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={demoData} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis type="number" hide domain={[0, maxAppointments > 0 ? maxAppointments : 1]} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--accent))' }}
                        contentStyle={{
                            background: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem',
                            color: 'hsl(var(--foreground))',
                        }}
                    />
                    <Bar dataKey="appointments" barSize={10} radius={[0, 5, 5, 0]}>
                         {demoData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColor} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
