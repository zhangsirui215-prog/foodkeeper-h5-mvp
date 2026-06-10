# 任务列表

## Task 1: 模块化拆分与代码注释
- [x] Task 1.1: 创建 `/js/` 目录结构，将代码拆分为 ES Module 文件
  - [x] 创建 `js/store.js`：数据读写、localStorage 操作，添加 JSDoc 注释
  - [x] 创建 `js/data/index.js`：模拟数据（食材种子、菜谱、健康场景）
  - [x] 创建 `js/ingredients.js`：食材相关函数，添加 JSDoc 注释，提取魔数为常量
  - [x] 创建 `js/recipes.js`：菜谱推荐、评分算法，添加 JSDoc 注释
  - [x] 创建 `js/health.js`：健康数据、运动同步，添加 JSDoc 注释
  - [x] 创建 `js/family.js`：家庭成员、老人关怀，添加 JSDoc 注释
  - [x] 创建 `js/ui.js`：渲染函数、事件绑定，添加 JSDoc 注释
  - [x] 创建 `js/app.js`：入口文件（render、页面切换）
  - [x] 删除未使用的 `saveElder()` 函数
  - [x] 统一所有函数命名风格为 camelCase
- [x] Task 1.2: 修改 `index.html` 引用 `<script type="module" src="./js/app.js">`

## Task 2: Toast 提示系统
- [x] Task 2.1: 在 `ui.js` 中添加 `showToast(message, type)` 函数
  - [x] 支持 `success`、`warning`、`error`、`info` 四种类型
  - [x] 2-3 秒自动消失
  - [x] 入场/离场动画
- [x] Task 2.2: 在 `health-demo.css` 中添加 Toast 样式
- [x] Task 2.3: 在所有用户操作位置调用 Toast（数据保存、同步、打卡等）

## Task 3: 碳足迹计算器
- [x] Task 3.1: 在 `ingredients.js` 中添加碳足迹数据模型与计算逻辑
  - [x] 定义食材类别碳足迹基准（g CO₂）
  - [x] 实现 `calcCarbonSaved(ingredient)` 函数
  - [x] 实现 `getCarbonData()` / `saveCarbonData(data)` 持久化
  - [x] 实现"相当于种树 X 棵"的类比换算逻辑
- [x] Task 3.2: 在首页添加碳足迹展示区域
  - [x] 累计节省量数字显示
  - [x] 进度条动画
  - [x] 类比换算文案（相当于种树、减少开车等）

## Task 4: 成就徽章系统
- [x] Task 4.1: 创建 `js/badges.js`
  - [x] 定义徽章列表（首次消耗、零浪费周、碳足迹里程碑等）
  - [x] 实现 `checkBadges(carbonData)` 检查逻辑
  - [x] 实现 `getBadges()` / `saveBadges(data)` 持久化
- [x] Task 4.2: 在首页添加成就展示区域
  - [x] 已解锁徽章展示（CSS 动画效果）
  - [x] 新徽章解锁时的弹出通知

## Task 5: 冰箱健康周报（Canvas 可视化）
- [x] Task 5.1: 创建 `js/charts.js`
  - [x] 实现 `drawConsumptionChart(canvas, data)`：消耗趋势条形图
  - [x] 实现 `drawFridgeRadar(canvas, data)`：冰箱健康雷达图
- [x] Task 5.2: 在食材库页面添加图表展示区域

## Task 6: PWA 增强
- [x] Task 6.1: 生成 PWA 图标资源（SVG/内联图标）
- [x] Task 6.2: 更新 `manifest.webmanifest` 的 icons 字段
- [x] Task 6.3: 创建 `sw.js`（Service Worker），Cache-First 策略缓存静态资源
- [x] Task 6.4: 在 `index.html` 中注册 Service Worker

## Task 7: 数据备份与恢复
- [x] Task 7.1: 在 `store.js` 中添加 `exportData()` 函数（JSON 文件下载）
- [x] Task 7.2: 在 `store.js` 中添加 `importData(file)` 函数（文件上传解析）
- [x] Task 7.3: 在设置页添加"导出数据"和"导入数据"按钮及交互

## Task 8: README 完善
- [x] Task 8.1: 重写 README.md，包含项目概述、目录结构、功能模块说明
- [x] Task 8.2: 添加本地运行方式、技术栈、作品集亮点说明

## Task 9: 功能测试与验证
- [x] Task 9.1: 测试所有页面切换与渲染功能正常
- [x] Task 9.2: 测试碳足迹计算与展示逻辑正确
- [x] Task 9.3: 测试成就徽章解锁条件与展示
- [x] Task 9.4: 测试 Canvas 图表渲染
- [x] Task 9.5: 测试 Toast 提示显示与消失
- [x] Task 9.6: 测试 PWA 离线缓存与安装
- [x] Task 9.7: 测试数据导出/导入功能
- [x] Task 9.8: 测试操作反馈覆盖所有用户交互点

# 任务依赖关系
- Task 1 是 Task 2~7 的前提（模块化拆分后才能在各模块中添加功能）
- Task 3、4、5 可并行实施（依赖 Task 1，互不依赖）
- Task 6、7 可并行实施（依赖 Task 1，互不依赖）
- Task 8 不依赖其他任务，可随时进行
- Task 9 依赖所有 Task 完成