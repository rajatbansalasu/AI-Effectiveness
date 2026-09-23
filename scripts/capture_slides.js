const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const artifactDir = '/Users/rajatbansal/.gemini/antigravity-ide/brain/a30cb014-9945-45af-a498-e773d81aca57';

  for (let slideNum = 1; slideNum <= 17; slideNum++) {
    await page.goto(`http://localhost:3000/#slide=${slideNum}`);
    await page.reload();
    await page.waitForTimeout(400);

    // Dark mode
    await page.evaluate(() => {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    });
    await page.waitForTimeout(200);
    const darkPath = path.join(artifactDir, `slide_${slideNum}_dark.png`);
    await page.screenshot({ path: darkPath });

    // Light mode
    await page.evaluate(() => {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    });
    await page.waitForTimeout(200);
    const lightPath = path.join(artifactDir, `slide_${slideNum}_light.png`);
    await page.screenshot({ path: lightPath });
    console.log(`Slide ${slideNum} captured in both themes.`);
  }

  await browser.close();
  console.log('All 17 slides captured successfully in both Dark and Light themes!');
})();
