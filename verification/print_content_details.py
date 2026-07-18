from playwright.sync_api import sync_playwright

def print_details():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3001/sheikh-digital")
        time_to_wait = 2000
        page.wait_for_timeout(time_to_wait)

        body_text = page.locator("body").inner_text()
        print("--- BODY PLAIN TEXT ---")
        print(body_text)
        print("-----------------------")
        browser.close()

if __name__ == "__main__":
    print_details()
