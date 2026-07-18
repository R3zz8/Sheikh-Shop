import os
from playwright.sync_api import sync_playwright, expect

def handle_console(msg):
    print(f"[CONSOLE {msg.type}]: {msg.text}")

def handle_page_error(err):
    print(f"[PAGE ERROR]: {err}")

def verify_sheikh_digital():
    print("Starting Playwright verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Create page and register console listener
        desktop_page = browser.new_page(viewport={"width": 1280, "height": 850})

        desktop_page.on("console", handle_console)
        desktop_page.on("pageerror", handle_page_error)

        print("Navigating to Sheikh Digital page on Desktop...")
        desktop_page.goto("http://localhost:3001/sheikh-digital", wait_until="domcontentloaded")

        # Apply dark mode state programmatically
        desktop_page.evaluate("""() => {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }""")

        # Explicitly wait for animations and lazy-loaded R3F canvas
        print("Waiting for page load & animations to settle...")
        desktop_page.wait_for_timeout(6000)

        # Assert first h1 element to be visible
        heading = desktop_page.locator("h1").first
        expect(heading).to_be_visible()
        print(f"Heading text: {heading.text_content()}")

        desktop_screenshot_path = "verification/sheikh_digital_desktop.png"
        desktop_page.screenshot(path=desktop_screenshot_path)
        print(f"Desktop screenshot saved to {desktop_screenshot_path}")

        browser.close()
        print("Playwright verification completed successfully!")

if __name__ == "__main__":
    os.makedirs("verification", exist_ok=True)
    verify_sheikh_digital()
