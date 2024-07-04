"use client"
import AnalyticsChart from "@/components/AnalyticsChart";
import Image from "next/image";
import { Chart } from '@/components/component/chart';

const mockData = {
  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
  traffic: [220, 180, 170, 190, 170, 160, 150, 140],
  revenue: [0, 200, 400, 600, 796, 796, 796, 796],
  visitors: '1.6k',
  totalRevenue: 796,
  revenuePerVisitor: 0.51,
  bounceRate: 69,
};

export default function Home() {
  return (
    <main className="flex w-full h-full justify-center items-center flex-col">
      <h1 className="text-3xl font-bold mb-6">Website Analytics</h1>
      <Chart />
    </main>
  );
}
