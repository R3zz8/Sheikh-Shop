import os
from playwright.sync_api import sync_playwright

def verify_mobile_ux():
    # Ensure directory exists
    os.makedirs("/home/jules/verification", exist_ok=True)

    with sync_playwright() as p:
        # Launch browser headless
        browser = p.chromium.launch(headless=True)

        # Configure a premium mobile viewport (375x812 is standard iPhone)
        context = browser.new_context(
            viewport={"width": 375, "height": 812},
            is_mobile=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
        )

        page = context.new_page()

        print("Navigating to mobile product detail page...")
        page.goto("http://localhost:3000/products/luxury-x9-speaker", wait_until="commit")

        # Wait for dynamic hydration and any 3D/image elements
        page.wait_for_timeout(5000)

        # Take a screenshot of the mobile hero view (Gallery, Title, Price, etc.)
        screenshot_hero_path = "/home/jules/verification/mobile_hero.png"
        page.screenshot(path=screenshot_hero_path)
        print(f"Captured mobile hero screenshot: {screenshot_hero_path}")

        # Scroll down to trigger the sticky bottom purchase bar
        print("Scrolling down to trigger the sticky buy bar...")
        page.evaluate("window.scrollTo(0, 800)")
        page.wait_for_timeout(2000)

        screenshot_sticky_path = "/home/jules/verification/mobile_sticky.png"
        page.screenshot(path=screenshot_sticky_path)
        print(f"Captured mobile sticky bar screenshot: {screenshot_sticky_path}")

        browser.close()

if __name__ == "__main__":
    verify_mobile_ux()
