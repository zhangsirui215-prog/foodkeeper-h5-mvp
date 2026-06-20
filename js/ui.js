import { healthScenarios, preferenceFilters, substitutions, CATEGORIES, UNIT_OPTIONS } from './data/index.js';
import { store, readJson, writeJson, exportData, importData } from './store.js';
import {
  expiringItems,
  ingredients,
  availableNames,
  fridgeHealthIndex,
  wastePredictions,
  lifecycleSteps,
  statusClass,
  getCarbonData,
  getCarbonMilestone,
  getCarbonAnalogy,
  addIngredient,
  updateIngredient,
  deleteIngredient,
  markConsumed,
  searchIngredients,
  getIngredientById
} from './ingredients.js';
import { getUnlockedBadges, getBadgeDefs, checkBadges, clearNewBadgeNotifications } from './badges.js';
import { smartShoppingTips, workoutRecipes, filteredRecipes, elderRecipes, recoveryScore, missingFor } from './recipes.js';
import { health, settings, recipeFilter, setRecipeFilter, syncHealth } from './health.js';
import { elder, elderFridgeHealth, mealRegularity, careReminders, groceryRequests, familyMembers, mealLogs, saveFamilyMembers, saveGroceryRequests, saveMealLogs, groceryForElder } from './family.js';
import { state } from './state.js';
import { drawConsumptionChart, drawFridgeRadar, calcFridgeScores, getConsumptionHistory } from './charts.js';

/**
 * 显示 Toast 提示消息
 * @param {string} message - 提示消息内容
 * @param {'success'|'warning'|'error'|'info'} [type='info'] - 提示类型
 */
function showToast(message, type = 'info') {
  // 移除已有 toast
  const existing = document.querySelector('#toast-container');
  if (existing) existing.remove();

  // 创建 toast 元素
  const toast = document.createElement('div');
  toast.id = 'toast-container';
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // 入场动画
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  // 2-3 秒后自动消失
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hiding');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/**
 * Tab 生成
 * @param {string} key 页面标识
 * @param {string} label 显示标签
 * @returns {string} HTML 字符串
 */
function tab(key, label) {
  return `<button class="tab ${state.page === key ? 'active' : ''}" data-page="${key}">${label}</button>`;
}

/**
 * 渲染食材卡片
 * @param {{id?: string, name: string, category: string, qty: number, unit: string, status: string, days: number}} item 食材对象
 * @returns {string} HTML 字符串
 */
function renderIngredient(item) {
  const emoji = item.category === '水果' ? '🍌' : item.category === '蔬菜' ? '🥬' : item.category === '肉类' ? '🥩' : item.category === '蛋奶' ? '🥛' : '🍽️';
  const id = item.id || '';
  return `
    <article class="ingredient-card card" data-open-ingredient="${id}" role="button" tabindex="0">
      <div class="food-avatar">${emoji}</div>
      <div>
        <div class="ingredient-title">
          <h3>${item.name}</h3>
          <span class="badge ${statusClass(item.status)}">${item.status}</span>
        </div>
        <p>${item.qty}${item.unit} · ${item.category} · ${item.days}天后到期</p>
        <div class="lifecycle">${lifecycleSteps(item)}</div>
      </div>
    </article>
  `;
}

/**
 * 渲染食材表单（添加/编辑复用）
 * @param {object} [item] - 编辑时传入现有食材
 * @returns {string} HTML 字符串
 */
function renderIngredientForm(item) {
  const today = new Date().toISOString().split('T')[0];
  const data = item || {
    name: '',
    category: '蔬菜',
    qty: 1,
    unit: '个',
    shelfLife: 7,
    purchaseDate: today
  };
  const isEdit = !!item;
  return `
    <form class="ingredient-form" data-form="ingredient">
      <label>
        <span>食材名称 *</span>
        <input type="text" name="name" value="${data.name || ''}" placeholder="如：西红柿" required>
      </label>
      <label>
        <span>类别 *</span>
        <select name="category" required>
          ${CATEGORIES.map((c) => `<option value="${c}" ${data.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </label>
      <div class="form-row">
        <label>
          <span>数量 *</span>
          <input type="number" name="qty" min="0.1" step="0.1" value="${data.qty}" required>
        </label>
        <label>
          <span>单位 *</span>
          <select name="unit" required>
            ${UNIT_OPTIONS.map((u) => `<option value="${u}" ${data.unit === u ? 'selected' : ''}>${u}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="form-row">
        <label>
          <span>保质期(天) *</span>
          <input type="number" name="shelfLife" min="1" step="1" value="${data.shelfLife}" required>
        </label>
        <label>
          <span>购入日期 *</span>
          <input type="date" name="purchaseDate" value="${data.purchaseDate}" max="${today}" required>
        </label>
      </div>
      <div class="form-actions">
        <button type="button" class="secondary" data-action="close-modal">取消</button>
        <button type="submit" class="primary" data-action="save-ingredient" data-id="${data.id || ''}">${isEdit ? '保存修改' : '添加食材'}</button>
      </div>
    </form>
  `;
}

/**
 * 渲染食材详情面板
 * @param {object} item 食材对象
 * @returns {string} HTML 字符串
 */
function renderIngredientDetail(item) {
  return `
    <div class="ingredient-detail" data-detail-id="${item.id}">
      <div class="detail-row"><span class="muted">名称</span><strong>${item.name}</strong></div>
      <div class="detail-row"><span class="muted">类别</span><strong>${item.category}</strong></div>
      <div class="detail-row"><span class="muted">数量</span><strong>${item.qty}${item.unit}</strong></div>
      <div class="detail-row"><span class="muted">状态</span><span class="badge ${statusClass(item.status)}">${item.status}</span></div>
      <div class="detail-row"><span class="muted">剩余天数</span><strong>${item.days} 天</strong></div>
      <div class="detail-row"><span class="muted">保质期</span><strong>${item.shelfLife || '-'} 天</strong></div>
      <div class="detail-row"><span class="muted">购入日期</span><strong>${item.purchaseDate || '-'}</strong></div>
      <div class="detail-row"><span class="muted">浪费风险</span><strong>${item.wasteRisk}%</strong></div>
      <div class="lifecycle">${lifecycleSteps(item)}</div>
      <div class="form-actions">
        <button type="button" class="secondary" data-action="edit-ingredient" data-id="${item.id}">编辑</button>
        <button type="button" class="secondary" data-action="consume-ingredient" data-id="${item.id}">标记为已消耗</button>
        <button type="button" class="danger" data-action="delete-ingredient" data-id="${item.id}">删除</button>
      </div>
    </div>
  `;
}

/**
 * 渲染食材库筛选条
 * @param {{status: string, category: string}} filter 当前筛选
 * @returns {string} HTML 字符串
 */
function renderLibraryFilters(filter) {
  const statuses = [
    { key: '', label: '全部' },
    { key: '新鲜', label: '新鲜' },
    { key: '临期', label: '临期' },
    { key: '今日到期', label: '今日到期' },
    { key: '已过期', label: '已过期' }
  ];
  return `
    <div class="library-toolbar">
      <input type="search" class="library-search" data-input="library-search" placeholder="搜索食材名称..." value="${filter.keyword || ''}">
      <div class="filter-chips">
        ${statuses.map((s) => `<button class="chip ${filter.status === s.key ? 'active' : ''}" data-action="filter-status" data-value="${s.key}">${s.label}</button>`).join('')}
      </div>
      <select class="filter-select" data-action="filter-category">
        <option value="">全部分类</option>
        ${CATEGORIES.map((c) => `<option value="${c}" ${filter.category === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>
  `;
}

/**
 * 渲染菜谱卡片
 * @param {{name: string, emoji: string, tags: string[], ingredients: string[], reason: string}} recipe 菜谱对象
 * @returns {string} HTML 字符串
 */
function renderRecipe(recipe) {
  const missing = missingFor(recipe);
  const score = recoveryScore(recipe);
  const substituteText = missing
    .map((item) => substitutions[item]?.length ? `${item}可换${substitutions[item].slice(0, 2).join('/')}` : '')
    .filter(Boolean)
    .join('；');
  return `
    <article class="recipe-card card">
      <div class="recipe-emoji">${recipe.emoji}</div>
      <h3>${recipe.name}</h3>
      <p>${recipe.reason}</p>
      <div class="score-box">
        <div class="row-between"><strong>恢复分 ${score.total}</strong><span class="muted">蛋白${score.protein} · 补水${score.hydration} · 减脂${score.fatLoss}</span></div>
        <div class="score-track"><span style="width:${score.total}%"></span></div>
      </div>
      <div class="chips">${recipe.tags.slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
      ${missing.length ? `<div class="buy-list">建议采购：${missing.join('、')}</div>` : ''}
      ${substituteText ? `<div class="sub-list">替换建议：${substituteText}</div>` : ''}
    </article>
  `;
}

/**
 * 渲染首页
 * @returns {string} HTML 字符串
 */
function renderHome() {
  const expiring = expiringItems();
  const visible = state.expiringExpanded ? expiring : expiring.slice(0, 3);
  const summary = health().summary;
  const fridge = fridgeHealthIndex();
  const mustEat = expiring.map((item) => item.name).join('、') || '暂无';
  const shopping = smartShoppingTips();
  const carbonData = getCarbonData();
  const milestone = getCarbonMilestone(carbonData.saved);
  const unlockedBadges = getUnlockedBadges();
  const allDefs = getBadgeDefs();

  // 检查徽章解锁（首页加载时自动检查）
  const fridgeScoreVal = fridgeHealthIndex().score;
  const consumptionHistory = readJson('foodkeeper.consumption.v1', []);
  const badgeCheck = checkBadges(carbonData, consumptionHistory, fridgeScoreVal);
  if (badgeCheck.newBadges.length > 0) {
    setTimeout(() => {
      const badgeNames = badgeCheck.newBadges.map(id => {
        const def = getBadgeDefs().find(d => d.id === id);
        return def ? `${def.icon} ${def.name}` : id;
      }).join('、');
      showToast(`🏅 解锁成就：${badgeNames}`, 'success');
      clearNewBadgeNotifications();
    }, 1000);
  }

  return `
    <main class="page">
      <section class="hero card">
        <div>
          <p class="eyebrow">AI 食材管家 MVP</p>
          <h1>今天优先处理 ${expiring.length} 个临期食材</h1>
          <p>结合库存、饮食偏好和运动状态，生成每日食材处理与运动后饮食建议。</p>
        </div>
      </section>

      <!-- 碳足迹区域 -->
      <section class="card card-section">
        <div class="section-title">
          <h2>🌍 碳足迹厨房</h2>
          <span class="badge success">环保贡献</span>
        </div>
        <div class="carbon-summary">
          <div class="carbon-number">${carbonData.saved.toLocaleString()} <small>g CO₂</small></div>
          <p class="muted">累计节省碳排放</p>
          <div class="carbon-progress-track">
            <span class="carbon-progress-fill" style="width:${milestone.progress}%"></span>
          </div>
          <p class="carbon-milestone-text">${milestone.progress < 100 ? `距下一个里程碑还差 ${(milestone.next - carbonData.saved).toLocaleString()} g CO₂` : '已达到最高里程碑！'}</p>
          <p class="carbon-analogy">${getCarbonAnalogy(carbonData.saved)}</p>
        </div>
      </section>

      <!-- 成就徽章 -->
      <section class="card card-section">
        <div class="section-title">
          <h2>🏅 成就徽章</h2>
          <span class="muted">${unlockedBadges.length}/${allDefs.length}</span>
        </div>
        <div class="badges-grid">
          ${allDefs.map((def) => {
            const unlocked = unlockedBadges.find((b) => b.id === def.id);
            return `
              <div class="badge-item ${unlocked ? 'unlocked' : 'locked'}">
                <span class="badge-icon">${def.icon}</span>
                <span class="badge-name">${def.name}</span>
                <span class="badge-desc">${def.desc}</span>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <section class="card card-section">
        <div class="section-title">
          <h2>冰箱健康指数</h2>
          <span class="badge success">${fridge.score}</span>
        </div>
        <div class="stats-grid">
          <div class="metric card"><strong>${fridge.protein}</strong><span>蛋白质储备</span></div>
          <div class="metric card"><strong>${fridge.produce}</strong><span>蔬果比例</span></div>
          <div class="metric card"><strong>${expiring.length}</strong><span>临期数量</span></div>
          <div class="metric card"><strong>${fridge.pressure}</strong><span>浪费压力</span></div>
        </div>
      </section>

      <section class="card card-section">
        <div class="section-title">
          <h2>今天必须吃掉</h2>
          <button class="text-button" data-page="recipes">生成菜单</button>
        </div>
        <p>优先消耗：${mustEat}。</p>
        <p class="muted">系统会优先把这些临期食材放进今日菜谱，减少浪费。</p>
      </section>

      <section class="card card-section toggle-content ${state.expiringExpanded ? '' : 'collapsed'}">
        <div class="section-title">
          <h2>今日提醒 · 临期食品</h2>
          ${expiring.length > 3 ? `<button class="text-button" data-action="toggle-expiring">${state.expiringExpanded ? '收起' : '展开更多'}</button>` : ''}
        </div>
        <div class="stack">
          ${visible.length ? visible.map(renderIngredient).join('') : '<div class="empty">暂无临期食材</div>'}
        </div>
      </section>

      <section class="card card-section">
        <div class="section-title">
          <h2>今日提醒 · 运动食物推荐</h2>
          <button class="text-button" data-page="profile">同步健康</button>
        </div>
        ${summary ? `<article class="notice-card card"><strong>运动后提醒卡片</strong><p>${summary.workout} ${summary.duration} 分钟，消耗约 ${summary.kcal} kcal。建议 30 分钟内补水，并补充 ${summary.focus.join('、')}。</p></article>` : ''}
        <p class="muted">${summary ? `${summary.workout}后建议：${summary.focus.join('、')}。${summary.effect}` : '还没有同步 iWatch 运动信息，先在"我的"中模拟同步。'}</p>
        <div class="recipe-grid">
          ${workoutRecipes(3).map(renderRecipe).join('')}
        </div>
      </section>

      <section class="card card-section">
        <div class="section-title">
          <h2>身体状态驱动采购</h2>
          <span class="muted">智能采购避坑</span>
        </div>
        <div class="stack">
          ${shopping.map((tip) => `
            <article class="shopping-row card">
              <strong>${tip.item}</strong>
              <span class="tag">${tip.tag}</span>
              <p class="muted">${tip.desc}</p>
            </article>
          `).join('')}
        </div>
      </section>
    </main>
  `;
}

/**
 * 渲染菜谱页
 * @returns {string} HTML 字符串
 */
function renderRecipes() {
  const filter = recipeFilter();
  const list = filteredRecipes();
  return `
    <main class="page">
      <div class="page-header">
        <div>
          <p class="eyebrow">菜谱</p>
          <h1>按饮食偏好筛选</h1>
        </div>
      </div>
      <section class="card card-section">
        <select class="filter-select" data-action="recipe-filter">
          ${preferenceFilters.map((item) => `<option value="${item}" ${filter === item ? 'selected' : ''}>${item}</option>`).join('')}
        </select>
        <div class="chips">
          ${preferenceFilters.map((item) => `<button class="chip ${filter === item ? 'active' : ''}" data-filter="${item}">${item}</button>`).join('')}
        </div>
      </section>
      <section class="recipe-grid">
        ${list.length ? list.map(renderRecipe).join('') : '<div class="empty card">当前偏好下暂无菜谱</div>'}
      </section>
    </main>
  `;
}

/**
 * 渲染食材库页
 * @returns {string} HTML 字符串
 */
function renderLibrary() {
  const waste = wastePredictions();
  const filter = { status: state.libraryStatus || '', category: state.libraryCategory || '', keyword: state.libraryKeyword || '' };
  const list = searchIngredients(filter);
  return `
    <main class="page">
      <div class="page-header">
        <div>
          <p class="eyebrow">库存</p>
          <h1>我的食材库</h1>
        </div>
        <button class="primary" data-action="add-ingredient">+ 添加食材</button>
      </div>
      ${renderLibraryFilters(filter)}
      <section class="card card-section">
        <div class="section-title">
          <h2>食材浪费预测</h2>
          <span class="muted">基于历史消耗模拟</span>
        </div>
        ${waste.length ? waste.map((item) => `<p class="waste-line">${item.name} 浪费风险 ${item.wasteRisk}%：建议下次少买或提前安排菜谱。</p>`).join('') : '<p class="empty-hint">暂无高浪费风险食材 🎉</p>'}
      </section>
      <section class="card card-section">
        <div class="section-title">
          <h2>📊 冰箱健康周报</h2>
          <span class="muted">最近7天食材消耗</span>
        </div>
        <canvas class="chart-canvas" id="consumption-chart" width="300" height="180"></canvas>
      </section>
      <section class="card card-section">
        <div class="section-title">
          <h2>📈 冰箱健康雷达</h2>
          <span class="muted">综合评分</span>
        </div>
        <canvas class="chart-canvas" id="fridge-radar" width="300" height="240"></canvas>
      </section>
      <section class="stack">
        ${list.length ? list.map(renderIngredient).join('') : '<div class="empty-hint">未找到匹配的食材，试试调整筛选或添加新食材</div>'}
      </section>
    </main>
  `;
}

/**
 * 渲染个人页
 * @returns {string} HTML 字符串
 */
function renderProfile() {
  const current = health();
  const summary = current.summary;
  return `
    <main class="page">
      <div class="page-header">
        <div>
          <p class="eyebrow">我的</p>
          <h1>健康数据</h1>
        </div>
      </div>
      <section class="card card-section health-panel">
        <div class="row-between">
          <div>
            <h2>iWatch 运动信息</h2>
            <p class="muted">${current.authorized ? '已模拟授权 HealthKit' : '未授权'}</p>
          </div>
          <button class="secondary" data-action="health-auth">${current.authorized ? '已授权' : '模拟授权'}</button>
        </div>
        <select class="scenario-select" data-action="health-scenario">
          ${Object.entries(healthScenarios).map(([key, value]) => `<option value="${key}" ${current.scenario === key ? 'selected' : ''}>${value.label}</option>`).join('')}
        </select>
        <button class="primary" data-action="health-sync">同步 iWatch 运动信息</button>
        ${summary ? `
          <div class="stats-grid">
            <div class="metric card"><strong>${summary.steps}</strong><span>步数</span></div>
            <div class="metric card"><strong>${summary.kcal}</strong><span>活动 kcal</span></div>
            <div class="metric card"><strong>${summary.duration}</strong><span>运动分钟</span></div>
            <div class="metric card"><strong>${summary.avgHr}</strong><span>平均心率</span></div>
          </div>
          <p>${summary.workout}后建议补充：${summary.focus.join('、')}。</p>
          <p class="muted">${summary.effect}</p>
        ` : '<div class="empty">同步后展示今日运动摘要</div>'}
      </section>
      <section class="card card-section">
        <div class="section-title">
          <h2>家庭成员画像</h2>
          <span class="muted">推荐时自动避开禁忌</span>
        </div>
        <div class="stack">
          ${familyMembers().map((profile) => `
            <article class="profile-card card">
              <strong>${profile.name} · ${profile.age}岁</strong>
              <div class="chips">${profile.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
              <p>${profile.conditions}</p>
            </article>
          `).join('')}
        </div>
      </section>
    </main>
  `;
}

/**
 * 渲染设置页
 * @returns {string} HTML 字符串
 */
function renderSettings() {
  const current = settings();
  const rows = [
    ['expiringReminder', '临期食品提醒', '食材进入临期时提醒优先处理'],
    ['workoutFoodReminder', '运动后饮食提醒', '同步运动后提醒补水和补充营养'],
    ['hydrationReminder', '补水提醒', '运动后 15 分钟提醒补水'],
    ['shoppingReminder', '采购建议提醒', '推荐菜谱缺食材时提醒加入采购清单']
  ];
  return `
    <main class="page">
      <div class="page-header">
        <div>
          <p class="eyebrow">设置</p>
          <h1>提醒设置</h1>
        </div>
      </div>
      <section class="settings-list">
        ${rows.map(([key, title, desc]) => `
          <article class="setting-row card">
            <label>
              <span>${title}</span>
              <input type="checkbox" data-setting="${key}" ${current[key] ? 'checked' : ''}>
            </label>
            <p class="muted">${desc}</p>
          </article>
        `).join('')}
      </section>
      <section class="card card-section">
        <div class="section-title">
          <h2>数据管理</h2>
          <span class="muted">备份与恢复</span>
        </div>
        <p class="muted">导出所有数据为 JSON 文件，或从备份文件恢复数据。</p>
        <div class="data-actions">
          <button class="primary" data-action="export-data">导出数据</button>
          <label class="secondary upload-label">
            导入数据
            <input type="file" accept=".json" class="file-input" data-action="import-data">
          </label>
        </div>
      </section>
    </main>
  `;
}

/**
 * 渲染关怀页
 * @returns {string} HTML 字符串
 */
function renderCare() {
  const elderInfo = elder();
  const fridge = elderFridgeHealth();
  const regularity = mealRegularity();
  const reminders = careReminders();
  const grocery = groceryRequests();
  const members = familyMembers();
  const editingMember = members.find((item) => item.id === state.editingMemberId);
  const editingGrocery = state.editingGroceryIndex !== null ? grocery[state.editingGroceryIndex] : null;
  return `
    <main class="page">
      <div class="page-header">
        <div>
          <p class="eyebrow">关怀老人</p>
          <h1>家庭成员与老人关怀</h1>
        </div>
      </div>

      <section class="card card-section">
        <div class="section-title">
          <h2>家庭成员</h2>
          <span class="badge success">老人信息在此维护</span>
        </div>
        <div class="elder-form">
          <label>名称<input data-member-field="name" value="${editingMember?.name || ''}" placeholder="例如 外婆"></label>
          <label>年龄<input data-member-field="age" type="number" value="${editingMember?.age || ''}" placeholder="例如 72"></label>
          <label>标签<input data-member-field="tags" value="${editingMember?.tags?.join('、') || ''}" placeholder="老人、控糖、健身成员、减脂成员"></label>
          <label>身体状况/备注<input data-member-field="conditions" value="${editingMember?.conditions || ''}" placeholder="例如 血压偏高，牙口较弱"></label>
        </div>
        <button class="primary" data-action="add-member">${editingMember ? '保存家庭成员' : '新增家庭成员'}</button>
        <div class="stack">
          ${members.map((member) => `
            <article class="profile-card card">
              <div class="row-between">
                <strong>${member.name} · ${member.age}岁</strong>
                <button class="text-button" data-edit-member="${member.id}">编辑到表单</button>
              </div>
              <div class="chips">${member.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
              <p>${member.conditions}</p>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="card card-section">
        <div class="section-title">
          <h2>${elderInfo.nickname}的冰箱健康</h2>
          <span class="badge ${fridge.expired ? 'danger' : 'success'}">${fridge.score}</span>
        </div>
        <div class="stats-grid">
          <div class="metric card"><strong>${fridge.expiring}</strong><span>临期食材</span></div>
          <div class="metric card"><strong>${fridge.expired}</strong><span>过期食材</span></div>
          <div class="metric card"><strong>${fridge.protein}</strong><span>蛋白储备</span></div>
          <div class="metric card"><strong>${fridge.fiber}</strong><span>蔬果纤维</span></div>
        </div>
      </section>

      <section class="card card-section">
        <h2>同步提醒</h2>
        <div class="stack">
          ${reminders.map((item) => `
            <article class="care-alert card ${item.level}">
              <strong>${item.title}</strong>
              <p>${item.text}</p>
              <span class="muted">接收方：${elderInfo.nickname}、主要用户</span>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="card card-section">
        <div class="section-title">
          <h2>适合老人的菜谱</h2>
          <span class="muted">结合身体状况与库存</span>
        </div>
        <div class="recipe-grid">
          ${elderRecipes().map(renderRecipe).join('')}
        </div>
      </section>

      <section class="card card-section">
        <div class="section-title">
          <h2>帮老人买菜</h2>
          <span class="muted">可人工添加/编辑</span>
        </div>
        <div class="meal-form">
          <input data-grocery-item value="${editingGrocery?.item || ''}" placeholder="买菜需求，例如 低脂牛奶">
          <input data-grocery-note value="${editingGrocery?.note || editingGrocery?.source || ''}" placeholder="备注，例如 明早送达，少糖">
          <button class="primary" data-action="add-grocery">${editingGrocery ? '保存买菜需求' : '添加买菜需求'}</button>
          <button class="secondary" data-action="generate-grocery">模拟生成买菜需求</button>
        </div>
        <div class="stack">
          ${grocery.map((item, index) => `
            <article class="shopping-row card">
              <strong>${item.item}</strong>
              <span class="tag">${item.status || '待确认'}</span>
              <p class="muted">${item.note || item.source || '人工添加'} · 可同步到主要用户确认后下单</p>
              <button class="text-button" data-edit-grocery="${index}">编辑</button>
            </article>
          `).join('')}
        </div>
        <button class="secondary" data-action="mock-order">模拟提交买菜需求</button>
      </section>

      <section class="card card-section">
        <div class="section-title">
          <h2>餐食打卡</h2>
          <span class="badge success">规律分 ${regularity.score}</span>
        </div>
        <p class="muted">${regularity.summary} ${regularity.risk}。</p>
        <div class="meal-form">
          <select data-meal-owner>
            <option>老人</option>
            <option>主要用户</option>
          </select>
          <select data-meal-type>
            <option>早餐</option>
            <option>午餐</option>
            <option>晚餐</option>
            <option>加餐</option>
          </select>
          <input data-meal-text placeholder="餐食内容，可手动填写或模拟OCR识别">
          <button class="secondary" data-action="mock-meal-ocr">模拟 OCR 识别餐食</button>
          <button class="primary" data-action="add-meal">餐食打卡并同步</button>
        </div>
        <div class="stack">
          ${mealLogs().map((item) => `
            <article class="meal-card card">
              <div class="meal-photo-placeholder">OCR记录</div>
              <div>
                <strong>${item.owner} · ${item.meal}</strong>
                <p>${item.time} · ${item.text}</p>
                <span class="muted">${item.shared ? '已同步给对方' : '未同步'}</span>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    </main>
  `;
}

/**
 * 渲染整个应用
 */
function render() {
  const app = document.querySelector('#app');
  const pages = {
    home: renderHome,
    library: renderLibrary,
    recipes: renderRecipes,
    profile: renderProfile,
    care: renderCare,
    settings: renderSettings
  };
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand-mark">食</div>
        <div>
          <strong>AI食材管家</strong>
          <span>H5 MVP</span>
        </div>
      </header>
      ${pages[state.page]()}
      <nav class="tabbar">
        ${tab('home', '首页')}
        ${tab('library', '食材库')}
        ${tab('recipes', '菜谱')}
        ${tab('profile', '我的')}
        ${tab('care', '关怀')}
        ${tab('settings', '设置')}
      </nav>
    </div>
  `;
  bindEvents();
}

/**
 * 打开模态对话框
 * @param {string} title - 标题
 * @param {string} bodyHtml - 主体内容
 */
function openModal(title, bodyHtml) {
  closeModal();
  const wrap = document.createElement('div');
  wrap.id = 'modal-mask';
  wrap.className = 'modal-mask';
  wrap.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="modal-header">
        <strong>${title}</strong>
        <button class="icon-button" data-action="close-modal" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
    </div>
  `;
  document.body.appendChild(wrap);
  // 点击遮罩关闭
  wrap.addEventListener('click', (event) => {
    if (event.target === wrap) closeModal();
  });
}

/**
 * 关闭模态对话框
 */
function closeModal() {
  document.getElementById('modal-mask')?.remove();
}

/**
 * 事件绑定
 */
function bindEvents() {
  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      state.page = button.dataset.page;
      render();
    });
  });
  document.querySelector('[data-action="toggle-expiring"]')?.addEventListener('click', () => {
    state.expiringExpanded = !state.expiringExpanded;
    render();
  });
  document.querySelector('[data-action="health-auth"]')?.addEventListener('click', () => {
    writeJson(store.health, { ...health(), authorized: true });
    showToast('已模拟授权 HealthKit', 'success');
    render();
  });
  document.querySelector('[data-action="health-sync"]')?.addEventListener('click', () => {
    syncHealth();
    showToast('iWatch 运动信息同步成功', 'success');
  });
  document.querySelector('[data-action="health-scenario"]')?.addEventListener('change', (event) => {
    writeJson(store.health, { ...health(), scenario: event.target.value });
    render();
  });
  document.querySelector('[data-action="recipe-filter"]')?.addEventListener('change', (event) => {
    setRecipeFilter(event.target.value);
    render();
  });
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      setRecipeFilter(button.dataset.filter);
      showToast(`筛选：${button.dataset.filter}`, 'info');
      render();
    });
  });
  document.querySelectorAll('[data-setting]').forEach((input) => {
    input.addEventListener('change', () => {
      writeJson(store.settings, { ...settings(), [input.dataset.setting]: input.checked });
    });
  });

  // ========== 食材库：添加/编辑/详情/消耗/删除/筛选/搜索 ==========
  document.querySelector('[data-action="add-ingredient"]')?.addEventListener('click', () => {
    openModal('添加食材', renderIngredientForm());
    bindModalEvents();
  });

  document.querySelectorAll('[data-open-ingredient]').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.openIngredient;
      const item = getIngredientById(id);
      if (!item) {
        // 兼容无 id 的种子数据：按名称匹配
        const name = card.querySelector('h3')?.textContent;
        const fallback = ingredients().find((it) => it.name === name);
        if (fallback) {
          openModal('食材详情', renderIngredientDetail(fallback));
        } else {
          showToast('食材数据已失效，请刷新页面', 'warning');
        }
        return;
      }
      openModal('食材详情', renderIngredientDetail(item));
      bindModalEvents();
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.click();
      }
    });
  });

  document.querySelectorAll('[data-action="filter-status"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.libraryStatus = btn.dataset.value || '';
      render();
    });
  });
  document.querySelector('[data-action="filter-category"]')?.addEventListener('change', (event) => {
    state.libraryCategory = event.target.value || '';
    render();
  });
  const searchInput = document.querySelector('[data-input="library-search"]');
  if (searchInput) {
    let timer = null;
    searchInput.addEventListener('input', (event) => {
      clearTimeout(timer);
      const value = event.target.value || '';
      timer = setTimeout(() => {
        state.libraryKeyword = value;
        render();
      }, 200);
    });
  }
  // ========== 食材库操作结束 ==========

  document.querySelector('[data-action="add-member"]')?.addEventListener('click', () => {
    const name = document.querySelector('[data-member-field="name"]')?.value.trim() || '新成员';
    const age = Number(document.querySelector('[data-member-field="age"]')?.value || 0);
    const tags = (document.querySelector('[data-member-field="tags"]')?.value || '家庭成员')
      .split(/[、,，]/)
      .map((item) => item.trim())
      .filter(Boolean);
    const conditions = document.querySelector('[data-member-field="conditions"]')?.value.trim() || '暂无备注';
    const current = familyMembers();
    const draft = {
      id: state.editingMemberId || `member_${Date.now()}`,
      name,
      age,
      tags,
      conditions
    };
    saveFamilyMembers(state.editingMemberId ? current.map((item) => item.id === state.editingMemberId ? draft : item) : [draft, ...current]);
    const wasEditing = !!state.editingMemberId;
    state.editingMemberId = null;
    showToast(wasEditing ? '家庭成员信息已更新' : '新成员已添加', 'success');
    render();
  });
  document.querySelectorAll('[data-edit-member]').forEach((button) => {
    button.addEventListener('click', () => {
      state.editingMemberId = button.dataset.editMember;
      render();
    });
  });
  document.querySelector('[data-action="add-grocery"]')?.addEventListener('click', () => {
    const item = document.querySelector('[data-grocery-item]')?.value.trim() || '未命名需求';
    const note = document.querySelector('[data-grocery-note]')?.value.trim() || '人工添加';
    const current = groceryRequests();
    const draft = { item, note, status: '待确认' };
    if (state.editingGroceryIndex !== null) {
      current[state.editingGroceryIndex] = draft;
      saveGroceryRequests(current);
    } else {
      saveGroceryRequests([draft, ...current]);
    }
    state.editingGroceryIndex = null;
    showToast('买菜需求已添加', 'success');
    render();
  });
  document.querySelector('[data-action="generate-grocery"]')?.addEventListener('click', () => {
    saveGroceryRequests(groceryForElder().map((item) => ({ ...item, note: `${item.source} · 模拟生成` })));
    state.editingGroceryIndex = null;
    showToast('已模拟生成买菜需求', 'success');
    render();
  });
  document.querySelectorAll('[data-edit-grocery]').forEach((button) => {
    button.addEventListener('click', () => {
      state.editingGroceryIndex = Number(button.dataset.editGrocery);
      render();
    });
  });
  document.querySelector('[data-action="mock-order"]')?.addEventListener('click', () => {
    showToast('已模拟同步买菜需求给主要用户确认', 'success');
  });
  document.querySelector('[data-action="mock-meal-ocr"]')?.addEventListener('click', () => {
    const samples = ['番茄豆腐鸡蛋羹', '牛奶燕麦香蕉糊', '豆腐蔬菜汤', '鸡蛋青菜软饭'];
    const input = document.querySelector('[data-meal-text]');
    if (input) input.value = samples[Math.floor(Math.random() * samples.length)];
    showToast('OCR 识别完成', 'info');
  });
  document.querySelector('[data-action="add-meal"]')?.addEventListener('click', () => {
    const owner = document.querySelector('[data-meal-owner]')?.value || '老人';
    const meal = document.querySelector('[data-meal-type]')?.value || '早餐';
    const text = document.querySelector('[data-meal-text]')?.value || '未填写餐食';
    const now = new Date();
    saveMealLogs([
      {
        id: `meal_${Date.now()}`,
        owner,
        meal,
        text,
        photo: '',
        shared: true,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      },
      ...mealLogs()
    ]);
    showToast('餐食打卡成功，已同步', 'success');
    render();
  });

  // Canvas 图表绘制（延迟确保 DOM 已渲染）
  setTimeout(() => {
    const consumptionCanvas = document.getElementById('consumption-chart');
    const radarCanvas = document.getElementById('fridge-radar');
    if (consumptionCanvas) {
      const history = getConsumptionHistory();
      drawConsumptionChart(consumptionCanvas, history);
    }
    if (radarCanvas) {
      const scores = calcFridgeScores(ingredients());
      drawFridgeRadar(radarCanvas, scores);
    }
  }, 50);

  // 数据导出
  document.querySelector('[data-action="export-data"]')?.addEventListener('click', () => {
    exportData();
    showToast('数据已导出', 'success');
  });

  // 数据导入
  document.querySelector('[data-action="import-data"]')?.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await importData(file);
      showToast(`成功导入 ${result.count} 项数据，页面即将刷新`, 'success');
      setTimeout(() => location.reload(), 1500);
    } catch (err) {
      showToast(err.message || '导入失败', 'error');
    }
    // 重置 input 以允许重复选择同一文件
    event.target.value = '';
  });
}

/**
 * 绑定模态对话框内的事件（食材详情/表单）
 */
function bindModalEvents() {
  // 关闭按钮
  document.querySelectorAll('[data-action="close-modal"]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal());
  });
  // 食材详情内"编辑"按钮
  document.querySelectorAll('[data-action="edit-ingredient"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = getIngredientById(btn.dataset.id);
      if (!item) {
        showToast('食材不存在', 'error');
        closeModal();
        return;
      }
      const body = document.querySelector('#modal-mask .modal-body');
      if (body) {
        body.innerHTML = renderIngredientForm(item);
        // 重新绑定关闭按钮
        body.querySelectorAll('[data-action="close-modal"]').forEach((c) => c.addEventListener('click', () => closeModal()));
        // 表单提交由下方全局监听处理
      }
    });
  });
  // 食材消耗
  document.querySelectorAll('[data-action="consume-ingredient"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const result = markConsumed(id);
      if (result.ok) {
        showToast(`已记录碳足迹节省 ${result.saved}g CO₂`, 'success');
        closeModal();
        render();
      } else {
        showToast(result.error?.msg || '操作失败', 'error');
      }
    });
  });
  // 食材删除
  document.querySelectorAll('[data-action="delete-ingredient"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = getIngredientById(id);
      if (!item) {
        showToast('食材不存在', 'error');
        closeModal();
        return;
      }
      if (!confirm(`确定删除「${item.name}」吗？此操作不可撤销。`)) return;
      deleteIngredient(id);
      showToast('已删除', 'success');
      closeModal();
      render();
    });
  });
  // 食材表单提交（添加/编辑）
  const form = document.querySelector('[data-form="ingredient"]');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fd = new FormData(form);
      const payload = {
        name: String(fd.get('name') || ''),
        category: String(fd.get('category') || ''),
        qty: fd.get('qty'),
        unit: String(fd.get('unit') || ''),
        shelfLife: fd.get('shelfLife'),
        purchaseDate: String(fd.get('purchaseDate') || '')
      };
      const saveBtn = form.querySelector('[data-action="save-ingredient"]');
      const id = saveBtn?.dataset.id;
      const result = id ? updateIngredient(id, payload) : addIngredient(payload);
      if (result.ok) {
        showToast(id ? '修改已保存' : '食材已添加', 'success');
        closeModal();
        render();
      } else {
        const msg = result.error?.msg || '保存失败';
        showToast(msg, 'error');
        const field = result.error?.field;
        if (field) {
          const el = form.querySelector(`[name="${field}"]`);
          el?.focus();
        }
      }
    });
  }
}

export { render };