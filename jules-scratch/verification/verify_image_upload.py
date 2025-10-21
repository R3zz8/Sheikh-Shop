
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # 1. Login
        await page.goto("http://localhost:3001/login")
        await page.fill('input[name="email"]', "admin@sheikh.com")
        await page.fill('input[name="password"]', "123456")
        await page.click('button[type="submit"]')
        await page.wait_for_url("http://localhost:3001/dashboard")

        # 2. Navigate to articles page
        await page.goto("http://localhost:3001/dashboard/articles")

        # 3. Click the edit button for a specific article
        await page.click('a[href="/dashboard/articles/c956f2bd-82ce-402d-9cb8-52e3391df43a/edit"]')

        # 4. Upload an image
        await page.set_input_files('input[type="file"]', 'tests/e2e/test-image.png')

        # 5. Take a screenshot
        await page.screenshot(path="jules-scratch/verification/verification.png")

        await browser.close()

asyncio.run(main())
