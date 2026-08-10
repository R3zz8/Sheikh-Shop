import os
import time
import subprocess
from playwright.sync_api import sync_playwright

def generate_fresh_token():
    secret = "super_secret_production_ready_jwt_key_at_least_32_characters_long_for_security"
    node_code = f"""
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({{
      id: 'mock-user-id',
      email: 'customer@sheikhshop.com',
      role: 'SUPERADMIN'
    }}, '{secret}', {{
      algorithm: 'HS256',
      issuer: 'sheikh-shop',
      audience: 'sheikh-shop-users',
      expiresIn: '100y'
    }});
    console.log(token);
    """
    res = subprocess.run(["node", "-e", node_code], capture_output=True, text=True)
    return res.stdout.strip()

def run_server():
    print("🚀 Starting Next.js standalone production server in MOCK_DB=true mode...")
    # Kill any process on port 3000 first
    subprocess.run("pkill -9 -f node 2>/dev/null || true", shell=True)
    subprocess.run("pkill -9 -f next 2>/dev/null || true", shell=True)
    time.sleep(2)  # Give OS time to fully release the port
    env = os.environ.copy()
    env["MOCK_DB"] = "true"
    env["PORT"] = "3000"
    env["JWT_SECRET"] = "super_secret_production_ready_jwt_key_at_least_32_characters_long_for_security"

    log_file = open("/app/server_output.log", "w")
    process = subprocess.Popen("node .next/standalone/server.js", shell=True, env=env, stdout=log_file, stderr=log_file)
    time.sleep(5)  # Wait for startup
    return process

def capture_screenshots():
    os.makedirs("/app/verification/product-images", exist_ok=True)

    viewports = {
        "desktop": {"width": 1280, "height": 900},
        "mobile": {"width": 375, "height": 812}
    }

    token = generate_fresh_token()
    print("🔑 Generated fresh SUPERADMIN token:", token[:20] + "...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        print("Browser launched.")

        def get_page(viewport_name):
            context = browser.new_context(
                viewport=viewports[viewport_name],
                locale="fa-IR",
                timezone_id="Asia/Tehran"
            )
            context.add_cookies([{
                "name": "access-token",
                "value": token,
                "domain": "localhost",
                "path": "/"
            }])
            return context.new_page()

        # 1. Admin editor BEFORE deletion
        print("📸 1. Navigating to Admin editor BEFORE deletion...")

        # Diagnostic: Make a direct GET request to /api/upload to see what it returns!
        import urllib.request
        import json
        try:
            req = urllib.request.Request("http://localhost:3000/api/upload?productId=pd_speaker_1")
            req.add_header("Cookie", f"access-token={token}")
            with urllib.request.urlopen(req) as response:
                print("Direct API Response:", response.read().decode('utf-8'))
        except Exception as api_err:
            print("Direct API Error:", api_err)

        page = get_page("desktop")
        page.on("dialog", lambda dialog: dialog.accept()) # Auto-accept confirm dialogs

        try:
            page.goto("http://localhost:3000/dashboard/products/pd_speaker_1", wait_until="domcontentloaded", timeout=20000)
            time.sleep(5)

            # Print page title and first 200 chars of body content to debug
            print("Page Title:", page.title())
            body_text = page.inner_text("body")
            print("Page Body Text Snippet:", body_text[:200])

            # Click the Media Tab
            page.click('button:has-text("تصاویر (Media Gallery)")')
            time.sleep(3)
            page.screenshot(path="/app/verification/product-images/1_editor_before_deletion.png")

            # 2. Admin editor AFTER deletion
            print("📸 2. Deleting image and capturing Admin editor AFTER deletion...")
            # Click the CircleX button (the delete button in the image card)
            page.locator(".lucide-circle-x").first.click()
            time.sleep(3)
            page.screenshot(path="/app/verification/product-images/2_editor_after_deletion.png")

            # 3. Admin editor AFTER uploading replacement/new image
            print("📸 3. Uploading a new image...")
            page.set_input_files('input[type="file"]', '/app/tests/e2e/test-image.png')
            time.sleep(1)
            page.click('button:has-text("شروع بارگذاری")')
            time.sleep(4)
            page.screenshot(path="/app/verification/product-images/3_editor_after_upload.png")

            # 4. Save changes and reload
            print("📸 4. Saving changes and reloading...")
            page.click('button:has-text("ذخیره کل تغییرات کالا")')
            time.sleep(5)

            # Re-navigate to check persistence
            page.goto("http://localhost:3000/dashboard/products/pd_speaker_1", wait_until="domcontentloaded", timeout=20000)
            time.sleep(5)
            page.click('button:has-text("تصاویر (Media Gallery)")')
            time.sleep(3)
            page.screenshot(path="/app/verification/product-images/4_editor_after_save_reload.png")

            # 5. Customer PDP after saved changes
            print("📸 5. Navigating to Customer PDP...")
            page.goto("http://localhost:3000/products/luxury-x9-speaker", wait_until="domcontentloaded", timeout=20000)
            time.sleep(5)
            page.screenshot(path="/app/verification/product-images/5_customer_pdp_desktop.png")
            page.close()

            # 6. Mobile PDP
            print("📸 6. Navigating to Mobile PDP...")
            page_mobile = get_page("mobile")
            page_mobile.goto("http://localhost:3000/products/luxury-x9-speaker", wait_until="domcontentloaded", timeout=20000)
            time.sleep(5)
            page_mobile.screenshot(path="/app/verification/product-images/6_customer_pdp_mobile.png")
            page_mobile.close()

        except Exception as e:
            print("Error capturing product images flow:", e)
        finally:
            browser.close()
            print("🎉 Image Management screenshots successfully captured under /app/verification/product-images/")

if __name__ == "__main__":
    server_process = run_server()
    try:
        capture_screenshots()
    finally:
        print("🛑 Shutting down development server...")
        server_process.terminate()
        subprocess.run("kill $(lsof -t -i :3000) 2>/dev/null || true", shell=True)
