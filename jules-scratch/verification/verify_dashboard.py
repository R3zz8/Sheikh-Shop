from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Login
    page.goto("http://localhost:3000/login", timeout=90000)
    page.wait_for_selector("label:has-text('Email')", timeout=60000)
    page.get_by_label("Email").fill("rezadhu615@gmail.com")
    page.get_by_label("Password").fill("Temp@1374")
    page.get_by_role("button", name="Login").click()
    page.wait_for_url("http://localhost:3000/dashboard")

    # Go to affiliate dashboard
    page.goto("http://localhost:3000/affiliate/dashboard")

    # Wait for charts to be visible
    page.wait_for_selector("text=Performance Analytics")

    page.screenshot(path="jules-scratch/verification/affiliate_dashboard.png", full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
