const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process', '--no-zygote']
        });
        console.log('Browser launched. New page...');
        const page = await browser.newPage();

        console.log('Navigating...');
        await page.goto('https://example.com', { timeout: 10000 });
        console.log('Page loaded.');

        const text = await page.evaluate(() => document.body.innerText);
        console.log('Extracted:', text.slice(0, 50));

        await browser.close();
        console.log('Done.');
    } catch (e) {
        console.error('PUPPETEER ERROR:', e);
    }
})();
