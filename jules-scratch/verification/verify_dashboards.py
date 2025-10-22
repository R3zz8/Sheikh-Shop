
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Affiliate Dashboard
    page.goto("http://localhost:3000/affiliate/dashboard", timeout=60000)
    page.screenshot(path="jules-scratch/verification/affiliate_dashboard.png", full_page=True)

    # Admin Dashboard
    page.goto("http://localhost:3000/admin/affiliates", timeout=60000)
    page.screenshot(path="jules-scratch/verification/admin_dashboard.png", full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
