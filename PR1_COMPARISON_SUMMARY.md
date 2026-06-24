# PR #1 SaulShen 对比版说明

## 来源

- GitHub PR: `zhangsirui215-prog/foodkeeper-h5-mvp#1`
- PR head SHA: `22d5843a1659ec731fe3be44880ca1f860b9dbfe`
- 作者: `SaulShen`
- 主要更新时间: 2026-06-20

## 主要变化

- 将原有单文件前端逻辑拆分为 `js/` 目录下的 ES Module 架构。
- 新增食材录入、编辑、搜索、分类筛选、状态筛选、消耗食材能力。
- 新增碳足迹厨房能力：消耗食材后计算 CO2 节省量，并在首页展示。
- 新增成就徽章系统和冰箱健康图表。
- 新增 PWA 图标、manifest、Service Worker 离线缓存。
- 新增 GitHub Pages 自动部署 workflow。
- 新增逻辑测试和 Playwright E2E 测试脚本。

## 本地对比版修正

为了让对比版更适合本地和 GitHub Pages 子路径预览，本地版本做了以下轻微修正：

- 将 `index.html` 标题改为 `AI 食材管家 H5 MVP - PR #1 对比版`。
- 将 `manifest.webmanifest` 的 `start_url` 和图标路径改为相对路径。
- 将 `sw.js` 的预缓存路径改为相对路径。

## 已验证

- 所有 JS 文件通过 `node --check` 语法检查。
- `manifest.webmanifest` 通过 JSON 解析检查。
- `test_calc_logic.js` 通过，14 项逻辑测试全部成功。
- 本地 HTTP 预览地址返回 200。
