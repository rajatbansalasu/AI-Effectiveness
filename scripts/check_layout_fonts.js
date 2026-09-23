const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log("=== SLIDE AUDIT: VIEWPORT OVERFLOW & FONT SIZE CHECK (1440x900 & 1728x920) ===");

  for (let slideNum = 1; slideNum <= 18; slideNum++) {
    await page.goto(`http://localhost:3000/#slide=${slideNum}`);
    await page.reload();
    await page.waitForTimeout(300);

    const metrics = await page.evaluate((sNum) => {
      const slide = document.querySelector(`.slide[data-slide="${sNum}"]`);
      if (!slide) return { error: "Slide not found" };

      const content = slide.querySelector('.slide-content');
      const header = slide.querySelector('.slide-header');
      const h2 = slide.querySelector('h2');
      const desc = slide.querySelector('.slide-desc');
      
      // Check bounding boxes
      const slideRect = slide.getBoundingClientRect();
      const contentRect = content ? content.getBoundingClientRect() : null;
      const isOverflowing = content ? (content.scrollHeight > content.clientHeight) : false;

      // Find all text elements and get their font sizes
      const textElements = slide.querySelectorAll('p, span, div, li, td, th, pre, code, strong, em');
      const fontSizes = [];
      textElements.forEach(el => {
        const fs = parseFloat(window.getComputedStyle(el).fontSize);
        if (!isNaN(fs) && el.textContent.trim().length > 0) {
          fontSizes.push(fs);
        }
      });

      const minFs = fontSizes.length ? Math.min(...fontSizes) : 0;
      const maxFs = fontSizes.length ? Math.max(...fontSizes) : 0;

      // Headroom at bottom of content
      const bottomPadding = content ? (contentRect.bottom - (slideRect.bottom - 48)) : 0;
      const freeSpace = content ? (slideRect.height - (contentRect.top + contentRect.height) - 48) : 0;

      return {
        slideNum: sNum,
        isOverflowing,
        scrollHeight: content ? content.scrollHeight : 0,
        clientHeight: content ? content.clientHeight : 0,
        h2FontSize: h2 ? window.getComputedStyle(h2).fontSize : 'N/A',
        descFontSize: desc ? window.getComputedStyle(desc).fontSize : 'N/A',
        minFontSize: minFs.toFixed(1) + 'px',
        maxFontSize: maxFs.toFixed(1) + 'px',
        freeSpace: Math.round(freeSpace) + 'px'
      };
    }, slideNum);

    console.log(`Slide ${slideNum}: Overflow=${metrics.isOverflowing ? '❌ YES' : '✅ NO'} | ScrollH/ClientH: ${metrics.scrollHeight}/${metrics.clientHeight} | H2: ${metrics.h2FontSize} | Desc: ${metrics.descFontSize} | MinText: ${metrics.minFontSize} | FreeSpace: ${metrics.freeSpace}`);
  }

  // Also test at 1728x920
  await page.setViewportSize({ width: 1728, height: 920 });
  console.log("\n=== TESTING AT 1728x920 ===");
  for (let slideNum = 1; slideNum <= 18; slideNum++) {
    await page.goto(`http://localhost:3000/#slide=${slideNum}`);
    await page.waitForTimeout(200);

    const metrics = await page.evaluate((sNum) => {
      const slide = document.querySelector(`.slide[data-slide="${sNum}"]`);
      const content = slide ? slide.querySelector('.slide-content') : null;
      return {
        isOverflowing: content ? (content.scrollHeight > content.clientHeight) : false,
        scrollHeight: content ? content.scrollHeight : 0,
        clientHeight: content ? content.clientHeight : 0,
      };
    }, slideNum);

    if (metrics.isOverflowing) {
      console.log(`❌ Slide ${slideNum} OVERFLOW at 1728x920: ${metrics.scrollHeight}/${metrics.clientHeight}`);
    }
  }
  console.log("1728x920 check complete.");

  await browser.close();
})();
