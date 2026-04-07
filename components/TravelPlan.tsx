'use client';

import { TravelData } from '@/app/page';

type Props = {
  data: TravelData;
  onReset: () => void;
};

export default function TravelPlan({ data, onReset }: Props) {
  return (
    <div className="space-y-6">
      {/* Destination hero */}
      <div className="bg-gradient-to-r from-sky-400 to-emerald-400 rounded-2xl p-8 text-white">
        <p className="text-sky-100 text-sm mb-1">为你推荐的目的地</p>
        <h2 className="text-3xl font-bold mb-2">{data.destination ?? '正在推荐中…'}</h2>
        <p className="text-sky-100">
          {data.days}天 · {data.domestic ? '国内' : '国外'} · {data.preference} · {data.budget}
        </p>
      </div>

      {/* Itinerary */}
      {data.itinerary && data.itinerary.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🗺️ 行程规划</h3>
          <div className="space-y-4">
            {data.itinerary.map((day) => (
              <div key={day.day} className="border-l-4 border-sky-300 pl-4">
                <p className="font-semibold text-sky-600 mb-2">Day {day.day}</p>
                <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                  <div className="flex gap-2">
                    <span className="text-yellow-500">🌅</span>
                    <span><strong>上午：</strong>{day.morning}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-orange-400">🍜</span>
                    <span><strong>午餐：</strong>{day.lunch}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-400">🎒</span>
                    <span><strong>下午：</strong>{day.afternoon}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-purple-400">🍽️</span>
                    <span><strong>晚餐：</strong>{day.dinner}</span>
                  </div>
                  {day.note && (
                    <div className="flex gap-2 mt-1 bg-amber-50 rounded-lg px-3 py-2">
                      <span>💡</span>
                      <span className="text-amber-700 text-xs">{day.note}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guides */}
      {data.guides && data.guides.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📖 相关攻略</h3>
          <div className="space-y-3">
            {data.guides.map((g, i) => (
              <a
                key={i}
                href={g.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl border border-gray-100 hover:border-sky-200 hover:bg-sky-50 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm leading-snug mb-1">{g.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{g.snippet}</p>
                  </div>
                  <span className="text-xs text-sky-500 whitespace-nowrap bg-sky-50 px-2 py-1 rounded-full border border-sky-100">
                    {g.source}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-all"
      >
        重新规划 🔄
      </button>
    </div>
  );
}
