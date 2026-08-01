import os
import sys
import subprocess
from playwright.sync_api import sync_playwright

TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1vY2stdXNlci1pZCIsImVtYWlsIjoiY3VzdG9tZXJAc2hlaWtoc2hvcC5jb20iLCJyb2xlIjoiU1VQRVJBRE1JTiIsImlhdCI6MTc4NTYxMzM5NCwiZXhwIjoxNzg2MjE4MTk0LCJhdWQiOiJzaGVpa2gtc2hvcC11c2VycyIsImlzcyI6InNoZWlraC1zaG9wIn0.wY3GVtFtU0AIgbI-qawbiA6dtx_VOSDGIgqGNIGeKpM"

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 1000})
        context.add_cookies([{
            "name": "access-token",
            "value": TOKEN,
            "domain": "localhost",
            "path": "/",
            "httpOnly": True,
            "secure": False,
            "sameSite": "Lax"
        }])
        page = context.new_page()
        url = "http://localhost:3000/products/p_simple_stock_50"
        print(f"Navigating to: {url}")
        page.goto(url, wait_until="domcontentloaded")
        page.wait_for_timeout(10000)

        # Read page title & text
        print(f"Page Title: {page.title()}")
        text = page.locator("body").text_content()
        print("Page Body Text content (first 1000 chars):")
        print(text[:1000])

        # If details or error exists, print it
        details = page.locator("details")
        if details.count() > 0:
            print("\nError details block found:")
            print(details.first.text_content())

        browser.close()

if __name__ == "__main__":
    run()
