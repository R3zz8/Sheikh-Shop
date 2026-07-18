from playwright.sync_api import sync_playwright

def print_body():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3001/sheikh-digital")

        # Get body inner HTML or page content
        content = page.locator("body").inner_html()
        print("--- BODY INNER HTML ---")
        print(content[:1500]) # Print first 1500 characters
        print("-----------------------")
        browser.close()

if __name__ == "__main__":
    print_body()
