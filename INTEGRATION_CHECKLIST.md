# 集成检查清单

- [ ] 删除 `server.ts` 中 Gemini SDK、Key rotation 与串行模型重试。
- [ ] 删除 `api/index.ts` 中重复 Gemini 调用。
- [ ] 挂载统一 `analyzeGridRouter`。
- [ ] `.env` 使用 `AI_PROVIDER/AI_API_KEY/AI_BASE_URL/AI_MODEL`。
- [ ] 成功分析不再触发 59 秒 cooldown；仅 429 做限流提示。
- [ ] 前端使用 AbortController；旧请求不能覆盖新图片。
- [ ] 视觉图片最长边由 400px 提升到约 1600px，JPEG 质量约 0.9。
- [ ] `systemNameKo` 迁移为 `systemName` 且兼容旧历史。
- [ ] 模型不返回 UI 开关与 `candidateGrids`。
- [ ] Auto-Snap 移除 `Math.max(95, autoSnapScore)`。
- [ ] 缓存 Key 包含 provider / model / promptVersion / schemaVersion。
- [ ] 前端 Bundle 不包含 API Key。
