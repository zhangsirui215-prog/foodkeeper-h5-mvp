/**
 * 全局状态变量
 * @type {{page: string, expiringExpanded: boolean, editingMemberId: string|null, editingGroceryIndex: number|null}}
 */
const state = {
  /** @type {string} 当前页面标识 */
  page: 'home',
  /** @type {boolean} 临期食材是否展开 */
  expiringExpanded: false,
  /** @type {string|null} 正在编辑的家庭成员 ID */
  editingMemberId: null,
  /** @type {number|null} 正在编辑的买菜需求索引 */
  editingGroceryIndex: null
};

export { state };