import time
from playwright.sync_api import sync_playwright

def debug():
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1vY2stdXNlci1pZCIsImVtYWlsIjoiY3VzdG9tZXJAc2hlaWtoc2hvcC5jb20iLCJyb2xlIjoiU1VQRVJBRE1JTiIsImlhdCI6MTc4NDYzMDc4OCwiZXhwIjoxNzg1MjM1NTg4LCJhdWQiOiJzaGVpa2gtc2hvcC11c2VycyIsImlzcyI6InNoZWlraC1zaG9wIn0._mWRn1Uukd8pcWzxKyHqQRazVlGkz858Z-d8aeR_6ZQ"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        context.add_cookies([{
            "name": "access-token",
            "value": token,
            "domain": "localhost",
            "path": "/"
        }])
        page = context.new_page()

        # Listen to console logs
        page.on("console", lambda msg: print(f"[Console] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[PageError] {err.message}"))

        print("Navigating to product detail page...")
        page.goto("http://localhost:3000/product/p1", wait_until="load")

        print("Waiting 5 seconds for hydration...")
        time.sleep(5)

        print("Taking debug screenshot...")
        page.screenshot(path="/home/jules/verification/debug_p1.png")

        # Check page HTML to see what is rendered
        print("\nPage title:", page.title())
        print("Body text snippet:", page.locator("body").inner_text()[:300])

        browser.close()

if __name__ == "__main__":
    debug()
