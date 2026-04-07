# 🌴 懒人攻略

> 告诉我你有几天假，其余交给我

P人 / 懒人专属旅行攻略生成器。只需回答 4 个问题，AI 自动生成完整行程 + 每日吃喝玩乐推荐 + 精选攻略文章。

## 功能

- 🗓️ 假期天数选择
- 🌏 国内/国外目的地推荐
- 📅 Day by Day 行程规划（P人友好，不赶场）
- 🍜 每日餐厅推荐（注明是否需要预订）
- 📖 精选攻略（来自小红书等高质量内容）

## 本地运行

```bash
npm install
cp .env.local.example .env.local  # 填入 API Key
npm run dev
```

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `AI_API_KEY` | OpenAI 兼容 API Key | 是（没有则用 Mock 数据） |
| `AI_API_BASE` | API Base URL | 否，默认 OpenAI |
| `AI_MODEL` | 模型名称 | 否，默认 gpt-4o-mini |
| `BRAVE_API_KEY` | Brave Search API Key（攻略搜索）| 否 |

## 部署到 Vercel

1. 把代码推到 GitHub
2. 在 [vercel.com](https://vercel.com) 导入仓库
3. 在 Vercel 控制台填入环境变量
4. 部署完成，获得公网 URL
