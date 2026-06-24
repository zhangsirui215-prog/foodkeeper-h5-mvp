# FoodKeeper H5 MVP 发布汇总 - 2026-06-23

## 本次同步结果

- 已从 GitHub 仓库 `zhangsirui215-prog/foodkeeper-h5-mvp` 拉取 `main` 分支最新内容。
- 远端核心 demo 文件 `index.html`、`health-demo.js`、`health-demo.css`、`manifest.webmanifest` 与本地 HTTP demo 当前版本一致。
- 已将远端 `README.md` 和 `DEPLOY.md` 同步到本地发布版本，补齐 GitHub Pages 部署说明。

## 当前版本能力

- 食材库存、临期/过期提醒、模拟 OCR 包装食品识别。
- 首页区分临期食品提醒与运动后食物推荐。
- iWatch / HealthKit 授权与运动数据同步模拟。
- 菜谱分类与饮食偏好筛选。
- 运动后补给建议、采购建议、食材替代建议。
- 家庭成员管理，支持老人、健身、减脂、控糖等标签。
- 老人冰箱健康监控、老人友好菜谱、买菜需求模拟与人工编辑。
- 餐食打卡模拟 OCR，同步给老人和主要用户查看。

## 发布方式

将本版本包中的文件上传到 GitHub 仓库根目录后，在 `Settings` -> `Pages` 中选择 `Deploy from a branch`，分支选择 `main`，目录选择 `/root`。
