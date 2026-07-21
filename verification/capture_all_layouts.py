import os
import time
from playwright.sync_api import sync_playwright

def capture_layouts():
    print("🎬 Starting extensive Playwright layout screenshot generation...")
    os.makedirs("/home/jules/verification", exist_ok=True)

    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1vY2stdXNlci1pZCIsImVtYWlsIjoiY3VzdG9tZXJAc2hlaWtoc2hvcC5jb20iLCJyb2xlIjoiU1VQRVJBRE1JTiIsImlhdCI6MTc4NDYzMDc4OCwiZXhwIjoxNzg1MjM1NTg4LCJhdWQiOiJzaGVpa2gtc2hvcC11c2VycyIsImlzcyI6InNoZWlraC1zaG9wIn0._mWRn1Uukd8pcWzxKyHqQRazVlGkz858Z-d8aeR_6ZQ"

    viewports = {
        "desktop": {"width": 1280, "height": 900},
        "laptop": {"width": 1024, "height": 768},
        "tablet": {"width": 768, "height": 1024},
        "mobile": {"width": 375, "height": 812},
        "small_mobile": {"width": 320, "height": 568}
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        print("Browser launched successfully.")

        # Let's define a helper to setup cookies for authentication
        def get_page(viewport_name):
            context = browser.new_context(
                viewport=viewports[viewport_name],
                locale="fa-IR",
                timezone_id="Asia/Tehran"
            )
            # Add access token cookie
            context.add_cookies([{
                "name": "access-token",
                "value": token,
                "domain": "localhost",
                "path": "/"
            }])
            return context.new_page()

        # -----------------------------------------------------------------
        # 1. Capture Product Detail Page (Luxury Shipping Badges & Timeline)
        # -----------------------------------------------------------------
        for vp_name in viewports.keys():
            print(f"📸 Capturing Product Detail - {vp_name}...")
            page = get_page(vp_name)
            page.goto("http://localhost:3000/product/p1", wait_until="load")
            time.sleep(3)

            # Scroll down slightly to make the luxury shipping badges and timeline visible
            page.evaluate("window.scrollTo(0, 300)")
            time.sleep(1.5)

            screenshot_path = f"/home/jules/verification/product_detail_{vp_name}.png"
            page.screenshot(path=screenshot_path)
            print(f"   Saved {screenshot_path}")
            page.close()

        # -----------------------------------------------------------------
        # 2. Capture Mini Cart & Cart Drawer
        # -----------------------------------------------------------------
        print("📸 Capturing Mini Cart / Cart Dropdown...")
        page = get_page("desktop")
        page.goto("http://localhost:3000/product/p1", wait_until="load")
        time.sleep(3)

        # Click cart dropdown trigger to open it
        cart_button = page.locator("button[aria-label='باز کردن سبد خرید']")
        if cart_button.is_visible():
            cart_button.click()
            time.sleep(1.5)

        screenshot_path = "/home/jules/verification/mini_cart_desktop.png"
        page.screenshot(path=screenshot_path)
        print(f"   Saved {screenshot_path}")
        page.close()

        # -----------------------------------------------------------------
        # 3. Capture Checkout & Order Summary Page
        # -----------------------------------------------------------------
        for vp_name in ["desktop", "tablet", "mobile"]:
            print(f"📸 Capturing Checkout & Order Summary - {vp_name}...")
            page = get_page(vp_name)
            page.goto("http://localhost:3000/checkout", wait_until="load")
            time.sleep(3)

            # Scroll to focus on summary
            if vp_name == "mobile":
                page.evaluate("window.scrollTo(0, 450)")
            else:
                page.evaluate("window.scrollTo(0, 100)")
            time.sleep(1.5)

            screenshot_path = f"/home/jules/verification/checkout_{vp_name}.png"
            page.screenshot(path=screenshot_path)
            print(f"   Saved {screenshot_path}")
            page.close()

        # -----------------------------------------------------------------
        # 4. Capture Admin Product Create Form
        # -----------------------------------------------------------------
        for vp_name in ["desktop", "mobile"]:
            print(f"📸 Capturing Admin Product Create - {vp_name}...")
            page = get_page(vp_name)
            page.goto("http://localhost:3000/dashboard/products/new", wait_until="load")
            time.sleep(3)

            # Scroll down to display the new luxury shipping settings card
            page.evaluate("window.scrollTo(0, 300)")
            time.sleep(1.5)

            screenshot_path = f"/home/jules/verification/admin_create_{vp_name}.png"
            page.screenshot(path=screenshot_path)
            print(f"   Saved {screenshot_path}")
            page.close()

        # -----------------------------------------------------------------
        # 5. Capture Admin Product Edit Form
        # -----------------------------------------------------------------
        print("📸 Capturing Admin Product Edit - desktop...")
        page = get_page("desktop")
        page.goto("http://localhost:3000/dashboard/products/p1", wait_until="load")
        time.sleep(3)

        page.evaluate("window.scrollTo(0, 300)")
        time.sleep(1.5)

        screenshot_path = "/home/jules/verification/admin_edit_desktop.png"
        page.screenshot(path=screenshot_path)
        print(f"   Saved {screenshot_path}")
        page.close()

        browser.close()
        print("🎉 Layout screenshots successfully captured and saved under /home/jules/verification!")

if __name__ == "__main__":
    capture_layouts()
