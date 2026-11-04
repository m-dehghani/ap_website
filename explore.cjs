const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  console.log('Page title:', await page.title());
  console.log('URL:', page.url());
  
  // Get all links
  const links = await page.$$eval('a', els => els.map(el => ({ href: el.href, text: el.innerText.trim() })));
  console.log('Links found:', links.length);
  links.forEach(l => console.log(' -', l.href, ':', l.text));
  
  await browser.close();
})();