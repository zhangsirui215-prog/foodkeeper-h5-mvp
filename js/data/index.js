/**
 * 食材种子数据
 * @type {Array<{name: string, category: string, qty: number, unit: string, status: string, days: number, wasteRisk: number}>}
 */
const ingredientsSeed = [
  { name: '鸡胸肉', category: '肉类', qty: 2, unit: '块', status: '临期', days: 1, wasteRisk: 22 },
  { name: '纯牛奶', category: '蛋奶', qty: 1, unit: '盒', status: '临期', days: 2, wasteRisk: 18 },
  { name: '香蕉', category: '水果', qty: 4, unit: '根', status: '临期', days: 2, wasteRisk: 34 },
  { name: '西兰花', category: '蔬菜', qty: 1, unit: '颗', status: '新鲜', days: 4, wasteRisk: 67 },
  { name: '鸡蛋', category: '蛋奶', qty: 6, unit: '个', status: '新鲜', days: 18, wasteRisk: 12 },
  { name: '豆腐', category: '蛋奶', qty: 1, unit: '盒', status: '今日到期', days: 0, wasteRisk: 52 },
  { name: '青菜', category: '蔬菜', qty: 1, unit: '把', status: '已过期', days: -1, wasteRisk: 74 }
];

/**
 * 健康场景数据
 * @type {Object<string, {label: string, workout: string, steps: number, duration: number, kcal: number, avgHr: number, focus: string[], effect: string}>}
 */
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

/**
 * 菜谱数据
 * @type {Array<{name: string, emoji: string, tags: string[], ingredients: string[], reason: string}>}
 */
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

/**
 * 偏好筛选列表
 * @type {string[]}
 */
const preferenceFilters = ['全部', '健身', '高蛋白', '低脂', '快手菜', '清淡', '素食', '儿童营养'];

/**
 * 食材替换映射
 * @type {Object<string, string[]>}
 */
const substitutions = {
  燕麦: ['全麦面包', '米饭', '红薯'],
  米饭: ['燕麦', '全麦面包', '玉米'],
  豆腐: ['鸡蛋', '低脂奶酪', '鸡胸肉'],
  番茄: ['生菜', '黄瓜', '西兰花'],
  全麦面包: ['燕麦', '米饭', '香蕉'],
  青菜: ['西兰花', '生菜', '菠菜']
};

/**
 * 家庭成员画像
 * @type {Array<{id: string, name: string, age: number, tags: string[], conditions: string}>}
 */
const familyProfiles = [
  { id: 'member_elder', name: '外婆', age: 72, tags: ['老人', '控糖', '牙口较弱'], conditions: '血压偏高，偏好清淡软烂。' },
  { id: 'member_fitness', name: '小林', age: 31, tags: ['健身成员', '高蛋白'], conditions: '力量训练日需要高蛋白恢复餐。' },
  { id: 'member_fatloss', name: '小周', age: 29, tags: ['减脂成员', '低脂'], conditions: '控制油脂和晚间总热量。' }
];

/**
 * localStorage key 常量
 * @type {Object<string, string>}
 */
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

/** 浪费风险高阈值 */
const WASTE_RISK_HIGH = 25;

/** 食材类别枚举（录入表单使用） */
const CATEGORIES = ['肉类', '蛋奶', '蔬菜', '水果', '其他'];

/** 食材单位枚举（录入表单使用） */
const UNIT_OPTIONS = ['个', 'g', 'kg', 'ml', 'L', '把', '盒', '袋', '块', '颗', '根'];

export {
  ingredientsSeed,
  healthScenarios,
  recipes,
  preferenceFilters,
  substitutions,
  familyProfiles,
  store,
  WASTE_RISK_HIGH,
  CATEGORIES,
  UNIT_OPTIONS
};