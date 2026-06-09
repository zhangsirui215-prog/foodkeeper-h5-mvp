const store = {
  ingredients: 'foodkeeper.demo.ingredients.v2',
  health: 'foodkeeper.demo.health.v2',
  settings: 'foodkeeper.demo.settings.v2',
  filter: 'foodkeeper.demo.recipeFilter.v2',
  elder: 'foodkeeper.demo.elder.v1',
  mealLogs: 'foodkeeper.demo.mealLogs.v1',
  familyMembers: 'foodkeeper.demo.familyMembers.v1',
  groceryRequests: 'foodkeeper.demo.groceryRequests.v1'
};

const ingredientsSeed = [
  { name: '鸡胸肉', category: '肉类', qty: 2, unit: '块', status: '临期', days: 1, wasteRisk: 22 },
  { name: '纯牛奶', category: '蛋奶', qty: 1, unit: '盒', status: '临期', days: 2, wasteRisk: 18 },
  { name: '香蕉', category: '水果', qty: 4, unit: '根', status: '临期', days: 2, wasteRisk: 34 },
  { name: '西兰花', category: '蔬菜', qty: 1, unit: '颗', status: '新鲜', days: 4, wasteRisk: 67 },
  { name: '鸡蛋', category: '蛋奶', qty: 6, unit: '个', status: '新鲜', days: 18, wasteRisk: 12 },
  { name: '豆腐', category: '蛋奶', qty: 1, unit: '盒', status: '今日到期', days: 0, wasteRisk: 52 },
  { name: '青菜', category: '蔬菜', qty: 1, unit: '把', status: '已过期', days: -1, wasteRisk: 74 }
];

const healthScenarios = {
  run: {
    label: '有氧跑步',
    workout: '户外跑步',
    steps: 9800,
    duration: 42,
    kcal: 430,
    avgHr: 148,
    focus: ['补水', '电解质', '碳水', '少量蛋白'],
    effect: '帮助补充糖原和水分，降低运动后疲劳感。'
  },
  strength: {
    label: '力量训练',
    workout: '力量训练',
    steps: 5200,
    duration: 55,
    kcal: 360,
    avgHr: 126,
    focus: ['高蛋白', '适量碳水', '低脂'],
    effect: '蛋白质有助于肌肉修复，适量碳水有助于恢复训练状态。'
  },
  hiit: {
    label: '高强度间歇',
    workout: 'HIIT',
    steps: 7600,
    duration: 28,
    kcal: 390,
    avgHr: 156,
    focus: ['补水', '电解质', '碳水', '蛋白质'],
    effect: '较高强度后优先补水，再补充易消化碳水和蛋白质。'
  },
  light: {
    label: '轻活动日',
    workout: '步行',
    steps: 4200,
    duration: 20,
    kcal: 130,
    avgHr: 92,
    focus: ['清淡', '高纤维', '低油'],
    effect: '活动量较低时，晚餐可控制总热量并提高蔬菜比例。'
  }
};

const recipes = [
  {
    name: '香蕉牛奶燕麦杯',
    emoji: '🥛',
    tags: ['健身', '高蛋白', '快手菜', '有氧恢复'],
    ingredients: ['香蕉', '纯牛奶', '燕麦'],
    reason: '适合有氧或高强度运动后，补充碳水、钾和少量蛋白。'
  },
  {
    name: '鸡胸肉西兰花饭',
    emoji: '🍗',
    tags: ['健身', '高蛋白', '低脂', '力量恢复'],
    ingredients: ['鸡胸肉', '西兰花', '米饭'],
    reason: '适合力量训练后，提供高蛋白和复合碳水。'
  },
  {
    name: '鸡蛋豆腐蒸碗',
    emoji: '🥚',
    tags: ['清淡', '高蛋白', '低油', '晚间训练'],
    ingredients: ['鸡蛋', '豆腐'],
    reason: '适合晚间运动后，清淡且蛋白质充足。'
  },
  {
    name: '番茄鸡蛋全麦三明治',
    emoji: '🥪',
    tags: ['快手菜', '儿童营养', '有氧恢复'],
    ingredients: ['番茄', '鸡蛋', '全麦面包'],
    reason: '适合中等强度运动后，兼顾碳水、蛋白质和饱腹感。'
  },
  {
    name: '豆腐蔬菜汤',
    emoji: '🥣',
    tags: ['素食', '低脂', '清淡', '轻活动', '老人友好'],
    ingredients: ['豆腐', '青菜', '番茄'],
    reason: '适合轻活动日，控制热量并提高蔬菜比例。'
  },
  {
    name: '番茄豆腐鸡蛋羹',
    emoji: '🍲',
    tags: ['老人友好', '清淡', '高蛋白', '低油'],
    ingredients: ['番茄', '豆腐', '鸡蛋'],
    reason: '口感软嫩、少油，适合牙口较弱或需要清淡饮食的老人。'
  },
  {
    name: '牛奶燕麦香蕉糊',
    emoji: '🥣',
    tags: ['老人友好', '快手菜', '有氧恢复'],
    ingredients: ['纯牛奶', '燕麦', '香蕉'],
    reason: '早餐或加餐友好，易咀嚼，也能优先消耗临期牛奶和香蕉。'
  }
];

const preferenceFilters = ['全部', '健身', '高蛋白', '低脂', '快手菜', '清淡', '素食', '儿童营养'];
const substitutions = {
  燕麦: ['全麦面包', '米饭', '红薯'],
  米饭: ['燕麦', '全麦面包', '玉米'],
  豆腐: ['鸡蛋', '低脂奶酪', '鸡胸肉'],
  番茄: ['生菜', '黄瓜', '西兰花'],
  全麦面包: ['燕麦', '米饭', '香蕉'],
  青菜: ['西兰花', '生菜', '菠菜']
};
const familyProfiles = [
  { id: 'member_elder', name: '外婆', age: 72, tags: ['老人', '控糖', '牙口较弱'], conditions: '血压偏高，偏好清淡软烂。' },
  { id: 'member_fitness', name: '小林', age: 31, tags: ['健身成员', '高蛋白'], conditions: '力量训练日需要高蛋白恢复餐。' },
  { id: 'member_fatloss', name: '小周', age: 29, tags: ['减脂成员', '低脂'], conditions: '控制油脂和晚间总热量。' }
];
let page = 'home';
let expiringExpanded = false;
let editingMemberId = null;
let editingGroceryIndex = null;

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ingredients() {
  return readJson(store.ingredients, ingredientsSeed);
}

function health() {
  return readJson(store.health, {
    authorized: false,
    scenario: 'strength',
    lastSyncAt: '',
    summary: null
  });
}

function settings() {
  return readJson(store.settings, {
    expiringReminder: true,
    workoutFoodReminder: true,
    hydrationReminder: true,
    shoppingReminder: true
  });
}

function elder() {
  const member = familyMembers().find((item) => item.tags.includes('老人')) || familyMembers()[0];
  return {
    nickname: member.name,
    age: member.age,
    conditions: member.tags.filter((tag) => tag !== '老人'),
    notes: member.conditions
  };
}

function familyMembers() {
  return readJson(store.familyMembers, familyProfiles);
}

function saveFamilyMembers(next) {
  writeJson(store.familyMembers, next);
}

function groceryRequests() {
  return readJson(store.groceryRequests, groceryForElder());
}

function saveGroceryRequests(next) {
  writeJson(store.groceryRequests, next);
}

function mealLogs() {
  return readJson(store.mealLogs, [
    {
      id: 'meal_1',
      owner: '老人',
      meal: '早餐',
      time: '08:12',
      text: '牛奶燕麦香蕉糊',
      photo: '',
      shared: true
    },
    {
      id: 'meal_2',
      owner: '主要用户',
      meal: '晚餐',
      time: '19:04',
      text: '鸡胸肉西兰花饭',
      photo: '',
      shared: true
    }
  ]);
}

function saveElder(next) {
  writeJson(store.elder, next);
}

function saveMealLogs(next) {
  writeJson(store.mealLogs, next);
}

function recipeFilter() {
  return localStorage.getItem(store.filter) || '全部';
}

function setRecipeFilter(value) {
  localStorage.setItem(store.filter, value);
}

function syncHealth() {
  const current = health();
  const scenario = healthScenarios[current.scenario];
  const summary = {
    ...scenario,
    source: 'iWatch / HealthKit 模拟数据',
    syncedAt: new Date().toISOString()
  };
  writeJson(store.health, {
    ...current,
    authorized: true,
    lastSyncAt: summary.syncedAt,
    summary
  });
  render();
}

function availableNames() {
  return ingredients().map((item) => item.name);
}

function missingFor(recipe) {
  const names = availableNames();
  return recipe.ingredients.filter((item) => !names.includes(item));
}

function recipeScore(recipe, summary) {
  let score = 0;
  const text = `${recipe.tags.join(' ')} ${recipe.ingredients.join(' ')}`;
  if (summary?.focus?.some((tag) => text.includes(tag))) score += 30;
  if (summary?.workout.includes('力量') && recipe.tags.includes('力量恢复')) score += 30;
  if (summary?.workout.includes('跑步') && recipe.tags.includes('有氧恢复')) score += 30;
  if (summary?.workout.includes('HIIT') && recipe.tags.includes('有氧恢复')) score += 18;
  if (summary?.workout.includes('步行') && recipe.tags.includes('轻活动')) score += 30;
  recipe.ingredients.forEach((item) => {
    if (availableNames().includes(item)) score += 12;
  });
  return score;
}

function recoveryScore(recipe) {
  const summary = health().summary;
  const base = recipeScore(recipe, summary);
  const protein = recipe.tags.includes('高蛋白') ? 92 : recipe.tags.includes('低脂') ? 76 : 64;
  const hydration = recipe.tags.includes('有氧恢复') || recipe.ingredients.includes('香蕉') || recipe.ingredients.includes('纯牛奶') ? 86 : 58;
  const fatLoss = recipe.tags.includes('低脂') || recipe.tags.includes('清淡') ? 90 : 62;
  const expiringUse = recipe.ingredients.filter((item) => expiringItems().some((food) => food.name === item)).length * 28 + 36;
  const total = Math.min(98, Math.round((base + protein + hydration + fatLoss + expiringUse) / 4));
  return {
    total,
    protein,
    hydration,
    fatLoss,
    expiringUse: Math.min(96, expiringUse)
  };
}

function fridgeHealthIndex() {
  const data = ingredients();
  const proteinCount = data.filter((item) => ['肉类', '蛋奶'].includes(item.category)).length;
  const produceCount = data.filter((item) => ['蔬菜', '水果'].includes(item.category)).length;
  const expiringCount = expiringItems().length;
  const score = Math.max(58, Math.min(96, 72 + proteinCount * 5 + produceCount * 4 - expiringCount * 6));
  return {
    score,
    protein: proteinCount >= 2 ? '充足' : '偏少',
    produce: produceCount >= 2 ? '合理' : '偏少',
    pressure: expiringCount >= 3 ? '临期压力较高' : '临期压力可控'
  };
}

function wastePredictions() {
  return ingredients()
    .filter((item) => item.wasteRisk >= 25)
    .sort((a, b) => b.wasteRisk - a.wasteRisk)
    .slice(0, 3);
}

function purchasePlan() {
  const summary = health().summary;
  if (!summary) return ['同步运动后生成采购建议'];
  if (summary.workout.includes('力量')) return ['豆腐', '低脂牛奶', '米饭', '牛肉'];
  if (summary.workout.includes('跑步') || summary.workout.includes('HIIT')) return ['燕麦', '全麦面包', '电解质饮品', '酸奶'];
  return ['青菜', '豆腐', '番茄', '低脂酸奶'];
}

function smartShoppingTips() {
  const names = availableNames();
  return purchasePlan().map((item) => {
    if (names.includes(item)) return { item, tag: '家里已有', desc: '先检查库存，避免重复购买。' };
    if (['西兰花', '青菜', '香蕉'].includes(item)) return { item, tag: '易浪费', desc: '建议少量购买，优先安排 2 天内食用。' };
    return { item, tag: '匹配目标', desc: '与当前运动恢复或饮食偏好匹配。' };
  });
}

function lifecycleSteps(item) {
  const steps = ['购买', '新鲜', '临期', '今日到期', '建议处理', '已消耗'];
  const active = item.status === '新鲜' ? 1 : item.status === '临期' ? 2 : item.status === '今日到期' ? 3 : item.status === '已过期' ? 4 : 5;
  return steps.map((step, index) => `<span class="life-step ${index <= active ? 'active' : ''}">${step}</span>`).join('');
}

function workoutRecipes(limit = 3) {
  const summary = health().summary;
  return [...recipes]
    .sort((a, b) => recipeScore(b, summary) - recipeScore(a, summary))
    .slice(0, limit);
}

function filteredRecipes() {
  const filter = recipeFilter();
  return recipes.filter((recipe) => filter === '全部' || recipe.tags.includes(filter));
}

function expiringItems() {
  return ingredients().filter((item) => item.status === '临期' || item.status === '今日到期');
}

function expiredItems() {
  return ingredients().filter((item) => item.status === '已过期' || item.days < 0);
}

function elderFridgeHealth() {
  const data = ingredients();
  const expired = expiredItems().length;
  const expiring = expiringItems().length;
  const elderFriendlyCount = data.filter((item) => ['蛋奶', '蔬菜', '水果'].includes(item.category)).length;
  const score = Math.max(45, Math.min(96, 82 + elderFriendlyCount * 3 - expired * 16 - expiring * 5));
  return {
    score,
    expired,
    expiring,
    protein: data.some((item) => ['鸡蛋', '豆腐', '纯牛奶', '鸡胸肉'].includes(item.name)) ? '可满足' : '偏少',
    fiber: data.some((item) => ['西兰花', '青菜', '香蕉'].includes(item.name)) ? '有储备' : '偏少'
  };
}

function elderRecipes() {
  const elderInfo = elder();
  const conditionText = elderInfo.conditions.join(' ');
  return recipes
    .map((recipe) => {
      let score = recipe.tags.includes('老人友好') ? 40 : 0;
      if (recipe.tags.includes('清淡')) score += 20;
      if (recipe.tags.includes('高蛋白')) score += 16;
      if (conditionText.includes('牙口') && /羹|糊|汤|豆腐/.test(recipe.name)) score += 20;
      recipe.ingredients.forEach((item) => {
        if (availableNames().includes(item)) score += 8;
      });
      return { ...recipe, elderScore: score };
    })
    .sort((a, b) => b.elderScore - a.elderScore)
    .slice(0, 3);
}

function careReminders() {
  const reminders = [];
  const expiring = expiringItems();
  const expired = expiredItems();
  if (expiring.length) {
    reminders.push({
      level: 'warning',
      title: '临期食材提醒',
      text: `${expiring.map((item) => item.name).join('、')} 即将到期，已同步给老人和主要用户。`
    });
  }
  if (expired.length) {
    reminders.push({
      level: 'danger',
      title: '过期食材提醒',
      text: `${expired.map((item) => item.name).join('、')} 已过期，请老人不要食用，主要用户需确认处理。`
    });
  }
  reminders.push({
    level: 'success',
    title: '餐食规律提醒',
    text: mealRegularity().summary
  });
  return reminders;
}

function groceryForElder() {
  const base = ['豆腐', '低脂牛奶', '番茄', '燕麦', '低钠调味品'];
  return base.map((item) => ({
    item,
    status: availableNames().includes(item) ? '家里已有' : '可帮老人买菜',
    source: '模拟外卖/买菜平台'
  }));
}

function mealRegularity() {
  const logs = mealLogs();
  const todayCount = logs.length;
  const hasBreakfast = logs.some((item) => item.meal === '早餐');
  const hasDinner = logs.some((item) => item.meal === '晚餐');
  const score = Math.min(96, 58 + todayCount * 12 + (hasBreakfast ? 10 : 0) + (hasDinner ? 8 : 0));
  return {
    score,
    summary: todayCount >= 3 ? '今天餐食记录较完整，规律性良好。' : '今天餐食记录偏少，建议提醒老人补充打卡。',
    risk: hasDinner ? '晚餐已记录' : '晚餐未打卡'
  };
}

function statusClass(status) {
  if (status === '已过期') return 'danger';
  if (status === '临期' || status === '今日到期') return 'warning';
  return 'success';
}

function renderIngredient(item) {
  const emoji = item.category === '水果' ? '🍌' : item.category === '蔬菜' ? '🥬' : item.category === '肉类' ? '🥩' : item.category === '蛋奶' ? '🥛' : '🍽️';
  return `
    <article class="ingredient-card card">
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

function renderHome() {
  const expiring = expiringItems();
  const visible = expiringExpanded ? expiring : expiring.slice(0, 3);
  const summary = health().summary;
  const fridge = fridgeHealthIndex();
  const mustEat = expiring.map((item) => item.name).join('、') || '暂无';
  const shopping = smartShoppingTips();
  return `
    <main class="page">
      <section class="hero card">
        <div>
          <p class="eyebrow">AI 食材管家 MVP</p>
          <h1>今天优先处理 ${expiring.length} 个临期食材</h1>
          <p>结合库存、饮食偏好和运动状态，生成每日食材处理与运动后饮食建议。</p>
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

      <section class="card card-section toggle-content ${expiringExpanded ? '' : 'collapsed'}">
        <div class="section-title">
          <h2>今日提醒 · 临期食品</h2>
          ${expiring.length > 3 ? `<button class="text-button" data-action="toggle-expiring">${expiringExpanded ? '收起' : '展开更多'}</button>` : ''}
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
        <p class="muted">${summary ? `${summary.workout}后建议：${summary.focus.join('、')}。${summary.effect}` : '还没有同步 iWatch 运动信息，先在“我的”中模拟同步。'}</p>
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

function renderLibrary() {
  const waste = wastePredictions();
  return `
    <main class="page">
      <div class="page-header">
        <div>
          <p class="eyebrow">库存</p>
          <h1>我的食材库</h1>
        </div>
      </div>
      <section class="card card-section">
        <div class="section-title">
          <h2>食材浪费预测</h2>
          <span class="muted">基于历史消耗模拟</span>
        </div>
        ${waste.map((item) => `<p class="waste-line">${item.name} 浪费风险 ${item.wasteRisk}%：建议下次少买或提前安排菜谱。</p>`).join('')}
      </section>
      <section class="stack">
        ${ingredients().map(renderIngredient).join('')}
      </section>
    </main>
  `;
}

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
    </main>
  `;
}

function renderCare() {
  const elderInfo = elder();
  const fridge = elderFridgeHealth();
  const regularity = mealRegularity();
  const reminders = careReminders();
  const grocery = groceryRequests();
  const members = familyMembers();
  const editingMember = members.find((item) => item.id === editingMemberId);
  const editingGrocery = editingGroceryIndex !== null ? grocery[editingGroceryIndex] : null;
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
      ${pages[page]()}
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

function tab(key, label) {
  return `<button class="tab ${page === key ? 'active' : ''}" data-page="${key}">${label}</button>`;
}

function bindEvents() {
  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      page = button.dataset.page;
      render();
    });
  });
  document.querySelector('[data-action="toggle-expiring"]')?.addEventListener('click', () => {
    expiringExpanded = !expiringExpanded;
    render();
  });
  document.querySelector('[data-action="health-auth"]')?.addEventListener('click', () => {
    writeJson(store.health, { ...health(), authorized: true });
    render();
  });
  document.querySelector('[data-action="health-sync"]')?.addEventListener('click', syncHealth);
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
      id: editingMemberId || `member_${Date.now()}`,
      name,
      age,
      tags,
      conditions
    };
    saveFamilyMembers(editingMemberId ? current.map((item) => item.id === editingMemberId ? draft : item) : [draft, ...current]);
    editingMemberId = null;
    render();
  });
  document.querySelectorAll('[data-edit-member]').forEach((button) => {
    button.addEventListener('click', () => {
      editingMemberId = button.dataset.editMember;
      render();
    });
  });
  document.querySelector('[data-action="add-grocery"]')?.addEventListener('click', () => {
    const item = document.querySelector('[data-grocery-item]')?.value.trim() || '未命名需求';
    const note = document.querySelector('[data-grocery-note]')?.value.trim() || '人工添加';
    const current = groceryRequests();
    const draft = { item, note, status: '待确认' };
    if (editingGroceryIndex !== null) {
      current[editingGroceryIndex] = draft;
      saveGroceryRequests(current);
    } else {
      saveGroceryRequests([draft, ...current]);
    }
    editingGroceryIndex = null;
    render();
  });
  document.querySelector('[data-action="generate-grocery"]')?.addEventListener('click', () => {
    saveGroceryRequests(groceryForElder().map((item) => ({ ...item, note: `${item.source} · 模拟生成` })));
    editingGroceryIndex = null;
    render();
  });
  document.querySelectorAll('[data-edit-grocery]').forEach((button) => {
    button.addEventListener('click', () => {
      editingGroceryIndex = Number(button.dataset.editGrocery);
      render();
    });
  });
  document.querySelector('[data-action="mock-order"]')?.addEventListener('click', () => {
    alert('已模拟同步买菜需求给主要用户确认。');
  });
  document.querySelector('[data-action="mock-meal-ocr"]')?.addEventListener('click', () => {
    const samples = ['番茄豆腐鸡蛋羹', '牛奶燕麦香蕉糊', '豆腐蔬菜汤', '鸡蛋青菜软饭'];
    const input = document.querySelector('[data-meal-text]');
    if (input) input.value = samples[Math.floor(Math.random() * samples.length)];
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
    render();
  });
}

if (!localStorage.getItem(store.ingredients)) {
  writeJson(store.ingredients, ingredientsSeed);
}

render();
