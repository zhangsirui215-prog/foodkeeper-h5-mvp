# 碳足迹厨房 - 创新功能与代码优化实施 Spec

## 为什么

当前 AI 食材管家 H5 MVP 功能完整但缺乏创新亮点和代码可维护性。本项目旨在：
1. 引入「碳足迹厨房」创新概念，通过环保叙事和数据可视化提升项目独特性
2. 执行前期分析中确定的代码优化项，提升代码质量和可维护性
3. 为所有函数添加 JSDoc 注释，增强代码可读性
4. 完善项目文档，使其适合作为个人作品集展示

## 变更范围

### 新增功能（碳足迹厨房）
- 碳足迹计算器：食材消耗时计算节省的 CO₂ 排放量
- 冰箱健康周报：Canvas 绘制可视化图表（消耗趋势、雷达图）
- 成就徽章系统：达成目标获得徽章，CSS 动画展示

### 代码优化（来自前期分析）
- 单 JS 文件模块化拆分（ES Module）
- Toast 提示组件与操作反馈
- PWA 增强（Manifest icons + Service Worker）
- 数据备份与恢复（导入/导出）
- 代码可读性优化（JSDoc 注释、魔数提取、命名统一）
- 删除未使用的函数（`saveElder()`）

### 文档完善
- README 增强：项目结构、运行说明、模块说明
- 变更记录保留

## 影响范围
- 影响页面：首页（Home）、食材库（Library）、设置（Settings）
- 影响文件：所有 JS/CSS/HTML/Manifest 文件
- 新增文件：JS 模块文件、sw.js、图标资源

## ADDED Requirements

### Requirement: 碳足迹计算器
系统 SHALL 记录用户处理临期食材时的碳足迹节省量，并在首页展示。

#### Scenario: 消耗临期食材触发碳足迹计算
- **WHEN** 用户标记一个临期食材为"已消耗"或食材被用于菜谱推荐
- **THEN** 系统根据食材类别计算节省的 CO₂ 克数，累加到总节省量，并显示进度动画

#### Scenario: 碳足迹数据持久化与展示
- **WHEN** 用户查看首页
- **THEN** 系统展示累计碳足迹节省量、进度条、以及"相当于种树 X 棵"的类比换算

### Requirement: 冰箱健康周报（Canvas 可视化）
系统 SHALL 在食材库页面提供基于 Canvas 的数据可视化图表。

#### Scenario: 查看冰箱健康图表
- **WHEN** 用户访问食材库页面
- **THEN** 系统用 Canvas 绘制本周食材消耗趋势图（条形图）和冰箱健康雷达图

### Requirement: 成就徽章系统
系统 SHALL 根据用户行为自动解锁成就徽章。

#### Scenario: 获得成就徽章
- **WHEN** 用户连续 7 天无浪费，或累计节省碳足迹达到 10000g
- **THEN** 系统弹出成就解锁通知，徽章以 CSS 动画展示在首页成就区域

### Requirement: Toast 提示系统
系统 SHALL 在所有用户操作后提供视觉反馈提示。

#### Scenario: 操作反馈
- **WHEN** 用户执行数据保存、同步、打卡等操作后
- **THEN** 系统在屏幕顶部显示 Toast 提示消息，2-3 秒后自动消失

### Requirement: PWA 离线支持
系统 SHALL 支持作为 PWA 安装到主屏幕并提供离线缓存。

- Manifest icons 填充为有效图标
- 添加 Service Worker（sw.js）实现 Cache-First 策略

### Requirement: 数据备份与恢复
系统 SHALL 在设置页提供一键导出/导入数据功能。

#### Scenario: 导出数据
- **WHEN** 用户在设置页点击"导出数据"
- **THEN** 系统将所有 localStorage 数据打包为 JSON 文件下载

#### Scenario: 导入数据
- **WHEN** 用户在设置页选择 JSON 文件上传
- **THEN** 系统解析文件并恢复所有 localStorage 数据，刷新页面

## MODIFIED Requirements

### Requirement: 代码架构 - 模块化拆分
**之前**：全部代码在 `health-demo.js` 单个文件中（~1000 行）
**之后**：拆分为 ES Module 架构：
```
/js/
  app.js          # 入口：渲染、页面切换
  store.js        # 数据读写、localStorage 操作
  data/           # 模拟数据（食材种子、菜谱、健康场景）
  ingredients.js  # 食材相关函数与碳足迹计算
  recipes.js      # 菜谱推荐、评分算法
  health.js       # 健康数据、运动同步
  family.js       # 家庭成员、老人关怀
  ui.js           # 渲染函数、事件绑定、Toast
  badges.js       # 成就徽章系统（新增）
  charts.js       # Canvas 图表可视化（新增）
```

**index.html**：引用 `<script type="module" src="./js/app.js">`

### Requirement: 代码注释规范
**之前**：无注释或极少注释
**之后**：每个函数添加 JSDoc 注释，标明：
- 函数作用描述
- @param 参数说明
- @returns 返回值说明

### Requirement: 代码可读性优化
**之前**：魔数散落各处，命名风格不统一
**之后**：
- 提取有意义的常量（如 `const WASTE_RISK_HIGH = 25`）
- 统一函数命名风格（camelCase）
- 删除未使用的 `saveElder()` 函数

### Requirement: README 文档
**之前**：仅含部署说明
**之后**：包含项目概述、目录结构、功能模块说明、本地运行方式、技术栈

## 推荐实施顺序

1. **Step 1**：模块化拆分 —— 重构代码结构为 ES Module，添加 JSDoc 注释（基础架构）
2. **Step 2**：Toast 提示系统 —— 添加操作反馈（并行）
3. **Step 3**：碳足迹计算器 —— 核心创新功能（依赖 Step 1）
4. **Step 4**：成就徽章系统 —— 游戏化激励（并行）
5. **Step 5**：冰箱健康周报 —— Canvas 可视化（并行）
6. **Step 6**：PWA 增强 —— Manifest + Service Worker（并行）
7. **Step 7**：数据备份与恢复 —— 导入/导出功能（并行）
8. **Step 8**：README 完善 —— 项目文档
9. **Step 9**：功能测试与验证 —— 完整回归测试