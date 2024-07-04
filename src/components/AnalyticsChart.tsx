// app/components/AnalyticsChart.tsx
'use client'

import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface AnalyticsData {
  labels: string[];
  traffic: number[];
  revenue: number[];
  visitors: string;
  totalRevenue: number;
  revenuePerVisitor: number;
  bounceRate: number;
}

interface AnalyticsChartProps {
  data: AnalyticsData;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data }) => {
  const [showTraffic, setShowTraffic] = useState(true);
  const [showRevenue, setShowRevenue] = useState(true);
  const [timeFrame, setTimeFrame] = useState('today');

  const chartData: ChartData<'line'> = {
    labels: data.labels,
    datasets: [
      showTraffic && {
        label: 'Website Traffic',
        data: data.traffic,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      showRevenue && {
        label: 'Cumulative Revenue',
        data: data.revenue,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ].filter(Boolean) as any,
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Website Analytics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Visitors</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{data.visitors}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">${data.totalRevenue}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue per Visitor</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">${data.revenuePerVisitor}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bounce Rate</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{data.bounceRate}%</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <Switch checked={showTraffic} onCheckedChange={setShowTraffic} />
            <span>Traffic</span>
          </label>
          <label className="flex items-center space-x-2">
            <Switch checked={showRevenue} onCheckedChange={setShowRevenue} />
            <span>Revenue</span>
          </label>
        </div>
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-64 md:h-96">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AnalyticsChart;