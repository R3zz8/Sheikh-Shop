import os
from playwright.sync_api import sync_playwright

def take_diag_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 1000})

        url = "http://localhost:3000/sheikh-digital"
        print(f"Navigating to {url}...")
        page.goto(url, wait_until="domcontentloaded")

        # Apply dark mode state programmatically
        page.evaluate("""() => {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }""")

        # Settle
        page.wait_for_timeout(5000)

        # Take full page screenshot
        page.screenshot(path="verification/diag_sheikh_digital.png", full_page=True)
        print("Diagnostic screenshot saved!")
        browser.close()

if __name__ == "__main__":
    take_diag_screenshot()
