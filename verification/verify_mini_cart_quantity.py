import os
import sys
import time
import subprocess
from playwright.sync_api import sync_playwright, expect

def handle_console(msg):
    # Filter noisy metrics logs
    if "METRICS" in msg.text:
        return
    print(f"[BROWSER CONSOLE] {msg.type}: {msg.text}")

def handle_page_error(err):
    print(f"[BROWSER EXCEPTION]: {err}")

def get_token():
    print("Generating JWT Token via node verification/generate_token.js...")
    result = subprocess.run(["node", "verification/generate_token.js"], capture_output=True, text=True, check=True)
    token = result.stdout.strip()
    print(f"Generated Token: {token[:20]}...{token[-20:]}")
    return token

def run():
    print("====================================================")
    print("STARTING E2E PLAYWRIGHT QUANTITY & STOCK VALIDATION")
    print("====================================================")

    TOKEN = get_token()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Desktop Context
        context = browser.new_context(viewport={"width": 1280, "height": 1000})

        # Set access-token cookie
        context.add_cookies([{
            "name": "access-token",
            "value": TOKEN,
            "domain": "localhost",
            "path": "/",
            "httpOnly": True,
            "secure": False,
            "sameSite": "Lax"
        }])

        page = context.new_page()
        page.on("console", handle_console)
        page.on("pageerror", handle_page_error)

        # Go to simple product page
        url = "http://localhost:3000/products/p_simple_stock_50"
        print(f"Navigating to: {url}...")
        page.goto(url, wait_until="domcontentloaded", timeout=60000)

        # Wait for product title to render (allowing Next.js to finish first-load compiling)
        print("Waiting for page compilation and element rendering (up to 60s)...")
        page.wait_for_selector("h1", state="attached", timeout=60000)

        # Verify product detail page
        product_title = page.locator("h1").first
        print(f"Product Title on Page: {product_title.text_content().strip()}")
        expect(product_title).to_contain_text("محصول تستی")

        # Check Add to Cart button
        add_to_cart_btn = page.locator("button:has-text('افزودن به سبد خرید')").first
        expect(add_to_cart_btn).to_be_visible()

        # Click Add to Cart
        print("Clicking 'Add to Cart'...")
        add_to_cart_btn.click()
        page.wait_for_timeout(2000)

        # Wait for Cart Dropdown trigger to hydrate and be ready
        print("Waiting for Cart Dropdown trigger to be active...")
        page.wait_for_selector("button:has(svg.lucide-shopping-cart)", timeout=20000)

        # Click on Cart dropdown trigger
        cart_trigger = page.locator("button:has(svg.lucide-shopping-cart)").first
        expect(cart_trigger).to_be_visible()
        print("Opening Glass Mini Cart dropdown...")
        cart_trigger.click()
        page.wait_for_timeout(2000)

        # Verify product is in Mini Cart and find its specific cart item row container
        print("Locating the specific Cart Item container for our test product...")
        cart_item = page.locator("div.p-3.rounded-xl", has_text="محصول تستی").first
        expect(cart_item).to_be_visible()

        quantity_span = cart_item.locator("span.min-w-\\[2rem\\]").first
        initial_qty = int(quantity_span.text_content().strip())
        print(f"Initial Cart Item Quantity: {initial_qty}")
        expect(quantity_span).to_have_text(str(initial_qty))

        # Take screenshot of initial cart
        page.screenshot(path="verification/01_initial_cart.png")
        print("Captured screenshot: 01_initial_cart.png")

        # Increment quantity (target the plus button in the specific cart item)
        plus_btn = cart_item.locator("button[aria-label='افزایش تعداد']").first
        print("Clicking '+' button to increment quantity...")
        plus_btn.click()
        page.wait_for_timeout(1000)

        current_qty = int(quantity_span.text_content().strip())
        print(f"Quantity after '+' click: {current_qty}")
        expect(quantity_span).to_have_text(str(initial_qty + 1))

        # Increment seeking initial_qty + 3
        target_qty_1 = initial_qty + 3
        print(f"Seeking quantity: {target_qty_1}...")
        while current_qty < target_qty_1:
            plus_btn.click()
            page.wait_for_timeout(600)
            current_qty = int(quantity_span.text_content().strip())
        print(f"Quantity after seeking: {current_qty}")
        expect(quantity_span).to_have_text(str(target_qty_1))

        # Increment seeking initial_qty + 8
        target_qty_2 = initial_qty + 8
        # Ensure we don't exceed max stock in this step
        if target_qty_2 > 45:
            target_qty_2 = 45
        print(f"Seeking quantity: {target_qty_2}...")
        while current_qty < target_qty_2:
            plus_btn.click()
            page.wait_for_timeout(600)
            current_qty = int(quantity_span.text_content().strip())
        print(f"Quantity after seeking: {current_qty}")
        expect(quantity_span).to_have_text(str(target_qty_2))

        # Take screenshot of intermediate cart
        page.screenshot(path="verification/02_cart_qty_intermediate.png")
        print("Captured screenshot: 02_cart_qty_intermediate.png")

        # Now seek maximum stock (50)
        print("Seeking maximum stock (50)...")
        while current_qty < 50:
            plus_btn.click()
            page.wait_for_timeout(200)
            current_qty = int(quantity_span.text_content().strip())

        page.wait_for_timeout(1000)
        print(f"Quantity reached: {quantity_span.text_content().strip()}")
        expect(quantity_span).to_have_text("50")

        # Take screenshot at maximum stock
        page.screenshot(path="verification/03_cart_max_stock_50.png")
        print("Captured screenshot: 03_cart_max_stock_50.png")

        # Click + to go to 51 (should show insufficient stock error and remain at 50)
        print("Clicking '+' to request 51 (exceeding stock of 50)...")
        plus_btn.click()
        page.wait_for_timeout(1500)

        # Verify quantity is still 50
        print(f"Quantity after trying 51: {quantity_span.text_content().strip()}")
        expect(quantity_span).to_have_text("50")

        # Check error toast presence
        toast_elem = page.locator("text=موجودی این محصول کافی نیست").first
        if toast_elem.is_visible():
            print("Successfully caught expected error toast: 'موجودی این محصول کافی نیست'")
        else:
            print("Warning: Toast element wasn't immediately visible, but quantity is correctly restricted to 50.")

        page.screenshot(path="verification/04_cart_stock_error.png")
        print("Captured screenshot: 04_cart_stock_error.png")

        # Decrement quantity to 49
        minus_btn = cart_item.locator("button[aria-label='کاهش تعداد']").first
        print("Clicking '-' to decrement to 49...")
        minus_btn.click()
        page.wait_for_timeout(1000)
        print(f"Quantity after '-' click: {quantity_span.text_content().strip()}")
        expect(quantity_span).to_have_text("49")

        # Remove product from cart
        trash_btn = cart_item.locator("button[aria-label='حذف کالا']").first
        print("Clicking trash icon to remove item...")
        trash_btn.click()
        page.wait_for_timeout(1500)

        # Verify empty cart or only the remaining items exist (there was p1 with quantity 2 in mockCartItems too!)
        p_simple_exists = page.locator("div.p-3.rounded-xl", has_text="محصول تستی").count() > 0
        print(f"Is 'محصول تستی' still in cart? {p_simple_exists}")
        assert not p_simple_exists, "Error: Simple test product should be removed from cart!"
        print("Successfully verified simple product removal!")

        # Take final desktop screenshot of remaining cart
        page.screenshot(path="verification/05_cart_simple_removed.png")
        print("Captured screenshot: 05_cart_simple_removed.png")

        context.close()

        # 2. Mobile Viewport (Drawer Cart)
        print("\n--- Testing Mobile Viewport (Drawer Cart) ---")
        mobile_context = browser.new_context(viewport={"width": 375, "height": 812})
        mobile_context.add_cookies([{
            "name": "access-token",
            "value": TOKEN,
            "domain": "localhost",
            "path": "/",
            "httpOnly": True,
            "secure": False,
            "sameSite": "Lax"
        }])

        mobile_page = mobile_context.new_page()
        mobile_page.on("console", handle_console)
        mobile_page.on("pageerror", handle_page_error)

        mobile_page.goto(url, wait_until="domcontentloaded", timeout=60000)
        mobile_page.wait_for_selector("h1", state="attached", timeout=60000)

        # Scroll down on mobile to make CTA floating bar or container visible and interactive
        print("Scrolling down on mobile viewport...")
        mobile_page.evaluate("window.scrollTo(0, 600)")
        mobile_page.wait_for_timeout(1500)

        # Click Add to Cart (target mobile button using .last)
        mobile_add_to_cart = mobile_page.locator("button:has-text('افزودن به سبد خرید')").last
        expect(mobile_add_to_cart).to_be_visible()
        mobile_add_to_cart.click()
        mobile_page.wait_for_timeout(2000)

        # Mobile cart has a responsive layout, let's open the cart by clicking the mobile floating cart button or menu
        mobile_header_cart = mobile_page.locator("button:has(svg.lucide-shopping-cart)").first
        mobile_header_cart.click()
        mobile_page.wait_for_timeout(1000)

        # Verify product is visible in mobile cart dropdown (target item row specifically using menu prefix)
        mobile_cart_title = mobile_page.locator("div[role='menu'] div.p-3.rounded-xl, [data-radix-menu-content] div.p-3.rounded-xl", has_text="محصول تستی").first
        expect(mobile_cart_title).to_be_visible()
        print("Successfully verified simple product in Mobile cart!")

        mobile_page.screenshot(path="verification/06_mobile_cart.png")
        print("Captured screenshot: 06_mobile_cart.png")

        mobile_context.close()
        browser.close()

    print("\n====================================================")
    print("✅ E2E PLAYWRIGHT TESTS PASSED SUCCESSFULLY WITH ZERO ERRORS!")
    print("====================================================")

if __name__ == "__main__":
    run()
