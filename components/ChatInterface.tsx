'use client';

import { useState } from 'react';
import { TravelData } from '@/app/page';

type Step = {
  id: string;
  question: string;
  options?: string[];
  inputType?: 'number' | 'text' | 'select';
  placeholder?: string;
};

const STEPS: Step[] = [
  {
    id: 'days',
    question: '你有几天假？🗓️',
    options: ['2天（周末）', '3天（小长假）', '5天', '7天以上'],
    inputType: 'select',
  },
  {
    id: 'domestic',
    question: '想去国内还是国外？✈️',
    options: ['国内', '国外'],
    inputType: 'select',
  },
  {
    id: 'preference',
    question: '喜欢什么类型的目的地？🏖️',
    options: ['看海', '看山', '逛城市', '随便，给我推荐'],
    inputType: 'select',
  },
  {
    id: 'budget',
    question: '人均预算大概多少？💰',
    options: ['1000以内', '1000-3000', '3000-6000', '6000+，不差钱'],
    inputType: 'select',
  },
];

type Props = {
  onComplete: (data: TravelData) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
};

export default function ChatInterface({ onComplete, loading, setLoading }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: '你好！我是你的懒人旅行助手 🌴 只需要回答几个问题，我来帮你搞定整个假期攻略！' },
    { role: 'ai', text: STEPS[0].question },
  ]);

  const handleOption = async (option: string) => {
    const step = STEPS[currentStep];
    const newAnswers = { ...answers, [step.id]: option };
    setAnswers(newAnswers);

    const newMessages = [...messages, { role: 'user' as const, text: option }];

    if (currentStep < STEPS.length - 1) {
      const next = STEPS[currentStep + 1];
      newMessages.push({ role: 'ai', text: next.question });
      setMessages(newMessages);
      setCurrentStep(currentStep + 1);
    } else {
      // 所有问题回答完，开始生成攻略
      newMessages.push({ role: 'ai', text: '好的！正在为你生成专属攻略，稍等片刻～ 🔍' });
      setMessages(newMessages);
      setLoading(true);

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAnswers),
        });
        const data = await res.json();
        onComplete({ ...parseTravelData(newAnswers), ...data });
      } catch (e) {
        setMessages([...newMessages, { role: 'ai', text: '出了点小问题，请刷新重试 😅' }]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Chat messages */}
      <div className="p-6 space-y-4 min-h-64">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sky-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-700 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      {!loading && currentStep < STEPS.length && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-2">
            {STEPS[currentStep].options?.map((opt) => (
              <button
                key={opt}
                onClick={() => handleOption(opt)}
                className="px-4 py-3 rounded-xl border border-sky-200 text-sky-700 text-sm font-medium hover:bg-sky-50 hover:border-sky-400 transition-all active:scale-95"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function parseTravelData(answers: Record<string, string>): TravelData {
  const daysMap: Record<string, number> = {
    '2天（周末）': 2,
    '3天（小长假）': 3,
    '5天': 5,
    '7天以上': 7,
  };
  return {
    days: daysMap[answers.days] ?? 3,
    domestic: answers.domestic === '国内',
    preference: answers.preference,
    budget: answers.budget,
  };
}
