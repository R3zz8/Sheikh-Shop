import os
import sys
import time
from playwright.sync_api import sync_playwright, expect

# Ensure PostgreSQL client can connect
sys.path.append(os.getcwd())

def get_db_images():
    # Helper to fetch current images from real PostgreSQL
    import subprocess
    import json
    cmd = [
        "pnpm", "tsx", "-e",
        "require('dotenv').config(); const { prisma } = require('./src/lib/prisma.ts'); prisma.image.findMany({ where: { productId: 'dcf36af5-71dd-4418-94e1-b109c3ccbb38' } }).then(imgs => console.log(JSON.stringify(imgs)));"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    lines = result.stdout.strip().split("\n")
    for line in reversed(lines):
        if line.startswith("[") and line.endswith("]"):
            return json.loads(line)
    return []

def run_acceptance_test():
    # Create screenshots directory if not exist
    os.makedirs("verification/product-images", exist_ok=True)

    with sync_playwright() as p:
        print("🚀 Launching browser...")
        browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # Print all browser console logs for diagnostics
        page.on("console", lambda msg: print(f"📺 [BROWSER CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"🚨 [BROWSER ERROR] {err}"))

        # Handle browser confirmation dialogs automatically (like confirming image deletion)
        page.on("dialog", lambda dialog: dialog.accept())

        # 1. Login
        print("🔑 Navigating to login page...")
        page.goto("http://127.0.0.1:3000/login", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)

        print("👤 Logging in as rezadhu615@gmail.com...")
        email_input = page.locator("input[type='email']")
        email_input.fill("rezadhu615@gmail.com")
        email_input.blur()

        password_input = page.locator("input[type='password']")
        password_input.fill("Temp@1374")
        password_input.blur()

        page.wait_for_timeout(1000)
        page.locator("button[type='submit']").click()
        page.wait_for_timeout(3000)
        print(f"URL after login click: {page.url}")

        # 2. Open Product Editor
        print("📂 Navigating to Product Editor...")
        editor_url = "http://127.0.0.1:3000/dashboard/products/dcf36af5-71dd-4418-94e1-b109c3ccbb38"
        page.goto(editor_url, wait_until="domcontentloaded")
        page.wait_for_timeout(4000)
        print(f"URL after navigation to editor: {page.url}")

        # Assert product name is loaded in the input field
        expect(page.locator("input[name='name']")).to_have_value("Automatic Cat Water Fountains")
        print("✅ Successfully opened Product Editor for 'Automatic Cat Water Fountains'!")

        # 3. Click Media tab
        print("🖼️ Clicking Media tab...")
        page.get_by_text("تصاویر (Media Gallery)").click()
        page.wait_for_timeout(2000)

        # Capturing Screenshot 1: before-delete
        page.screenshot(path="verification/product-images/before-delete.png")
        print("📸 Captured Screenshot 1: before-delete.png")

        # Read current DB state before deletion
        initial_db_images = get_db_images()
        initial_db_ids = [img["id"] for img in initial_db_images]
        print(f"Initial images in PostgreSQL count: {len(initial_db_ids)}")
        print(f"Initial IDs: {initial_db_ids}")

        # Check visual image count in UI
        delete_buttons = page.locator("svg.lucide-circle-x")
        ui_count = delete_buttons.count()
        print(f"Initial images in UI count: {ui_count}")

        # 4. Delete exactly one image
        print("🗑️ Deleting first image...")
        deleted_id_1 = initial_db_ids[0]
        delete_buttons.nth(0).click()
        page.wait_for_timeout(5000) # Give it 5s to finish the DELETE fetch and update the UI

        # Take screenshot BEFORE asserting so we can visually inspect state on failure
        page.screenshot(path="verification/product-images/after-delete.png")
        print("📸 Captured Screenshot 2: after-delete.png")

        # Verify count decreased by 1 in UI
        expect(delete_buttons).to_have_count(len(initial_db_ids) - 1)
        print("✅ UI count decreased. Image successfully deleted in UI.")

        # Assert URL did not change during deletion
        assert page.url == editor_url, f"Expected URL {editor_url}, got {page.url}"

        # 5. Upload a new image
        print("📤 Preparing new dummy image upload...")
        test_img_path = "verification/custom_404.png"

        page.locator("input[type='file']").set_input_files(test_img_path)
        page.wait_for_timeout(1000)

        print("⚡ Clicking upload button...")
        page.get_by_role("button", name="شروع بارگذاری").click()
        page.wait_for_timeout(6000) # Give it plenty of time to hit Cloudinary and return

        # Take screenshot BEFORE asserting upload
        page.screenshot(path="verification/product-images/after-upload.png")
        print("📸 Captured Screenshot 3: after-upload.png")

        # Verify count in UI is now back to 4 (or same as initial)
        expect(delete_buttons).to_have_count(len(initial_db_ids))
        print("✅ Image uploaded successfully! UI count is back to initial.")

        # 6. Save all product changes
        print("💾 Saving all product changes...")
        page.get_by_role("button", name="ذخیره کل تغییرات کالا").click()
        page.wait_for_timeout(5000)

        # Assert URL is STILL the exact same Product Editor URL (no unexpected redirect!)
        assert page.url == editor_url, f"Expected URL {editor_url} after save, got {page.url}"
        print("✅ Save completed successfully. NO UNEXPECTED REDIRECT!")

        # Capture Screenshot 4: after-save
        page.screenshot(path="verification/product-images/after-save.png")
        print("📸 Captured Screenshot 4: after-save.png")

        # 7. Reload using a fresh page/reload to verify persistence
        print("🔄 Reloading editor page...")
        page.reload(wait_until="domcontentloaded")
        page.wait_for_timeout(4000)

        # Assert URL is still the editor URL
        assert page.url == editor_url, f"Expected URL {editor_url} after reload, got {page.url}"

        # Verify deletion and upload persists in UI after reload
        page.get_by_text("تصاویر (Media Gallery)").click()
        page.wait_for_timeout(2000)
        expect(delete_buttons).to_have_count(len(initial_db_ids))
        print("✅ Verified persistent image set in UI after reload!")

        # Capture Screenshot 5: after-reload
        page.screenshot(path="verification/product-images/after-reload.png")
        print("📸 Captured Screenshot 5: after-reload.png")

        # Verify PostgreSQL directly
        post_save_db_images = get_db_images()
        post_save_db_ids = [img["id"] for img in post_save_db_images]
        print(f"Post-save images in PostgreSQL count: {len(post_save_db_ids)}")
        assert len(post_save_db_ids) == len(initial_db_ids), f"Expected {len(initial_db_ids)} images in DB, got {len(post_save_db_ids)}"
        assert deleted_id_1 not in post_save_db_ids, f"Deleted image {deleted_id_1} still exists in PostgreSQL!"
        print("✅ PostgreSQL verified: Deleted image record successfully purged and new upload persisted!")

        # 8. Open public Product Detail Page (PDP)
        print("🔗 Navigating to public Product Detail Page (PDP)...")
        pdp_url = "http://127.0.0.1:3000/products/automatic-cat-water-fountains"
        page.goto(pdp_url, wait_until="domcontentloaded")
        page.wait_for_timeout(4000)

        # Capture Screenshot 6: public-product-page
        page.screenshot(path="verification/product-images/public-product-page.png")
        print("📸 Captured Screenshot 6: public-product-page.png")

        print("🎉 ALL ACCEPTANCE CRITERIA SUCCESSFULLY PASSED! 🎉")
        browser.close()

if __name__ == "__main__":
    run_acceptance_test()
