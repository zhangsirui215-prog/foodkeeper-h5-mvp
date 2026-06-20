# Tasks

- [ ] Task 1: 扩展数据常量与状态计算：在 `js/data/index.js` 中新增 `CATEGORIES` 与 `UNIT_OPTIONS` 常量；在 `js/ingredients.js` 中实现 `calcStatus(remainingDays)` 与 `calcRemainingDays(purchaseDate, shelfLife)` 纯函数
  - [ ] SubTask 1.1: 在 `data/index.js` 末尾添加 `CATEGORIES = ['肉类', '蛋奶', '蔬菜', '水果', '其他']` 和 `UNIT_OPTIONS = ['个', 'g', 'kg', 'ml', 'L', '把', '盒', '袋']`
  - [ ] SubTask 1.2: 在 `ingredients.js` 添加 `calcRemainingDays(purchaseDateStr, shelfLifeDays)` 函数：返回 `shelfLifeDays - Math.floor((Date.now() - new Date(purchaseDateStr).getTime()) / 86400000)`
  - [ ] SubTask 1.3: 在 `ingredients.js` 添加 `calcStatus(remainingDays)`：根据规则返回 `'已过期' | '今日到期' | '临期' | '新鲜'`

- [ ] Task 2: 实现 CRUD 函数：在 `js/ingredients.js` 中实现 `addIngredient` / `updateIngredient` / `deleteIngredient` / `markConsumed` / `getIngredientById` / 筛选与搜索函数
  - [ ] SubTask 2.1: 实现 `addIngredient(payload)`：校验必填、查重、调用 `calcRemainingDays` 与 `calcStatus` 计算初始状态、生成 id（时间戳）、`writeJson` 保存、返回新食材
  - [ ] SubTask 2.2: 实现 `updateIngredient(id, patch)`：合并 patch 后重算 `status/days/wasteRisk`，保存
  - [ ] SubTask 2.3: 实现 `deleteIngredient(id)` 与 `getIngredientById(id)`
  - [ ] SubTask 2.4: 实现 `markConsumed(id)`：调用 `recordCarbonSaving(ingredient)` 后 `deleteIngredient(id)`
  - [ ] SubTask 2.5: 实现 `searchIngredients({ keyword, status, category })`：从 `ingredients()` 过滤后返回
  - [ ] SubTask 2.6: 导出全部新函数，并在 `app.js` 入口测试一次添加流程（开发态，提交前移除）

- [ ] Task 3: UI 渲染扩展：在 `js/ui.js` 中扩展 `renderLibrary()` 添加按钮、筛选条、搜索框；在 `renderIngredient()` 中加"点击打开详情"事件
  - [ ] SubTask 3.1: 在 `renderLibrary()` 顶部加入口按钮 `<button data-action="add-ingredient">+ 添加食材</button>` 与筛选/搜索区
  - [ ] SubTask 3.2: 实现 `renderIngredientForm(ingredient?)` 返回表单 HTML（名称/类别/数量/单位/保质期/购入日期）
  - [ ] SubTask 3.3: 实现 `renderIngredientDetail(ingredient)` 返回详情 HTML（完整字段 + 生命周期 + 编辑/消耗/删除按钮）
  - [ ] SubTask 3.4: 实现 `renderLibraryFilters(currentFilter)` 返回状态/类别筛选 HTML
  - [ ] SubTask 3.5: 调整 `renderIngredient()` 让整卡可点击（`data-open-ingredient`）

- [ ] Task 4: 事件绑定与状态管理：在 `js/ui.js` 中绑定新增/编辑/消耗/删除/筛选/搜索事件；使用 `js/state.js` 中已有的 `page` + 新增 `editingIngredientId` / `libraryFilter` / `libraryKeyword` 临时状态
  - [ ] SubTask 4.1: 在 `state.js` 引入 `editingIngredientId`, `libraryFilter`, `libraryKeyword` 默认值
  - [ ] SubTask 4.2: 在 `bindEvents()` 中处理 `data-action="add-ingredient" / "save-ingredient" / "edit-ingredient" / "consume-ingredient" / "delete-ingredient" / "filter-status" / "filter-category"`，以及 `data-input="library-search"` 防抖输入
  - [ ] SubTask 4.3: 详情/编辑复用模态：点击卡片 → 渲染详情；详情内"编辑"切换为表单；保存后关闭并重渲
  - [ ] SubTask 4.4: 各操作成功/失败调用 `showToast` 反馈

- [ ] Task 5: 样式与可访问性：在 `health-demo.css` 中添加录入表单、详情模态、筛选条样式；遵循现有视觉风格
  - [ ] SubTask 5.1: 添加 `.library-toolbar`、`.library-search`、`.filter-chips` 样式
  - [ ] SubTask 5.2: 添加 `.modal`、`.modal-mask`、`.ingredient-form` 样式（与现有 `.card` 风格一致）
  - [ ] SubTask 5.3: 添加空状态 `.empty-hint` 样式
  - [ ] SubTask 5.4: 移动端响应式校验（< 480px 宽度下表单纵向排列）

- [ ] Task 6: 集成测试与文档：手动验证全部场景；更新 README
  - [ ] SubTask 6.1: 浏览器中执行 5 条主流程：添加 → 编辑 → 消耗 → 筛选 → 搜索
  - [ ] SubTask 6.2: 验证 4 条异常路径：空字段、重复名称、数量≤0、保质期≤0
  - [ ] SubTask 6.3: 验证数据持久化（刷新后食材仍存在）
  - [ ] SubTask 6.4: 验证碳足迹联动（消耗后首页数值 + 徽章检查）
  - [ ] SubTask 6.5: 在 `README.md` 补充"食材录入与管理"章节
  - [ ] SubTask 6.6: 提交并推送到 main

# Task Dependencies

- [Task 2] 依赖 [Task 1]（数据操作需要 calcStatus/calcRemainingDays）
- [Task 3] 依赖 [Task 2]（UI 需要数据函数支持）
- [Task 4] 依赖 [Task 2, Task 3]（事件绑定需要函数与 HTML 渲染函数）
- [Task 5] 依赖 [Task 3, Task 4]（样式配合 UI）
- [Task 6] 依赖 [Task 1, Task 2, Task 3, Task 4, Task 5]