# FoodKeeper H5 MVP - PR #1 整合版发布说明

## 本次整合

- 已将 SaulShen 的 PR #1 模块化版本整合到原 HTTP demo。
- 原单文件 demo 升级为 ES Module 架构，新增 `js/` 模块目录。
- 保留原有食材管理、HealthKit 模拟、家庭成员、老人关怀、买菜需求、餐食打卡等功能。
- 合入 PR #1 的食材录入、编辑、搜索、筛选、消耗食材、碳足迹、成就徽章、PWA、测试脚本等能力。

## 本次产品调整

- `碳足迹厨房` 完整模块已移动到 `我的` 页面。
- `成就徽章` 完整模块已移动到 `我的` 页面。
- 首页仅保留两个 icon 入口：`🌍` 与 `🏅`，点击后进入 `我的` 查看完整内容。

## 验证

- `health-demo.js`、`js/` 下所有模块、`sw.js` 均通过 JavaScript 语法检查。
- `manifest.webmanifest` 已通过 JSON 解析检查。
- `test_calc_logic.js` 14 项逻辑测试全部通过。
