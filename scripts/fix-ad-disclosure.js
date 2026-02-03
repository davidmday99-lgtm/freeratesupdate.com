const fs = require('fs');

const p = 'advertising-disclosure.html';
let s = fs.readFileSync(p, 'utf8');

// Remove the internal note at the end of the page.
s = s.replace(/\r?\n\s*<p class="muted">Note: This page is provided[\s\S]*?finalized\.<\/p>\s*\r?\n/g, '\r\n');

// Ensure domain name is correct anywhere it appears.
s = s.replace(/FreeRateUpdate\.com/g, 'FreeRatesUpdate.com');

fs.writeFileSync(p, s);
console.log('fixed', p);
