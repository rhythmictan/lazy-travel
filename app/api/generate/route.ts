import { NextRequest, NextResponse } from 'next/server';

const DAYS_MAP: Record<string, number> = {
  '2天（周末）': 2,
  '3天（小长假）': 3,
  '5天': 5,
  '7天以上': 7,
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { days: daysStr, domestic, preference, budget } = body;

  const days = DAYS_MAP[daysStr] ?? 3;
  const isDomestic = domestic === '国内';

  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  const apiBase = process.env.AI_API_BASE || 'https://api.openai.com/v1';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    // 返回 mock 数据供本地预览
    return NextResponse.json(mockData(days, isDomestic, preference));
  }

  const prompt = buildPrompt({ days, isDomestic, preference, budget });

  try {
    const res = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              '你是一个专业的旅行规划师，擅长为懒人和P人制定详细、接地气的旅行攻略。回复必须是合法的JSON格式。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    });

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    // 搜索攻略
    const guides = await searchGuides(parsed.destination, process.env.BRAVE_API_KEY);

    return NextResponse.json({ ...parsed, guides });
  } catch (e) {
    console.error(e);
    return NextResponse.json(mockData(days, isDomestic, preference));
  }
}

function buildPrompt(params: {
  days: number;
  isDomestic: boolean;
  preference: string;
  budget: string;
}) {
  const { days, isDomestic, preference, budget } = params;
  const prefMap: Record<string, string> = {
    看海: '海边/海岛',
    看山: '山地/自然风光',
    逛城市: '城市文化/美食',
    '随便，给我推荐': '综合推荐',
  };
  const budgetNote = budget === '6000+，不差钱' ? '预算充足' : `人均预算${budget}`;

  return `
请为用户规划一次 ${days} 天的 ${isDomestic ? '国内' : '国外'} 旅行。
偏好：${prefMap[preference] || preference}
${budgetNote}

请返回以下 JSON 格式（严格遵守）：
{
  "destination": "推荐目的地名称（城市或地区，一个即可）",
  "destinationDesc": "一句话描述这个目的地的特色（30字以内）",
  "itinerary": [
    {
      "day": 1,
      "morning": "上午活动建议（具体景点或活动，30字以内）",
      "lunch": "午餐推荐（餐厅类型或菜系，注明是否需要提前预订，30字以内）",
      "afternoon": "下午活动建议（30字以内）",
      "dinner": "晚餐推荐（注明是否需要提前预订，30字以内）",
      "note": "当天温馨提示或注意事项（30字以内，可选）"
    }
    // ... 共 ${days} 天
  ]
}

要求：
- 行程要实际可行，交通时间要合理
- 餐厅推荐要接地气，说明是否需要提前预订
- 注意考虑预算限制
- 每天行程节奏不要太赶，P人友好
`;
}

async function searchGuides(destination: string, braveKey?: string) {
  if (!braveKey || !destination) return [];

  try {
    const query = encodeURIComponent(`${destination} 旅游攻略 site:xiaohongshu.com OR 小红书`);
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${query}&count=5&search_lang=zh`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': braveKey,
        },
      }
    );
    const data = await res.json();
    return (data.web?.results || []).slice(0, 4).map((r: any) => ({
      title: r.title,
      url: r.url,
      snippet: r.description,
      source: '小红书',
    }));
  } catch {
    return [];
  }
}

function mockData(days: number, isDomestic: boolean, preference: string) {
  const dest = isDomestic
    ? preference.includes('海') ? '三亚' : preference.includes('山') ? '黄山' : '成都'
    : preference.includes('海') ? '巴厘岛' : '东京';

  return {
    destination: dest,
    destinationDesc: `${dest}是${isDomestic ? '国内' : '国外'}最受欢迎的旅游目的地之一`,
    itinerary: Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      morning: i === 0 ? '抵达目的地，入住酒店，附近散步熟悉环境' : `游览${dest}核心景区`,
      lunch: i === 0 ? '酒店附近找家本地小馆，试试当地特色菜' : `${dest}人气餐厅，建议提前预订`,
      afternoon: i === days - 1 ? '下午整理行李，准备返程' : '下午自由活动，逛逛当地市集',
      dinner: i === days - 1 ? '机场/高铁站附近解决' : '当地夜市，随便走随便吃，最好玩',
      note: i === 0 ? '第一天不要排太满，先感受一下城市氛围' : i === days - 1 ? '提前确认回程交通，预留充足时间' : undefined,
    })),
    guides: [
      {
        title: `${dest}旅游攻略 | 本地人推荐必吃必玩清单`,
        url: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(dest + '攻略')}`,
        snippet: `${dest}最全旅游攻略，包含景点推荐、美食地图、住宿建议，适合第一次去的朋友`,
        source: '小红书',
      },
      {
        title: `${days}天${dest}行程规划，这样玩最划算`,
        url: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(dest + days + '天')}`,
        snippet: `${days}天时间去${dest}怎么玩？当地博主手把手带你规划，附详细交通攻略`,
        source: '小红书',
      },
    ],
  };
}
