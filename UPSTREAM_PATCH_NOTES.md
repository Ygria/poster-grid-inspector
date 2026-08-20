# 原项目需要改动的位置

## `server.ts`
删除原 `/api/analyze-grid` 内的 Gemini prompt、GoogleGenAI 初始化、API Key rotation、modelsToTry 和 Gemini 专属错误文案；保留 history API 与 Vite/静态托管。添加：

```ts
import { analyzeGridRouter } from './server/routes/analyzeGrid.js';
app.use(analyzeGridRouter);
```

请确保旧 `/api/analyze-grid` route 已删除，否则 Express 会先命中旧路由。

## `api/index.ts`
使用本包提供的版本，让 Vercel 与本地共用 `server/routes/analyzeGrid.ts`。

## `src/App.tsx`
将直接 `fetch` 改为 `analyzeGrid()`，并在组件卸载/重新上传时调用 `cancelAnalyzeGrid()`。成功请求不要再无条件进入 59 秒 cooldown。

## `src/utils/imageUtils.ts`
原本地 Canvas 分析逻辑可保留；只把 `prepareImageForVisionApi` 替换为本包 `visionImage.ts` 的实现，或直接 re-export。

## `src/utils/gridOptimizer.ts`
至少修改：

```ts
fitScore: Math.max(95, autoSnapScore)
```

为：

```ts
fitScore: autoSnapScore
```

更推荐把评分函数替换成本包 `gridScoring.ts`。

## `src/types.ts`
把主字段改成 `systemName: string`；读取历史数据时兼容 `systemNameKo`。
