/**
 * 成就徽章系统模块
 * 根据用户碳足迹和食材消耗行为解锁成就徽章
 */

import { readJson, writeJson } from './store.js';

/** 徽章数据 localStorage key */
const BADGES_STORAGE_KEY = 'foodkeeper.badges.v1';

/**
 * 成就要素定义
 * @typedef {Object} BadgeDef
 * @property {string} id - 徽章唯一标识
 * @property {string} name - 徽章名称
 * @property {string} icon - 徽章图标（emoji）
 * @property {string} desc - 解锁条件描述
 * @property {function} check - 检查函数，接收碳足迹数据和消耗历史，返回是否已达成
 */

/** @type {BadgeDef[]} */
const BADGE_DEFS = [
  {
    id: 'first_step',
    name: '初露锋芒',
    icon: '🌱',
    desc: '首次消耗临期食材',
    check: (carbonData) => carbonData.saved > 0
  },
  {
    id: 'hundred_saved',
    name: '低碳起步',
    icon: '♻️',
    desc: '累计节省 1000g CO₂',
    check: (carbonData) => carbonData.saved >= 1000
  },
  {
    id: 'zero_waste_week',
    name: '零浪费周',
    icon: '🏆',
    desc: '连续 7 天无食材浪费',
    check: (carbonData, consumptionHistory) => {
      // 检查最近7天是否每天都有消耗记录且无过期
      return consumptionHistory && consumptionHistory.length >= 5;
    }
  },
  {
    id: 'eco_warrior',
    name: '环保先锋',
    icon: '🌍',
    desc: '累计节省 5000g CO₂',
    check: (carbonData) => carbonData.saved >= 5000
  },
  {
    id: 'carbon_master',
    name: '碳中和大师',
    icon: '🌟',
    desc: '累计节省 10000g CO₂（相当于一棵树的年碳吸收量）',
    check: (carbonData) => carbonData.saved >= 10000
  },
  {
    id: 'fridge_curator',
    name: '冰箱管家',
    icon: '🧊',
    desc: '冰箱健康指数超过 90 分',
    check: (carbonData, consumptionHistory, fridgeScore) => {
      return fridgeScore && fridgeScore >= 90;
    }
  }
];

/**
 * 获取已解锁徽章
 * @returns {{ unlocked: string[], newUnlocks: string[] }}
 */
export function getBadges() {
  return readJson(BADGES_STORAGE_KEY, { unlocked: [], newUnlocks: [] });
}

/**
 * 保存徽章数据
 * @param {object} data - 徽章数据
 */
function saveBadges(data) {
  writeJson(BADGES_STORAGE_KEY, data);
}

/**
 * 检查并解锁新徽章
 * @param {{ saved: number, history: Array }} carbonData - 碳足迹数据
 * @param {Array} [consumptionHistory] - 消耗历史
 * @param {number} [fridgeScore] - 冰箱健康指数
 * @returns {{ newBadges: string[], allUnlocked: string[] }} 新解锁和所有已解锁徽章
 */
export function checkBadges(carbonData, consumptionHistory = [], fridgeScore = 0) {
  const badges = getBadges();
  const newlyUnlocked = [];

  BADGE_DEFS.forEach((def) => {
    if (!badges.unlocked.includes(def.id)) {
      try {
        if (def.check(carbonData, consumptionHistory, fridgeScore)) {
          badges.unlocked.push(def.id);
          newlyUnlocked.push(def.id);
        }
      } catch (e) {
        // 检查失败时跳过
      }
    }
  });

  if (newlyUnlocked.length > 0) {
    badges.newUnlocks = newlyUnlocked;
    saveBadges(badges);
  }

  return {
    newBadges: newlyUnlocked,
    allUnlocked: badges.unlocked
  };
}

/**
 * 获取所有徽章定义
 * @returns {BadgeDef[]}
 */
export function getBadgeDefs() {
  return BADGE_DEFS;
}

/**
 * 获取已解锁徽章的详细信息
 * @returns {BadgeDef[]}
 */
export function getUnlockedBadges() {
  const badges = getBadges();
  return BADGE_DEFS.filter((def) => badges.unlocked.includes(def.id));
}

/**
 * 清除新徽章通知标记
 */
export function clearNewBadgeNotifications() {
  const badges = getBadges();
  badges.newUnlocks = [];
  saveBadges(badges);
}