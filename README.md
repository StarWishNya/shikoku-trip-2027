# 去看海的那年夏天 PRO · 四国与濑户内海 2027

2027-06-10 → 06-23，香港 ⇄ 高松 / 广岛 14 天四国一周行程网站（加密版）。

- 分钟级行程：每站附班次、时刻与票价，标出相对原版新增的「加密」内容
- 16 处军事博物馆与遗迹（大和博物馆、铁鲸馆、江田岛旧海军兵学校、大久野岛、乃木馆等）
- 11 部动漫巡礼作品与机位建议
- 每天的日出 / 日落 / 黄金时刻 / 满潮 / 干潮面板与 14 天总表
- Leaflet 交互地图（暗色 / 浅色 / OSM / 卫星底图），分类与日期筛选，Google 地图预览与导航
- 出发清单（本地保存）、复制、分享、打印

## 技术栈

Vite + React 19 + TypeScript + Tailwind CSS v4 + Leaflet + lucide-react。纯静态站点，无需后端与 API Key。

## 本地运行

```bash
npm install
npm run dev      # http://localhost:43178
npm run build    # 输出到 dist/
```

## 部署到 Cloudflare Pages

```bash
npm run deploy   # = build + wrangler pages deploy dist --project-name shikoku-trip-2027
```

需要 `CLOUDFLARE_API_TOKEN`（含 Cloudflare Pages: Edit 权限）与 `CLOUDFLARE_ACCOUNT_ID` 环境变量，或先 `npx wrangler login`。

## 数据说明

- 交通时刻为参考班次，2027 年时刻改正后请以 JR 四国 / JR 西日本与各船公司官网为准。
- 潮汐为调和常数模型推算，出行前用日本气象厅潮位表复核。
- 数据文件位于 `src/data/`：`itineraryData.ts`（行程、点位、巡礼）、`militaryData.ts`、`tideAndSunData.ts`。
