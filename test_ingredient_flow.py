"""AI 食材管家 H5 MVP - 食材录入功能测试"""
from playwright.sync_api import sync_playwright
import sys

BASE_URL = "http://localhost:8080"

def test_all(page):
    results = []
    
    def check(name, passed, detail=""):
        status = "✅" if passed else "❌"
        print(f"  {status} {name}")
        if detail:
            print(f"     {detail}")
        results.append((name, passed, detail))
    
    # Step 1: Load the page
    print("\n[Step 1] 页面加载")
    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")
    body = page.text_content("body") or ""
    check("首页加载成功", "AI 食材管家" in body)
    check("Tab栏存在", page.locator(".tabbar").is_visible())
    check("食材卡片展示", page.locator(".ingredient-card").count() > 0)
    
    # Step 2: Navigate to Library
    print("\n[Step 2] 食材库页")
    page.locator('[data-page="library"]').click()
    page.wait_for_timeout(500)
    body = page.text_content("body") or ""
    check("切换到食材库", "我的食材库" in body)
    check("食材列表存在", page.locator(".ingredient-card").count() > 0)
    check("搜索框存在", page.locator('[data-input="library-search"]').is_visible())
    check("添加按钮存在", page.locator('[data-action="add-ingredient"]').is_visible())
    check("筛选标签存在", page.locator("[data-filter-status]").count() >= 3)
    
    # Step 3: Status filter
    print("\n[Step 3] 筛选功能")
    before = page.locator(".ingredient-card").count()
    page.locator('[data-filter-status="临期"]').click()
    page.wait_for_timeout(500)
    after = page.locator(".ingredient-card").count()
    check("临期筛选结果数小于等于总数", after <= before)
    page.locator('[data-filter-status="全部"]').click()
    page.wait_for_timeout(500)
    
    # Step 4: Search
    print("\n[Step 4] 搜索")
    search = page.locator('[data-input="library-search"]')
    before = page.locator(".ingredient-card").count()
    search.fill("鸡")
    page.wait_for_timeout(500)
    after = page.locator(".ingredient-card").count()
    check("搜索'鸡'有结果", after > 0)
    if after > 0:
        card = page.locator(".ingredient-card").first.text_content() or ""
        check("搜索结果含'鸡'名称", "鸡" in card)
    search.fill("")
    page.wait_for_timeout(500)
    
    # Step 5: Add ingredient
    print("\n[Step 5] 食材录入")
    page.locator('[data-action="add-ingredient"]').click()
    page.wait_for_timeout(300)
    check("添加模态框弹出", page.locator(".modal-mask").is_visible())
    modal = page.locator(".modal")
    check("模态框标题显示'添加食材'", "添加食材" in (modal.text_content() or ""))
    
    # Fill form
    page.locator('[data-ingredient-field="name"]').fill("测试鸡腿")
    page.locator('[data-ingredient-field="category"]').select_option("肉类")
    page.locator('[data-ingredient-field="qty"]').fill("3")
    page.locator('[data-ingredient-field="unit"]').select_option("个")
    page.locator('[data-ingredient-field="shelfLife"]').fill("14")
    page.locator('[data-ingredient-field="purchaseDate"]').fill("2026-06-12")
    page.locator('[data-action="save-ingredient"]').click()
    page.wait_for_timeout(500)
    check("添加后模态框关闭", page.locator(".modal-mask").count() == 0)
    check("新食材出现在列表", "测试鸡腿" in (page.text_content("body") or ""))
    
    # Step 6: Validation - empty name
    print("\n[Step 6] 校验")
    page.locator('[data-action="add-ingredient"]').click()
    page.wait_for_timeout(300)
    page.locator('[data-ingredient-field="name"]').fill("")
    page.locator('[data-action="save-ingredient"]').click()
    page.wait_for_timeout(300)
    toast = page.locator("#toast-container")
    check("空名称时显示Toast", toast.is_visible())
    check("Toast内容含'名称'", "名称" in (toast.text_content() or ""))
    page.locator('[data-action="close-modal"]').click()
    page.wait_for_timeout(300)
    
    # Step 7: Validation - duplicate name
    print("\n[Step 7] 重复名称校验")
    page.locator('[data-action="add-ingredient"]').click()
    page.wait_for_timeout(300)
    page.locator('[data-ingredient-field="name"]').fill("鸡蛋")
    page.locator('[data-ingredient-field="category"]').select_option("蛋奶")
    page.locator('[data-ingredient-field="qty"]').fill("1")
    page.locator('[data-ingredient-field="shelfLife"]').fill("7")
    page.locator('[data-ingredient-field="purchaseDate"]').fill("2026-06-12")
    page.locator('[data-action="save-ingredient"]').click()
    page.wait_for_timeout(300)
    check("重复名称时显示Toast", page.locator("#toast-container").is_visible())
    content = page.locator("#toast-container").text_content() or ""
    check("重复名称提示内容", "已存在" in content)
    page.locator('[data-action="close-modal"]').click()
    page.wait_for_timeout(300)
    
    # Step 8: Ingredient detail modal
    print("\n[Step 8] 食材详情")
    page.locator(".ingredient-card").first.click()
    page.wait_for_timeout(300)
    check("详情模态框弹出", page.locator(".modal-mask").is_visible())
    check("详情含编辑按钮", page.locator('[data-action="edit-ingredient"]').is_visible())
    check("详情含消耗按钮", page.locator('[data-action="consume-ingredient"]').is_visible())
    check("详情含删除按钮", page.locator('[data-action="delete-ingredient"]').is_visible())
    page.locator('[data-action="close-modal"]').click()
    page.wait_for_timeout(300)
    
    # Step 9: Edit ingredient
    print("\n[Step 9] 食材编辑")
    test_card = page.locator('.ingredient-card:has-text("测试鸡腿")')
    if test_card.count() > 0:
        test_card.first.click()
        page.wait_for_timeout(300)
        page.locator('[data-action="edit-ingredient"]').click()
        page.wait_for_timeout(300)
        check("编辑模态框显示", "编辑食材" in (page.locator(".modal").text_content() or ""))
        page.locator('[data-ingredient-field="qty"]').fill("5")
        page.locator('[data-action="save-ingredient"]').click()
        page.wait_for_timeout(500)
        check("编辑保存成功", "测试鸡腿" in (page.text_content("body") or ""))
    
    # Step 10: Consume ingredient
    print("\n[Step 10] 消耗食材")
    test_card2 = page.locator('.ingredient-card:has-text("测试鸡腿")')
    if test_card2.count() > 0:
        test_card2.first.click()
        page.wait_for_timeout(300)
        page.locator('[data-action="consume-ingredient"]').click()
        page.wait_for_timeout(500)
        check("消耗后食材已移除", page.locator('.ingredient-card:has-text("测试鸡腿")').count() == 0)
        toast2 = page.locator("#toast-container").text_content() or ""
        check("消耗后显示碳足迹Toast", "CO" in toast2 or "碳" in toast2 or "g" in toast2)
    
    # Step 11: Category filter
    print("\n[Step 11] 分类筛选")
    page.locator('[data-filter-category]').select_option("蔬菜")
    page.wait_for_timeout(300)
    cat_filtered = page.locator(".ingredient-card").count()
    check("分类筛选有结果", cat_filtered > 0)
    if cat_filtered > 0:
        card_text = page.locator(".ingredient-card").first.text_content() or ""
        check("筛选结果含蔬菜", "蔬菜" in card_text)
    page.locator('[data-filter-category]').select_option("")
    page.wait_for_timeout(300)
    
    # Step 12: Home page carbon footprint display
    print("\n[Step 12] 首页碳足迹")
    page.locator('[data-page="home"]').click()
    page.wait_for_timeout(500)
    home = page.text_content("body") or ""
    check("碳足迹区显示", "累计节省碳排放" in home or "碳足迹" in home or "CO" in home)
    
    # Step 13: Data reset check
    print("\n[Step 13] 数据重置检查")
    page.evaluate("localStorage.clear()")
    page.reload()
    page.wait_for_load_state("networkidle")
    check("重置后页面正常", "AI 食材管家" in (page.text_content("body") or ""))
    
    # Summary
    passed = sum(1 for r in results if r[1])
    failed = sum(1 for r in results if not r[1])
    print(f"\n{'='*40}")
    print(f"汇总: {passed} 通过 / {failed} 失败 / 共 {len(results)} 项")
    print(f"{'='*40}\n")
    
    return failed == 0

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 420, "height": 900})
        success = test_all(page)
        page.screenshot(path="/tmp/test-screenshot.png", full_page=True)
        browser.close()
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()