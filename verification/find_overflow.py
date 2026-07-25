from playwright.sync_api import sync_playwright

def find_overflow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Pixel 5 viewport (375x812)
        context = browser.new_context(
            viewport={"width": 375, "height": 812},
            is_mobile=True,
            user_agent="Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36"
        )
        page = context.new_page()

        print("Navigating to http://localhost:3000/...")
        page.goto("http://localhost:3000/", wait_until="load")

        print("Waiting 5 seconds for hydration and 3D scenes...")
        page.wait_for_timeout(5000)

        # Get elements extending outside the body viewport
        overflowing_elements = page.evaluate("""() => {
            const body_rect = document.body.getBoundingClientRect();
            const v_left = body_rect.left;
            const v_right = body_rect.right;

            const elms = [];
            document.querySelectorAll('*').forEach(el => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);

                if (rect.width > 0 && rect.height > 0) {
                    const is_overflow_left = rect.left < v_left - 1;
                    const is_overflow_right = rect.right > v_right + 1;

                    if (is_overflow_left || is_overflow_right) {
                        let selector = el.tagName.toLowerCase();
                        if (el.id) {
                            selector += '#' + el.id;
                        } else if (el.className) {
                            selector += '.' + [...el.classList].join('.');
                        }
                        elms.push({
                            selector: selector.substring(0, 100),
                            left: rect.left,
                            right: rect.right,
                            width: rect.width,
                            height: rect.height,
                            position: style.position,
                            overflow: style.overflow,
                            display: style.display,
                            is_overflow_left,
                            is_overflow_right,
                            outerHTML: el.outerHTML.substring(0, 120)
                        });
                    }
                }
            });
            return {
                body: { left: v_left, right: v_right, width: body_rect.width },
                elements: elms
            };
        }""")

        print(f"Body bounding rect: {overflowing_elements['body']}")
        elements = overflowing_elements['elements']
        print(f"Total out-of-bounds elements relative to body: {len(elements)}")
        # Filter elements that are not fixed and actually overflow
        actual_overflow = [el for el in elements if el['position'] != 'fixed' and 'header' not in el['selector'] and 'footer' not in el['selector']]
        print(f"Total candidate overflowing elements: {len(actual_overflow)}")
        for idx, el in enumerate(actual_overflow[:30]):
            print(f"[{idx}] Pos: {el['position']}, Display: {el['display']}, Left: {el['left']}px, Right: {el['right']}px, Width: {el['width']}px, Selector: {el['selector']}, html: {el['outerHTML']}")

        browser.close()

if __name__ == "__main__":
    find_overflow()
