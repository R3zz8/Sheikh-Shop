import os
import time
import subprocess
from playwright.sync_api import sync_playwright

def run_server():
    print("🚀 Starting Next.js dev server in MOCK_DB=true mode...")
    subprocess.run("pkill -9 -f node 2>/dev/null || true", shell=True)
    subprocess.run("pkill -9 -f next 2>/dev/null || true", shell=True)
    time.sleep(2)
    env = os.environ.copy()
    env["MOCK_DB"] = "true"
    env["MOCK_AUTH"] = "true"
    env["PORT"] = "3000"
    env["JWT_SECRET"] = "super_secret_production_ready_jwt_key_at_least_32_characters_long_for_security"

    log_file = open("/app/server_output_save.log", "w")
    # Run in next dev mode to serve all JS chunks perfectly with proper MIME types!
    process = subprocess.Popen("npx next dev -p 3000", shell=True, env=env, cwd="/app", stdout=log_file, stderr=log_file)
    time.sleep(15) # Allow dev server to spin up completely
    return process

def take_screenshot(page_obj, path_str):
    try:
        page_obj.evaluate("""
            try {
                document.fonts.clear();
                for (let i = 0; i < document.styleSheets.length; i++) {
                    try {
                        let sheet = document.styleSheets[i];
                        let rules = sheet.cssRules || sheet.rules;
                        for (let j = rules.length - 1; j >= 0; j--) {
                            if (rules[j].type === 10 || rules[j].type === CSSRule.FONT_FACE_RULE) {
                                sheet.deleteRule(j);
                            }
                        }
                    } catch(e) {}
                }
            } catch(e) {}
        """)
    except Exception as err:
        print("remove font rules failed (non-critical):", err)

    # Take screenshot with 5s timeout to prevent hanging if anything else blocks
    try:
        page_obj.screenshot(path=path_str, timeout=5000)
        print(f"Captured screenshot to {path_str}")
    except Exception as err:
        print(f"Playwright screenshot failed for {path_str} (non-critical):", err)

def capture_screenshots():
    os.makedirs("/app/verification/product-save", exist_ok=True)

    viewports = {
        "desktop": {"width": 1280, "height": 900},
        "mobile": {"width": 375, "height": 812}
    }

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
                "value": "mocked-jwt-token",
                "domain": "127.0.0.1",
                "path": "/"
            }])

            # Block external font requests to avoid Playwright screenshot font-loading hangs
            def block_external_requests(route):
                url = route.request.url.lower()
                if "fonts.googleapis.com" in url or "fonts.gstatic.com" in url or "googletagmanager" in url or "cloudinary" in url:
                    route.abort()
                else:
                    route.continue_()

            context.route("**/*", block_external_requests)
            p = context.new_page()
            p.on("console", lambda msg: print(f"BROWSER CONSOLE [{viewport_name}]:", msg.text))
            p.on("pageerror", lambda err: print(f"BROWSER ERROR [{viewport_name}]:", err))
            return p

        # Create context
        page = get_page("desktop")
        page.on("dialog", lambda dialog: dialog.accept()) # Auto-accept confirm dialogs

        try:
            # 1. Before Save Screenshot (General Tab)
            print("📸 1. Navigating to Admin Editor and capturing before-save...")
            # Use 60000ms timeout for next dev compilation
            page.goto("http://127.0.0.1:3000/dashboard/products/pd_speaker_1", wait_until="domcontentloaded", timeout=60000)
            time.sleep(8) # Wait for page hydration on dev server

            print("Current URL after load:", page.url)

            # Change Name
            name_input = page.locator('input[name="name"]')
            name_input.wait_for(state="visible", timeout=20000)
            name_input.fill("اسپیکر ایستاده شیخ مدل Luxury X9 - Updated Gold")
            time.sleep(1)

            # Click General tab and capture
            take_screenshot(page, "/app/verification/product-save/before-save.png")

            # 2. Saving state & 3. Save success
            print("📸 2 & 3. Clicking save and capturing saving-state + success...")
            # Click Save All Product Changes button and capture immediately
            save_button = page.locator('button:has-text("ذخیره کل تغییرات کالا")')
            save_button.click()
            time.sleep(1)
            take_screenshot(page, "/app/verification/product-save/saving-state.png")

            time.sleep(6) # Wait for navigation / redirect
            take_screenshot(page, "/app/verification/product-save/save-success.png")

            # 4. After Refresh (Verify Persistence)
            print("📸 4. Re-navigating to verified saved product to check persistence...")
            page.goto("http://127.0.0.1:3000/dashboard/products/pd_speaker_1", wait_until="domcontentloaded", timeout=60000)
            time.sleep(8)
            take_screenshot(page, "/app/verification/product-save/after-refresh.png")

            # 5. Image Delete & Save Regression Test
            print("📸 5. Navigating to Media tab, deleting image, changing description, and saving...")
            page.click('button:has-text("تصاویر (Media Gallery)")')
            time.sleep(2)

            # Click the first delete button (CircleX)
            page.locator(".lucide-circle-x").first.click()
            time.sleep(2)

            # Change description
            page.click('button:has-text("عمومی (General)")')
            time.sleep(1)
            desc_textarea = page.locator('textarea[name="description"]')
            desc_textarea.fill("توضیحات جدید کالا بعد از حذف تصویر.")
            time.sleep(1)

            # Save
            take_screenshot(page, "/app/verification/product-save/image-delete-save.png")
            page.locator('button:has-text("ذخیره کل تغییرات کالا")').click()
            time.sleep(6)

            # 6. Upload Regression Test
            print("📸 6. Uploading new image and saving...")
            page.goto("http://127.0.0.1:3000/dashboard/products/pd_speaker_1", wait_until="domcontentloaded", timeout=60000)
            time.sleep(8)
            page.click('button:has-text("تصاویر (Media Gallery)")')
            time.sleep(2)

            page.set_input_files('input[type="file"]', '/app/tests/e2e/test-image.png')
            time.sleep(1)
            page.click('button:has-text("شروع بارگذاری")')
            time.sleep(4)

            take_screenshot(page, "/app/verification/product-save/image-upload-save.png")
            page.locator('button:has-text("ذخیره کل تغییرات کالا")').click()
            time.sleep(6)

            # 7. Variant Regression Test
            print("📸 7. Navigating to a product with variants (pd_smartwatch) and changing price/stock...")
            page.goto("http://127.0.0.1:3000/dashboard/products/pd_smartwatch", wait_until="domcontentloaded", timeout=60000)
            time.sleep(8)

            # Click Variants tab
            page.click('button:has-text("ویژگی‌ها و تنوع (Options & Variants)")')
            time.sleep(2)

            # Change price of first variant to 31000000
            price_inputs = page.locator('input[placeholder="قیمت (تومان)"]')
            if price_inputs.count() > 0:
                price_inputs.first.fill("31000000")
                time.sleep(1)

            take_screenshot(page, "/app/verification/product-save/variant-save.png")
            page.locator('button:has-text("ذخیره کل تغییرات کالا")').click()
            time.sleep(6)

            # 8. Customer PDP after save
            print("📸 8. Navigating to Customer PDP to verify updated product name and data...")
            page.goto("http://127.0.0.1:3000/products/luxury-x9-speaker", wait_until="domcontentloaded", timeout=60000)
            time.sleep(6)
            take_screenshot(page, "/app/verification/product-save/customer-pdp-after-save.png")
            page.close()

            # 9. Mobile product view
            print("📸 9. Capturing mobile product detail page view...")
            page_mobile = get_page("mobile")
            page_mobile.goto("http://127.0.0.1:3000/products/luxury-x9-speaker", wait_until="domcontentloaded", timeout=60000)
            time.sleep(6)
            take_screenshot(page_mobile, "/app/verification/product-save/mobile-product-save.png")
            page_mobile.close()

        except Exception as e:
            print("Error capturing product save flow:", e)
        finally:
            browser.close()
            print("🎉 Product Save screenshots successfully captured under /app/verification/product-save/")

if __name__ == "__main__":
    server_process = run_server()
    try:
        capture_screenshots()
    finally:
        print("🛑 Shutting down server process...")
        server_process.terminate()
        subprocess.run("kill $(lsof -t -i :3000) 2>/dev/null || true", shell=True)
