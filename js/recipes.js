import { recipes, substitutions } from './data/index.js';
import { availableNames, expiringItems } from './ingredients.js';
import { health, recipeFilter } from './health.js';
import { elder } from './family.js';

/**
 * 缺失食材
 * @param {{ingredients: string[]}} recipe 菜谱对象
 * @returns {string[]}
 */
function missingFor(recipe) {
  const names = availableNames();
  return recipe.ingredients.filter((item) => !names.includes(item));
}

/**
 * 菜谱评分
 * @param {{tags: string[], ingredients: string[]}} recipe 菜谱对象
 * @param {{focus?: string[], workout?: string}} summary 运动摘要
 * @returns {number}
 */
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

/**
 * 恢复评分
 * @param {{tags: string[], ingredients: string[]}} recipe 菜谱对象
 * @returns {{total: number, protein: number, hydration: number, fatLoss: number, expiringUse: number}}
 */
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

/**
 * 运动推荐菜谱
 * @param {number} [limit=3] 返回数量限制
 * @returns {Array<{name: string, emoji: string, tags: string[], ingredients: string[], reason: string}>}
 */
function workoutRecipes(limit = 3) {
  const summary = health().summary;
  return [...recipes]
    .sort((a, b) => recipeScore(b, summary) - recipeScore(a, summary))
    .slice(0, limit);
}

/**
 * 筛选菜谱
 * @returns {Array<{name: string, emoji: string, tags: string[], ingredients: string[], reason: string}>}
 */
function filteredRecipes() {
  const filter = recipeFilter();
  return recipes.filter((recipe) => filter === '全部' || recipe.tags.includes(filter));
}

/**
 * 老人推荐菜谱
 * @returns {Array<{name: string, emoji: string, tags: string[], ingredients: string[], reason: string, elderScore: number}>}
 */
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

/**
 * 采购计划
 * @returns {string[]}
 */
function purchasePlan() {
  const summary = health().summary;
  if (!summary) return ['同步运动后生成采购建议'];
  if (summary.workout.includes('力量')) return ['豆腐', '低脂牛奶', '米饭', '牛肉'];
  if (summary.workout.includes('跑步') || summary.workout.includes('HIIT')) return ['燕麦', '全麦面包', '电解质饮品', '酸奶'];
  return ['青菜', '豆腐', '番茄', '低脂酸奶'];
}

/**
 * 智能采购建议
 * @returns {Array<{item: string, tag: string, desc: string}>}
 */
function smartShoppingTips() {
  const names = availableNames();
  return purchasePlan().map((item) => {
    if (names.includes(item)) return { item, tag: '家里已有', desc: '先检查库存，避免重复购买。' };
    if (['西兰花', '青菜', '香蕉'].includes(item)) return { item, tag: '易浪费', desc: '建议少量购买，优先安排 2 天内食用。' };
    return { item, tag: '匹配目标', desc: '与当前运动恢复或饮食偏好匹配。' };
  });
}

export { missingFor, recipeScore, recoveryScore, workoutRecipes, filteredRecipes, elderRecipes, purchasePlan, smartShoppingTips };