/**
 * Canvas 图表可视化模块
 * 提供冰箱健康相关的数据图表绘制功能
 */

import { readJson } from './store.js';

/** 食材消耗历史 localStorage key */
const CONSUMPTION_HISTORY_KEY = 'foodkeeper.consumption.v1';

/**
 * 获取或初始化消耗历史数据
 * @returns {Array<{date: string, count: number}>} 最近7天消耗记录
 */
export function getConsumptionHistory() {
  let history = readJson(CONSUMPTION_HISTORY_KEY, []);
  // 只保留最近7天
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  history = history.filter(item => new Date(item.date) >= sevenDaysAgo);
  return history;
}

/**
 * 绘制食材消耗趋势条形图
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {Array<{date: string, count: number}>} data - 消耗数据
 */
export function drawConsumptionChart(canvas, data) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 20, bottom: 30, left: 30, right: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // 背景
  ctx.clearRect(0, 0, width, height);

  if (!data || data.length === 0) {
    ctx.fillStyle = '#789086';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('暂无消耗数据', width / 2, height / 2);
    return;
  }

  const maxVal = Math.max(...data.map(d => d.count), 1);
  const barW = Math.min(chartW / data.length * 0.6, 40);
  const gap = chartW / data.length;

  // 绘制柱状图
  data.forEach((item, i) => {
    const x = padding.left + i * gap + (gap - barW) / 2;
    const barH = (item.count / maxVal) * chartH;
    const y = padding.top + chartH - barH;

    // 柱体
    const gradient = ctx.createLinearGradient(x, y, x, padding.top + chartH);
    gradient.addColorStop(0, '#29a36a');
    gradient.addColorStop(1, '#73c64b');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
    ctx.fill();

    // 数值标签
    ctx.fillStyle = '#315c4b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.count, x + barW / 2, y - 6);

    // 日期标签
    const dateLabel = item.date.slice(5); // MM-DD
    ctx.fillStyle = '#658176';
    ctx.font = '10px sans-serif';
    ctx.fillText(dateLabel, x + barW / 2, padding.top + chartH + 16);
  });
}

/**
 * 绘制冰箱健康雷达图
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {{ protein: number, produce: number, freshness: number, variety: number, carbon: number }} scores - 各维度评分(0-100)
 */
export function drawFridgeRadar(canvas, scores) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.35;
  const levels = 5;

  const labels = ['蛋白质', '蔬果', '新鲜度', '多样性', '低碳'];
  const keys = ['protein', 'produce', 'freshness', 'variety', 'carbon'];

  ctx.clearRect(0, 0, width, height);

  // 绘制网格
  for (let level = 1; level <= levels; level++) {
    const r = (radius / levels) * level;
    ctx.beginPath();
    for (let i = 0; i <= keys.length; i++) {
      const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#d9e9e0';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 绘制轴线
  keys.forEach((_, i) => {
    const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    ctx.strokeStyle = '#d9e9e0';
    ctx.stroke();

    // 标签
    const labelR = radius + 16;
    const lx = cx + labelR * Math.cos(angle);
    const ly = cy + labelR * Math.sin(angle);
    ctx.fillStyle = '#315c4b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labels[i], lx, ly);
  });

  // 绘制数据区域
  const defaultScores = { protein: 60, produce: 60, freshness: 80, variety: 50, carbon: 40 };
  const data = { ...defaultScores, ...scores };

  ctx.beginPath();
  keys.forEach((key, i) => {
    const val = Math.min(100, Math.max(0, data[key])) / 100;
    const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
    const x = cx + radius * val * Math.cos(angle);
    const y = cy + radius * val * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(41, 163, 106, 0.2)';
  ctx.fill();
  ctx.strokeStyle = '#29a36a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 数据点
  keys.forEach((key, i) => {
    const val = Math.min(100, Math.max(0, data[key])) / 100;
    const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
    const x = cx + radius * val * Math.cos(angle);
    const y = cy + radius * val * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#29a36a';
    ctx.fill();
  });
}

/**
 * 计算冰箱健康各维度评分
 * @param {Array} ingredients - 食材列表
 * @returns {{ protein: number, produce: number, freshness: number, variety: number, carbon: number }}
 */
export function calcFridgeScores(ingredients) {
  if (!ingredients || ingredients.length === 0) {
    return { protein: 30, produce: 30, freshness: 50, variety: 20, carbon: 40 };
  }

  // 蛋白质评分
  const proteinItems = ingredients.filter(i => ['肉类', '蛋奶'].includes(i.category));
  const protein = Math.min(100, proteinItems.length * 25 + 20);

  // 蔬果评分
  const produceItems = ingredients.filter(i => ['蔬菜', '水果'].includes(i.category));
  const produce = Math.min(100, produceItems.length * 20 + 20);

  // 新鲜度评分
  const expired = ingredients.filter(i => i.status === '已过期' || i.days < 0).length;
  const expiring = ingredients.filter(i => i.status === '临期' || i.status === '今日到期').length;
  const freshness = Math.max(10, 100 - expired * 30 - expiring * 10);

  // 多样性评分
  const categories = new Set(ingredients.map(i => i.category));
  const variety = Math.min(100, categories.size * 20 + 10);

  // 低碳评分
  const meatCount = ingredients.filter(i => i.category === '肉类').length;
  const greenCount = ingredients.filter(i => ['蔬菜', '水果'].includes(i.category)).length;
  const carbon = Math.min(100, Math.round((greenCount / (meatCount + 1)) * 30 + 30));

  return { protein, produce, freshness, variety, carbon };
}