const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function run() {
  console.log('Starting Playwright browser to generate premium icon suite...');

  const publicDir = path.join(__dirname, '../public');
  const iconsDir = path.join(publicDir, 'icons');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Load the logo SVG
  const svgPath = path.join(iconsDir, 'logo.svg');
  if (!fs.existsSync(svgPath)) {
    console.error(`SVG logo not found at: ${svgPath}`);
    process.exit(1);
  }
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. STANDARD ICON SIZES
  const sizes = [16, 32, 48, 64, 128, 192, 256, 512];

  for (const size of sizes) {
    console.log(`Generating icon-${size}x${size}.png...`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: ${size}px;
            height: ${size}px;
            overflow: hidden;
            background: transparent;
          }
          svg {
            width: 100%;
            height: 100%;
            display: block;
          }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
      </html>
    `;

    await page.setContent(htmlContent);
    await page.setViewportSize({ width: size, height: size });

    const outPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    await page.screenshot({ path: outPath, omitBackground: true });

    // Copy 32x32 to public/favicon.ico
    if (size === 32) {
      console.log('Copying 32x32 icon to public/favicon.ico...');
      fs.copyFileSync(outPath, path.join(publicDir, 'favicon.ico'));
    }
  }

  // 2. APPLE TOUCH ICON (180x180)
  console.log('Generating apple-touch-icon.png (180x180)...');
  const appleHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 180px;
          height: 180px;
          overflow: hidden;
          background: #020100;
        }
        svg {
          width: 100%;
          height: 100%;
          display: block;
        }
      </style>
    </head>
    <body>
      ${svgContent}
    </body>
    </html>
  `;
  await page.setContent(appleHtml);
  await page.setViewportSize({ width: 180, height: 180 });
  await page.screenshot({ path: path.join(iconsDir, 'apple-touch-icon.png'), omitBackground: false });

  // 3. MASKABLE ICON (512x512 with 15% inner padding for crop safe-zones)
  console.log('Generating maskable-icon.png (512x512 with safe-zone padding)...');
  const maskableHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 512px;
          height: 512px;
          overflow: hidden;
          background: #020100;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wrapper {
          width: 80%;
          height: 80%;
        }
        svg {
          width: 100%;
          height: 100%;
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        ${svgContent}
      </div>
    </body>
    </html>
  `;
  await page.setContent(maskableHtml);
  await page.setViewportSize({ width: 512, height: 512 });
  await page.screenshot({ path: path.join(iconsDir, 'maskable-icon.png'), omitBackground: false });

  // 4. ANDROID ADAPTIVE ICON (512x512)
  console.log('Generating android-adaptive.png (512x512)...');
  await page.screenshot({ path: path.join(iconsDir, 'android-adaptive.png'), omitBackground: false });

  // 5. ANDROID MONOCHROME ICON (512x512)
  console.log('Generating android-monochrome.png (512x512, monochrome/grayscale style)...');
  const monochromeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 512px;
          height: 512px;
          overflow: hidden;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wrapper {
          width: 85%;
          height: 85%;
          filter: grayscale(100%) brightness(1.2) contrast(1.5);
        }
        svg {
          width: 100%;
          height: 100%;
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        ${svgContent}
      </div>
    </body>
    </html>
  `;
  await page.setContent(monochromeHtml);
  await page.setViewportSize({ width: 512, height: 512 });
  await page.screenshot({ path: path.join(iconsDir, 'android-monochrome.png'), omitBackground: false });

  await browser.close();
  console.log('All icons generated successfully!');
}

run().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
