'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import TravelPlan from '@/components/TravelPlan';

export type TravelData = {
  days: number;
  domestic: boolean;
  preference: string; // 海/山/城市/随意
  budget: string;
  destination?: string;
  itinerary?: DayPlan[];
  guides?: Guide[];
};

export type DayPlan = {
  day: number;
  morning: string;
  lunch: string;
  afternoon: string;
  dinner: string;
  note?: string;
};

export type Guide = {
  title: string;
  url: string;
  snippet: string;
  source: string;
};

export default function Home() {
  const [travelData, setTravelData] = useState<TravelData | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🌴 懒人攻略</h1>
          <p className="text-gray-500 text-lg">告诉我你有几天假，其余交给我</p>
        </div>

        {!travelData ? (
          <ChatInterface onComplete={setTravelData} loading={loading} setLoading={setLoading} />
        ) : (
          <TravelPlan data={travelData} onReset={() => setTravelData(null)} />
        )}
      </div>
    </main>
  );
}
