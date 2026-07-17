import os
import time
from playwright.sync_api import sync_playwright

def capture_screenshots():
    # Ensure verification folder exists
    os.makedirs("/home/jules/verification", exist_ok=True)

    with sync_playwright() as p:
        # Launch headless browser
        browser = p.chromium.launch(headless=True)
        print("Browser launched successfully.")

        # 1. Desktop Screenshot
        print("Capturing Desktop screenshot...")
        desktop_page = browser.new_page(viewport={"width": 1280, "height": 900})
        desktop_page.goto("http://localhost:3001/sheikh-digital", wait_until="load")
        time.sleep(10)
        # Scroll down to make products fully visible
        desktop_page.evaluate("window.scrollTo(0, 500)")
        time.sleep(3)
        desktop_page.screenshot(path="/home/jules/verification/sheikh_digital_desktop.png")
        print("Desktop screenshot captured.")
        desktop_page.close()

        # 2. Tablet Screenshot
        print("Capturing Tablet screenshot...")
        tablet_page = browser.new_page(viewport={"width": 768, "height": 1024})
        tablet_page.goto("http://localhost:3001/sheikh-digital", wait_until="load")
        time.sleep(10)
        tablet_page.evaluate("window.scrollTo(0, 500)")
        time.sleep(3)
        tablet_page.screenshot(path="/home/jules/verification/sheikh_digital_tablet.png")
        print("Tablet screenshot captured.")
        tablet_page.close()

        # 3. Mobile Screenshot
        print("Capturing Mobile screenshot...")
        mobile_page = browser.new_page(viewport={"width": 375, "height": 812})
        mobile_page.goto("http://localhost:3001/sheikh-digital", wait_until="load")
        time.sleep(10)
        mobile_page.evaluate("window.scrollTo(0, 400)")
        time.sleep(3)
        mobile_page.screenshot(path="/home/jules/verification/sheikh_digital_mobile.png")
        print("Mobile screenshot captured.")
        mobile_page.close()

        browser.close()
        print("Screenshots captured successfully!")

if __name__ == "__main__":
    capture_screenshots()
