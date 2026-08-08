import os
import time
from playwright.sync_api import sync_playwright

def capture_screenshots():
    print("🎬 Starting Playwright PDP Regression screenshot generation...")
    os.makedirs("/app/verification", exist_ok=True)

    viewports = {
        "desktop": {"width": 1280, "height": 900},
        "mobile": {"width": 375, "height": 812}
    }

    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1vY2stdXNlci1pZCIsImVtYWlsIjoiY3VzdG9tZXJAc2hlaWtoc2hvcC5jb20iLCJyb2xlIjoiU1VQRVJBRE1JTiIsImlhdCI6MTc4NDYzMDc4OCwiZXhwIjoxNzg1MjM1NTg4LCJhdWQiOiJzaGVpa2gtc2hvcC11c2VycyIsImlzcyI6InNoZWlraC1zaG9wIn0._mWRn1Uukd8pcWzxKyHqQRazVlGkz858Z-d8aeR_6ZQ"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        print("Browser launched successfully.")

        def get_page(viewport_name):
            context = browser.new_context(
                viewport=viewports[viewport_name],
                locale="fa-IR",
                timezone_id="Asia/Tehran"
            )
            # Add access token cookie for SUPERADMIN auth
            context.add_cookies([{
                "name": "access-token",
                "value": token,
                "domain": "localhost",
                "path": "/"
            }])
            return context.new_page()

        # 1. Food PDP desktop (Product without variants: p1)
        print("📸 Capturing Food PDP desktop...")
        page = get_page("desktop")
        try:
            page.goto("http://localhost:3000/products/p1", wait_until="domcontentloaded", timeout=15000)
        except Exception as e:
            print("   Warning/Timeout during load (continuing anyway):", e)
        time.sleep(3)
        page.screenshot(path="/app/verification/Food_PDP_desktop.png")
        page.close()

        # 2. Nova PDP desktop (pd_speaker_2)
        print("📸 Capturing Nova PDP desktop...")
        page = get_page("desktop")
        try:
            page.goto("http://localhost:3000/products/royal-sound-pro-speaker", wait_until="domcontentloaded", timeout=15000)
        except Exception as e:
            print("   Warning/Timeout during load (continuing anyway):", e)
        time.sleep(3)
        page.screenshot(path="/app/verification/Nova_PDP_desktop.png")
        page.close()

        # 3. Digital PDP desktop / Product with variants (royal-watch-v2)
        print("📸 Capturing Digital PDP / Product with variants...")
        page = get_page("desktop")
        try:
            page.goto("http://localhost:3000/products/royal-watch-v2", wait_until="domcontentloaded", timeout=15000)
        except Exception as e:
            print("   Warning/Timeout during load (continuing anyway):", e)
        time.sleep(3)
        page.screenshot(path="/app/verification/Digital_PDP_desktop.png")
        page.close()

        # 4. Home PDP desktop (royal-frost-x9-refrigerator)
        print("📸 Capturing Home PDP desktop...")
        page = get_page("desktop")
        try:
            page.goto("http://localhost:3000/products/royal-frost-x9-refrigerator", wait_until="domcontentloaded", timeout=15000)
        except Exception as e:
            print("   Warning/Timeout during load (continuing anyway):", e)
        time.sleep(3)
        page.screenshot(path="/app/verification/Home_PDP_desktop.png")
        page.close()

        # 5. Mobile PDP
        print("📸 Capturing Mobile PDP (p1)...")
        page = get_page("mobile")
        try:
            page.goto("http://localhost:3000/products/p1", wait_until="domcontentloaded", timeout=15000)
        except Exception as e:
            print("   Warning/Timeout during load (continuing anyway):", e)
        time.sleep(3)
        page.screenshot(path="/app/verification/Mobile_PDP.png")
        page.close()

        # 6. Invalid product 404
        print("📸 Capturing Invalid product 404...")
        page = get_page("desktop")
        try:
            page.goto("http://localhost:3000/products/this-product-does-not-exist", wait_until="domcontentloaded", timeout=15000)
        except Exception as e:
            print("   Warning/Timeout during load (continuing anyway):", e)
        time.sleep(3)
        page.screenshot(path="/app/verification/Invalid_product_404.png")
        page.close()

        # 7. Homepage to verify colors
        print("📸 Capturing Homepage...")
        page = get_page("desktop")
        try:
            page.goto("http://localhost:3000/", wait_until="domcontentloaded", timeout=15000)
        except Exception as e:
            print("   Warning/Timeout during load (continuing anyway):", e)
        time.sleep(3)
        page.screenshot(path="/app/verification/Homepage_colors.png")
        page.close()

        browser.close()
        print("🎉 Screenshots successfully captured and saved under /app/verification!")

if __name__ == "__main__":
    capture_screenshots()
