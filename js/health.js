import { store, healthScenarios } from './data/index.js';
import { readJson, writeJson } from './store.js';
import { render } from './ui.js';

/**
 * 获取健康数据
 * @returns {{authorized: boolean, scenario: string, lastSyncAt: string, summary: Object|null}}
 */
function health() {
  return readJson(store.health, {
    authorized: false,
    scenario: 'strength',
    lastSyncAt: '',
    summary: null
  });
}

/**
 * 同步健康数据
 */
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

/**
 * 获取设置
 * @returns {{expiringReminder: boolean, workoutFoodReminder: boolean, hydrationReminder: boolean, shoppingReminder: boolean}}
 */
function settings() {
  return readJson(store.settings, {
    expiringReminder: true,
    workoutFoodReminder: true,
    hydrationReminder: true,
    shoppingReminder: true
  });
}

/**
 * 获取菜谱筛选值
 * @returns {string}
 */
function recipeFilter() {
  return localStorage.getItem(store.filter) || '全部';
}

/**
 * 设置菜谱筛选值
 * @param {string} value 筛选值
 */
function setRecipeFilter(value) {
  localStorage.setItem(store.filter, value);
}

export { health, syncHealth, settings, recipeFilter, setRecipeFilter };