"use client"

import AnalyticsDashboard from "@/components/component/chart";
import { useState } from "react";

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


export default function Home() {

  return (
    <main className="flex w-full h-full justify-center items-center flex-col">
      <h1 className="text-3xl font-bold mb-6">Website Analytics</h1>
      <AnalyticsDashboard />
    </main>
  );
}
