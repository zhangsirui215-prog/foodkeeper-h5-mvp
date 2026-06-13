# 食材录入与编辑功能 Spec

## Why

当前 AI 食材管家 H5 MVP 在重构后**缺失了食材录入界面**：用户只能查看预设的 12 条模拟食材（`ingredientsSeed`），没有"手动添加食材"按钮、食材详情查看/编辑、消耗记录、列表筛选/搜索等基础功能。这是日常使用中最频繁的操作路径，必须恢复并增强。

## What Changes

- **食材录入**：在"我的食材库"页提供"添加食材"入口，支持手动录入名称、类别（肉类/蛋奶/蔬菜/水果/其他）、数量与单位、保鲜期天数、购入日期
- **食材详情与编辑**：点击食材卡片打开详情面板，可修改数量/单位/状态/保质期，可标记为"已消耗"（自动触发碳足迹记录）
- **食材库筛选与搜索**：按状态（全部/临期/今日到期/已过期/新鲜）、类别、关键字搜索
- **数据完整性校验**：必填字段校验、数量与天数合法性、避免重复名称
- **Toast 反馈**：添加/编辑/删除/消耗时调用现有 Toast 系统提示

## Impact

- Affected specs: `carbon-footprint-innovation`（消耗触发碳足迹）、`optimization-analysis`
- Affected code:
  - `js/ingredients.js`：新增 `addIngredient / updateIngredient / deleteIngredient / markConsumed / getIngredientById` 等数据操作函数 + 筛选/搜索函数
  - `js/ui.js`：扩展 `renderLibrary()` 加入口按钮、详情模态、筛选/搜索 UI、事件绑定
  - `js/data/index.js`：`CATEGORIES` 常量、`UNIT_OPTIONS` 常量（如需）
  - `health-demo.css`：录入表单、详情模态、筛选条样式
  - `index.html`：无变化（单页 SPA）
  - `README.md`：补充录入/编辑/筛选的使用说明

## ADDED Requirements

### Requirement: 手动添加食材

The system SHALL provide a form to manually add a new ingredient to the inventory.

#### Scenario: 成功添加
- **WHEN** 用户在食材库页点击"+ 添加食材"按钮，填写名称/类别/数量/单位/保质期/购入日期，点击保存
- **THEN** 新食材立即出现在食材库列表顶部，状态根据保质期自动计算（新鲜/临期/今日到期），并显示成功 Toast

#### Scenario: 表单校验
- **WHEN** 用户必填字段为空或数量 ≤ 0 或保质期 ≤ 0
- **THEN** 系统阻止保存并显示错误 Toast，定位到第一个错误字段

#### Scenario: 重复名称
- **WHEN** 用户输入的名称已存在（不区分大小写）
- **THEN** 系统阻止保存并显示"食材已存在"错误 Toast

### Requirement: 食材详情与编辑

The system SHALL allow viewing and editing details of any existing ingredient.

#### Scenario: 查看详情
- **WHEN** 用户点击食材卡片
- **THEN** 弹出详情面板显示完整字段、生命周期步骤、备注（如有）

#### Scenario: 编辑保存
- **WHEN** 用户在详情面板修改字段并点击"保存"
- **THEN** 食材列表立即更新，状态根据新保质期重算，显示成功 Toast

#### Scenario: 标记已消耗
- **WHEN** 用户点击"标记为已消耗"按钮
- **THEN** 食材从库中移除，触发碳足迹记录（`recordCarbonSaving`），并显示"已记录碳足迹节省"Toast

#### Scenario: 删除食材
- **WHEN** 用户点击"删除"并确认
- **THEN** 食材从库中移除，显示删除 Toast

### Requirement: 食材库筛选与搜索

The system SHALL provide status/category filters and a keyword search box on the library page.

#### Scenario: 状态筛选
- **WHEN** 用户点击"临期"筛选标签
- **THEN** 列表仅显示状态为临期/今日到期的食材，并显示空状态文案

#### Scenario: 类别筛选
- **WHEN** 用户从下拉选择"蔬菜"
- **THEN** 列表仅显示类别为蔬菜的食材

#### Scenario: 关键字搜索
- **WHEN** 用户在搜索框输入"鸡"
- **THEN** 列表仅显示名称包含"鸡"的食材（不区分大小写）

#### Scenario: 组合筛选
- **WHEN** 用户同时应用状态筛选和搜索
- **THEN** 列表取交集筛选结果

### Requirement: 状态自动重算

The system SHALL automatically recalculate ingredient status based on purchase date and shelf life when adding or editing.

#### Scenario: 状态计算规则
- 剩余天数 = 保质期 − (今天 − 购入日期)
- **WHEN** 剩余天数 < 0 → 状态 = "已过期"
- **WHEN** 剩余天数 = 0 → 状态 = "今日到期"
- **WHEN** 0 < 剩余天数 ≤ 3 → 状态 = "临期"
- **WHEN** 剩余天数 > 3 → 状态 = "新鲜"

### Requirement: 与碳足迹集成

The system SHALL automatically record carbon savings when an ingredient is marked consumed.

#### Scenario: 消耗触发碳足迹
- **WHEN** 用户标记食材为已消耗
- **THEN** `recordCarbonSaving(ingredient)` 被调用，碳足迹数据 + 该食材类别基准值
- **THEN** 首页碳足迹区数据 + 相应克数
- **THEN** 检查并解锁相关徽章