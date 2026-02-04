const fs = require('fs');
const path = require('path');

// Topics: alternate purchase/refi-ish themes, plus the specific items you listed.
const TOPICS = [
  {
    tag: 'Purchase',
    title: 'Buying a home: what matters most in your mortgage options',
    outline: [
      'Start with your monthly payment target, not just the rate.',
      'Compare loan types (Conventional, FHA, VA) based on down payment + flexibility.',
      'Ask about seller credits, points, and how they affect cash to close.',
      'Get clear on timeline: pre-approval vs underwriting vs clear-to-close.'
    ]
  },
  {
    tag: 'Refinance',
    title: 'Refinance basics: when it makes sense (and when it doesn’t)',
    outline: [
      'Lower rate isn’t the only win—payment, term, and total cost matter.',
      'Run a break-even: how long until savings cover closing costs?',
      'Consider term changes (30→15, or 30→20) to build equity faster.',
      'Keep your goals simple: lower payment, pay off faster, or access cash.'
    ]
  },
  {
    tag: 'Cash-out',
    title: 'Cash-out refinance: benefits, risks, and the “right” reasons to use it',
    outline: [
      'Good use cases: debt consolidation, home improvements, emergency reserves.',
      'Avoid turning short-term spending into long-term debt.',
      'Watch your loan-to-value (LTV) and how it impacts pricing and approvals.',
      'Always compare against HELOC/home equity options.'
    ]
  },
  {
    tag: 'Blended Rate',
    title: 'Blended rates: a smarter way to look at your total debt cost',
    outline: [
      'Your mortgage rate may be low while your overall debt is expensive.',
      'A blended rate looks at all debts together—cards, auto, personal loans, mortgage.',
      'The goal: reduce total interest and free monthly cash flow.',
      'Use it to evaluate debt consolidation strategies.'
    ]
  },
  {
    tag: 'Term',
    title: 'Shortening your mortgage term without “feeling” the full payment jump',
    outline: [
      'Compare 30-year vs 15-year vs “paying extra” on a 30-year.',
      'Even small extra principal payments can shave years off.',
      'Ask for amortization comparisons (total interest + payoff date).',
      'Pick a plan you can stick to through life changes.'
    ]
  },
  {
    tag: 'Skip a Payment',
    title: 'Can you “skip” a mortgage payment with a refinance?',
    outline: [
      'Sometimes you can close before the next payment is due and create short-term cash flow.',
      'It’s not free money—interest accrues and costs roll into the loan.',
      'Use it strategically (buffer savings, planned expenses), not as a habit.',
      'Always request a clear payoff + closing timeline explanation.'
    ]
  },
  {
    tag: 'Appraisal',
    title: 'Appraisal waivers: what they are and when you might qualify',
    outline: [
      'Some conventional loans may allow waivers based on data and borrower profile.',
      'A waiver can save time and simplify the process.',
      'Not everyone qualifies—property type and scenario matter.',
      'Ask early so you can plan your closing timeline.'
    ]
  },
  {
    tag: 'FHA',
    title: 'FHA loans: who they’re for and why they can be powerful',
    outline: [
      'FHA is designed to expand access—lower down payment, flexible guidelines.',
      'Mortgage insurance matters: know the costs and how long it lasts.',
      'Great for first-time buyers and rebuilders (depending on full profile).',
      'Have a plan for the future: refinance options if it benefits you later.'
    ]
  },
  {
    tag: 'Credit',
    title: 'Credit scores as low as 500: what to know before you start',
    outline: [
      'Some programs may allow lower scores, but terms and requirements can change by lender.',
      'Focus on the whole picture: income, payment history, and reserves.',
      'A short credit improvement plan can dramatically expand options.',
      'Get a clear checklist instead of guessing.'
    ]
  },
  {
    tag: 'VA',
    title: 'VA loans for veterans: major benefits many buyers overlook',
    outline: [
      'Often no down payment required and competitive pricing.',
      'No monthly mortgage insurance (in many cases) is a big long-term win.',
      'Eligibility and entitlement can be confusing—get clarity early.',
      'If you’re a veteran, ask specifically for VA comparisons.'
    ]
  }
];

const AUTHOR = 'Michael Miller';

function chicagoNowParts() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(new Date());
  const get = (type) => parts.find(p => p.type === type)?.value;
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    ymd: `${get('year')}-${get('month')}-${get('day')}`
  };
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 70);
}

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPost({ title, dateLabel, author, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${htmlEscape(title)} — FreeRatesUpdate.com</title>
  <meta name="description" content="${htmlEscape(title)}" />
  <meta name="theme-color" content="#eef6ff" />
  <style>
    :root{
      --bg:#eef6ff;
      --card:#ffffff;
      --text:#0b1220;
      --muted:rgba(11,18,32,.72);
      --line:rgba(11,18,32,.12);
      --shadow:0 18px 55px rgba(11,18,32,.10);
      --blue:#2f7dff;
      --teal:#21d4b4;
      --amber:#f59e0b;
      --radius:18px;
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
      color:var(--text);
      background:
        radial-gradient(900px 520px at 12% 8%, rgba(47,125,255,.12) 0%, rgba(255,255,255,0) 60%),
        radial-gradient(860px 520px at 88% 12%, rgba(33,212,180,.12) 0%, rgba(255,255,255,0) 62%),
        linear-gradient(180deg, var(--bg) 0%, #ffffff 100%);
    }
    a{color:inherit;text-decoration:none}
    .wrap{max-width:820px;margin:0 auto;padding:18px 14px 64px}
    .top{display:flex;justify-content:space-between;align-items:center;gap:12px}
    .pill{display:inline-flex;align-items:center;gap:8px;padding:10px 12px;border-radius:999px;border:1px solid rgba(11,18,32,.14);background:rgba(255,255,255,.82);font-weight:800;font-size:13px}
    .pill b{color:var(--teal)}
    .card{margin-top:14px;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:18px}
    h1{margin:0 0 8px;font-size:30px;letter-spacing:-.2px}
    .meta{color:rgba(11,18,32,.65);font-size:12px;margin-bottom:14px}
    p{color:var(--muted);line-height:1.7;margin:0 0 12px}
    ul{margin:0 0 14px 18px;color:var(--muted);line-height:1.7}
    .cta{margin-top:16px;display:flex;gap:10px;flex-wrap:wrap}
    .btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 14px;border-radius:12px;border:1px solid rgba(11,18,32,.14);background:#fff;font-weight:900}
    .btn.primary{border:0;background:linear-gradient(135deg,var(--blue),var(--teal),var(--amber));color:#061222}
    @media (max-width:520px){
      .wrap{padding:14px 12px 60px}
      h1{font-size:28px}
      input,select,textarea{font-size:16px}
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <a class="pill" href="/blog/"><b>←</b> Blog</a>
      <a class="pill" href="/#quote"><b>New:</b> get options</a>
    </div>

    <article class="card">
      <h1>${htmlEscape(title)}</h1>
      <div class="meta">${htmlEscape(dateLabel)} • ${htmlEscape(author)}</div>
      ${bodyHtml}

      <div class="cta">
        <a class="btn primary" href="/#quote">Get options</a>
        <a class="btn" href="/mortgage-rates.html">Mortgage rates</a>
      </div>

      <p style="margin-top:14px;font-size:12px;color:rgba(11,18,32,.62)">
        FreeRatesUpdate.com is a marketing lead generator and information service. We are not a lender and we do not offer loan approvals or underwriting decisions through this website.
      </p>
    </article>
  </div>
</body>
</html>`;
}

function buildBody(topic) {
  const bullets = topic.outline.map(x => `<li>${htmlEscape(x)}</li>`).join('');
  return `
    <p>${htmlEscape('Here’s a quick, plain-English breakdown.')} </p>
    <ul>${bullets}</ul>
    <p>${htmlEscape('If you want, request information and we’ll help you compare your next best step.')}</p>
  `;
}

function main() {
  const now = chicagoNowParts();
  const statePath = path.join('blog', 'state.json');
  const indexPath = path.join('blog', 'posts', 'index.json');

  const state = fs.existsSync(statePath)
    ? JSON.parse(fs.readFileSync(statePath, 'utf8'))
    : { lastPostedDate: null, nextTopicIndex: 0 };

  // Schedule notes:
  // GitHub scheduled workflows can run late/early. To keep posting reliable,
  // we do NOT require an exact 7:00am execution time.
  // We only enforce:
  // - never post more than once per day
  // - post every other day (>= 2 days since last post)
  const force = process.env.FORCE_POST === '1';

  if (!force && state.lastPostedDate === now.ymd) {
    console.log('Already posted today; skipping.');
    return;
  }

  const parseYMD = (s) => {
    if (!s || typeof s !== 'string') return null;
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    // Use UTC to avoid DST/timezone edge cases.
    return new Date(Date.UTC(y, mo - 1, d));
  };

  if (!force && state.lastPostedDate) {
    const last = parseYMD(state.lastPostedDate);
    const today = parseYMD(now.ymd);
    if (last && today) {
      const days = Math.floor((today.getTime() - last.getTime()) / (24 * 60 * 60 * 1000));
      if (days < 2) {
        console.log('Every-other-day rule: last post was', state.lastPostedDate, 'so skipping today', now.ymd);
        return;
      }
    }
  }

  const topic = TOPICS[state.nextTopicIndex % TOPICS.length];
  const slug = slugify(topic.title);
  const filename = `${now.ymd}-${slug}.html`;
  const url = `/blog/posts/${filename}`;

  const dateLabel = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  const bodyHtml = buildBody(topic);
  const html = renderPost({ title: topic.title, dateLabel, author: AUTHOR, bodyHtml });

  const outPath = path.join('blog', 'posts', filename);
  fs.writeFileSync(outPath, html);

  // Update index
  const idx = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf8')) : { posts: [] };
  idx.posts = Array.isArray(idx.posts) ? idx.posts : [];
  idx.posts.unshift({
    title: topic.title,
    date: dateLabel,
    author: AUTHOR,
    url
  });
  // keep last 60 entries
  idx.posts = idx.posts.slice(0, 60);
  fs.writeFileSync(indexPath, JSON.stringify(idx, null, 2));

  // Advance state
  state.lastPostedDate = now.ymd;
  state.nextTopicIndex = (state.nextTopicIndex + 1) % TOPICS.length;
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

  console.log('Wrote post:', outPath);
}

main();
