import { store } from './data/index.js';

/**
 * 从 localStorage 读取 JSON 数据
 * @param {string} key localStorage 键名
 * @param {*} fallback 解析失败或不存在时的默认值
 * @returns {*} 解析后的数据
 */
function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * 写入 JSON 到 localStorage
 * @param {string} key localStorage 键名
 * @param {*} value 要写入的值
 */
function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * 所有 localStorage key 列表
 */
const ALL_STORAGE_KEYS = [
  'foodkeeper.demo.ingredients.v2',
  'foodkeeper.demo.health.v2',
  'foodkeeper.demo.settings.v2',
  'foodkeeper.demo.recipeFilter.v2',
  'foodkeeper.demo.familyMembers.v1',
  'foodkeeper.demo.mealLogs.v1',
  'foodkeeper.demo.groceryRequests.v1',
  'foodkeeper.carbon.v1',
  'foodkeeper.badges.v1',
  'foodkeeper.consumption.v1'
];

/**
 * 导出所有数据为 JSON 文件并下载
 */
export function exportData() {
  const data = {};
  ALL_STORAGE_KEYS.forEach((key) => {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      data[key] = JSON.parse(raw);
    }
  });

  // 添加导出元数据
  data._meta = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    app: 'AI食材管家'
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `foodkeeper-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 从 JSON 文件导入数据
 * @param {File} file - 上传的 JSON 文件
 * @returns {Promise<{success: boolean, count: number}>} 导入结果
 */
export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        let count = 0;

        Object.entries(data).forEach(([key, value]) => {
          if (key === '_meta') return; // 跳过元数据
          if (ALL_STORAGE_KEYS.includes(key)) {
            localStorage.setItem(key, JSON.stringify(value));
            count++;
          }
        });

        resolve({ success: true, count });
      } catch (err) {
        reject(new Error('文件格式无效，请选择正确的备份文件'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

export { store, readJson, writeJson };