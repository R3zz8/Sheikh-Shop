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
        time.sleep(8)

        # Compute dynamic RTL scroll target
        scroll_width = desktop_page.evaluate("document.documentElement.scrollWidth")
        client_width = desktop_page.evaluate("document.documentElement.clientWidth")
        scroll_left_target = -(scroll_width - client_width)

        # Scroll down and left dynamically to make products fully visible
        desktop_page.evaluate(f"window.scrollTo({scroll_left_target}, 400)")
        time.sleep(3)
        desktop_page.screenshot(path="/home/jules/verification/sheikh_digital_desktop.png")
        print(f"Desktop screenshot captured. Size: {os.path.getsize('/home/jules/verification/sheikh_digital_desktop.png')} bytes.")
        desktop_page.close()

        # 2. Tablet Screenshot
        print("Capturing Tablet screenshot...")
        tablet_page = browser.new_page(viewport={"width": 768, "height": 1024})
        tablet_page.goto("http://localhost:3001/sheikh-digital", wait_until="load")
        time.sleep(8)

        scroll_width = tablet_page.evaluate("document.documentElement.scrollWidth")
        client_width = tablet_page.evaluate("document.documentElement.clientWidth")
        scroll_left_target = -(scroll_width - client_width)

        tablet_page.evaluate(f"window.scrollTo({scroll_left_target}, 450)")
        time.sleep(3)
        tablet_page.screenshot(path="/home/jules/verification/sheikh_digital_tablet.png")
        print(f"Tablet screenshot captured. Size: {os.path.getsize('/home/jules/verification/sheikh_digital_tablet.png')} bytes.")
        tablet_page.close()

        # 3. Mobile Screenshot
        print("Capturing Mobile screenshot...")
        mobile_page = browser.new_page(viewport={"width": 375, "height": 812})
        mobile_page.goto("http://localhost:3001/sheikh-digital", wait_until="load")
        time.sleep(8)

        scroll_width = mobile_page.evaluate("document.documentElement.scrollWidth")
        client_width = mobile_page.evaluate("document.documentElement.clientWidth")
        scroll_left_target = -(scroll_width - client_width)

        mobile_page.evaluate(f"window.scrollTo({scroll_left_target}, 350)")
        time.sleep(3)
        mobile_page.screenshot(path="/home/jules/verification/sheikh_digital_mobile.png")
        print(f"Mobile screenshot captured. Size: {os.path.getsize('/home/jules/verification/sheikh_digital_mobile.png')} bytes.")
        mobile_page.close()

        browser.close()
        print("Screenshots captured successfully!")

if __name__ == "__main__":
    capture_screenshots()
