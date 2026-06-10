import { store, familyProfiles } from './data/index.js';
import { readJson, writeJson } from './store.js';
import { ingredients, availableNames, expiringItems, expiredItems } from './ingredients.js';

/**
 * 老人信息
 * @returns {{nickname: string, age: number, conditions: string[], notes: string}}
 */
function elder() {
  const member = familyMembers().find((item) => item.tags.includes('老人')) || familyMembers()[0];
  return {
    nickname: member.name,
    age: member.age,
    conditions: member.tags.filter((tag) => tag !== '老人'),
    notes: member.conditions
  };
}

/**
 * 家庭成员列表
 * @returns {Array<{id: string, name: string, age: number, tags: string[], conditions: string}>}
 */
function familyMembers() {
  return readJson(store.familyMembers, familyProfiles);
}

/**
 * 保存家庭成员列表
 * @param {Array<{id: string, name: string, age: number, tags: string[], conditions: string}>} next
 */
function saveFamilyMembers(next) {
  writeJson(store.familyMembers, next);
}

/**
 * 买菜需求列表
 * @returns {Array<{item: string, status: string, source?: string, note?: string}>}
 */
function groceryRequests() {
  return readJson(store.groceryRequests, groceryForElder());
}

/**
 * 保存买菜需求列表
 * @param {Array<{item: string, status: string, source?: string, note?: string}>} next
 */
function saveGroceryRequests(next) {
  writeJson(store.groceryRequests, next);
}

/**
 * 餐食记录
 * @returns {Array<{id: string, owner: string, meal: string, time: string, text: string, photo: string, shared: boolean}>}
 */
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

/**
 * 保存餐食记录
 * @param {Array<{id: string, owner: string, meal: string, time: string, text: string, photo: string, shared: boolean}>} next
 */
function saveMealLogs(next) {
  writeJson(store.mealLogs, next);
}

/**
 * 为老人买菜
 * @returns {Array<{item: string, status: string, source: string}>}
 */
function groceryForElder() {
  const base = ['豆腐', '低脂牛奶', '番茄', '燕麦', '低钠调味品'];
  return base.map((item) => ({
    item,
    status: availableNames().includes(item) ? '家里已有' : '可帮老人买菜',
    source: '模拟外卖/买菜平台'
  }));
}

/**
 * 老人冰箱健康
 * @returns {{score: number, expired: number, expiring: number, protein: string, fiber: string}}
 */
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

/**
 * 关怀提醒
 * @returns {Array<{level: string, title: string, text: string}>}
 */
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

/**
 * 餐食规律
 * @returns {{score: number, summary: string, risk: string}}
 */
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

export { elder, familyMembers, saveFamilyMembers, groceryRequests, saveGroceryRequests, mealLogs, saveMealLogs, groceryForElder, elderFridgeHealth, careReminders, mealRegularity };