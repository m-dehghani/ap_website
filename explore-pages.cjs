const { chromium } = require('playwright');
const fs = require('fs');

const pages = [
  { path: '/', name: 'home' },
  { path: '/shop', name: 'shop' },
  { path: '/programs', name: 'programs' },
  { path: '/coaches', name: 'coaches' },
  { path: '/about', name: 'about' },
  { path: '/news', name: 'news' },
  { path: '/success', name: 'success' },
  { path: '/testimonials', name: 'testimonials' },
  { path: '/contact', name: 'contact' },
  { path: '/register', name: 'register' },
  { path: '/login', name: 'login' },
  { path: '/shop/cart', name: 'cart' },
];

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Create output directory
  if (!fs.existsSync('ux-audit')) {
    fs.mkdirSync('ux-audit');
  }
  
  for (const p of pages) {
    try {
      console.log(`\n=== Exploring ${p.name} (${p.path}) ===`);
      await page.goto(`http://localhost:3000${p.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Take screenshot
      await page.screenshot({ path: `ux-audit/${p.name}.png`, fullPage: true });
      
      // Get page title
      const title = await page.title();
      console.log(`Title: ${title}`);
      
      // Get all headings
      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els => 
        els.map(el => ({ tag: el.tagName, text: el.innerText.trim() }))
      );
      console.log('Headings:', headings.length);
      headings.forEach(h => console.log(`  ${h.tag}: ${h.text}`));
      
      // Get all buttons
      const buttons = await page.$$eval('button', els => 
        els.map(el => ({ text: el.innerText.trim(), class: el.className, disabled: el.disabled }))
      );
      console.log('Buttons:', buttons.length);
      buttons.forEach(b => console.log(`  "${b.text}" (${b.class})${b.disabled ? ' [DISABLED]' : ''}`));
      
      // Get all form inputs
      const inputs = await page.$$eval('input, select, textarea', els => 
        els.map(el => ({ 
          tag: el.tagName, 
          type: el.type || 'N/A', 
          name: el.name || 'N/A', 
          placeholder: el.placeholder || 'N/A',
          required: el.required,
          class: el.className
        }))
      );
      console.log('Form inputs:', inputs.length);
      inputs.forEach(i => console.log(`  <${i.tag} type="${i.type}" name="${i.name}" placeholder="${i.placeholder}"${i.required ? ' required' : ''}>`));
      
      // Get all images
      const images = await page.$$eval('img', els => 
        els.map(el => ({ src: el.src, alt: el.alt, class: el.className }))
      );
      console.log('Images:', images.length);
      images.forEach(img => console.log(`  ${img.src} | alt: "${img.alt}"`));
      
      // Get main content structure
      const mainContent = await page.$eval('main, [role="main"], #main-content', el => el.innerHTML.substring(0, 500)).catch(() => 'No main element found');
      console.log('Main content preview:', mainContent.substring(0, 200) + '...');
      
      // Check for accessibility issues
      const ariaLabels = await page.$$eval('[aria-label]', els => els.map(el => el.getAttribute('aria-label')));
      console.log('ARIA labels:', ariaLabels.length);
      
      const focusableElements = await page.$$eval('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])', els => els.length);
      console.log('Focusable elements:', focusableElements);
      
    } catch (error) {
      console.log(`Error exploring ${p.name}:`, error.message);
    }
  }
  
  await browser.close();
  console.log('\n=== Exploration Complete ===');
})();