import { healthScenarios, preferenceFilters, substitutions, CATEGORIES, UNIT_OPTIONS } from './data/index.js';
import { store, readJson, writeJson, exportData, importData } from './store.js';
import { expiringItems, ingredients, availableNames, fridgeHealthIndex, wastePredictions, lifecycleSteps, statusClass, getCarbonData, getCarbonMilestone, getCarbonAnalogy, calcStatus, calcRemainingDays, addIngredient, updateIngredient, deleteIngredient, getIngredientById, markConsumed, searchIngredients } from './ingredients.js';
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
 * @param {{name: string, category: string, qty: number, unit: string, status: string, days: number}} item 食材对象
 * @returns {string} HTML 字符串
 */
function renderIngredient(item) {
  const emoji = item.category === '水果' ? '🍌' : item.category === '蔬菜' ? '🥬' : item.category === '肉类' ? '🥩' : item.category === '蛋奶' ? '🥛' : '🍽️';
  return `
    <article class="ingredient-card card" data-open-ingredient="${item.id}">
      <div class="food-avatar">${emoji}</div>
      <div>
        <div class="ingredient-title">
          <h3>${item.name}</h3>
          <span class="badge ${statusClass(item.status)}">${item.status}</span>
        </div>
        <p>${item.qty}${item.unit} · ${item.category} · ${item.days >= 0 ? item.days + '天后到期' : Math.abs(item.days) + '天前过期'}</p>
        <div class="lifecycle">${lifecycleSteps(item)}</div>
      </div>
    </article>
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
  const filtered = searchIngredients({
    keyword: state.libraryKeyword,
    status: state.libraryFilter,
    category: state.libraryCategory
  });
  
  return `
    <main class="page">
      <div class="page-header">
        <div>
          <p class="eyebrow">库存</p>
          <h1>我的食材库</h1>
        </div>
      </div>
      
      <!-- 工具栏：搜索 + 添加 -->
      <div class="library-toolbar">
        <input class="library-search" data-input="library-search" placeholder="🔍 搜索食材名称..." value="${state.libraryKeyword}">
        <button class="primary" data-action="add-ingredient">+ 添加食材</button>
      </div>
      
      <!-- 筛选条 -->
      <div class="filter-chips">
        ${['全部', '新鲜', '临期', '今日到期', '已过期'].map(s => 
          `<button class="chip ${state.libraryFilter === s ? 'active' : ''}" data-filter-status="${s}">${s}</button>`
        ).join('')}
        <select class="category-select" data-filter-category>
          <option value="">全部分类</option>
          ${CATEGORIES.map(c => `<option value="${c}" ${state.libraryCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      
      <section class="card card-section">
        <div class="section-title">
          <h2>食材浪费预测</h2>
          <span class="muted">基于历史消耗模拟</span>
        </div>
        ${waste.map((item) => `<p class="waste-line">${item.name} 浪费风险 ${item.wasteRisk}%：建议下次少买或提前安排菜谱。</p>`).join('')}
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
        ${filtered.length ? filtered.map(renderIngredient).join('') : '<div class="empty-hint">暂无匹配食材，试试修改筛选条件或添加新食材</div>'}
      </section>
    </main>
    ${renderModal()}
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
 * 渲染食材表单
 * @param {object|null} ingredient 要编辑的食材，null 表示新建
 * @returns {string} HTML 字符串
 */
function renderIngredientForm(ingredient) {
  const isEdit = !!ingredient;
  const today = new Date().toISOString().split('T')[0];
  return `
    <div class="modal-mask" data-action="close-modal">
      <div class="modal ingredient-form" onclick="event.stopPropagation()">
        <h2>${isEdit ? '编辑食材' : '添加食材'}</h2>
        <label>
          名称
          <input data-ingredient-field="name" value="${isEdit ? ingredient.name : ''}" placeholder="如 鸡胸肉" ${isEdit ? 'readonly' : ''}>
        </label>
        <label>
          类别
          <select data-ingredient-field="category" ${isEdit ? 'disabled' : ''}>
            <option value="">请选择</option>
            ${CATEGORIES.map(c => `<option value="${c}" ${isEdit && ingredient.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </label>
        <div class="form-row">
          <label>
            数量
            <input data-ingredient-field="qty" type="number" min="1" value="${isEdit ? ingredient.qty : '1'}" placeholder="1">
          </label>
          <label>
            单位
            <select data-ingredient-field="unit">
              ${UNIT_OPTIONS.map(u => `<option value="${u}" ${isEdit && ingredient.unit === u ? 'selected' : ''}>${u}</option>`).join('')}
            </select>
          </label>
        </div>
        <label>
          保质期（天）
          <input data-ingredient-field="shelfLife" type="number" min="1" value="${isEdit ? ingredient.shelfLife || 7 : ''}" placeholder="如 7">
        </label>
        <label>
          购入日期
          <input data-ingredient-field="purchaseDate" type="date" value="${isEdit ? ingredient.purchaseDate || today : today}">
        </label>
        <div class="modal-actions">
          <button class="primary" data-action="save-ingredient">${isEdit ? '保存修改' : '添加食材'}</button>
          <button class="secondary" data-action="close-modal">取消</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染食材详情
 * @param {object} ingredient
 * @returns {string} HTML 字符串
 */
function renderIngredientDetail(ingredient) {
  return `
    <div class="modal-mask" data-action="close-modal">
      <div class="modal ingredient-detail" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2>${ingredient.name}</h2>
          <span class="badge ${statusClass(ingredient.status)}">${ingredient.status}</span>
        </div>
        <div class="detail-grid">
          <div><span class="muted">类别</span><strong>${ingredient.category}</strong></div>
          <div><span class="muted">数量</span><strong>${ingredient.qty}${ingredient.unit}</strong></div>
          <div><span class="muted">购入日期</span><strong>${ingredient.purchaseDate || '未知'}</strong></div>
          <div><span class="muted">保质期</span><strong>${ingredient.shelfLife || '未知'} 天</strong></div>
          <div><span class="muted">剩余天数</span><strong style="color:${ingredient.days < 0 ? '#bd3028' : ingredient.days <= 3 ? '#a96600' : '#17794a'}">${ingredient.days >= 0 ? ingredient.days + ' 天' : '已过期 ' + Math.abs(ingredient.days) + ' 天'}</strong></div>
          <div><span class="muted">浪费风险</span><strong>${ingredient.wasteRisk || '-'}%</strong></div>
        </div>
        <div class="lifecycle">${lifecycleSteps(ingredient)}</div>
        <div class="modal-actions">
          <button class="primary" data-action="edit-ingredient">编辑</button>
          <button class="ghost" data-action="consume-ingredient">标记已消耗</button>
          <button class="secondary danger-btn" data-action="delete-ingredient">删除</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染模态框
 * @returns {string} HTML 字符串
 */
function renderModal() {
  if (!state.showIngredientModal) return '';
  if (state.editingIngredientId !== null) {
    const ingredient = getIngredientById(state.editingIngredientId);
    if (!ingredient) return '';
    return renderIngredientForm(ingredient);
  }
  if (state.modalIngredientId) {
    const ingredient = getIngredientById(state.modalIngredientId);
    if (!ingredient) return '';
    const detailMode = state.modalIngredientId && state.editingIngredientId === null;
    return renderIngredientDetail(ingredient);
  }
  // New ingredient form
  return renderIngredientForm(null);
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

  // ===== 食材录入/编辑/消耗/删除 =====
  // Event delegation for ingredient card clicks, filter button clicks, modal actions
  document.querySelector('#app')?.addEventListener('click', (e) => {
    const target = e.target.closest('[data-open-ingredient]');
    if (target) {
      state.modalIngredientId = target.dataset.openIngredient;
      state.showIngredientModal = true;
      state.editingIngredientId = null;
      render();
      return;
    }
    
    const addBtn = e.target.closest('[data-action="add-ingredient"]');
    if (addBtn) {
      state.showIngredientModal = true;
      state.modalIngredientId = null;
      state.editingIngredientId = null;
      render();
      return;
    }
    
    const closeBtn = e.target.closest('[data-action="close-modal"]');
    if (closeBtn) {
      state.showIngredientModal = false;
      state.modalIngredientId = null;
      state.editingIngredientId = null;
      render();
      return;
    }
    
    // Save ingredient (add or update)
    const saveBtn = e.target.closest('[data-action="save-ingredient"]');
    if (saveBtn) {
      const name = document.querySelector('[data-ingredient-field="name"]')?.value.trim();
      const category = document.querySelector('[data-ingredient-field="category"]')?.value;
      const qty = Number(document.querySelector('[data-ingredient-field="qty"]')?.value);
      const unit = document.querySelector('[data-ingredient-field="unit"]')?.value || '个';
      const shelfLife = Number(document.querySelector('[data-ingredient-field="shelfLife"]')?.value);
      const purchaseDate = document.querySelector('[data-ingredient-field="purchaseDate"]')?.value;
      
      if (state.editingIngredientId) {
        // Update existing
        const result = updateIngredient(state.editingIngredientId, { qty, unit, shelfLife, purchaseDate });
        if (!result.ok) { showToast(result.error, 'error'); return; }
        showToast('食材已更新', 'success');
      } else {
        // Add new
        const result = addIngredient({ name, category, qty, unit, shelfLife, purchaseDate });
        if (!result.ok) { showToast(result.error, 'error'); return; }
        showToast(`已添加 ${result.ingredient.name}`, 'success');
      }
      
      state.showIngredientModal = false;
      state.editingIngredientId = null;
      state.modalIngredientId = null;
      render();
      return;
    }
    
    // Edit (switch from detail view to edit form)
    const editBtn = e.target.closest('[data-action="edit-ingredient"]');
    if (editBtn) {
      if (state.modalIngredientId) {
        state.editingIngredientId = state.modalIngredientId;
        render();
      }
      return;
    }
    
    // Consume
    const consumeBtn = e.target.closest('[data-action="consume-ingredient"]');
    if (consumeBtn) {
      const id = state.modalIngredientId;
      if (id) {
        const result = markConsumed(id);
        if (!result.ok) { showToast(result.error, 'error'); return; }
        showToast(`已消耗，节省 ${result.saved} g CO₂ 🎉`, 'success');
        state.showIngredientModal = false;
        state.modalIngredientId = null;
        render();
      }
      return;
    }
    
    // Delete
    const deleteBtn = e.target.closest('[data-action="delete-ingredient"]');
    if (deleteBtn) {
      if (confirm('确定删除该食材吗？')) {
        const id = state.modalIngredientId;
        deleteIngredient(id);
        showToast('食材已删除', 'info');
        state.showIngredientModal = false;
        state.modalIngredientId = null;
        render();
      }
      return;
    }
    
    // Status filter chips
    const filterBtn = e.target.closest('[data-filter-status]');
    if (filterBtn) {
      state.libraryFilter = filterBtn.dataset.filterStatus;
      render();
      return;
    }
  });

  // Search input with debounce
  const searchInput = document.querySelector('[data-input="library-search"]');
  if (searchInput) {
    let searchTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.libraryKeyword = searchInput.value.trim();
        render();
      }, 300);
    });
  }

  // Category filter
  document.querySelector('[data-filter-category]')?.addEventListener('change', (e) => {
    state.libraryCategory = e.target.value;
    render();
  });
}

export { render };