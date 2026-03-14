const fs = require('fs');

const src = fs.readFileSync('reviews_source.txt','utf8');

// Keep only review section between "Show All" and "\nAbout\n"
const start = src.indexOf('\nShow All\n');
const end = src.indexOf('\nAbout\n');
const slice = src.slice(start >= 0 ? start : 0, end > 0 ? end : src.length);
const lines = slice.split(/\n+/).map(l => l.trim()).filter(Boolean);

const isRating = s => /^\d+(?:\.\d+)?$/.test(s) && parseFloat(s) <= 5 && parseFloat(s) >= 1;
const isPosted = s => /^Posted on /i.test(s);
const isReplyFrom = s => /^Reply from /i.test(s);
const clean = s => (s || '').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();

const reviews = [];

for (let i = 0; i < lines.length; i++) {
  if (!isRating(lines[i])) continue;
  const rating = parseFloat(lines[i]);

  let j = i + 1;
  // sometimes there's a single-letter initial
  if (lines[j] && lines[j].length === 1) j++;

  const name = (lines[j] && !isPosted(lines[j])) ? lines[j] : '';
  j++;

  let location = '';
  if (lines[j] && /,\s*[A-Z]{2}$/.test(lines[j])) { location = lines[j]; j++; }

  // find Posted on within next few lines
  if (!lines[j] || !isPosted(lines[j])) {
    let k = j;
    for (; k < Math.min(lines.length, j + 6); k++) {
      if (isPosted(lines[k])) break;
    }
    if (k >= Math.min(lines.length, j + 6)) continue;
    j = k;
  }

  const posted = lines[j].replace(/^Posted on\s+/i,'');
  j++;

  const bodyParts = [];
  for (; j < lines.length; j++) {
    const s = lines[j];
    if (isRating(s)) break;
    if (isReplyFrom(s)) break;
    if (/^\d+\s+of\s+\d+/i.test(s)) break;
    if (/^Load More/i.test(s)) break;
    if (/^read more$/i.test(s)) continue;
    // skip obvious UI
    if (/^(Reset all filters|Filter by|Reviews from Web|Experience\.com|Google|Facebook)$/i.test(s)) continue;
    bodyParts.push(s);
  }

  let body = clean(bodyParts.join(' '));
  body = body.replace(/\.\.\.\s*read more\s*$/i,'').replace(/\.\.\.$/,'').trim();
  if (!body) continue;

  reviews.push({ rating, name, location, posted, body });
}

// De-dupe by posted+body
const seen = new Set();
let out = [];
for (const r of reviews) {
  const key = r.posted + '|' + r.body;
  if (seen.has(key)) continue;
  seen.add(key);
  out.push(r);
}

// Filter spam / irrelevant / auto-generated filler
out = out.filter(r => {
  const b = r.body.toLowerCase();
  if (b.includes('crypto') || b.includes('scammer') || b.includes('mr kevin')) return false;
  if (b.includes('adam pashea')) return false;
  if (b.includes('received a review with')) return false;
  return true;
});

// Keep stronger reviews for homepage (avoid low outliers)
out = out.filter(r => r.rating >= 4);

// Trim very short one-word reviews
out = out.filter(r => r.body.length >= 12);

const final = out.map(r => ({
  rating: r.rating,
  who: [r.name, r.location].filter(Boolean).join(' • ').trim(),
  quote: r.body
}));

fs.writeFileSync('reviews.json', JSON.stringify({
  source: 'experience.com/reviews/david-day-388889',
  count: final.length,
  reviews: final
}, null, 2));

console.log('Parsed raw:', reviews.length, 'Dedup:', out.length, '-> reviews.json');
