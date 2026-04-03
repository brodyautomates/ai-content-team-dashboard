/* ─────────────────────────────────────────
   Content OS — Dashboard Runtime
   ───────────────────────────────────────── */

const AGENTS = [
  {
    id: 'researcher',
    name: 'Trend Researcher',
    progress: 78,
    taskIdx: 0,
    outputIdx: 0,
    outputTs: Date.now() - 2 * 60 * 1000,
    tickMs: 2300,
    inc: [3, 8],
    tasks: [
      'Scanning YouTube trending data',
      'Analyzing Reddit signal threads',
      'Monitoring X topic velocity',
      'Cross-referencing keyword spikes',
      'Compiling trend velocity report',
    ],
    outputs: [
      '3 viral signals flagged',
      '"AI agents" trending +340%',
      '7 keyword opportunities found',
      'Signal cluster identified',
      'Trend report queued for strategist',
    ],
  },
  {
    id: 'strategist',
    name: 'Content Strategist',
    progress: 45,
    taskIdx: 0,
    outputIdx: 0,
    outputTs: Date.now() - 5 * 60 * 1000,
    tickMs: 3400,
    inc: [2, 6],
    tasks: [
      'Building May content calendar',
      'Mapping topics to content formats',
      'Assigning posting schedule',
      'Aligning with trend signals',
      'Exporting calendar to queue',
    ],
    outputs: [
      'Week 3 slots filled — 6 posts queued',
      'May calendar: 18/30 slots assigned',
      'Slot 14 assigned: educational carousel',
      'Format mix updated: 60% Reels, 40% carousel',
      'Calendar exported to production queue',
    ],
  },
  {
    id: 'scriptwriter',
    name: 'Scriptwriter',
    progress: 91,
    taskIdx: 0,
    outputIdx: 0,
    outputTs: Date.now() - 20 * 1000,
    tickMs: 1800,
    inc: [4, 9],
    tasks: [
      'Writing hook variants (×4)',
      'Drafting body script — Reel #10',
      'Generating CTA options',
      'Scoring hook performance likelihood',
      'Queuing scripts for review',
    ],
    outputs: [
      'Script #09 ready for review',
      'Hook v3 approved — Score 9.1',
      'CTA variant B outperforming A by 18%',
      'Script #10 draft complete',
      '4 hooks scored: avg 8.6',
    ],
  },
  {
    id: 'designer',
    name: 'Visual Designer',
    progress: 23,
    taskIdx: 0,
    outputIdx: 0,
    outputTs: Date.now() - 8 * 60 * 1000,
    tickMs: 4100,
    inc: [3, 7],
    tasks: [
      'Generating thumbnail brief',
      'Selecting visual style direction',
      'Writing color palette spec',
      'Exporting layout guidelines',
      'Sending brief to review queue',
    ],
    outputs: [
      'Brief #12 exported to queue',
      'Style guide updated: 3 new templates',
      'Thumbnail brief sent — Reel #09',
      'Color palette finalized: high contrast',
      'Brief #13 drafted',
    ],
  },
  {
    id: 'analyst',
    name: 'Performance Analyst',
    progress: 61,
    taskIdx: 0,
    outputIdx: 0,
    outputTs: Date.now() - 3 * 60 * 1000,
    tickMs: 2800,
    inc: [3, 7],
    tasks: [
      'Analyzing last 30 reels',
      'Calculating hook retention rates',
      'Benchmarking against 30-day baseline',
      'Flagging top performers',
      'Compiling weekly insights report',
    ],
    outputs: [
      'Reel #042 — 42K views in 4h',
      'Weekly report compiled — 94% accuracy',
      'Reel #039 hit 10K — boosting signal',
      'Hook drop-off at 4s: flagged for revision',
      '31 insights queued for strategist',
    ],
  },
];

const FEED_POOL = [
  { agent: 'Trend Researcher',    text: "Flagged: 'AI agents' trending +340%" },
  { agent: 'Scriptwriter',        text: 'Hook v3 approved — Score 9.1' },
  { agent: 'Content Strategist',  text: 'Slot 14 assigned: educational carousel' },
  { agent: 'Visual Designer',     text: 'Thumbnail brief sent to queue' },
  { agent: 'Performance Analyst', text: 'Reel #039 hit 10K — boosting signal' },
  { agent: 'Trend Researcher',    text: 'Reddit thread detected: 4.2K upvotes' },
  { agent: 'Scriptwriter',        text: 'CTA variant B outperforming A by 18%' },
  { agent: 'Performance Analyst', text: 'Weekly report compiled — 94% accuracy' },
  { agent: 'Content Strategist',  text: 'May calendar: 18/30 slots filled' },
  { agent: 'Visual Designer',     text: 'Style guide updated: 3 new templates' },
  { agent: 'Scriptwriter',        text: 'Script #11 queued for visual brief' },
  { agent: 'Trend Researcher',    text: 'Long-form signal: 8 min avg watch time' },
  { agent: 'Performance Analyst', text: 'Hook drop-off at 4s — flagged for revision' },
  { agent: 'Content Strategist',  text: 'Format split updated: 60% Reels' },
  { agent: 'Visual Designer',     text: 'High-contrast palette locked for week 3' },
];

/* ── UTILITIES ── */

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function fmt(n) {
  return n < 10 ? '0' + n : String(n);
}

function relTime(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 10)  return 'just now';
  if (diff < 60)  return diff + 's ago';
  const m = Math.floor(diff / 60);
  if (m === 1)    return '1 min ago';
  if (m < 60)     return m + ' min ago';
  return Math.floor(m / 60) + 'h ago';
}

/* ── CLOCK ── */

function startClock() {
  const el = document.getElementById('clock');
  function tick() {
    const now = new Date();
    el.textContent = fmt(now.getHours()) + ':' + fmt(now.getMinutes()) + ':' + fmt(now.getSeconds());
  }
  tick();
  setInterval(tick, 1000);
}

/* ── STAT COUNTERS ── */

function animateCounters() {
  const els = document.querySelectorAll('.metric-val[data-target]');
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const e = easeOutExpo(t);
    els.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      el.textContent = Math.round(e * target);
    });
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── RELATIVE TIMESTAMPS ── */

function refreshOutputTimes() {
  AGENTS.forEach(agent => {
    const card = document.querySelector(`[data-agent="${agent.id}"]`);
    if (!card) return;
    const el = card.querySelector('[data-field="time"]');
    if (el) el.textContent = relTime(agent.outputTs);
  });
}

/* ── PROGRESS SIMULATION ── */

function updateCard(card, agent) {
  const barEl  = card.querySelector('[data-field="bar"]');
  const pctEl  = card.querySelector('[data-field="pct"]');
  const taskEl = card.querySelector('[data-field="task"]');
  const outEl  = card.querySelector('[data-field="output"]');
  const timeEl = card.querySelector('[data-field="time"]');

  const pct = Math.round(agent.progress);
  if (barEl) barEl.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
  if (taskEl) taskEl.textContent = agent.tasks[agent.taskIdx];
  if (outEl)  outEl.textContent  = agent.outputs[agent.outputIdx];
  if (timeEl) timeEl.textContent = relTime(agent.outputTs);
}

function tickAgent(agent) {
  const card = document.querySelector(`[data-agent="${agent.id}"]`);
  if (!card) return;

  const increment = rand(agent.inc[0], agent.inc[1]) + Math.random() * 2;
  agent.progress = Math.min(agent.progress + increment, 100);

  updateCard(card, agent);

  if (agent.progress >= 100) {
    const fill = card.querySelector('[data-field="bar"]');
    if (fill) {
      fill.classList.add('complete');
      setTimeout(() => {
        fill.classList.remove('complete');
        agent.progress   = rand(12, 30);
        agent.taskIdx    = (agent.taskIdx + 1)   % agent.tasks.length;
        agent.outputIdx  = (agent.outputIdx + 1) % agent.outputs.length;
        agent.outputTs   = Date.now();
        updateCard(card, agent);
      }, 350);
    }
  }

  const jitter = rand(-400, 400);
  setTimeout(() => tickAgent(agent), agent.tickMs + jitter);
}

/* ── ACTIVITY FEED ── */

let feedLog = [];
let feedPool = [...FEED_POOL];
let feedPoolIdx = 0;

function nowStamp() {
  const now = new Date();
  return fmt(now.getHours()) + ':' + fmt(now.getMinutes()) + ':' + fmt(now.getSeconds());
}

function renderFeed() {
  const container = document.getElementById('feed');
  if (!container) return;

  container.innerHTML = '';
  feedLog.forEach((entry, i) => {
    const div = document.createElement('div');
    div.className = 'feed-entry' + (i === 0 ? ' feed-new' : '');
    div.innerHTML =
      `<span class="feed-ts">${entry.ts}</span>` +
      `<span class="feed-agent">${entry.agent}</span>` +
      `<span class="feed-arrow">→</span>` +
      `<span class="feed-text">${entry.text}</span>`;
    container.appendChild(div);
  });
}

function seedFeed() {
  // pre-seed with 4 entries at staggered past times
  const seeds = [
    { ...FEED_POOL[4], ts: (() => { const d = new Date(Date.now() - 240000); return fmt(d.getHours())+':'+fmt(d.getMinutes())+':'+fmt(d.getSeconds()); })() },
    { ...FEED_POOL[3], ts: (() => { const d = new Date(Date.now() - 180000); return fmt(d.getHours())+':'+fmt(d.getMinutes())+':'+fmt(d.getSeconds()); })() },
    { ...FEED_POOL[2], ts: (() => { const d = new Date(Date.now() - 120000); return fmt(d.getHours())+':'+fmt(d.getMinutes())+':'+fmt(d.getSeconds()); })() },
    { ...FEED_POOL[1], ts: (() => { const d = new Date(Date.now() -  60000); return fmt(d.getHours())+':'+fmt(d.getMinutes())+':'+fmt(d.getSeconds()); })() },
  ];
  feedLog = seeds;
  renderFeed();
}

function pushFeedEntry() {
  const item = FEED_POOL[feedPoolIdx % FEED_POOL.length];
  feedPoolIdx = (feedPoolIdx + 1) % FEED_POOL.length;

  feedLog.unshift({ ...item, ts: nowStamp() });
  if (feedLog.length > 5) feedLog = feedLog.slice(0, 5);
  renderFeed();
}

/* ── INIT ── */

document.addEventListener('DOMContentLoaded', () => {
  startClock();
  animateCounters();
  seedFeed();

  // stagger agent tick starts
  AGENTS.forEach((agent, i) => {
    setTimeout(() => tickAgent(agent), 1500 + i * 400 + rand(0, 300));
  });

  // activity feed: new entry every 6s
  setTimeout(() => {
    pushFeedEntry();
    setInterval(pushFeedEntry, 6000);
  }, 3000);

  // relative timestamps refresh every 30s
  setInterval(refreshOutputTimes, 30000);
});
