import time
from playwright.sync_api import sync_playwright, TimeoutError

def verify_frontend():
    with sync_playwright() as p:
        # Launch headless browser
        browser = p.chromium.launch(headless=True)

        # 1. Verify Desktop Layout (1440x900)
        context_desktop = browser.new_context(viewport={"width": 1440, "height": 900})
        page_desktop = context_desktop.new_page()

        print("Navigating to homepage on Desktop (1440px)...")
        try:
            page_desktop.goto("http://localhost:3001", wait_until="domcontentloaded", timeout=15000)
        except TimeoutError:
            print("Desktop navigation timed out, continuing to screenshot anyway...")

        time.sleep(2)  # Allow any dynamic elements to settle

        # Capture full page or viewport screenshot
        page_desktop.screenshot(path="verification/desktop_homepage.png")
        print("Desktop screenshot captured at verification/desktop_homepage.png")

        # 2. Verify Mobile Layout (375x812)
        context_mobile = browser.new_context(viewport={"width": 375, "height": 812})
        page_mobile = context_mobile.new_page()

        print("Navigating to homepage on Mobile (375px)...")
        try:
            page_mobile.goto("http://localhost:3001", wait_until="domcontentloaded", timeout=15000)
        except TimeoutError:
            print("Mobile navigation timed out, continuing to screenshot anyway...")

        time.sleep(2)

        page_mobile.screenshot(path="verification/mobile_homepage.png")
        print("Mobile screenshot captured at verification/mobile_homepage.png")

        # 3. Verify Mobile Menu Open
        print("Opening Mobile Menu...")
        try:
            # Try multiple common selectors for mobile menu button
            menu_btn = page_mobile.locator("button[aria-label='Open menu'], button[aria-label='منو'], button[class*='menu']").first
            if menu_btn.is_visible():
                menu_btn.click()
                time.sleep(1)
        except Exception as e:
            print(f"Could not open mobile menu dynamically: {e}")

        page_mobile.screenshot(path="verification/mobile_menu_open.png")
        print("Mobile Menu Open screenshot captured at verification/mobile_menu_open.png")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
