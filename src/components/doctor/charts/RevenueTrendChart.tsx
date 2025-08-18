
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMemo } from 'react';

const chartColor = "#34d399"; // A nice green color

// Static data for demonstration
const demoData = [
    { name: 'Jan', revenue: 2500 },
    { name: 'Feb', revenue: 3200 },
    { name: 'Mar', revenue: 2800 },
    { name: 'Apr', revenue: 4100 },
    { name: 'May', revenue: 3900 },
    { name: 'Jun', revenue: 5200 },
];

export function RevenueTrendChart() {
    const maxRevenue = Math.max(...demoData.map(d => d.revenue), 0);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={demoData} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                         {demoData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColor} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
