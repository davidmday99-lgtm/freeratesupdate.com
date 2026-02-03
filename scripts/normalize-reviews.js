const fs = require('fs');

const p = 'reviews.json';
const j = JSON.parse(fs.readFileSync(p, 'utf8'));

const scrubNames = (s) => {
  s = String(s || '');
  // remove common references to David / Day / Mr. Day etc.
  s = s.replace(/\bMr\.?\s+Day\b/gi, '');
  s = s.replace(/\bDavid\s+Day\b/gi, '');
  // Many reviews refer to "David" meaning you
  s = s.replace(/\bDavid\b/gi, '');
  s = s.replace(/\bDay\b/gi, '');

  // also remove a few staff names that show up
  s = s.replace(/\bJehnna\b/gi, '');
  s = s.replace(/\bMegan\b/gi, '');
  s = s.replace(/\bKyle\s+Gally\b/gi, '');
  s = s.replace(/\bKeri\s+Robertson\b/gi, '');

  // cleanup spacing/punct
  s = s.replace(/\s{2,}/g, ' ')
    .replace(/\s+([,!.?])/g, '$1')
    .replace(/\(\s*\)/g, '')
    .trim();

  // if the quote starts weird (e.g. "with multiple times") clean leading 'with'
  s = s.replace(/^with\s+/i, '').trim();

  return s;
};

j.reviews = (j.reviews || [])
  .map(r => ({
    rating: r.rating,
    who: 'Verified borrower',
    quote: scrubNames(r.quote)
  }))
  .filter(r => r.quote && r.quote.length >= 18);

fs.writeFileSync(p, JSON.stringify(j, null, 2));
console.log('normalized reviews:', j.reviews.length);
