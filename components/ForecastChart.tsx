import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { HourlyForecast } from '../types';

interface Props {
  data: HourlyForecast;
}

export const ForecastChart: React.FC<Props> = ({ data }) => {
  // Prepare data for the next 24 hours
  const chartData = data.time.slice(0, 24).map((t, i) => {
    const date = new Date(t);
    return {
      time: date.getHours() + ':00',
      temp: data.temperature_2m[i],
    };
  });

  return (
    <div className="w-full h-48 sm:h-64 lg:h-80 xl:h-96 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis 
            hide 
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff'
            }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value: number) => [`${value}°C`, 'Temp']}
          />
          <Area 
            type="monotone" 
            dataKey="temp" 
            stroke="#60a5fa" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTemp)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};