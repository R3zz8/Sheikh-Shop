import os
import time
from playwright.sync_api import sync_playwright

def capture():
    os.makedirs("verification", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})

        print("Loading /sheikh-digital on port 3001...")
        page.goto("http://localhost:3001/sheikh-digital", wait_until="load")

        # Apply dark theme
        page.evaluate("""() => {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }""")

        print("Taking top screenshot (Hero + 3D)...")
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(5)
        page.screenshot(path="verification/sheikh_digital_hero.png")
        print("Hero screenshot saved.")

        print("Taking products screenshot (scroll down)...")
        page.evaluate("window.scrollTo(0, 650)")
        time.sleep(2)
        page.screenshot(path="verification/sheikh_digital_products.png")
        print("Products screenshot saved.")

        browser.close()

if __name__ == "__main__":
    capture()
