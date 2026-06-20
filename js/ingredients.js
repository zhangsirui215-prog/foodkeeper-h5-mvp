import { store, ingredientsSeed, WASTE_RISK_HIGH } from './data/index.js';
import { readJson, writeJson } from './store.js';

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
 * @returns {Array<{id?: string, name: string, category: string, qty: number, unit: string, status: string, days: number, wasteRisk: number, purchaseDate?: string, shelfLife?: number}>}
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
 * 根据保质期与购入日期计算剩余天数
 * @param {string} purchaseDateStr - ISO 日期字符串（YYYY-MM-DD）
 * @param {number} shelfLifeDays - 保质期天数
 * @returns {number} 剩余天数（可负数）
 */
function calcRemainingDays(purchaseDateStr, shelfLifeDays) {
  if (!purchaseDateStr || !shelfLifeDays) return 0;
  const purchase = new Date(purchaseDateStr).getTime();
  const now = Date.now();
  const elapsedDays = Math.floor((now - purchase) / 86400000);
  return Number(shelfLifeDays) - elapsedDays;
}

/**
 * 根据剩余天数计算状态
 * @param {number} remainingDays - 剩余天数
 * @returns {'已过期'|'今日到期'|'临期'|'新鲜'}
 */
function calcStatus(remainingDays) {
  if (remainingDays < 0) return '已过期';
  if (remainingDays === 0) return '今日到期';
  if (remainingDays <= 3) return '临期';
  return '新鲜';
}

/**
 * 根据状态估算浪费风险（0-100）
 * @param {string} status 状态
 * @param {number} remainingDays 剩余天数
 * @returns {number} 浪费风险百分比
 */
function calcWasteRisk(status, remainingDays) {
  if (status === '已过期') return 90;
  if (status === '今日到期') return 60;
  if (status === '临期') return 35;
  if (remainingDays <= 7) return 20;
  return 10;
}

/**
 * 重新计算食材的派生字段
 * @param {object} ing 食材对象
 * @returns {object} 含 status/days/wasteRisk 的新对象
 */
function recalcDerived(ing) {
  const days = calcRemainingDays(ing.purchaseDate, ing.shelfLife);
  const status = calcStatus(days);
  const wasteRisk = calcWasteRisk(status, days);
  return { ...ing, days, status, wasteRisk };
}

/**
 * 根据 ID 获取食材
 * @param {string} id
 * @returns {object|null}
 */
function getIngredientById(id) {
  return ingredients().find((item) => item.id === id) || null;
}

/**
 * 校验食材表单数据
 * @param {{name: string, category: string, qty: number, unit: string, shelfLife: number, purchaseDate: string}} payload
 * @returns {{ok: boolean, field?: string, msg?: string}}
 */
function validateIngredientPayload(payload) {
  if (!payload.name || !payload.name.trim()) {
    return { ok: false, field: 'name', msg: '请输入食材名称' };
  }
  if (!payload.category) {
    return { ok: false, field: 'category', msg: '请选择类别' };
  }
  const qty = Number(payload.qty);
  if (!Number.isFinite(qty) || qty <= 0) {
    return { ok: false, field: 'qty', msg: '数量必须大于 0' };
  }
  if (!payload.unit) {
    return { ok: false, field: 'unit', msg: '请选择单位' };
  }
  const shelfLife = Number(payload.shelfLife);
  if (!Number.isFinite(shelfLife) || shelfLife <= 0) {
    return { ok: false, field: 'shelfLife', msg: '保质期必须大于 0 天' };
  }
  if (!payload.purchaseDate) {
    return { ok: false, field: 'purchaseDate', msg: '请选择购入日期' };
  }
  return { ok: true };
}

/**
 * 添加食材
 * @param {{name: string, category: string, qty: number, unit: string, shelfLife: number, purchaseDate: string}} payload
 * @returns {{ok: boolean, data?: object, error?: {field: string, msg: string}}}
 */
function addIngredient(payload) {
  const valid = validateIngredientPayload(payload);
  if (!valid.ok) return { ok: false, error: valid };
  const list = ingredients();
  const dup = list.find((it) => it.name.trim().toLowerCase() === payload.name.trim().toLowerCase());
  if (dup) return { ok: false, error: { field: 'name', msg: '食材已存在' } };
  const base = {
    id: `ing_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: payload.name.trim(),
    category: payload.category,
    qty: Number(payload.qty),
    unit: payload.unit,
    purchaseDate: payload.purchaseDate,
    shelfLife: Number(payload.shelfLife)
  };
  const item = recalcDerived(base);
  list.unshift(item);
  writeJson(store.ingredients, list);
  return { ok: true, data: item };
}

/**
 * 更新食材
 * @param {string} id
 * @param {object} patch
 * @returns {{ok: boolean, data?: object, error?: {field: string, msg: string}}}
 */
function updateIngredient(id, patch) {
  const list = ingredients();
  const idx = list.findIndex((it) => it.id === id);
  if (idx < 0) return { ok: false, error: { field: 'id', msg: '食材不存在' } };
  const merged = { ...list[idx], ...patch, id };
  const valid = validateIngredientPayload(merged);
  if (!valid.ok) return { ok: false, error: valid };
  const dup = list.find((it) => it.id !== id && it.name.trim().toLowerCase() === merged.name.trim().toLowerCase());
  if (dup) return { ok: false, error: { field: 'name', msg: '食材已存在' } };
  const item = recalcDerived(merged);
  list[idx] = item;
  writeJson(store.ingredients, list);
  return { ok: true, data: item };
}

/**
 * 删除食材
 * @param {string} id
 * @returns {{ok: boolean}}
 */
function deleteIngredient(id) {
  const list = ingredients();
  const next = list.filter((it) => it.id !== id);
  writeJson(store.ingredients, next);
  return { ok: true };
}

/**
 * 标记食材为已消耗：记录碳足迹并从库移除
 * @param {string} id
 * @returns {{ok: boolean, saved?: number, error?: {msg: string}}}
 */
function markConsumed(id) {
  const item = getIngredientById(id);
  if (!item) return { ok: false, error: { msg: '食材不存在' } };
  const saved = recordCarbonSaving(item, `消耗${item.name}`);
  deleteIngredient(id);
  return { ok: true, saved };
}

/**
 * 按关键字/状态/类别筛选食材
 * @param {{keyword?: string, status?: string, category?: string}} criteria
 * @returns {Array}
 */
function searchIngredients(criteria = {}) {
  const { keyword = '', status = '', category = '' } = criteria;
  const kw = keyword.trim().toLowerCase();
  return ingredients().filter((it) => {
    if (kw && !it.name.toLowerCase().includes(kw)) return false;
    if (status && it.status !== status) return false;
    if (category && it.category !== category) return false;
    return true;
  });
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

export {
  ingredients,
  availableNames,
  expiringItems,
  expiredItems,
  fridgeHealthIndex,
  wastePredictions,
  lifecycleSteps,
  statusClass,
  calcRemainingDays,
  calcStatus,
  calcWasteRisk,
  recalcDerived,
  getIngredientById,
  addIngredient,
  updateIngredient,
  deleteIngredient,
  markConsumed,
  searchIngredients,
  getCarbonData,
  calcCarbonSaved,
  recordCarbonSaving,
  getCarbonAnalogy,
  getCarbonMilestone
};

// 初始化碳足迹数据
if (!localStorage.getItem(CARBON_STORAGE_KEY)) {
  saveCarbonData({ saved: 0, history: [], badges: [] });
}