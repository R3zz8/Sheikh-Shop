from playwright.sync_api import sync_playwright

def verify_mobile():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate Pixel 5 / Mobile viewport
        context = browser.new_context(
            viewport={"width": 375, "height": 812},
            is_mobile=True,
            user_agent="Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36"
        )
        page = context.new_page()

        print("Navigating to http://localhost:3000/...")
        page.goto("http://localhost:3000/", wait_until="load")

        print("Waiting 5 seconds for hydration and 3D scenes...")
        page.wait_for_timeout(5000)

        # Let's take a screenshot of the viewport
        screenshot_path = "/home/jules/verification/verification_mobile.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot successfully saved to {screenshot_path}")

        # Let's check scrollWidth and innerWidth programmatically
        scroll_width = page.evaluate("document.documentElement.scrollWidth")
        inner_width = page.evaluate("window.innerWidth")
        body_scroll_width = page.evaluate("document.body.scrollWidth")
        print(f"window.innerWidth: {inner_width}px")
        print(f"document.body.scrollWidth: {body_scroll_width}px")
        print(f"document.documentElement.scrollWidth: {scroll_width}px")

        browser.close()

if __name__ == "__main__":
    verify_mobile()
