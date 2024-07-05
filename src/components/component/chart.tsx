import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { InfoIcon, CalendarIcon, ChevronDown, Sun, Moon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, eachDayOfInterval, subDays, differenceInDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from 'next-themes';

interface DataPoint {
  date: Date;
  visitors: number;
  revenue: number;
  cumulativeRevenue: number;
}

interface Metric {
  key: 'visitors' | 'revenue' | 'conversionRate' | 'revenuePerVisitor' | 'bounceRate' | 'timeOnPage';
  title: string;
  value: string | number;
  previousValue: number;
  unit?: string;
  info?: string;
  color: string;
  selectable: boolean;
  active: boolean;
}

const generateRandomData = (startDate: Date, endDate: Date): DataPoint[] => {
  let cumulativeRevenue = 0;
  return eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
    const dailyRevenue = Math.floor(Math.random() * 300) + 100;
    cumulativeRevenue += dailyRevenue;
    return {
      date,
      visitors: Math.floor(Math.random() * 1500) + 1000,
      revenue: dailyRevenue,
      cumulativeRevenue: cumulativeRevenue,
    };
  });
};

const calculateChange = (current: number, previous: number): string | null => {
  if (isNaN(current) || isNaN(previous) || previous === 0) {
    return null;
  }
  const change = ((current - previous) / previous) * 100;
  return change.toFixed(1);
};
const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

const MetricCard: React.FC<Metric & { onClick?: () => void }> = ({
  title, value, previousValue, unit = '', info, color, active, selectable, onClick
}) => {
  const change = calculateChange(typeof value === 'string' ? parseFloat(value) : value, previousValue);
  const isPositive = change !== null && parseFloat(change) >= 0;

  return (
    <Card
      className={`transition-all ${selectable ? 'cursor-pointer' : ''} ${active ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800' : ''} bg-white dark:bg-gray-800`}
      style={{ outlineColor: selectable ? color : 'transparent' }}
      onClick={selectable ? onClick : undefined}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h3>
          {info && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </TooltipTrigger>
                <TooltipContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                  <p>{info}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100" style={{ color: selectable ? color : 'inherit' }}>{value}{unit}</div>
        <div className={`text-sm ${change !== null ? (isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : 'text-gray-500 dark:text-gray-400'}`}>
          {change !== null ? (
            <>
              {isPositive ? '↑' : '↓'} {Math.abs(parseFloat(change))}%
            </>
          ) : (
            'No previous data'
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [metrics, setMetrics] = useState<Metric[]>([
    { key: 'visitors', title: 'Visitors', value: '0', previousValue: 0, color: '#3b82f6', active: true, selectable: true, info: "Total number of unique visitors" },
    { key: 'revenue', title: 'Revenue', value: '$0', previousValue: 0, color: '#10b981', active: true, selectable: true, info: "Total cumulative revenue generated" },
    { key: 'conversionRate', title: 'Conversion rate', value: '0', previousValue: 0, unit: '%', color: '#6366f1', active: false, selectable: false, info: "Percentage of visitors who made a purchase" },
    { key: 'revenuePerVisitor', title: 'Revenue per visitor', value: '$0', previousValue: 0, color: '#f59e0b', active: false, selectable: false, info: "Average revenue generated per visitor" },
    { key: 'bounceRate', title: 'Bounce rate', value: '0', previousValue: 0, unit: '%', color: '#ef4444', active: false, selectable: false, info: "Percentage of visitors who left after viewing only one page" },
    { key: 'timeOnPage', title: 'Time on page', value: '0m 0s', previousValue: 0, color: '#8b5cf6', active: false, selectable: false, info: "Average time spent on the site per visit" },
  ]);
  const [currentData, setCurrentData] = useState<DataPoint[]>([]);
  const [compareData, setCompareData] = useState<DataPoint[]>([]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const days = differenceInDays(dateRange.to, dateRange.from) + 1;
      const compareFrom = subDays(dateRange.from, days);
      const compareTo = subDays(dateRange.from, 1);

      const newCurrentData = generateRandomData(dateRange.from, dateRange.to);
      const newCompareData = generateRandomData(compareFrom, compareTo);

      setCurrentData(newCurrentData);
      setCompareData(newCompareData);

      const currentMetrics = calculateMetrics(newCurrentData);
      const previousMetrics = calculateMetrics(newCompareData);

      setMetrics(prevMetrics => prevMetrics.map(metric => ({
        ...metric,
        value: formatMetricValue(metric.key, currentMetrics[metric.key]),
        previousValue: previousMetrics[metric.key],
      })));
    }
  }, [dateRange]);

  const calculateMetrics = (data: DataPoint[]) => ({
    visitors: data.reduce((sum, d) => sum + d.visitors, 0),
    revenue: data[data.length - 1]?.cumulativeRevenue || 0,
    conversionRate: data.length > 0
      ? (data[data.length - 1].cumulativeRevenue / data.reduce((sum, d) => sum + d.visitors, 0) * 100) || 0
      : 0,
    revenuePerVisitor: data.length > 0
      ? (data[data.length - 1].cumulativeRevenue / data.reduce((sum, d) => sum + d.visitors, 0)) || 0
      : 0,
    bounceRate: Math.random() * 100, // Placeholder calculation
    timeOnPage: Math.floor(Math.random() * 180) + 60, // Placeholder calculation in seconds
  });

  const formatMetricValue = (key: Metric['key'], value: number): string => {
    switch (key) {
      case 'visitors':
        return value.toLocaleString();
      case 'revenue':
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'conversionRate':
      case 'bounceRate':
        return value.toFixed(1) + '%';
      case 'revenuePerVisitor':
        return `$${value.toFixed(2)}`;
      case 'timeOnPage':
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        return `${minutes}m ${seconds}s`;
      default:
        return value.toString();
    }
  };

  const toggleMetric = (key: Metric['key']) => {
    setMetrics(prevMetrics =>
      prevMetrics.map(metric =>
        metric.key === key && metric.selectable ? { ...metric, active: !metric.active } : metric
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[300px] justify-start text-left font-normal bg-white dark:bg-gray-800">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className="bg-white dark:bg-gray-800"
              />
            </PopoverContent>
          </Popover>
          <ThemeToggle />
        </div>
      </div>

      <Card className="mb-6 bg-white dark:bg-gray-800">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {metrics.map((metric) => (
              <MetricCard
                {...metric}
                key={metric.key}
                onClick={metric.selectable ? () => toggleMetric(metric.key) : undefined}
              />
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">Visitors over revenue</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">See how visitors count influenced your cumulative revenue over time.</p>
          </div>

          <div className="h-[450px] bg-white dark:bg-gray-800 p-4 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData} margin={{ top: 20, right: 50, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickMargin={10}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#9CA3AF"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickFormatter={(value) => `${value}`}
                  tickMargin={10}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#9CA3AF"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickFormatter={(value) => `$${value}`}
                  tickMargin={10}
                />
                {metrics.filter(m => m.active && m.selectable).map((metric) => (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key === 'revenue' ? 'cumulativeRevenue' : metric.key}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={false}
                    yAxisId={metric.key === 'revenue' ? 'right' : 'left'}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-end mt-4 space-x-4">
            {metrics.filter(m => m.selectable).map((metric) => (
              <label key={metric.key} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded text-blue-600 dark:text-blue-400"
                  checked={metric.active}
                  onChange={() => toggleMetric(metric.key)}
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300" style={{ color: metric.color }}>
                  {metric.title}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;