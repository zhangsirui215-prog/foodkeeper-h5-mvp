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
  editingGroceryIndex: null,
  /** @type {string|null} 正在编辑的食材 id */
  editingIngredientId: null,
  /** @type {string} 食材库筛选状态 */
  libraryFilter: '全部',
  /** @type {string} 食材库类别筛选 */
  libraryCategory: '',
  /** @type {string} 食材库搜索关键字 */
  libraryKeyword: '',
  /** @type {boolean} 是否显示食材详情模态 */
  showIngredientModal: false,
  /** @type {string|null} 模态中显示的食材 id */
  modalIngredientId: null
};

export { state };