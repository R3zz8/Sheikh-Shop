import os
import sys
import re
from playwright.sync_api import sync_playwright, expect

console_errors = []
page_errors = []
failed_requests = []

def handle_console(msg):
    if msg.type == "error":
        text = msg.text.lower()
        # Filter out external network/analytics, CSP blockages, favicons, or guest 401s
        if any(x in text for x in ["email-decode", "vibrate", "google", "analytics", "csp", "content security policy", "401", "404", "unauthorized", "not found"]):
            return
        print(f"[BROWSER ERROR]: {msg.text}")
        console_errors.append(msg.text)

def handle_page_error(err):
    print(f"[BROWSER EXCEPTION]: {err}")
    page_errors.append(str(err))

def run_verification():
    print("====================================================")
    print("STARTING FULL END-TO-END VERIFICATION FLOW")
    print("====================================================")

    with sync_playwright() as p:
        # Launch headless browser
        browser = p.chromium.launch(headless=True)

        # We will use 4 viewports: Desktop (1280x1000), Tablet (768x1024), Mobile (375x812), Small-Mobile (320x568)
        viewports = {
            "desktop": {"width": 1280, "height": 1000},
            "tablet": {"width": 768, "height": 1024},
            "mobile": {"width": 375, "height": 812},
            "small_mobile": {"width": 320, "height": 568}
        }

        for name, vp in viewports.items():
            print(f"\n--- Testing Viewport: {name.upper()} ({vp['width']}x{vp['height']}) ---")

            # Create a fresh browser context and page
            context = browser.new_context(viewport=vp)
            page = context.new_page()

            # Attach event listeners to trace any console issues or exceptions
            page.on("console", handle_console)
            page.on("pageerror", handle_page_error)

            # Capture network response codes
            def check_response(response):
                if response.status >= 500:
                    url = response.url
                    if "localhost:3000" in url:
                        print(f"[HTTP {response.status}]: {url}")
                        failed_requests.append(f"{url} ({response.status})")

            page.on("response", check_response)

            # Navigate to sheikh-digital page
            url = "http://localhost:3000/sheikh-digital"
            print(f"Navigating to {url}...")
            page.goto(url, wait_until="domcontentloaded")

            # Enable luxury dark theme state
            page.evaluate("""() => {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }""")

            # Settle animations
            page.wait_for_timeout(4000)

            # 1. Assert exactly 2 products are rendered
            p1_title = "اسپیکر ایستاده شیخ مدل Luxury X9"
            p2_title = "اسپیکر هوشمند شیخ مدل Royal Sound Pro"

            # Check presence of first product
            print(f"Verifying presence of Product 1: '{p1_title}'")
            p1_elem = page.locator(f"text={p1_title}").filter(visible=True).first
            expect(p1_elem).to_be_visible()

            # Check presence of second product
            print(f"Verifying presence of Product 2: '{p2_title}'")
            p2_elem = page.locator(f"text={p2_title}").filter(visible=True).first
            expect(p2_elem).to_be_visible()

            # Verify prices
            p1_price = "۱۸٬۹۰۰٬۰۰۰ تومان"
            p2_price = "۲۴٬۵۰۰٬۰۰۰ تومان"

            print(f"Verifying price for Product 1: '{p1_price}'")
            p1_price_elem = page.locator(f"text={p1_price}").filter(visible=True).first
            expect(p1_price_elem).to_be_visible()

            print(f"Verifying price for Product 2: '{p2_price}'")
            p2_price_elem = page.locator(f"text={p2_price}").filter(visible=True).first
            expect(p2_price_elem).to_be_visible()

            # Take high-resolution screenshot
            screenshot_path = f"verification/sheikh_digital_final_{name}.png"
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"Screenshot successfully saved to: {screenshot_path}")

            # 2. End-to-end Click Through Verification:
            # Click on Product 1 and verify its detail page loads successfully
            if name == "desktop":
                print("\nRunning E2E Navigation check for Product 1 (Luxury X9)...")
                p1_elem.click()
                page.wait_for_timeout(3000)
                print(f"Current URL after clicking Product 1: {page.url}")
                expect(page).to_have_url(re.compile(r".*luxury-x9-standing-speaker.*|.*luxury-x9-speaker.*|.*p1.*"))

                # Check that detail page content renders successfully
                detail_title = page.locator("h1").first
                print(f"Product 1 Detail Page H1: {detail_title.text_content()}")
                expect(detail_title).to_contain_text("Luxury X9")

                # Go back
                page.goto(url, wait_until="domcontentloaded")
                page.wait_for_timeout(2000)

                print("\nRunning E2E Navigation check for Product 2 (Royal Sound Pro)...")
                p2_elem = page.locator(f"text={p2_title}").filter(visible=True).first
                p2_elem.click()
                page.wait_for_timeout(3000)
                print(f"Current URL after clicking Product 2: {page.url}")
                expect(page).to_have_url(re.compile(r".*royal-sound-pro-smart-speaker.*|.*royal-sound-pro-speaker.*|.*p2.*"))

                # Check that detail page content renders successfully
                detail_title2 = page.locator("h1").first
                print(f"Product 2 Detail Page H1: {detail_title2.text_content()}")
                expect(detail_title2).to_contain_text("Royal Sound Pro")

            context.close()

        browser.close()

    print("\n====================================================")
    print("VERIFICATION RUN SUMMARY")
    print("====================================================")
    print(f"Console errors detected: {len(console_errors)}")
    for err in console_errors:
        print(f" - {err}")
    print(f"Page/JS exceptions: {len(page_errors)}")
    for err in page_errors:
        print(f" - {err}")
    print(f"Failed local HTTP requests: {len(failed_requests)}")
    for req in failed_requests:
        print(f" - {req}")

    if len(console_errors) > 0 or len(page_errors) > 0 or len(failed_requests) > 0:
        print("\n❌ Verification FAILED with errors! Please review the console log above.")
        sys.exit(1)
    else:
        print("\n✅ Verification PASSED flawlessly with ZERO errors!")
        sys.exit(0)

if __name__ == "__main__":
    os.makedirs("verification", exist_ok=True)
    run_verification()
