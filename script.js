/* ─────────────────────────────────────────
   Content OS — Pipeline Simulation
   Data flows: Researcher → Strategist → Scriptwriter → Designer → Analyst
   ───────────────────────────────────────── */

/* ── TOPIC POOL ── */

const TOPICS = [
  'AI automation tools',
  'How I replaced my team with Claude',
  'Building an agency with AI',
  'Cold email with AI agents',
  'My AI content system walkthrough',
  '5 tools that run my business',
  'Getting clients with automation',
  'AI workflow for $10k months',
  'n8n for beginners',
  'The agency model nobody talks about',
];

let topicIndex = 0;
function nextTopic() {
  const t = TOPICS[topicIndex % TOPICS.length];
  topicIndex++;
  return t;
}

/* ── PIPELINE STATE ──
   Each queue holds topic strings that are ready for the next stage.
   Agents pick from the queue when they finish their current task.
*/
const pipeline = {
  toStrategist:  [],   // topics flagged by Researcher
  toScriptwriter: [],  // topics scheduled by Strategist
  toDesigner:    [],   // scripts ready for visual brief
  toAnalyst:     [],   // published pieces to track
};

/* ── AGENT STATE ── */

const AGENTS = {
  researcher: {
    el: null,
    progress: 78,
    currentTopic: TOPICS[0],
    phase: 'scanning',   // scanning | flagging
    outputTs: Date.now() - 2 * 60 * 1000,
    tickMs: 2200,
    inc: [4, 9],
  },
  strategist: {
    el: null,
    progress: 45,
    currentTopic: null,
    phase: 'idle',
    outputTs: Date.now() - 5 * 60 * 1000,
    tickMs: 3100,
    inc: [3, 7],
  },
  scriptwriter: {
    el: null,
    progress: 91,
    currentTopic: null,
    phase: 'idle',
    outputTs: Date.now() - 20 * 1000,
    tickMs: 2600,
    inc: [4, 8],
  },
  designer: {
    el: null,
    progress: 23,
    currentTopic: null,
    phase: 'idle',
    outputTs: Date.now() - 8 * 60 * 1000,
    tickMs: 4200,
    inc: [3, 6],
  },
  analyst: {
    el: null,
    progress: 61,
    currentTopic: null,
    phase: 'tracking',
    outputTs: Date.now() - 3 * 60 * 1000,
    tickMs: 3400,
    inc: [3, 7],
  },
};

/* ── UTILITIES ── */

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function fmt(n) { return n < 10 ? '0' + n : String(n); }
function nowStamp() {
  const d = new Date();
  return fmt(d.getHours()) + ':' + fmt(d.getMinutes()) + ':' + fmt(d.getSeconds());
}
function relTime(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 15)  return 'just now';
  if (s < 60)  return s + 's ago';
  const m = Math.floor(s / 60);
  if (m === 1) return '1 min ago';
  if (m < 60)  return m + ' min ago';
  return Math.floor(m / 60) + 'h ago';
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

/* ── DOM HELPERS ── */

function setField(card, field, val) {
  const el = card.querySelector(`[data-field="${field}"]`);
  if (el) el.textContent = val;
}

function setBar(card, pct) {
  const fill = card.querySelector('[data-field="bar"]');
  const pctEl = card.querySelector('[data-field="pct"]');
  if (fill)  fill.style.width = Math.round(pct) + '%';
  if (pctEl) pctEl.textContent = Math.round(pct) + '%';
}

function flashComplete(card, cb) {
  const fill = card.querySelector('[data-field="bar"]');
  if (fill) fill.classList.add('complete');
  setTimeout(() => {
    if (fill) fill.classList.remove('complete');
    cb();
  }, 380);
}

/* ── ACTIVITY FEED ── */

let feedLog = [];

const SEED_FEED = [
  { agent: 'Trend Researcher',    text: "Flagged: 'AI automation tools' — score 9.4" },
  { agent: 'Content Strategist',  text: "Scheduled 'AI automation tools' — Reel, Week 3" },
  { agent: 'Scriptwriter',        text: "Script #08 complete — 'AI automation tools'" },
  { agent: 'Visual Designer',     text: "Brief #11 exported — 'AI automation tools'" },
];

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

function pushFeed(agent, text) {
  feedLog.unshift({ ts: nowStamp(), agent, text });
  if (feedLog.length > 5) feedLog = feedLog.slice(0, 5);
  renderFeed();
}

function seedFeed() {
  const now = Date.now();
  feedLog = SEED_FEED.map((e, i) => ({
    ...e,
    ts: (() => {
      const d = new Date(now - (SEED_FEED.length - i) * 90000);
      return fmt(d.getHours()) + ':' + fmt(d.getMinutes()) + ':' + fmt(d.getSeconds());
    })(),
  }));
  renderFeed();
}

/* ── PIPELINE AGENT LOGIC ── */

/* RESEARCHER — scans platforms, flags topics into pipeline.toStrategist */
function tickResearcher() {
  const a = AGENTS.researcher;
  const card = a.el;

  const inc = rand(a.inc[0], a.inc[1]) + Math.random();
  a.progress = Math.min(a.progress + inc, 100);
  setBar(card, a.progress);

  const platforms = ['YouTube', 'Reddit', 'X', 'TikTok', 'Google Trends'];
  const platform = platforms[rand(0, platforms.length - 1)];
  setField(card, 'task', 'Scanning ' + platform + ' for signals');

  if (a.progress >= 100) {
    flashComplete(card, () => {
      const topic = nextTopic();
      a.currentTopic = topic;
      a.progress = rand(8, 20);
      a.outputTs = Date.now();

      const score = (8 + Math.random() * 1.8).toFixed(1);
      setField(card, 'output', `Flagged: '${truncate(topic, 28)}' — score ${score}`);
      setField(card, 'time', 'just now');
      setField(card, 'task', `Verifying signal: '${truncate(topic, 22)}'`);

      pipeline.toStrategist.push(topic);
      pushFeed('Trend Researcher', `Flagged: '${topic}' — score ${score}`);

      // nudge strategist to pick it up
      if (AGENTS.strategist.phase === 'idle') startStrategist();
    });
  }

  setTimeout(tickResearcher, a.tickMs + rand(-300, 500));
}

/* STRATEGIST — picks flagged topics, schedules them, passes to Scriptwriter */
function startStrategist() {
  const a = AGENTS.strategist;
  if (pipeline.toStrategist.length === 0) return;
  const topic = pipeline.toStrategist.shift();
  a.currentTopic = topic;
  a.phase = 'scheduling';
  a.progress = rand(5, 15);

  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const formats = ['Reel', 'Carousel', 'Single', 'Reel'];
  const week = weeks[rand(0, 3)];
  const format = formats[rand(0, 3)];

  setField(a.el, 'task', `Scheduling '${truncate(topic, 22)}'`);
}

function tickStrategist() {
  const a = AGENTS.strategist;
  const card = a.el;

  if (a.phase === 'idle') {
    if (pipeline.toStrategist.length > 0) {
      startStrategist();
    } else {
      setField(card, 'task', 'Monitoring incoming topic queue');
      setBar(card, a.progress);
    }
    setTimeout(tickStrategist, a.tickMs);
    return;
  }

  const inc = rand(a.inc[0], a.inc[1]) + Math.random();
  a.progress = Math.min(a.progress + inc, 100);
  setBar(card, a.progress);

  if (a.progress >= 100) {
    flashComplete(card, () => {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const formats = ['Reel', 'Carousel', 'Reel', 'Single'];
      const week = weeks[rand(0, 3)];
      const format = formats[rand(0, 3)];
      const slotNum = rand(8, 22);

      a.outputTs = Date.now();
      setField(card, 'output', `Slot ${slotNum} → '${truncate(a.currentTopic, 20)}' (${format})`);
      setField(card, 'time', 'just now');
      setField(card, 'task', 'Monitoring incoming topic queue');

      pipeline.toScriptwriter.push({ topic: a.currentTopic, format, week });
      pushFeed('Content Strategist', `Slot ${slotNum} assigned: '${a.currentTopic}' — ${format}, ${week}`);

      a.phase = pipeline.toStrategist.length > 0 ? 'idle' : 'idle';
      a.progress = rand(5, 15);
      a.currentTopic = null;

      if (AGENTS.scriptwriter.phase === 'idle') startScriptwriter();
    });
  }

  setTimeout(tickStrategist, a.tickMs + rand(-300, 400));
}

/* SCRIPTWRITER — writes scripts for scheduled topics, passes to Designer */
let scriptCounter = 9;

function startScriptwriter() {
  const a = AGENTS.scriptwriter;
  if (pipeline.toScriptwriter.length === 0) return;
  const job = pipeline.toScriptwriter.shift();
  a.currentTopic = job.topic;
  a.phase = 'writing';
  a.progress = rand(5, 18);

  setField(a.el, 'task', `Writing script: '${truncate(job.topic, 20)}'`);
}

function tickScriptwriter() {
  const a = AGENTS.scriptwriter;
  const card = a.el;

  if (a.phase === 'idle') {
    if (pipeline.toScriptwriter.length > 0) {
      startScriptwriter();
    } else {
      setField(card, 'task', 'Waiting for calendar assignments');
    }
    setBar(card, a.progress);
    setTimeout(tickScriptwriter, a.tickMs);
    return;
  }

  const inc = rand(a.inc[0], a.inc[1]) + Math.random() * 2;
  a.progress = Math.min(a.progress + inc, 100);
  setBar(card, a.progress);

  if (a.progress >= 100) {
    flashComplete(card, () => {
      scriptCounter++;
      const score = (7.8 + Math.random() * 1.6).toFixed(1);

      a.outputTs = Date.now();
      setField(card, 'output', `Script #${String(scriptCounter).padStart(2,'0')} complete — score ${score}`);
      setField(card, 'time', 'just now');
      setField(card, 'task', 'Waiting for calendar assignments');

      pipeline.toDesigner.push({ topic: a.currentTopic, scriptNum: scriptCounter });
      pushFeed('Scriptwriter', `Script #${String(scriptCounter).padStart(2,'0')} complete: '${a.currentTopic}' — score ${score}`);

      a.phase = 'idle';
      a.progress = rand(5, 15);
      a.currentTopic = null;

      if (AGENTS.designer.phase === 'idle') startDesigner();
    });
  }

  setTimeout(tickScriptwriter, a.tickMs + rand(-200, 400));
}

/* DESIGNER — creates visual briefs for completed scripts */
let briefCounter = 12;

function startDesigner() {
  const a = AGENTS.designer;
  if (pipeline.toDesigner.length === 0) return;
  const job = pipeline.toDesigner.shift();
  a.currentTopic = job.topic;
  a.scriptNum = job.scriptNum;
  a.phase = 'designing';
  a.progress = rand(5, 15);

  setField(a.el, 'task', `Creating brief: '${truncate(job.topic, 20)}'`);
}

function tickDesigner() {
  const a = AGENTS.designer;
  const card = a.el;

  if (a.phase === 'idle') {
    if (pipeline.toDesigner.length > 0) {
      startDesigner();
    } else {
      setField(card, 'task', 'Waiting for approved scripts');
    }
    setBar(card, a.progress);
    setTimeout(tickDesigner, a.tickMs);
    return;
  }

  const inc = rand(a.inc[0], a.inc[1]);
  a.progress = Math.min(a.progress + inc, 100);
  setBar(card, a.progress);

  if (a.progress >= 100) {
    flashComplete(card, () => {
      briefCounter++;
      const ctrLift = rand(14, 31);

      a.outputTs = Date.now();
      setField(card, 'output', `Brief #${String(briefCounter).padStart(2,'0')} — '${truncate(a.currentTopic, 22)}'`);
      setField(card, 'time', 'just now');
      setField(card, 'task', 'Waiting for approved scripts');

      pipeline.toAnalyst.push({ topic: a.currentTopic, briefNum: briefCounter });
      pushFeed('Visual Designer', `Brief #${String(briefCounter).padStart(2,'0')} exported — '${a.currentTopic}'`);

      a.phase = 'idle';
      a.progress = rand(5, 15);
      a.currentTopic = null;

      if (AGENTS.analyst.phase !== 'tracking') startAnalyst();
    });
  }

  setTimeout(tickDesigner, a.tickMs + rand(-300, 500));
}

/* ANALYST — tracks published content performance */
let reelCounter = 42;

function startAnalyst() {
  const a = AGENTS.analyst;
  if (pipeline.toAnalyst.length === 0) return;
  const job = pipeline.toAnalyst.shift();
  a.currentTopic = job.topic;
  a.phase = 'tracking';
  reelCounter++;
  a.currentReel = reelCounter;
  a.progress = rand(10, 30);

  setField(a.el, 'task', `Tracking Reel #${String(a.currentReel).padStart(3,'0')} performance`);
}

function tickAnalyst() {
  const a = AGENTS.analyst;
  const card = a.el;

  if (a.phase !== 'tracking' || !a.currentTopic) {
    if (pipeline.toAnalyst.length > 0) {
      startAnalyst();
    } else {
      setField(card, 'task', 'Monitoring live post performance');
    }
    setBar(card, a.progress);
    setTimeout(tickAnalyst, a.tickMs);
    return;
  }

  const inc = rand(a.inc[0], a.inc[1]) + Math.random();
  a.progress = Math.min(a.progress + inc, 100);
  setBar(card, a.progress);

  if (a.progress >= 100) {
    flashComplete(card, () => {
      const views = rand(8, 62);
      const hours = rand(2, 6);
      const label = views >= 50 ? '🔥 ' : '';

      a.outputTs = Date.now();
      setField(card, 'output', `Reel #${String(a.currentReel).padStart(3,'0')} — ${views}K views in ${hours}h`);
      setField(card, 'time', 'just now');

      pushFeed('Performance Analyst', `Reel #${String(a.currentReel).padStart(3,'0')} — ${views}K views in ${hours}h — '${truncate(a.currentTopic, 20)}'`);

      a.phase = 'idle';
      a.progress = rand(10, 25);
      a.currentTopic = null;

      setField(card, 'task', 'Monitoring live post performance');
      if (pipeline.toAnalyst.length > 0) startAnalyst();
    });
  }

  setTimeout(tickAnalyst, a.tickMs + rand(-400, 600));
}

/* ── CLOCK ── */

function startClock() {
  const el = document.getElementById('clock');
  function tick() {
    const d = new Date();
    el.textContent = fmt(d.getHours()) + ':' + fmt(d.getMinutes()) + ':' + fmt(d.getSeconds());
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
      el.textContent = Math.round(e * parseInt(el.dataset.target, 10));
    });
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── RELATIVE TIMESTAMPS ── */

function refreshTimes() {
  Object.values(AGENTS).forEach(a => {
    if (!a.el) return;
    const el = a.el.querySelector('[data-field="time"]');
    if (el) el.textContent = relTime(a.outputTs);
  });
}

/* ── BOOT ── */

document.addEventListener('DOMContentLoaded', () => {
  // bind DOM refs
  Object.keys(AGENTS).forEach(id => {
    AGENTS[id].el = document.querySelector(`[data-agent="${id}"]`);
  });

  startClock();
  animateCounters();
  seedFeed();

  // pre-populate pipeline so agents have work immediately
  TOPICS.slice(1, 4).forEach(t => pipeline.toStrategist.push(t));
  pipeline.toScriptwriter.push({ topic: TOPICS[1], format: 'Reel', week: 'Week 2' });
  pipeline.toDesigner.push({ topic: TOPICS[2], scriptNum: 8 });

  // start all ticks with slight stagger
  setTimeout(tickResearcher,   800);
  setTimeout(tickStrategist,  1200);
  setTimeout(tickScriptwriter, 1600);
  setTimeout(tickDesigner,    2000);
  setTimeout(tickAnalyst,     2400);

  // refresh relative timestamps every 30s
  setInterval(refreshTimes, 30000);
});
