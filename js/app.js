import { store, ingredientsSeed } from './data/index.js';
import { readJson, writeJson } from './store.js';
import { render } from './ui.js';

// 初始数据写入：如果 localStorage 中没有食材数据，则写入种子数据
if (!localStorage.getItem(store.ingredients)) {
  writeJson(store.ingredients, ingredientsSeed);
}

// 启动应用
render();