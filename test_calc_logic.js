/**
 * AI 食材管家 - 食材录入功能逻辑测试
 * 在 Node.js 环境下测试纯函数逻辑（无需浏览器）
 */
const tests = [];

function test(name, fn) {
  try {
    const result = fn();
    tests.push({ name, passed: true });
    console.log(`  ✅ ${name}`);
  } catch (e) {
    tests.push({ name, passed: false, error: e.message });
    console.log(`  ❌ ${name}: ${e.message}`);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'assertion failed');
}

// ===== Simulate calcRemainingDays =====
function calcRemainingDays(purchaseDateStr, shelfLifeDays) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const purchase = new Date(purchaseDateStr);
  purchase.setHours(0, 0, 0, 0);
  const diff = today - purchase;
  return shelfLifeDays - Math.floor(diff / 86400000);
}

function calcStatus(remainingDays) {
  if (remainingDays < 0) return '已过期';
  if (remainingDays === 0) return '今日到期';
  if (remainingDays <= 3) return '临期';
  return '新鲜';
}

// ===== Test calcRemainingDays =====
console.log('\n📋 一、状态计算函数测试');
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

test('当天购入保质期7天 → 剩余7天', () => {
  assert(calcRemainingDays(todayStr, 7) === 7);
});

test('7天前购入保质期7天 → 到期', () => {
  const past = new Date(today);
  past.setDate(past.getDate() - 7);
  assert(calcRemainingDays(past.toISOString().split('T')[0], 7) === 0);
});

test('10天前购入保质期7天 → 已过期3天', () => {
  const past = new Date(today);
  past.setDate(past.getDate() - 10);
  assert(calcRemainingDays(past.toISOString().split('T')[0], 7) === -3);
});

// ===== Test calcStatus =====
console.log('\n📋 二、状态计算测试');
test('剩余天数>3 → 新鲜', () => {
  assert(calcStatus(7) === '新鲜');
  assert(calcStatus(4) === '新鲜');
});

test('剩余天数1~3 → 临期', () => {
  assert(calcStatus(1) === '临期');
  assert(calcStatus(2) === '临期');
  assert(calcStatus(3) === '临期');
});

test('剩余天数=0 → 今日到期', () => {
  assert(calcStatus(0) === '今日到期');
});

test('剩余天数<0 → 已过期', () => {
  assert(calcStatus(-1) === '已过期');
  assert(calcStatus(-5) === '已过期');
});

// ===== Test searchIngredients logic =====
console.log('\n📋 三、搜索筛选逻辑测试');
const mockData = [
  { name: '鸡胸肉', category: '肉类', status: '临期' },
  { name: '鸡蛋', category: '蛋奶', status: '新鲜' },
  { name: '青菜', category: '蔬菜', status: '已过期' },
  { name: '牛奶', category: '蛋奶', status: '临期' },
];

function search(data, { keyword, status, category } = {}) {
  let list = [...data];
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

test('搜索"鸡" → 鸡胸肉、鸡蛋', () => {
  const r = search(mockData, { keyword: '鸡' });
  assert(r.length === 2, `got ${r.length}`);
  assert(r[0].name === '鸡胸肉');
  assert(r[1].name === '鸡蛋');
});

test('状态=临期 → 鸡胸肉、牛奶', () => {
  const r = search(mockData, { status: '临期' });
  assert(r.length === 2, `got ${r.length}`);
  assert(r.every(i => i.status === '临期'));
});

test('类别=蛋奶→鸡蛋、牛奶', () => {
  const r = search(mockData, { category: '蛋奶' });
  assert(r.length === 2);
  assert(r.every(i => i.category === '蛋奶'));
});

test('组合筛选: 蛋奶+临期→牛奶', () => {
  const r = search(mockData, { status: '临期', category: '蛋奶' });
  assert(r.length === 1);
  assert(r[0].name === '牛奶');
});

test('搜索无结果→空数组', () => {
  const r = search(mockData, { keyword: '芒果' });
  assert(r.length === 0);
});

// ===== Test status 计算规则 Edge Cases =====
console.log('\n📋 四、边界情况测试');
test('购入未来日期 → 剩余天数可能大于保质期', () => {
  const future = new Date(today);
  future.setDate(future.getDate() + 5);
  const days = calcRemainingDays(future.toISOString().split('T')[0], 7);
  assert(days > 7, `got ${days}`);
});

test('保质期=0 → 立即过期', () => {
  const days = calcRemainingDays('2026-06-01', 0);
  assert(days < 0);
  assert(calcStatus(days) === '已过期');
});

// ===== Summary =====
console.log(`\n${'='.repeat(40)}`);
const passed = tests.filter(t => t.passed).length;
const failed = tests.filter(t => !t.passed).length;
console.log(`汇总: ${passed} 通过 / ${failed} 失败 / 共 ${tests.length} 项`);

if (failed > 0) {
  process.exit(1);
}