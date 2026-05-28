'use client';

import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';

interface ChartDataPoint {
  name: string;
  value: number;
}

interface RealtimeChartProps {
  data: ChartDataPoint[];
  color?: string;
  dataKey?: string;
}

export const RealtimeChart: React.FC<RealtimeChartProps> = ({
  data,
  color = '#D4AF37',
  dataKey = 'value',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-48 w-full bg-white/5 animate-pulse rounded-2xl" />;
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`colorUv-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="rgba(255,255,255,0.2)" 
            fontSize={9}
            tickLine={false}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.2)" 
            fontSize={9}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#0A0D18', 
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              fontSize: '11px',
              color: '#fff'
            }}
          />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={1.5}
            fillOpacity={1} 
            fill={`url(#colorUv-${color})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
export default RealtimeChart;
