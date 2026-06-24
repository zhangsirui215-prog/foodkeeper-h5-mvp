import { store, ingredientsSeed, WASTE_RISK_HIGH, CATEGORIES, UNIT_OPTIONS } from './data/index.js';
import { readJson, writeJson } from './store.js';

/**
 * 计算剩余天数
 * @param {string} purchaseDateStr 购入日期 YYYY-MM-DD
 * @param {number} shelfLifeDays 保质期天数
 * @returns {number} 剩余天数
 */
function calcRemainingDays(purchaseDateStr, shelfLifeDays) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const purchase = new Date(purchaseDateStr);
  purchase.setHours(0, 0, 0, 0);
  const diff = today - purchase;
  return shelfLifeDays - Math.floor(diff / 86400000);
}

/**
 * 根据剩余天数计算食材状态
 * @param {number} remainingDays
 * @returns {'新鲜'|'临期'|'今日到期'|'已过期'}
 */
function calcStatus(remainingDays) {
  if (remainingDays < 0) return '已过期';
  if (remainingDays === 0) return '今日到期';
  if (remainingDays <= 3) return '临期';
  return '新鲜';
}

/**
 * 食材类别碳足迹基准（g CO₂/份）
 * 基于环保组织公开数据估算
 */
const CARBON_FOOTPRINT_MAP = {
  '肉类': 3200,
  '蛋奶': 1800,
  '蔬菜': 400,
  '水果': 300
};

/** 碳足迹数据 localStorage key */
const CARBON_STORAGE_KEY = 'foodkeeper.carbon.v1';

/** 碳足迹成就里程碑（g CO₂） */
const CARBON_MILESTONES = [1000, 5000, 10000, 50000, 100000];

/** 一棵树年均碳吸收量（g CO₂/年） */
const TREE_CARBON_ABSORPTION = 21000;

/**
 * 获取食材列表
 * @returns {Array<{name: string, category: string, qty: number, unit: string, status: string, days: number, wasteRisk: number}>}
 */
function ingredients() {
  return readJson(store.ingredients, ingredientsSeed);
}

/**
 * 获取可用食材名称列表
 * @returns {string[]}
 */
function availableNames() {
  return ingredients().map((item) => item.name);
}

/**
 * 获取临期食材
 * @returns {Array<{name: string, category: string, qty: number, unit: string, status: string, days: number, wasteRisk: number}>}
 */
function expiringItems() {
  return ingredients().filter((item) => item.status === '临期' || item.status === '今日到期');
}

/**
 * 获取过期食材
 * @returns {Array<{name: string, category: string, qty: number, unit: string, status: string, days: number, wasteRisk: number}>}
 */
function expiredItems() {
  return ingredients().filter((item) => item.status === '已过期' || item.days < 0);
}

/**
 * 冰箱健康指数
 * @returns {{score: number, protein: string, produce: string, pressure: string}}
 */
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

/**
 * 浪费预测
 * @returns {Array<{name: string, category: string, qty: number, unit: string, status: string, days: number, wasteRisk: number}>}
 */
function wastePredictions() {
  return ingredients()
    .filter((item) => item.wasteRisk >= WASTE_RISK_HIGH)
    .sort((a, b) => b.wasteRisk - a.wasteRisk)
    .slice(0, 3);
}

/**
 * 食材生命周期步骤
 * @param {{status: string}} item 食材对象
 * @returns {string} HTML 字符串
 */
function lifecycleSteps(item) {
  const steps = ['购买', '新鲜', '临期', '今日到期', '建议处理', '已消耗'];
  const active = item.status === '新鲜' ? 1 : item.status === '临期' ? 2 : item.status === '今日到期' ? 3 : item.status === '已过期' ? 4 : 5;
  return steps.map((step, index) => `<span class="life-step ${index <= active ? 'active' : ''}">${step}</span>`).join('');
}

/**
 * 状态样式类
 * @param {string} status 食材状态
 * @returns {string} CSS 类名
 */
function statusClass(status) {
  if (status === '已过期') return 'danger';
  if (status === '临期' || status === '今日到期') return 'warning';
  return 'success';
}

/**
 * 获取碳足迹数据
 * @returns {{ saved: number, history: Array<{date: string, saved: number, label: string}>, badges: string[] }}
 */
function getCarbonData() {
  return readJson(CARBON_STORAGE_KEY, { saved: 0, history: [], badges: [] });
}

/**
 * 保存碳足迹数据
 * @param {object} data - 碳足迹数据对象
 */
function saveCarbonData(data) {
  writeJson(CARBON_STORAGE_KEY, data);
}

/**
 * 计算消耗食材节省的碳足迹
 * @param {{ name: string, category: string }} ingredient - 食材对象
 * @returns {number} 节省的 CO₂ 克数
 */
function calcCarbonSaved(ingredient) {
  return CARBON_FOOTPRINT_MAP[ingredient.category] || 200;
}

/**
 * 记录一次碳足迹节省事件
 * @param {{ name: string, category: string }} ingredient - 被消耗的食材
 * @param {string} [label] - 事件描述
 */
function recordCarbonSaving(ingredient, label = '') {
  const data = getCarbonData();
  const saved = calcCarbonSaved(ingredient);
  data.saved += saved;
  data.history.push({
    date: new Date().toISOString().split('T')[0],
    saved,
    label: label || `消耗${ingredient.name}`
  });
  saveCarbonData(data);
  return saved;
}

/**
 * 获取碳足迹类比换算文案
 * @param {number} totalSaved - 累计节省碳足迹(g)
 * @returns {string} 类比文案
 */
function getCarbonAnalogy(totalSaved) {
  const trees = Math.floor(totalSaved / TREE_CARBON_ABSORPTION);
  if (trees >= 1) return `相当于 🌲 ${trees} 棵树一年的碳吸收量`;
  const percent = Math.round((totalSaved / TREE_CARBON_ABSORPTION) * 100);
  return `相当于一棵树年碳吸收量的 ${percent}%`;
}

/**
 * 获取当前碳足迹里程碑进度
 * @param {number} totalSaved - 累计节省碳足迹(g)
 * @returns {{ current: number, next: number, progress: number }}
 */
function getCarbonMilestone(totalSaved) {
  let current = 0;
  let next = CARBON_MILESTONES[0];
  for (let i = 0; i < CARBON_MILESTONES.length; i++) {
    if (totalSaved >= CARBON_MILESTONES[i]) {
      current = CARBON_MILESTONES[i];
      next = CARBON_MILESTONES[i + 1] || current;
    } else {
      next = CARBON_MILESTONES[i];
      break;
    }
  }
  const progress = next > current ? ((totalSaved - current) / (next - current)) * 100 : 100;
  return { current, next, progress: Math.min(100, progress) };
}

/**
 * 添加食材
 * @param {{name: string, category: string, qty: number, unit: string, shelfLife: number, purchaseDate: string}} payload
 * @returns {{ok: boolean, ingredient?: object, error?: string}}
 */
function addIngredient(payload) {
  // 必填校验
  if (!payload.name || !payload.name.trim()) return { ok: false, error: '请输入食材名称' };
  if (!payload.category) return { ok: false, error: '请选择食材类别' };
  if (!payload.qty || payload.qty <= 0) return { ok: false, error: '数量必须大于 0' };
  if (!payload.shelfLife || payload.shelfLife <= 0) return { ok: false, error: '保质期天数必须大于 0' };
  if (!payload.purchaseDate) return { ok: false, error: '请选择购入日期' };
  
  // 查重
  const list = ingredients();
  const name = payload.name.trim();
  if (list.some(item => item.name.toLowerCase() === name.toLowerCase())) {
    return { ok: false, error: `"${name}" 已在食材库中` };
  }
  
  const days = calcRemainingDays(payload.purchaseDate, payload.shelfLife);
  const ingredient = {
    id: `ing_${Date.now()}`,
    name,
    category: payload.category,
    qty: Number(payload.qty),
    unit: payload.unit || '个',
    status: calcStatus(days),
    days,
    wasteRisk: days <= 3 ? Math.max(25, Math.min(90, 70 - days * 15)) : Math.max(5, 60 - days * 3),
    purchaseDate: payload.purchaseDate,
    shelfLife: Number(payload.shelfLife)
  };
  
  writeJson(store.ingredients, [ingredient, ...list]);
  return { ok: true, ingredient };
}

/**
 * 更新食材
 * @param {string} id 食材 id
 * @param {object} patch 要更新的字段
 * @returns {{ok: boolean, ingredient?: object, error?: string}}
 */
function updateIngredient(id, patch) {
  const list = ingredients();
  const index = list.findIndex(item => item.id === id);
  if (index === -1) return { ok: false, error: '食材不存在' };
  
  const updated = { ...list[index], ...patch };
  // 如果有购入日期或保质期变化，重算状态
  if (patch.purchaseDate || patch.shelfLife) {
    const purchaseDate = patch.purchaseDate || updated.purchaseDate;
    const shelfLife = patch.shelfLife || updated.shelfLife;
    updated.days = calcRemainingDays(purchaseDate, shelfLife);
    updated.status = calcStatus(updated.days);
    updated.wasteRisk = updated.days <= 3 ? Math.max(25, Math.min(90, 70 - updated.days * 15)) : Math.max(5, 60 - updated.days * 3);
  }
  
  list[index] = updated;
  writeJson(store.ingredients, list);
  return { ok: true, ingredient: updated };
}

/**
 * 删除食材
 * @param {string} id
 * @returns {{ok: boolean}}
 */
function deleteIngredient(id) {
  const list = ingredients().filter(item => item.id !== id);
  writeJson(store.ingredients, list);
  return { ok: true };
}

/**
 * 通过 id 获取食材
 * @param {string} id
 * @returns {object|undefined}
 */
function getIngredientById(id) {
  return ingredients().find(item => item.id === id);
}

/**
 * 标记食材为已消耗（记录碳足迹后删除）
 * @param {string} id
 * @returns {{ok: boolean, saved?: number, error?: string}}
 */
function markConsumed(id) {
  const ingredient = getIngredientById(id);
  if (!ingredient) return { ok: false, error: '食材不存在' };
  const saved = recordCarbonSaving(ingredient, `消耗${ingredient.name}`);
  deleteIngredient(id);
  return { ok: true, saved };
}

/**
 * 搜索食材
 * @param {{keyword?: string, status?: string, category?: string}} filters
 * @returns {Array}
 */
function searchIngredients({ keyword, status, category } = {}) {
  let list = ingredients();
  if (keyword) {
    const kw = keyword.toLowerCase();
    list = list.filter(item => item.name.toLowerCase().includes(kw));
  }
  if (status && status !== '全部') {
    if (status === '临期') {
      list = list.filter(item => item.status === '临期' || item.status === '今日到期');
    } else {
      list = list.filter(item => item.status === status);
    }
  }
  if (category) {
    list = list.filter(item => item.category === category);
  }
  return list;
}

export { ingredients, availableNames, expiringItems, expiredItems, fridgeHealthIndex, wastePredictions, lifecycleSteps, statusClass, getCarbonData, calcCarbonSaved, recordCarbonSaving, getCarbonAnalogy, getCarbonMilestone, calcRemainingDays, calcStatus, addIngredient, updateIngredient, deleteIngredient, getIngredientById, markConsumed, searchIngredients };

// 初始化碳足迹数据
if (!localStorage.getItem(CARBON_STORAGE_KEY)) {
  saveCarbonData({ saved: 0, history: [], badges: [] });
}