const fs = require('fs');

const p = 'privacy.html';
let s = fs.readFileSync(p, 'utf8');

s = s.replace(/\r?\n\s*<p class="muted">Note: This privacy policy is provided[\s\S]*?attorney for advice\.<\/p>\s*\r?\n/g, '\r\n');

fs.writeFileSync(p, s);
console.log('removed note from', p);
