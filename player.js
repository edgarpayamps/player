/* Alchemy Player — group training prototype.
   Hash routes: #home, #sessions, #select-activities, #add-employees, #preview, #training, #results.
   Entry points for the Figma start-page states: #home-ready, #home-paused, #home-offline.
   All state lives in memory; reloading the page starts a fresh session. */
(function () {
  'use strict';

  // ---------- Data ----------
  // dl = percent of the activity's files already on this Player (Preview blocks training until all are 100).
  const ACTIVITIES = [
    { id: 'fac', title: 'Introduction to Facility Safety', desc: 'Learn essential facility rules and safe work practices.', cat: 'Workplace Safety', dur: 10, questions: 5, dl: 100,
      long: 'Get to know the facility rules that keep everyone safe, from entering production areas to reporting hazards.',
      comp: ['Follow facility entry and sign-in rules.', 'Identify restricted and hazardous areas.', 'Report unsafe conditions to a supervisor.'] },
    { id: 'ppe', title: 'Personal Protective Equipment', desc: 'Choose and use protective equipment for your tasks.', cat: 'Workplace Safety', dur: 12, questions: 4, dl: 60,
      long: 'Learn how to select, wear, inspect, and store the protective equipment your tasks require.',
      comp: ['Match protective equipment to task hazards.', 'Put on and remove equipment correctly.', 'Inspect equipment for damage before use.'] },
    { id: 'loto', title: 'Lockout / Tagout Essentials', desc: 'Recognize hazardous energy and isolation procedures.', cat: 'Workplace Safety', dur: 10, questions: 4, dl: 0,
      long: 'Understand hazardous energy and the steps to isolate equipment before servicing or maintenance.',
      comp: ['Recognize sources of hazardous energy.', 'Describe the lockout / tagout sequence.', 'Verify isolation before starting work.'] },
    { id: 'food', title: 'Food Safety Basics', desc: 'Practice safe food handling and prevent contamination.', cat: 'Food Safety', dur: 15, questions: 6, dl: 100,
      long: 'Learn safe food handling practices to help prevent contamination. This activity introduces personal hygiene, cross-contamination prevention, and safe food storage practices.',
      comp: ['Identify common sources of food contamination.', 'Recognize proper personal hygiene practices.', 'Describe ways to prevent cross-contamination.', 'Identify safe food storage practices.'] },
  ];
  const SESSIONS = [
    { id: 'SES-1104-01', name: 'Morning Shift Safety', date: 'Nov 4, 2026, 9:00 AM', fac: 'Edgar Payamps', emps: 7, acts: '3', dur: '36 min', status: 'Completed', upload: 'Pending upload' },
    { id: 'SES-1103-02', name: 'New Hire Orientation', date: 'Nov 3, 2026, 1:30 PM', fac: 'Alex Morgan', emps: 12, acts: '4', dur: '51 min', status: 'Completed', upload: 'Uploaded' },
    { id: 'SES-1103-01', name: 'Packaging Safety', date: 'Nov 3, 2026, 8:00 AM', fac: 'Jordan Lee', emps: 9, acts: '2', dur: '24 min', status: 'Completed', upload: 'Upload failed' },
    { id: 'SES-1102-01', name: 'Food Safety Refresher', date: 'Nov 2, 2026, 10:00 AM', fac: 'Edgar Payamps', emps: 15, acts: '3', dur: '38 min', status: 'Completed', upload: 'Uploaded' },
    { id: 'SES-1102-02', name: 'Evening Shift Safety', date: 'Nov 2, 2026, 4:00 PM', fac: 'Jordan Lee', emps: 8, acts: '1 of 3', dur: '14 min', status: 'Ended early', upload: 'Uploaded' },
    { id: 'SES-1030-01', name: 'Lockout / Tagout Review', date: 'Oct 30, 2026, 9:00 AM', fac: 'Alex Morgan', emps: 10, acts: '1', dur: '13 min', status: 'Completed', upload: 'Uploaded' },
  ];
  // Course catalogue for the Download courses dialog. st: ready | update | downloading | done | failed
  const COURSES = [
    { id: 'c1', t: 'Food Safety Basics', video: false, lang: 'English (US)', cat: 'Food safety', up: 'Oct 30, 2026', mb: 28.5, st: 'ready' },
    { id: 'c2', t: 'Personal Protective Equipment', video: true, lang: 'English (US)', cat: 'Workplace safety', up: 'Oct 28, 2026', mb: 42.1, st: 'update' },
    { id: 'c3', t: 'Lockout / Tagout Essentials', video: false, lang: 'Spanish (US)', cat: 'Workplace safety', up: 'Oct 27, 2026', mb: 56.8, st: 'downloading', p: 45 },
    { id: 'c4', t: 'Allergen Awareness', video: true, lang: 'English (US)', cat: 'Food safety', up: 'Oct 25, 2026', mb: 31.2, st: 'done' },
    { id: 'c5', t: 'Emergency Procedures', video: false, lang: 'French (Canada)', cat: 'Health and safety', up: 'Oct 24, 2026', mb: 38.6, st: 'failed' },
    { id: 'c6', t: 'Workplace Hygiene', video: true, lang: 'Spanish (US)', cat: 'Food safety', up: 'Oct 22, 2026', mb: 24.0, st: 'ready' },
    { id: 'c7', t: 'Machine Guarding', video: false, lang: 'English (US)', cat: 'Workplace safety', up: 'Oct 20, 2026', mb: 47.3, st: 'update' },
    { id: 'c8', t: 'Chemical Safety', video: true, lang: 'English (US)', cat: 'Health and safety', up: 'Oct 18, 2026', mb: 35.4, st: 'ready' },
  ];
  const FILTERS = {
    site: { title: 'Worksites', ph: 'Search worksites', all: 'All worksites', opts: ['Plant 01', 'Plant 02', 'Distribution Center'] },
    group: { title: 'Groups', ph: 'Search groups', all: 'All groups', opts: ['Morning Shift', 'Evening Shift', 'Production', 'Packaging', 'Maintenance'] },
    dyn: { title: 'Dynamic Groups', ph: 'Search dynamic groups', all: 'All dynamic groups', opts: ['New Hires', 'Training Due This Month', 'Expiring Qualifications', 'Overdue Training'] },
  };
  const ADMIN = [
    ['Records and Media Management', [['cloud_download', 'Download', 'admin-download'], ['cloud_upload', 'Upload Records', 'open-upload'], ['perm_media', 'Client Media', 'open-courses'], ['bar_chart', 'Roster'], ['cloud_sync', 'Alchemy Manager Settings']]],
    ['Presentation Settings', [['co_present', 'Presentation Options'], ['groups', 'Audience Responses'], ['display_settings', 'Display Settings'], ['podium', 'Facilitator Settings'], ['tv_signin', 'Kiosk Settings']]],
    ['Hardware Devices', [['settings_remote', 'Input Devices'], ['badge', 'Badge Registration', 'open-register'], ['settings', 'Alchemy Settings']]],
    ['General Settings', [['person_add', 'Add User'], ['group', 'Manage Groups'], ['shield', 'Password Security']]],
  ];
  const EMPLOYEES = [
    { id: 'e1', name: 'Maria Garcia', dept: 'Production', eid: '1042', site: 'Plant 01', shift: 'Morning Shift', dyn: 'New Hires' },
    { id: 'e2', name: 'James Wilson', dept: 'Packaging', eid: '1087', site: 'Plant 01', shift: 'Morning Shift', dyn: '' },
    { id: 'e3', name: 'Aisha Patel', dept: 'Production', eid: '1123', site: 'Plant 01', shift: 'Morning Shift', dyn: 'Training Due This Month' },
    { id: 'e4', name: 'Carlos Rivera', dept: 'Packaging', eid: '1156', site: 'Plant 01', shift: 'Morning Shift', dyn: '' },
    { id: 'e5', name: 'Emily Chen', dept: 'Production', eid: '1194', site: 'Plant 01', shift: 'Morning Shift', dyn: 'New Hires' },
    { id: 'e6', name: 'David Thompson', dept: 'Packaging', eid: '1218', site: 'Plant 01', shift: 'Morning Shift', dyn: 'Overdue Training' },
    { id: 'e7', name: 'Sofia Martinez', dept: 'Production', eid: '1240', site: 'Plant 01', shift: 'Morning Shift', dyn: '' },
    { id: 'e8', name: 'Michael Brown', dept: 'Packaging', eid: '1265', site: 'Plant 01', shift: 'Evening Shift', dyn: 'Expiring Qualifications' },
    { id: 'e9', name: 'Priya Nair', dept: 'Maintenance', eid: '1302', site: 'Plant 02', shift: 'Evening Shift', dyn: '' },
    { id: 'e10', name: 'Tom Okafor', dept: 'Production', eid: '1317', site: 'Distribution Center', shift: 'Morning Shift', dyn: 'New Hires' },
  ];
  const LANGS = ['English (US)', 'Spanish (MX)', 'French (CA)'];
  const SUBS = ['None', 'English (US)', 'Spanish (MX)'];
  const REMS = ['None', '1', '2', '3'];
  const GAMES = ['None', 'Quiz Show', 'Team Battle'];
  const RESPONSE_LOG = [
    ['1', '09:04:02', 'Maria Garcia', 'Initial', 'B', false, 'B'],
    ['2', '09:04:03', 'James Wilson', 'Initial', 'A', true, 'A'],
    ['3', '09:04:04', 'Aisha Patel', 'Initial', 'A', true, 'A'],
    ['4', '09:04:05', 'Carlos Rivera', 'Initial', 'B', false, 'B'],
    ['5', '09:04:06', 'Emily Chen', 'Initial', 'A', true, 'A'],
    ['6', '09:04:07', 'David Thompson', 'Initial', 'A', true, 'A'],
    ['7', '09:04:08', 'Sofia Martinez', 'Initial', 'A', true, 'A'],
    ['1', '09:04:10', 'Maria Garcia', 'Initial', 'A', true, 'A'],
    ['1', '09:04:12', 'Maria Garcia', 'Initial', 'D', false, 'A', true],
    ['4', '09:04:40', 'Carlos Rivera', 'Remediation 1', 'A', true, 'A'],
  ];
  const FULL_HISTORY = [
    ['09:02:05', 'Facility Safety · Q1', '2', 'James Wilson', 'Initial', '1', true, '1'],
    ['09:04:02', 'Facility Safety · Q2', '1', 'Maria Garcia', 'Initial', '2', false, '2'],
    ['09:04:03', 'Facility Safety · Q2', '2', 'James Wilson', 'Initial', '1', true, '1'],
    ['09:04:05', 'Facility Safety · Q2', '4', 'Carlos Rivera', 'Initial', '2', false, '2'],
    ['09:04:10', 'Facility Safety · Q2', '1', 'Maria Garcia', 'Initial', '1', true, '1'],
    ['09:04:12', 'Facility Safety · Q2', '1', 'Maria Garcia', 'Initial', '4', false, '1', true],
    ['09:04:40', 'Facility Safety · Q2', '4', 'Carlos Rivera', 'Remediation 1', '1', true, '1'],
    ['09:06:03', 'Facility Safety · Q3', '3', 'Aisha Patel', 'Initial', '3', true, '3'],
  ];

  // ---------- State ----------
  const state = {
    tab: 'activities',
    actSearch: '', actCat: 'all', actLang: 'all',
    selActs: ['fac', 'ppe', 'loto'],
    lastSel: null, // selection to bring back with "Restore selection"
    rosterTab: 'employees', empSearch: '', site: [], group: [], dyn: [],
    selEmps: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7'],
    remotes: {}, // employee id → remote number; filled in by Register employee, never pre-assigned
    settings: {}, // per activity id: { lang, sub, rem, games, resp }
    global: { lang: 'English (US)', sub: 'None', rem: '2', games: 'None', resp: true },
    playlistName: '',
    room: 'Room 57',
    customize: false, // Preview: show per-activity setting controls
    tr: null, // training run state
    home: 'ready', // start page: 'ready' or 'paused' (a session was left mid-way)
    online: true,
    sync: { dl: 23, ul: 57, lastDl: 'Today, 8:15 AM', lastUl: '', auto: { user: true, course: true, media: true } },
    resSes: 'SES-1104-01', // session shown on Session results
    sesSearch: '', sesRange: 'Last 30 days', sesStatus: 'all', sesUpload: 'all',
    courses: COURSES.map(c => ({ ...c })),
    modal: null,
  };
  ACTIVITIES.forEach(a => { state.settings[a.id] = { lang: 'English (US)', sub: 'None', rem: '2', games: 'None', resp: true }; });

  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (name, cls = '') => `<span class="ms ${cls}" aria-hidden="true">${name}</span>`;
  const act = id => ACTIVITIES.find(a => a.id === id);
  const emp = id => EMPLOYEES.find(e => e.id === id);
  const selActs = () => state.selActs.map(act);
  const totalMin = () => selActs().reduce((t, a) => t + a.dur, 0);
  const plural = (n, w) => w === 'activity' ? `${n} ${n === 1 ? 'activity' : 'activities'}` : `${n} ${w}${n === 1 ? '' : 's'}`;
  const curSes = () => SESSIONS.find(s => s.id === state.resSes) || SESSIONS[0];
  const nowTime = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const missingActs = () => selActs().filter(a => a.dl < 100);
  // "Restore selection" brings back the list as it was before the run of removals that emptied it.
  let snap = null;
  function setActs(arr) {
    if (arr.length < state.selActs.length) { if (!snap) snap = [...state.selActs]; } else snap = null;
    if (!arr.length && snap) { state.lastSel = snap; snap = null; }
    state.selActs = arr;
  }
  const opts = (list, v) => list.map(o => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('');
  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const every = (fn, ms) => { const t = setInterval(fn, ms); timers.push(t); return t; };
  const clearTimers = () => { timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = []; };

  // ---------- In-app notifications (bell flyout) ----------
  // From the "In-App Notifications" Figma file: flyout with All / Unread tabs, priority bar + icon on unread rows,
  // Player-only content: uploads/downloads, input devices, Client Media and Player updates (no Manager admin items).
  // envelope = mark as read, read rows show Dismiss on hover. Order: newest day first, then High → Low, then newest time.
  const PRI = { high: 0, medium: 1, low: 2 };
  const NOTIFS = [
    { id: 'n1', pri: 'high', icon: 'warning', title: 'Results failed to upload', body: 'Forklift Safety Refresher (Nov 4) couldn’t upload. Results for 9 employees are saved on this computer.', day: 0, at: 520, time: 'Today, 8:40 AM', act: 'Retry upload', run: 'open-upload', unread: true },
    { id: 'n2', pri: 'medium', icon: 'battery_alert', title: 'Remote batteries low', body: 'Remotes 3, 5 and 11 are below 15%. Replace the batteries before your next session.', day: 0, at: 480, time: 'Today, 8:00 AM', act: 'View input devices', run: 'toast:7 remotes and 1 base station connected. Remotes 3, 5 and 11 have low batteries.', unread: true },
    { id: 'n3', pri: 'medium', icon: 'cloud_download', title: 'Content updates available', body: '2 activities in your library were updated. Download them before your next session.', day: 0, at: 435, time: 'Today, 7:15 AM', act: 'Download updates', run: 'open-download', unread: true },
    { id: 'n4', pri: 'low', icon: 'cloud_upload', title: 'Results waiting to upload', body: 'Morning Shift Safety results upload automatically when Alchemy Manager is connected.', day: 0, at: 390, time: 'Today, 6:30 AM', act: 'View recent sessions', run: 'go:sessions', unread: true },
    { id: 'n5', pri: 'low', icon: 'task_alt', title: 'Results uploaded', body: 'Evening Shift Safety results for 12 employees uploaded to Alchemy Manager.', day: 1, at: 1068, time: 'Yesterday, 5:48 PM', act: 'View recent sessions', run: 'go:sessions', unread: false },
    { id: 'n7', pri: 'low', icon: 'system_update', title: 'Player update available', body: 'Alchemy Player 8.4.0 is ready. It installs the next time you close the Player.', day: 1, at: 1020, time: 'Yesterday, 5:00 PM', act: 'See what’s new', run: 'toast:Release notes open in the Help Center in the real Player.', unread: false },
    { id: 'n6', pri: 'low', icon: 'perm_media', title: 'New course in Client Media', body: 'Hazard Communication (GHS) is ready to download.', day: 1, at: 850, time: 'Yesterday, 2:10 PM', act: 'Open Client Media', run: 'open-courses', unread: false },
  ];
  const notif = { open: false, tab: 'all', list: NOTIFS.map(n => ({ ...n })) };
  const unreadCount = () => notif.list.filter(n => n.unread).length;
  function syncBell() {
    const n = unreadCount(), c = $('#bellCount'), b = $('#bellBtn');
    c.textContent = n; c.hidden = !n;
    b.setAttribute('aria-label', n ? `Notifications, ${n} unread` : 'Notifications');
    b.setAttribute('aria-expanded', String(notif.open));
  }
  function renderNotifs() {
    const p = $('#notifPanel'); syncBell();
    if (!notif.open) { p.hidden = true; p.innerHTML = ''; return; }
    const b = $('#bellBtn').getBoundingClientRect();
    const narrow = innerWidth < 600; // phone width: full-bleed with 16px gutters
    p.style.right = (narrow ? 16 : Math.max(16, innerWidth - b.right - 24)) + 'px'; p.style.left = narrow ? '16px' : ''; p.style.width = narrow ? 'auto' : '';
    const prevScroll = p.querySelector('.nlist') ? p.querySelector('.nlist').scrollTop : 0;
    const n = unreadCount(), all = notif.list.slice().sort((a, b) => a.day - b.day || PRI[a.pri] - PRI[b.pri] || b.at - a.at);
    const list = notif.tab === 'unread' ? all.filter(x => x.unread) : all;
    const head = `<div class="nh"><button type="button" class="nbtn light" data-action="n-close" aria-label="Close notifications">${icon('close')}</button><h2 id="nTitle">Notifications</h2></div>`;
    const foot = `<div class="nfoot"><button type="button" class="link" data-action="n-see-all">See all notifications →</button></div>`;
    const empty = (h, a, b2) => `<div class="nempty">${icon('notifications_paused')}<h3>${h}</h3><p>${a}</p><p class="s">${b2}</p></div>`;
    let body;
    if (!all.length) body = empty('No recent notifications', 'Older notifications may still be available on the Notifications page.', 'Notifications are displayed for 30 days.');
    else {
      const tabs = `<div class="ntabs" role="tablist">
        <button type="button" role="tab" class="t${notif.tab === 'all' ? ' on' : ''}" aria-selected="${notif.tab === 'all'}" data-action="n-tab" data-tab="all">All</button>
        <button type="button" role="tab" class="t${notif.tab === 'unread' ? ' on' : ''}" aria-selected="${notif.tab === 'unread'}" data-action="n-tab" data-tab="unread">Unread${n ? `<span class="nb">${n}</span>` : ''}</button>
        <button type="button" class="link mall" data-action="n-all-read"${n ? '' : ' disabled'}>${icon('mail')}Mark all as read</button></div>
        <div class="ninfo">Notifications are available for 30 days.</div>`;
      const rows = list.map(x => `<li class="nrow ${x.unread ? 'unread' : 'read'} p-${x.pri}">
        ${icon(x.icon, 'ic fill')}
        <div class="nc"><div class="ti">${esc(x.title)}</div><div class="bd">${esc(x.body)}</div><div class="tm">${x.time}</div>
          <button type="button" class="link nact" data-action="n-act" data-id="${x.id}">${esc(x.act)}</button></div>
        <div class="nside">${x.unread
          ? `<button type="button" class="nbtn" data-action="n-read" data-id="${x.id}" aria-label="Mark as read: ${esc(x.title)}" title="Mark as read">${icon('mail')}</button>`
          : `<span class="opened" title="Read">${icon('drafts', 'fill')}</span><button type="button" class="nbtn dismiss" data-action="n-dismiss" data-id="${x.id}" aria-label="Dismiss: ${esc(x.title)}" title="Dismiss">${icon('cancel')}</button>`}</div>
      </li>`).join('');
      body = tabs + (list.length ? `<ul class="nlist">${rows}</ul>` : empty('All caught up!', 'You have no unread recent notifications.', 'Older notifications may still be available on the Notifications page.'));
    }
    p.innerHTML = head + body + foot; wrapLinks(p); p.hidden = false;
    const l = p.querySelector('.nlist'); if (l) l.scrollTop = prevScroll;
  }
  function setNotifs(open, focusBell) {
    notif.open = open; renderNotifs();
    if (open) $('#notifPanel [data-action="n-close"]').focus(); else if (focusBell) $('#bellBtn').focus();
  }

  function toast(msg) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  function stepper(n) {
    const steps = [['select-activities', 'Select activities'], ['add-employees', 'Add employees'], ['preview', 'Preview session']];
    return `<nav class="stepper" aria-label="Session setup progress">${steps.map(([route, label], i) => {
      const k = i + 1;
      const inner = k < n ? `${icon('check_circle')}<span>${label}</span>` : `<span class="num">${k}</span><span>${label}</span>`;
      const cls = k < n ? 'done' : k === n ? 'current' : '';
      const el = k < n ? `<button type="button" class="step ${cls}" data-go="${route}">${inner}</button>` : `<span class="step ${cls}"${k === n ? ' aria-current="step"' : ''}>${inner}</span>`;
      return (i ? '<span class="bar" aria-hidden="true"></span>' : '') + el;
    }).join('')}</nav>`;
  }

  // ---------- Screen: Start page (ready / paused session / offline) ----------
  const autoOn = () => Object.values(state.sync.auto).some(Boolean);
  const queuedUploads = () => SESSIONS.filter(s => s.upload !== 'Uploaded').length;
  function syncCard() {
    const s = state.sync;
    const row = (ic, title, status, sub, extra = '', end = '') => `<div class="srow">${icon(ic, 'fill ic')}<div><div class="t"><b>${title}</b><span class="bar" aria-hidden="true"></span><span>${status}</span>${extra}</div><small${/^Last /.test(sub) ? ' class="ts"' : ''}>${sub}</small></div>${end}</div>`;
    if (!state.online) {
      const q = queuedUploads();
      return `<div class="syncard" role="status">
        <div class="srow off">${icon('wifi_off', 'ic')}<span>No internet connection. You can train with downloaded activities.</span></div>
        ${row('cloud_download', 'Downloads', 'Unavailable offline', `Last downloaded: ${s.lastDl}`)}
        ${row('cloud_upload', 'Uploads', q ? `${plural(q, 'session')} queued` : 'Nothing to upload', q ? 'Uploads automatically when connection returns.' : 'All sessions are uploaded.')}</div>`;
    }
    const dlBusy = autoOn() && s.dl < 100;
    const dl = !autoOn()
      ? row('cloud_download', 'Downloads', 'Automatic download off', `Last downloaded: ${s.lastDl}`, '', `<button class="btn dark xs" type="button" data-action="download-now">Download now</button>`)
      : row('cloud_download', 'Downloads', dlBusy ? `In progress - ${s.dl}%` : 'Up to date', `Last downloaded: ${s.lastDl}`, dlBusy ? '<span class="spin sm" aria-hidden="true"></span>' : '',
        `<button class="iconbtn" type="button" aria-label="Download settings" data-action="open-download">${icon('chevron_right')}</button>`);
    const q = queuedUploads();
    const ulChev = `<button class="iconbtn" type="button" aria-label="View recent sessions and uploads" data-go="sessions">${icon('chevron_right')}</button>`;
    const ul = s.ul < 100 && q
      ? row('cloud_upload', 'Uploads', `In progress - ${s.ul}%`, `Uploading 1 of ${plural(q, 'session')}`, '<span class="spin sm" aria-hidden="true"></span>', ulChev)
      : row('cloud_upload', 'Uploads', 'All sessions uploaded', s.lastUl ? `Last uploaded: ${s.lastUl}` : 'Results are synced to Alchemy Manager.', '', ulChev);
    return `<div class="syncard">${dl}${ul}</div>`;
  }
  function viewHome() {
    const tr = state.tr;
    const paused = state.home === 'paused' && tr;
    let side;
    if (paused) {
      const sel = selActs(); const a = sel[tr.ai];
      side = `<h1 class="wb">Welcome back!</h1>
        <div class="pcard">
          <span class="ptag">${icon('pause_circle', 'fill')}Paused session</span>
          <h2>${esc(state.playlistName || 'Morning Shift Safety')}</h2>
          <div class="who">${plural(state.selEmps.length, 'employee')} · Facilitator: Edgar Payamps</div>
          <div class="pl">${icon('cast_for_education')}Activity ${tr.ai + 1} of ${sel.length} • ${esc(a.title)}</div>
          <div class="pl">${icon('help')}Question ${tr.q} of ${a.questions}</div>
          <button class="btn primary resume" type="button" data-action="resume">${icon('play_arrow', 'fill')}Resume session</button>
        </div>
        <div class="two"><button class="btn" type="button" data-go="select-activities">Create a training session</button><button class="btn" type="button" data-go="sessions">View recent sessions</button></div>`;
    } else {
      side = `<div class="eyebrow">Group-based training</div>
        <h1>Ready to train?</h1>
        <p class="lead">Choose activities, add employees, and review your session before you start.</p>
        <button class="btn primary cta" type="button" data-go="select-activities">Create a training session${icon('arrow_forward')}</button>
        <button class="btn cta2" type="button" data-go="sessions">View recent sessions</button>`;
    }
    return `<section class="home">
      <div class="photo"><img src="assets/start-training-photo.webp" alt="A facilitator leads a group training session for Fieldbridge Foods employees, who hold response remotes."></div>
      <div class="hside${paused ? ' paused' : ''}">${side}${syncCard()}</div>
    </section>`;
  }
  // Background sync runs on every screen. Only the start page re-renders; elsewhere the nav icons
  // and any open background-progress dialog update in place.
  const dlBusy = () => state.online && autoOn() && state.sync.dl < 100;
  const ulBusy = () => state.online && state.sync.ul < 100 && queuedUploads() > 0;
  function tickHome() {
    if (!state.online) return;
    const s = state.sync; let changed = false;
    if (autoOn() && s.dl < 100) { s.dl = Math.min(100, s.dl + 2); if (s.dl === 100) s.lastDl = `Today, ${nowTime()}`; changed = true; }
    if (s.ul < 100 && queuedUploads()) {
      s.ul = Math.min(100, s.ul + 1); changed = true;
      if (s.ul === 100) { const n = queuedUploads(); SESSIONS.forEach(x => { x.upload = 'Uploaded'; }); s.lastUl = `Today, ${nowTime()}`; toast(`${plural(n, 'session')} uploaded to Alchemy Manager.`); }
    }
    if (!changed) return;
    if (state.modal && state.modal.bg) renderModal();
    if (route() === 'home' && !state.modal) render(); else syncNav();
  }

  // ---------- Screen: Recent sessions ----------
  function filteredSessions() {
    const q = state.sesSearch.trim().toLowerCase();
    return SESSIONS.filter(s => (!q || `${s.name} ${s.id} ${s.fac}`.toLowerCase().includes(q))
      && (state.sesStatus === 'all' || s.status === state.sesStatus)
      && (state.sesUpload === 'all' || s.upload === state.sesUpload));
  }
  function sesStatus(s) { return s.status === 'Completed' ? `<span class="sst ok">${icon('check_circle', 'fill')}Completed</span>` : `<span class="sst early">${icon('do_not_disturb_on', 'fill')}${esc(s.status)}</span>`; }
  function upStatus(u) { const c = u === 'Uploaded' ? 'up' : u === 'Upload failed' ? 'fail' : 'pend'; return `<span class="sst ${c}">${icon('cloud_upload', 'fill')}${esc(u)}</span>`; }
  function viewSessions() {
    const list = filteredSessions();
    const sel = (key, ph, options) => `<select class="select" aria-label="${ph}" data-change="${key}"><option value="all">${ph}</option>${options.map(o => `<option${state[key] === o ? ' selected' : ''}>${o}</option>`).join('')}</select>`;
    return `<section class="screen sessions">
      <div><button class="back" type="button" data-go="home">${icon('arrow_back')}Back to home</button></div>
      <div class="shead"><div><h1>Recent sessions</h1><p>Review training outcomes and upload session results.</p></div>
        <button class="btn primary" type="button" data-go="select-activities">${icon('add')}Create a training session</button></div>
      <div class="sfilters">
        <label class="field">${icon('search')}<span class="sr">Search sessions or facilitators</span><input id="sesSearch" type="search" placeholder="Search sessions or facilitators" value="${esc(state.sesSearch)}" data-input="sesSearch"></label>
        <select class="select" aria-label="Date range" data-change="sesRange">${['Last 7 days', 'Last 30 days', 'Last 90 days'].map(o => `<option${state.sesRange === o ? ' selected' : ''}>${o}</option>`).join('')}</select>
        ${sel('sesStatus', 'Session status', ['Completed', 'Ended early'])}
        ${sel('sesUpload', 'Upload status', ['Pending upload', 'Uploaded', 'Upload failed'])}
      </div>
      <h2 class="count">${plural(list.length, 'session')}</h2>
      <div class="card stbl"><div class="scroll-x"><table class="tbl ses-tbl">
        <thead><tr><th>Session</th><th>Date &amp; time</th><th>Facilitator</th><th>Employees</th><th>Activities</th><th>Total duration</th><th>Session status</th><th>Upload status</th><th><span class="sr">Actions</span></th></tr></thead>
        <tbody>${list.map(s => `<tr class="${s.upload === 'Pending upload' ? 'pend' : ''}">
          <td><b>${esc(s.name)}</b>Session ID: ${s.id}</td><td>${s.date}</td><td>${esc(s.fac)}</td><td>${s.emps}</td><td>${s.acts}</td><td>${s.dur}</td>
          <td>${sesStatus(s)}</td><td>${upStatus(s.upload)}</td>
          <td><button class="btn dark" type="button" data-action="view-results" data-id="${s.id}">View results</button></td></tr>`).join('')
          || '<tr><td colspan="9" class="empty">No sessions match. Clear the search or filters to see all sessions.</td></tr>'}</tbody></table></div>
        <div class="pager"><span>Showing ${list.length ? `1–${list.length}` : '0'} of ${plural(list.length, 'session')}</span><span class="pg"><button type="button" disabled>${icon('chevron_left')}Previous</button><small>Page 1 of 1</small><button type="button" disabled>Next${icon('chevron_right')}</button></span></div>
      </div>
      <div class="snote">${icon('info')}Upload status shows whether results have synchronized with Alchemy Manager.</div>
    </section>`;
  }

  // ---------- Screen: Select activities ----------
  function filteredActivities() {
    const q = state.actSearch.trim().toLowerCase();
    return ACTIVITIES.filter(a => (!q || (a.title + ' ' + a.desc).toLowerCase().includes(q)) && (state.actCat === 'all' || a.cat === state.actCat));
  }
  function viewSelect() {
    const list = filteredActivities();
    const nSel = list.filter(a => state.selActs.includes(a.id)).length;
    const tabs = [['activities', 'book', 'Activities'], ['playlists', 'format_list_bulleted', 'Playlists'], ['plans', 'library_books', 'Learning Plans'], ['jobs', 'badge', 'Job Qualifications']];
    const body = state.tab === 'activities' ? `
      <div class="inner">
        <h2>Activity library</h2>
        <div class="filters">
          <label class="field">${icon('search')}<span class="sr">Search activities</span><input id="actSearch" type="search" placeholder="Search activities" value="${esc(state.actSearch)}" data-input="actSearch"></label>
          <select class="select" id="actCat" aria-label="Category" data-change="actCat">
            <option value="all"${state.actCat === 'all' ? ' selected' : ''}>Categories (2)</option>
            <option${state.actCat === 'Workplace Safety' ? ' selected' : ''}>Workplace Safety</option>
            <option${state.actCat === 'Food Safety' ? ' selected' : ''}>Food Safety</option>
          </select>
          <select class="select" id="actLang" aria-label="Language" data-change="actLang">
            <option value="all">Languages (2)</option><option>English</option><option>Spanish</option>
          </select>
          <button class="clear" type="button" data-action="clear-act-filters">Clear filters</button>
        </div>
        <label class="selectall"><input type="checkbox" class="check" id="actAll" data-action="toggle-all-acts"${nSel === list.length && list.length ? ' checked' : ''}> Select all results (${nSel} of ${list.length} selected)</label>
        <div class="scroll-x">
        <table class="tbl act-tbl">
          <thead><tr><th style="width:60px"><span class="sr">Selected</span></th><th>Activity</th><th>Category</th><th>Duration</th><th>Languages</th><th style="width:40px"></th></tr></thead>
          <tbody>${list.map(a => `
            <tr class="row" data-action="toggle-act" data-id="${a.id}">
              <td><input type="checkbox" class="check" aria-label="Select ${esc(a.title)}" data-action="toggle-act" data-id="${a.id}"${state.selActs.includes(a.id) ? ' checked' : ''}></td>
              <td><div class="t">${esc(a.title)}</div><div class="d">${esc(a.desc)}</div></td>
              <td class="c">${esc(a.cat).replace(' ', '<br>')}</td>
              <td class="du">${a.dur} min</td>
              <td class="l">English<br>Spanish</td>
              <td><button type="button" class="iconbtn" aria-label="Details for ${esc(a.title)}" data-action="open-details" data-id="${a.id}">${icon('chevron_right')}</button></td>
            </tr>`).join('') || `<tr><td colspan="6" class="empty">No activities match. Clear the filters to see the full library.</td></tr>`}
          </tbody>
        </table></div>
      </div>` : `<div class="inner"><div class="empty">${tabs.find(t => t[0] === state.tab)[2]} aren't part of this prototype yet. Use the Activities tab to build a session.</div></div>`;
    const sel = selActs();
    return `<section class="screen">
      <div class="head"><div><h1>Select activities</h1><p>Choose activities, playlists, or learning plans for your session.</p></div>${stepper(1)}</div>
      <div class="split sel">
        <div class="card library">
          <div class="tabs" role="tablist">${tabs.map(([k, ic, l]) => `<button class="tab" role="tab" type="button" aria-selected="${state.tab === k}" data-action="tab" data-tab="${k}">${icon(ic, state.tab === k ? 'fill' : '')}${l}</button>`).join('')}</div>
          ${body}
        </div>
        <aside class="card side">
          <h2>Session activities</h2>
          <div class="sub">${plural(sel.length, 'activity').replace('activitys', 'activities')} / ${totalMin()} min</div>
          ${sel.length ? `<div class="hint">${icon('drag_indicator')}Drag to reorder</div>
          <ol class="queue" id="queue">${sel.map((a, i) => `
            <li draggable="true" data-id="${a.id}">
              ${icon('drag_indicator', 'grip')}<span class="n">${i + 1}</span><span class="tt">${esc(a.title)}</span><span class="dur">${a.dur} min</span>
              <button type="button" class="iconbtn" aria-label="Remove ${esc(a.title)}" data-action="remove-act" data-id="${a.id}">${icon('close')}</button>
            </li>`).join('')}</ol>` : `<div class="empty">No activities yet. Select activities from the library to add them here.${state.lastSel && state.lastSel.length ? `<div style="margin-top:14px"><button class="link sm" type="button" data-action="restore-sel">${icon('restore')}Restore selection</button></div>` : ''}</div>`}
          <div class="foot">
            <div>${state.playlistName
              ? `<button class="link plname" type="button" data-action="save-playlist" aria-label="Rename playlist ${esc(state.playlistName)}">${icon('format_list_numbered')}${esc(state.playlistName)}</button>`
              : `<button class="btn sm" type="button" data-action="save-playlist"${sel.length ? '' : ' disabled'}>${icon('playlist_add')}Save as playlist</button>`}</div>
            <div class="row"><button class="btn" type="button" data-go="home">Back</button><button class="btn primary big" type="button" data-go="add-employees"${sel.length ? '' : ' disabled'}>Next</button></div>
          </div>
        </aside>
      </div>
    </section>`;
  }

  // ---------- Screen: Add employees ----------
  function filteredEmployees() {
    const q = state.empSearch.trim().toLowerCase();
    return EMPLOYEES.filter(e => (!q || (e.name + ' ' + e.eid).toLowerCase().includes(q))
      && (!state.site.length || state.site.includes(e.site))
      && (!state.group.length || state.group.includes(e.shift) || state.group.includes(e.dept))
      && (!state.dyn.length || state.dyn.includes(e.dyn)));
  }
  function viewAdd() {
    const list = filteredEmployees();
    const nSel = state.selEmps.length;
    const nReg = state.selEmps.filter(id => state.remotes[id]).length; // Next needs every roster employee registered
    const nVis = list.filter(e => state.selEmps.includes(e.id)).length;
    const roster = state.selEmps.map(emp);
    return `<section class="screen">
      <div class="head"><div><h1>Add employees</h1><p>Choose employees or a saved roster for this session.</p></div>${stepper(2)}</div>
      <div class="split wide-side">
        <div class="card roster-main">
          <div class="tabs" role="tablist">
            <button class="tab" role="tab" type="button" aria-selected="${state.rosterTab === 'employees'}" data-action="rtab" data-tab="employees">${icon('person', 'fill')}Employees</button>
            <button class="tab" role="tab" type="button" aria-selected="${state.rosterTab === 'saved'}" data-action="rtab" data-tab="saved">${icon('how_to_reg')}Saved Roster</button>

          </div>
          ${state.rosterTab === 'employees' ? `<div class="inner">
            <label class="field">${icon('search')}<span class="sr">Search employees</span><input id="empSearch" type="search" placeholder="Search employees" value="${esc(state.empSearch)}" data-input="empSearch"></label>
            <div class="empfilters">${['site', 'group', 'dyn'].map(k => { const v = state[k]; const label = { site: 'Worksite', group: 'Groups', dyn: 'Dynamic Groups' }[k];
              return `<div class="ff"><span id="ff-${k}">${label}</span><button type="button" class="select fbtn" aria-labelledby="ff-${k} ffv-${k}" data-action="open-filter" data-key="${k}"><span id="ffv-${k}">${v.length ? (v.length === 1 ? esc(v[0]) : `${v.length} selected`) : FILTERS[k].all}</span></button></div>`; }).join('')}
            </div>
            <label class="selbar"><input type="checkbox" class="check" id="empAll" data-action="toggle-all-emps"${nVis === list.length && list.length ? ' checked' : ''}> ${plural(nSel, 'employee')} selected</label>
            <div class="emp-scroll scroll-x">
            <table class="tbl emp-tbl">
              <thead><tr><th style="width:70px"><span class="sr">Selected</span></th><th>Employee</th><th>Employee ID</th><th>Worksite</th><th style="width:64px"><span class="sr">Register remote</span></th></tr></thead>
              <tbody>${list.map(e => `<tr>
                <td><input type="checkbox" class="check" aria-label="Select ${esc(e.name)}" data-action="toggle-emp" data-id="${e.id}"${state.selEmps.includes(e.id) ? ' checked' : ''}></td>
                <td><div class="nm">${esc(e.name)}</div><div class="dp">${esc(e.dept)}</div></td>
                <td class="v num-col">${e.eid}</td><td class="v">${esc(e.site)}</td>
                <td class="rcell"><div class="rwrap">
                  <button type="button" class="rbtn" data-action="reg-emp" data-id="${e.id}" aria-label="${state.remotes[e.id] ? 'Re-register' : 'Register'} a remote for ${esc(e.name)}" title="${state.remotes[e.id] ? 'Re-register remote' : 'Register remote'}">${icon('settings_remote')}</button></div></td>
              </tr>`).join('') || `<tr><td colspan="5" class="empty">No employees match these filters.</td></tr>`}</tbody>
            </table></div>
          </div>` : `<div class="inner"><div class="empty">Saved rosters aren't part of this prototype yet. Pick employees on the Employees tab.</div></div>`}
        </div>
        <aside class="card rpanel">
          <div class="top"><div><h2>Session roster</h2><div class="sub">${plural(nSel, 'employee')}</div></div>
            <button class="btn sm" type="button" data-action="open-register">${icon('badge', 'fill')}Register employee</button></div>
          <ul class="names">${roster.map(e => `<li>${esc(e.name)}${state.remotes[e.id] ? `<span class="r">Remote ${state.remotes[e.id]}</span>` : ''}<button type="button" class="iconbtn" aria-label="Remove ${esc(e.name)}" data-action="toggle-emp" data-id="${e.id}">${icon('close')}</button></li>`).join('') || '<li class="empty" style="border:0;font-weight:400">No employees yet. Select employees from the list.</li>'}</ul>
          <div class="facil"><h3>Facilitator</h3><div class="who">${icon('person')}Edgar Payamps<button class="link" type="button" data-action="toast" data-msg="Only one facilitator is signed in to this Player.">${icon('sync')}Change</button></div>
            <div class="summary">${plural(nSel, 'employee')} &nbsp;•&nbsp; 1 facilitator</div></div>
        </aside>
      </div>
      <div class="actions"><button class="btn" type="button" data-go="select-activities">Back</button><div class="rt">${nSel && nReg < nSel ? `<span class="why">Register remotes for all employees to continue (${nReg} of ${nSel}).</span>` : ''}<button class="btn primary big" type="button" data-go="preview"${nSel && nReg === nSel ? '' : ' disabled'}>Next</button></div></div>
    </section>`;
  }

  // ---------- Screen: Preview session ----------
  function viewPreview() {
    const sel = selActs();
    const g = state.global;
    const regd = state.selEmps.filter(id => state.remotes[id]).length;
    const allReg = regd === state.selEmps.length;
    const miss = missingActs();
    const custom = state.customize;
    const sumOf = s => [s.lang, s.sub === 'None' ? 'Subtitles off' : `Subtitles: ${s.sub}`, s.rem === 'None' ? 'No remediations' : `${s.rem} remediations`, s.games === 'None' ? 'Games off' : s.games, s.resp ? 'Responses on' : 'Responses off'].map(esc).join(' · ');
    const row = (a, i) => { const s = state.settings[a.id]; if (!custom) return `<tr class="compact-row">
      <td>${icon('drag_indicator', 'grip')}</td><td class="idx">${i + 1}</td>
      <td><div class="t">${esc(a.title)}</div><div class="s"><span>${a.dur} min</span>${a.dl >= 100 ? `<span>${icon('check_circle', 'ok')} Downloaded</span>` : `<span>${icon('warning', 'warn')} ${a.dl > 0 ? `Download incomplete · ${Math.round(a.dl)}%` : 'Not downloaded'}</span>`}</div></td>
      <td colspan="5" class="pv-sum">${sumOf(s)}</td></tr>`; return `<tr>
      <td>${icon('drag_indicator', 'grip')}</td><td class="idx">${i + 1}</td>
      <td><div class="t">${esc(a.title)}</div><div class="s"><span>${a.dur} min</span>${a.dl >= 100 ? `<span>${icon('check_circle', 'ok')} Downloaded</span>` : `<span>${icon('warning', 'warn')} ${a.dl > 0 ? `Download incomplete · ${Math.round(a.dl)}%` : 'Not downloaded'}</span>`}</div></td>
      <td><select class="select lang" aria-label="Language for ${esc(a.title)}" data-setting="lang" data-id="${a.id}">${opts(LANGS, s.lang)}</select></td>
      <td><select class="select subl" aria-label="Subtitles for ${esc(a.title)}" data-setting="sub" data-id="${a.id}">${opts(SUBS, s.sub)}</select></td>
      <td><select class="select" aria-label="Remediations for ${esc(a.title)}" data-setting="rem" data-id="${a.id}">${opts(REMS, s.rem)}</select></td>
      <td><select class="select gm" aria-label="Games for ${esc(a.title)}" data-setting="games" data-id="${a.id}">${opts(GAMES, s.games)}</select></td>
      <td><label class="toggle"><input type="checkbox" data-setting="resp" data-id="${a.id}"${s.resp ? ' checked' : ''}><span>${s.resp ? 'On' : 'Off'}</span></label></td>
    </tr>`; };
    return `<section class="screen">
      <div class="head"><div><h1>Preview session</h1><p>Verify activities, roster, and facilitator before you start.</p>
        <div class="meta"><button class="link" type="button" data-action="save-playlist">${icon(state.playlistName ? 'format_list_numbered' : 'playlist_add')}${state.playlistName ? esc(state.playlistName) : 'Add Playlist Name'}</button><span class="div"></span><b>${plural(sel.length, 'activity').replace('activitys', 'activities')} • ${totalMin()} min</b></div></div>${stepper(3)}</div>
      ${miss.length ? `<div class="dlwarn" role="alert">${icon('warning')}<span class="vr" aria-hidden="true"></span><div><b>${miss.length === 1 ? '1 activity needs' : `${miss.length} activities need`} downloading</b><p>Download the remaining files before starting training.</p></div>
        <button class="btn" type="button" data-action="open-missing">${icon('cloud_download', 'fill')}Download missing activities</button></div>` : ''}
      <div class="card acts">
        <div class="hd"><h2>Activities (${sel.length})</h2><span class="hint" style="margin:0">${icon('drag_indicator')}Drag to reorder</span><button class="link" type="button" data-action="toggle-customize" aria-expanded="${custom}" style="margin-left:auto">${icon(custom ? 'unfold_less' : 'tune')}${custom ? 'Use global settings view' : 'Customize per activity'}</button><span class="sep" aria-hidden="true" style="width:1px;height:20px;background:var(--line-soft)"></span><button class="link" type="button" data-go="select-activities" style="margin-left:0">${icon('edit', 'fill')}Edit activities</button></div>
        <div class="scroll-x"><table class="tbl pv-tbl${custom ? ' custom' : ''}">
          <thead><tr><th style="width:40px"></th><th style="width:40px"></th><th>Activity</th><th>Language</th><th>Subtitle language</th><th>Remediations</th><th>Games</th><th>Responses</th></tr></thead>
          <tbody>
            <tr class="global"><td></td><td></td><td><div class="t">Global playlist controls</div><div class="pv-sum">Apply settings to all activities</div></td>
              <td><select class="select lang" aria-label="Language for all activities" data-global="lang">${opts(LANGS, g.lang)}</select></td>
              <td><select class="select subl" aria-label="Subtitles for all activities" data-global="sub">${opts(SUBS, g.sub)}</select></td>
              <td><select class="select" aria-label="Remediations for all activities" data-global="rem">${opts(REMS, g.rem)}</select></td>
              <td><select class="select gm" aria-label="Games for all activities" data-global="games">${opts(GAMES, g.games)}</select></td>
              <td><label class="toggle"><input type="checkbox" data-global="resp"${g.resp ? ' checked' : ''}><span>${g.resp ? 'On' : 'Off'}</span></label></td></tr>
            ${sel.map(row).join('')}
          </tbody></table></div>
      </div>
      <div class="twocards">
        <div class="card mini"><div><h3>Roster</h3><div class="who">${icon('group', 'fill')}${plural(state.selEmps.length, 'employee')}</div></div>
          <div class="links"><button class="link" type="button" data-go="add-employees">${icon('visibility')}View roster</button><span class="sep"></span><button class="link" type="button" data-go="add-employees">${icon('edit', 'fill')}Edit</button></div></div>
        <div class="card mini"><div><h3>Facilitator</h3><div class="who">${icon('person')}Edgar Payamps</div></div>
          <button class="link" type="button" data-action="toast" data-msg="Only one facilitator is signed in to this Player.">${icon('sync')}Change</button></div>
      </div>
      <div class="checks">
        <div class="${miss.length ? 'warn' : ''}">${icon(miss.length ? 'warning' : 'check_circle')}${miss.length ? 'Activity downloads incomplete' : 'Activities available'}</div>
        <div>${icon('check_circle')}Base station connected</div>
        <div class="${allReg ? '' : 'warn'}">${icon(allReg ? 'check_circle' : 'warning')}${allReg ? `${regd} remotes registered` : `${regd} of ${state.selEmps.length} remotes registered`}</div>
      </div>
      <div class="actions"><button class="btn" type="button" data-go="add-employees">Back</button><div class="rt">${miss.length ? '<span class="why">Download required activities to continue.</span>' : ''}<button class="btn primary huge" type="button" data-action="start-training"${miss.length ? ' disabled' : ''}>${icon('play_arrow', 'fill')}Start training</button></div></div>
    </section>`;
  }

  // ---------- Screen: Training ----------
  function newRun() {
    return { ai: 0, q: 2, sec: 260, paused: false, got: 4, startedAt: Date.now() };
  }
  function viewTraining() {
    const tr = state.tr || (state.tr = newRun());
    const sel = selActs();
    const a = sel[tr.ai];
    const n = state.selEmps.length;
    const pct = Math.round(tr.got / n * 100);
    const isLast = tr.ai === sel.length - 1 && tr.q === a.questions;
    const mm = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    const lang = state.settings[a.id].lang;
    return `<section class="screen tight" style="gap:22px">
      <div class="trhead"><div><h1>Training in progress</h1><p>${state.playlistName ? esc(state.playlistName) : 'Morning Shift Safety'} · ${plural(n, 'employee')} · Edgar Payamps</p></div>
        <div class="links"><button class="link" type="button" data-action="toast" data-msg="Session settings aren't part of this prototype yet.">${icon('settings', 'fill')}Session settings</button><button class="link" type="button" data-action="open-history">${icon('history')}Response history</button></div></div>
      <div class="trgrid">
        <div class="card player">
          <div class="ph"><div><div class="eyebrow">Activity ${tr.ai + 1} of ${sel.length}</div><div class="title">${esc(a.title)}</div></div><div class="lang">${esc(lang)}</div></div>
          <div class="media"><img src="assets/course-estop-question.webp" alt="Course video: What does the E-STOP RESET button do? Four answer choices.">
            ${tr.paused ? `<div class="paused" role="status"><div>${icon('pause_circle')}Session paused<div style="font-size:16px;font-weight:400;margin-top:6px">Employees can't answer until you resume.</div></div></div>` : ''}</div>
          <div class="timeline" aria-hidden="true"><div style="width:${Math.min(100, tr.sec / 600 * 100)}%"></div></div>
          <div class="pctl"><span>Question ${tr.q} of ${a.questions}</span><span class="num-col" id="clock">${mm(tr.sec)} / 10:00</span>
            <span class="cc">${icon('closed_caption', 'fill')}Subtitles: ${state.settings[a.id].sub === 'None' ? 'Off' : esc(state.settings[a.id].sub)}</span>
            <button class="iconbtn" type="button" aria-label="Volume" data-action="toast" data-msg="Volume is controlled from the room's speakers.">${icon('volume_up', 'fill')}</button>
            <button class="iconbtn" type="button" aria-label="Full screen" data-action="fullscreen">${icon('fullscreen')}</button></div>
        </div>
        <aside class="card queuepanel">
          <h2>Session activities</h2><div class="sub">${plural(sel.length, 'activity').replace('activitys', 'activities')} · ${totalMin()} min</div>
          <ol class="tq">${sel.map((x, i) => {
            const st = i < tr.ai ? 'Completed' : i === tr.ai ? (tr.paused ? 'Paused' : 'In progress') : i === tr.ai + 1 ? 'Up next' : 'Not started';
            const lead = i < tr.ai ? `<span class="bub done">${icon('check', '')}</span>` : i === tr.ai ? icon('play_arrow', 'fill') : `<span class="bub">${i + 1}</span>`;
            return `<li class="${i === tr.ai ? 'now' : ''}">${lead}<div><div class="t">${esc(x.title)}</div><div class="s">${st} · ${x.dur} min</div></div></li>`;
          }).join('')}</ol>
          <div class="responses"><h3>Employee responses</h3><div class="big" id="gotBig">${tr.got} of ${n}</div><div class="lbl">responses received</div>
            <div class="meter"><div class="track"><div id="gotBar" style="width:${pct}%"></div></div>${tr.got >= n ? icon('check_circle', 'fill okic') : `<span class="pct" id="gotPct">${pct}%</span>`}</div>
            ${tr.got >= n ? `<div class="allin" role="status">Everyone has responded</div><div class="nextnote">${isLast ? 'Finish session to see results.' : 'Next to review answers.'}</div>` : ''}</div>
        </aside>
      </div>
      <div class="trbar">
        <button class="btn dark" type="button" data-action="pause">${icon(tr.paused ? 'play_arrow' : 'pause', 'fill')}${tr.paused ? 'Resume session' : 'Pause session'}</button>
        <button class="btn outline" type="button" data-action="confirm-end">${icon('stop_circle')}End session</button>
        <span class="grow"></span>
        <button class="btn primary big" type="button" data-action="next-q"${tr.paused ? ' disabled' : ''}>${isLast ? 'Finish session' : 'Next'}</button>
      </div>
    </section>`;
  }
  function tickTraining() {
    const tr = state.tr;
    if (!tr || tr.paused || route() !== 'training') return;
    tr.sec = Math.min(599, tr.sec + 1);
    const c = $('#clock'); if (c) c.textContent = `${String(Math.floor(tr.sec / 60)).padStart(2, '0')}:${String(tr.sec % 60).padStart(2, '0')} / 10:00`;
    const n = state.selEmps.length;
    if (tr.got < n && Math.random() < 0.28) {
      tr.got++;
      const pct = Math.round(tr.got / n * 100);
      const big = $('#gotBig'), bar = $('#gotBar'), p = $('#gotPct');
      if (tr.got >= n) { render(); return; }
      if (big) big.textContent = `${tr.got} of ${n}`; if (bar) bar.style.width = pct + '%'; if (p) p.textContent = pct + '%';
    }
  }

  // ---------- Screen: Session results ----------
  function viewResults() {
    const ses = curSes();
    const sel = selActs();
    const roster = state.selEmps.map(emp);
    let clock = 9 * 60;
    const played = sel.map(a => { const from = clock; clock += a.dur + 2; return [from, clock]; });
    const t = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
    const total = totalMin() + 4;
    return `<section class="screen results">
      <div class="rhead">
        <div><button class="back" type="button" data-go="sessions">${icon('arrow_back')}Back to recent sessions</button>
          <h1>Session results</h1><div class="sub">${esc(ses.name)} · ${ses.id}</div>
          <div class="meta">${icon(ses.status === 'Completed' ? 'check_circle' : 'do_not_disturb_on', 'fill')}${esc(ses.status)} <span>·</span> ${ses.date.split(', ').slice(0, 2).join(', ')} <span>·</span> ${ses.id === 'SES-1104-01' ? `9:00–${t(9 * 60 + total)} AM` : ses.date.split(', ')[2]} <span>·</span> Room 57 <span>·</span> Facilitator: ${esc(ses.fac)}</div></div>
        ${ses.upload === 'Uploaded'
          ? `<div class="banner done">${icon('cloud_done', 'fill ic')}<div><b>Uploaded</b><p>Results are synced to Alchemy Manager.</p></div><button class="btn xs" type="button" data-go="select-activities">Start a new session</button></div>`
          : ses.upload === 'Upload failed'
          ? `<div class="banner fail">${icon('cloud_off', 'fill ic')}<div><b>Upload failed</b><p>The connection was interrupted. Results are saved on this Player.</p></div><button class="btn dark xs" type="button" data-action="open-upload">${icon('refresh')}Retry upload</button></div>`
          : `<div class="banner">${icon('cloud_upload', 'fill ic')}<div><b>Pending upload</b><p>Results have not synced to Alchemy Manager.</p></div><button class="btn dark xs" type="button" data-action="open-upload">${icon('cloud_upload', 'fill')}Upload results</button></div>`}
      </div>
      <div class="card stats"><div class="row">
        <div class="s"><div class="v">${roster.length} / ${roster.length}</div><div class="k">Employees completed</div></div>
        <div class="s"><div class="v">${sel.length} / ${sel.length}</div><div class="k">Activities completed</div></div>
        <div class="s"><div class="v">${total} min</div><div class="k">Total duration</div></div>
        <div class="s"><div class="v">2 pauses · 4 min</div><div class="k">Pause time</div></div></div>
        <div class="fn"><span>${totalMin()} min active training + 4 min paused = ${total} min total</span><span>${esc(state.global.lang)} · Subtitles ${state.global.sub === 'None' ? 'off' : esc(state.global.sub)} · Responses ${state.global.resp ? 'on' : 'off'} · Games ${state.global.games === 'None' ? 'off' : esc(state.global.games)}</span></div>
      </div>
      <div class="twocol">
        <div class="card sect"><h2>Activities played</h2>
          <div class="scroll-x"><table class="tbl compact"><thead><tr><th>Order</th><th>Activity</th><th>Language</th><th>Played</th><th>Outcome</th></tr></thead>
          <tbody>${sel.map((a, i) => `<tr><td>${i + 1}</td><td>${esc(a.title)}</td><td>${esc(state.settings[a.id].lang)}</td><td class="num-col">${t(played[i][0])}–${t(played[i][1])} AM</td><td><span class="chip ok">${icon('check_circle', 'fill')}Completed</span></td></tr>`).join('')}</tbody></table></div>
          <p class="note">Played times include pauses. Playback and question events are recorded in the session log.</p></div>
        <div class="card sect"><h2>Pause history</h2><div class="sub">2 pauses · 4 min total</div>
          <table class="tbl compact"><thead><tr><th>Paused</th><th>Resumed</th><th>Duration</th></tr></thead>
          <tbody><tr><td>9:08 AM</td><td>9:10 AM</td><td>2 min</td></tr><tr><td>9:20 AM</td><td>9:22 AM</td><td>2 min</td></tr></tbody></table></div>
      </div>
      <div class="card sect"><h2>Employee outcomes</h2>
        <div class="scroll-x"><table class="tbl big-tbl"><thead><tr><th>Employee</th><th>Remote #</th><th>Activities completed</th><th>Outcome</th></tr></thead>
        <tbody>${roster.map((e, i) => `<tr><td>${esc(e.name)}</td><td>${state.remotes[e.id] || '—'}</td><td>${sel.length} of ${sel.length}</td><td><span class="chip ok">${icon('check_circle', 'fill')}Completed</span></td></tr>`).join('')}</tbody></table></div></div>
      <div class="card sect"><h2>Full response history</h2><div class="sub">All questions, answer changes, and remediation responses.</div>
        <div class="rfilters">
          <select class="select sm" aria-label="Activity"><option>All activities</option>${sel.map(a => `<option>${esc(a.title)}</option>`).join('')}</select>
          <select class="select sm" aria-label="Question"><option>All questions</option><option>Question 1</option><option>Question 2</option><option>Question 3</option></select>
          <select class="select sm" aria-label="Employee"><option>All employees</option>${roster.map(e => `<option>${esc(e.name)}</option>`).join('')}</select>
          <select class="select sm" aria-label="Round"><option>All rounds</option><option>Initial</option><option>Remediation 1</option></select>
          <span class="order">Received order: oldest first</span></div>
        <div class="infobox">${icon('info')}A correct response is retained for scoring, even if a later response is incorrect.</div>
        <div class="scroll-x"><table class="tbl compact"><thead><tr><th>Received</th><th>Activity · Question</th><th>Remote #</th><th>Employee</th><th>Round</th><th>Answer</th><th>Result</th><th>Retained</th></tr></thead>
        <tbody>${FULL_HISTORY.map(r => `<tr${r[8] ? ' class="hl"' : ''}><td class="num-col">${r[0]}</td><td>${icon('chevron_right')} ${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td>
          <td><span class="chip ${r[6] ? 'ok' : 'bad'}">${icon(r[6] ? 'check_circle' : 'close', r[6] ? 'fill' : '')}${r[6] ? 'Correct' : 'Incorrect'}</span></td><td>${r[7]}${r[8] ? ' ' + icon('check_circle', 'fill" style="color:var(--success);font-size:20px;vertical-align:-5px') : ''}</td></tr>`).join('')}</tbody></table></div>
        <div class="pager"><span>Showing 1–8 of 126 responses</span><span class="pg"><button type="button" disabled>${icon('chevron_left')}Previous</button><small>Page 1 of 16</small><button type="button" data-action="toast" data-msg="Paging isn't wired in this prototype.">Next${icon('chevron_right')}</button></span></div>
        <p class="note">Select a question to view its wording and answer options. Retained shows the answer kept after each response.</p></div>
      <div><button class="btn sm" type="button" data-action="toast" data-msg="The session event log isn't part of this prototype yet.">${icon('description', 'fill')}View session event log</button></div>
    </section>`;
  }

  // ---------- Modals ----------
  function openModal(m) { state.modal = m; renderModal(); }
  function closeModal() { state.modal = null; clearModalTimers(); renderModal(); }
  let modalTimers = [];
  const mLater = (fn, ms) => { const t = setTimeout(fn, ms); modalTimers.push(t); };
  const mEvery = (fn, ms) => { const t = setInterval(fn, ms); modalTimers.push(t); return t; };
  const clearModalTimers = () => { modalTimers.forEach(t => { clearTimeout(t); clearInterval(t); }); modalTimers = []; };
  let lastFocus = null;

  function renderModal() {
    const root = $('#modalRoot');
    const m = state.modal;
    if (!m) { root.innerHTML = ''; root.dataset.kind = ''; if (lastFocus) { lastFocus.focus(); lastFocus = null; } return; }
    if (!root.firstChild) lastFocus = document.activeElement;
    let html = '';
    if (m.type === 'register') html = modalRegister(m);
    if (m.type === 'download') html = modalDownload(m);
    if (m.type === 'upload') html = modalUpload(m);
    if (m.type === 'history') html = modalHistory(m);
    if (m.type === 'playlist') html = modalPlaylist(m);
    if (m.type === 'dlSettings') html = modalDlSettings(m);
    if (m.type === 'cancelDl') html = modalCancelDl(m);
    if (m.type === 'missing') html = modalMissing(m);
    if (m.type === 'admin') html = modalAdmin(m);
    if (m.type === 'courses') html = modalCourses(m);
    if (m.type === 'filter') html = modalFilter(m);
    if (m.type === 'details') html = modalDetails(m);
    if (m.type === 'endSes') html = modalEndSession(m);
    if (m.type === 'uploadBg') html = modalUploadBg(m);
    const first = !root.firstChild || root.dataset.kind !== m.type + (m.step || m.stage || '');
    const prevScroll = root.querySelector('.modal') ? root.querySelector('.modal').scrollTop : 0;
    const activeId = document.activeElement && root.contains(document.activeElement) ? document.activeElement.dataset.action || document.activeElement.id : null;
    root.dataset.kind = m.type + (m.step || m.stage || '');
    const tpl = document.createElement('div');
    tpl.innerHTML = `<div class="scrim" data-action="scrim">${html}</div>`;
    wrapLinks(tpl);
    // An open dialog is patched in place, so progress bars animate, spinners keep turning and the
    // open animation doesn't replay on every tick. Only a newly opened dialog is inserted fresh.
    if (root.firstChild) morph(root.firstChild, tpl.firstChild);
    else root.replaceChildren(tpl.firstChild);
    root.querySelector('.modal').scrollTop = first ? 0 : prevScroll;
    let f = null;
    if (!first && activeId) f = root.querySelector(`[data-action="${activeId}"], #${CSS.escape(activeId)}`);
    if (!f && (first || !root.contains(document.activeElement))) f = root.querySelector('[autofocus]') || root.querySelector('.modal button, .modal input');
    if (f) { f.focus(); if (f.matches('input[type=search], input:not([type])') && f.value) { const n = f.value.length; try { f.setSelectionRange(n, n); } catch (e) {} } }
    root.querySelectorAll('.check[data-ind]').forEach(c => { c.indeterminate = true; });
  }
  // Minimal DOM patch: keep nodes that match by tag, update text and attributes, replace the rest.
  function morph(from, to) {
    if (from.nodeType !== to.nodeType || from.nodeName !== to.nodeName) { from.replaceWith(to); return; }
    if (from.nodeType === 3) { if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue; return; }
    if (from.nodeType !== 1) return;
    for (const { name } of [...from.attributes]) if (!to.hasAttribute(name)) from.removeAttribute(name);
    for (const { name, value } of [...to.attributes]) if (from.getAttribute(name) !== value) from.setAttribute(name, value);
    if (from.tagName === 'INPUT') {
      if (from.checked !== to.hasAttribute('checked')) from.checked = to.hasAttribute('checked');
      const v = to.getAttribute('value') || ''; if (from.type !== 'checkbox' && from.value !== v) from.value = v;
    }
    const sel = from.tagName === 'SELECT' ? [...to.options].findIndex(o => o.hasAttribute('selected')) : -1;
    const a = [...from.childNodes], b = [...to.childNodes];
    b.forEach((n, i) => { if (a[i]) morph(a[i], n); else from.appendChild(n); });
    for (let i = b.length; i < a.length; i++) a[i].remove();
    if (sel >= 0 && from.selectedIndex !== sel) from.selectedIndex = sel;
  }
  function mHead(iconName, title, cls = '') {
    return `<div class="mh">${icon(iconName, 'fill lead')}<h2 id="mt">${title}</h2><button type="button" class="iconbtn" aria-label="Close" data-action="close-modal">${icon('close')}</button></div>`;
  }

  // Register employee: find → waiting → registered
  // Next roster employee after `id` (in roster order, wrapping) who doesn't have a remote yet.
  function nextOnRoster(id) {
    const r = state.selEmps, i = r.indexOf(id);
    for (let k = 1; k <= r.length; k++) { const c = r[(i + k) % r.length]; if (c !== id && !state.remotes[c]) return c; }
    return null;
  }
  function nextUnregistered() { return state.selEmps.find(id => !state.remotes[id]) || state.selEmps[0]; }
  function modalRegister(m) {
    const steps = (s) => `<div class="regsteps"><span class="s ${s === 1 ? 'on' : 'done'}">${s === 1 ? '<span class="b">1</span>' : icon('check_circle', 'fill')}Find employee</span><span class="ln"></span>
      <span class="s ${s === 2 ? 'on' : s === 3 ? 'done' : ''}">${s === 3 ? icon('check_circle', 'fill') : '<span class="b">2</span>'}Register remote</span></div>`;
    const e = m.emp ? emp(m.emp) : null;
    const pos = e ? state.selEmps.indexOf(e.id) + 1 : 0;
    const card = e ? `<div class="muted">Session roster · Employee ${pos} of ${state.selEmps.length}</div>
      <div class="empcard">${icon('person', 'fill')}<span class="vr"></span><div><b>${esc(e.name)}</b><div>Employee ID: ${e.eid}</div><div class="muted">${esc(e.dept)} · ${esc(e.site)}</div></div></div>` : '';
    let body = '', foot = '';
    if (m.step === 'done') {
      body = `<div class="regdone" role="status">${icon('how_to_reg', 'fill')}<h3>Roster registration is complete</h3>
        <p>All employees have a remote.</p></div>`;
      foot = `<button class="btn" type="button" data-action="register-more">Scan another badge</button><button class="btn primary" type="button" data-action="close-modal" autofocus>Done</button>`;
    } else if (m.step === 1) {
      body = `${steps(1)}<div>Scan an employee badge to find them automatically.</div>
        <label class="lbl" for="badge">Badge number</label>
        <label class="field">${icon('badge', 'fill')}<input id="badge" autofocus autocomplete="off" placeholder="Scan or enter badge number" value="${esc(m.badge || '')}" data-input="badge"></label>
        <div class="muted">For manual entry, press Enter or select Find employee.</div>
        ${m.err ? `<div style="color:var(--error)" role="alert">${esc(m.err)}</div>` : '<div class="muted" style="margin-top:12px">Once found, the employee is added to the session roster.</div>'}`;
      foot = `<button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn dark" type="button" data-action="find-employee" id="findBtn"${(m.badge || '').trim() ? '' : ' disabled'}>Find employee</button>`;
    } else if (m.step === 2) {
      body = `${steps(2)}${card}<div class="waitbox" role="status">${icon('sensors')}<h3>Waiting for response</h3><p>Ask ${esc(e.name.split(' ')[0])} to press any button on their remote.</p><p class="m">The remote number appears when ${esc(e.name.split(' ')[0])} responds.</p></div>`;
      foot = `<span></span><button class="btn" type="button" data-action="close-modal">Cancel</button>`;
    } else {
      body = `${steps(3)}${card}<div class="remnum">Remote number<b>${state.remotes[e.id]}</b></div>
        <div class="okbox" role="status">${icon('task_alt')}<b>Remote registered</b><span>${esc(e.name)} is registered with remote ${state.remotes[e.id]}.</span></div>`;
      foot = `<button class="btn" type="button" data-action="close-modal">Done</button><button class="btn primary" type="button" data-action="register-next" autofocus>Register next employee</button>`;
    }
    return `<div class="modal reg" role="dialog" aria-modal="true" aria-labelledby="mt" style="max-width:640px">
      <div class="mh">${icon('settings_remote', 'lead')}<h2 id="mt">Register employee</h2><button type="button" class="iconbtn" aria-label="Close" data-action="close-modal">${icon('close')}</button></div>
      <div class="mb">${body}</div><div class="mf">${foot}</div></div>`;
  }
  function findEmployee() {
    const m = state.modal; const badge = (m.badge || '').trim();
    let e = EMPLOYEES.find(x => x.eid === badge);
    if (!e && badge) e = emp(nextUnregistered()); // any badge works in the prototype
    if (!e) { m.err = 'Enter or scan a badge number.'; renderModal(); return; }
    if (!state.selEmps.includes(e.id)) state.selEmps.push(e.id);
    m.emp = e.id; m.step = 2; m.err = ''; renderModal(); render();
    waitForRemote(m, e);
  }
  // Step 2 → 3: the employee presses any button on a remote; the prototype answers after 2.2 s.
  function waitForRemote(m, e) {
    mLater(() => {
      if (state.modal !== m) return;
      if (!state.remotes[e.id] || m.reassign) state.remotes[e.id] = Math.max(0, ...Object.values(state.remotes)) + 1;
      m.step = 3; renderModal(); render();
    }, 2200);
  }

  // Download: settings (choose what to download) → in progress → complete, with a cancel confirmation
  const DL_ITEMS = [['user', 'User database', 'Update employee and facilitator information.'], ['course', 'Course database', 'Update activity listings and course information.'], ['media', 'Client media', 'Download company media files.']];
  function mgrStatus() {
    return state.online ? `<div class="mstat">${icon('check_circle', 'fill')}Alchemy Manager connected</div>` : `<div class="mstat off">${icon('do_not_disturb_on')}Alchemy Manager disconnected</div>`;
  }
  function modalDlSettings(m) {
    const any = DL_ITEMS.some(([k]) => m.pick[k]);
    return `<div class="modal dls" role="dialog" aria-modal="true" aria-labelledby="mt" style="max-width:820px">
      ${m.admin ? '<div class="eyebrow-m">Admin settings</div>' : ''}${mHead('cloud_download', 'Download')}
      <div class="mb"><div class="muted">Get the latest data and client media from Alchemy Manager.</div>
        ${m.admin ? '' : mgrStatus()}
        <div class="dlhead"><h3>Choose what to download</h3><span id="autoh">Automatic download</span></div>
        <div class="dlgrid">${DL_ITEMS.map(([k, t, d]) => `<div class="r">
          <label class="c1"><input type="checkbox" class="check" data-action="dl-pick" data-k="${k}"${m.pick[k] ? ' checked' : ''}><b>${t}<span class="ms" title="${d}" aria-hidden="true">info</span></b><span class="d">${d}</span></label>
          <div class="c2"><label class="toggle"><input type="checkbox" aria-label="Automatically download ${t.toLowerCase()}" data-action="dl-auto" data-k="${k}"${state.sync.auto[k] ? ' checked' : ''}></label></div></div>`).join('')}</div>
        <div class="note2">${icon('info')}${state.online ? 'Automatically download updates when available.' : 'Downloads start when this Player is back online.'}</div></div>
      <div class="mf"><button class="btn" type="button" data-action="close-modal">${m.admin ? 'Close' : 'Cancel'}</button><button class="btn dark" type="button" data-action="start-download"${any && state.online ? '' : ' disabled'}>${icon('cloud_download', 'fill')}Download</button></div></div>`;
  }
  // The three download items, derived from the background sync's overall percent.
  function bgItems() {
    const d = state.sync.dl, part = i => Math.max(0, Math.min(100, Math.round((d - i * 100 / 3) * 3)));
    return DL_ITEMS.map(([k, t], i) => ({ k, t, p: part(i) }));
  }
  function modalDownload(m) {
    if (m.bg) m.items = bgItems();
    const done = m.items.every(x => x.p >= 100);
    const doneCount = m.items.filter(x => x.p >= 100).length;
    const overall = Math.round(m.items.reduce((t, x) => t + x.p, 0) / m.items.length);
    const st = (x, i) => x.p >= 100 ? `${icon('check_circle', 'fill')}Completed` : (x.p > 0 || i === 0 || m.items[i - 1].p >= 100) ? `<span class="spin sm"></span>Downloading · ${Math.round(x.p)}%<span class="mini-bar"><div style="width:${x.p}%"></div></span>` : `${icon('schedule', 'q')}Queued`;
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="max-width:820px">
      ${mHead('cloud_download', 'Download')}
      <div class="mb"><div class="muted">Get the latest data and client media from Alchemy Manager.</div>
        ${mgrStatus()}
        <div class="progbox ${done ? 'ok' : ''}" role="status">${done ? icon('check_circle', 'fill') : '<span class="spin"></span>'}<b>${done ? 'Download complete' : 'Download in progress'}</b><p>${done ? 'This Player has the latest data and media.' : 'Updating this Player with the latest data and media.'}</p></div>
        <div class="dl-tbl"><div class="r h"><span>Download item</span><span>Status</span></div>${m.items.map((x, i) => `<div class="r"><b>${x.t}</b><span class="stt">${st(x, i)}</span></div>`).join('')}</div>
        <div class="split-line ov-line"><span>Overall progress</span><span class="num-col">${overall}%</span></div>
        <div class="bar2"><div style="width:${overall}%"></div></div>
        <div>${doneCount} of ${m.items.length} items complete</div>
        <div class="muted" style="font-size:var(--fs-sm)">${done ? 'You can close this window.' : m.bg ? 'Automatic download is running in the background. Close this window to keep working.' : 'Please keep Player open until the download finishes.'}</div></div>
      <div class="mf">${done ? '<button class="btn dark" type="button" data-action="close-modal" autofocus>Close</button>' : '<button class="btn" type="button" data-action="ask-cancel-download">Cancel download</button><button class="btn dark" type="button" data-action="close-modal" autofocus>Close</button>'}</div></div>`;
  }
  // A manual download keeps running after its window is closed (Close is the primary action); the top-bar
  // Download button reopens the same job while it runs. It pauses only while "Cancel download?" is asking.
  let dlJob = null, dlTimer = null;
  function startDownload(keys) {
    const items = DL_ITEMS.filter(([k]) => keys.includes(k)).map(([k, t]) => ({ k, t, p: 0 }));
    const m = dlJob = { type: 'download', items };
    openModal(m);
    clearInterval(dlTimer);
    dlTimer = setInterval(() => {
      if (state.modal && state.modal.type === 'cancelDl' && state.modal.prev === m) return;
      const x = m.items.find(v => v.p < 100);
      if (x) x.p = Math.min(100, x.p + (x.k === 'media' ? 4 : 8));
      if (m.items.every(v => v.p >= 100)) {
        clearInterval(dlTimer); dlJob = null; state.sync.dl = 100; state.sync.lastDl = `Today, ${nowTime()}`; render();
        if (state.modal !== m) toast('Download complete. This Player has the latest data and media.');
      }
      if (state.modal === m) renderModal();
    }, 240);
  }
  function modalCancelDl() {
    return `<div class="modal cnf" role="alertdialog" aria-modal="true" aria-labelledby="mt" aria-describedby="md" style="max-width:612px">
      ${mHead('warning', 'Cancel download?').replace('fill lead', 'lead')}
      <div class="mb" id="md"><p>This will stop the remaining downloads.</p><p>Items that have already finished downloading will remain available.</p></div>
      <div class="mf"><button class="btn" type="button" data-action="keep-download" autofocus>Keep downloading</button><button class="btn dark" type="button" data-action="cancel-download">Cancel download</button></div></div>`;
  }

  // Download missing activities (from Preview session)
  function modalMissing(m) {
    const acts = m.ids.map(act);
    const left = acts.filter(a => a.dl < 100).length;
    const status = a => a.dl >= 100 ? `<div class="stx">${icon('check_circle', 'fill ok')}<span>Downloaded</span></div>`
      : m.running ? `<div class="stx"><span class="spin sm"></span><span>Downloading · ${Math.round(a.dl)}%</span><div class="mini"><div style="width:${a.dl}%"></div></div></div>`
      : a.dl > 0 ? `<div class="stx">${icon('warning')}<span>Download incomplete</span><small>${Math.round(a.dl)}% downloaded</small><div class="mini"><div style="width:${a.dl}%"></div></div></div>`
      : `<div class="stx">${icon('warning')}<span>Not downloaded</span></div>`;
    return `<div class="modal m24" role="dialog" aria-modal="true" aria-labelledby="mt" style="max-width:960px">
      ${mHead('cloud_download', 'Download missing activities')}
      <div class="mb"><div>Download the remaining files for this session before starting training.</div>
        ${left ? `<div><span class="pill">${left === 1 ? '1 activity needs' : `${left} activities need`} downloading</span></div>` : `<div class="progbox ok" role="status">${icon('check_circle', 'fill')}<b>All activities downloaded</b><p>You can start training.</p></div>`}
        ${state.online ? '' : `<div class="mstat off">${icon('wifi_off')}No internet connection. Downloads resume when this Player is back online.</div>`}
        <div class="mtbl"><div class="r h"><span>Activity</span><span>Language</span><span>Status</span></div>
          ${acts.map(a => `<div class="r"><span>${esc(a.title)}</span><span>${esc(state.settings[a.id].lang)}</span>${status(a)}</div>`).join('')}</div>
        <div class="note2">${icon('info')}Training stays unavailable until ${acts.length === 2 ? 'both activities are' : acts.length === 1 ? 'this activity is' : 'all activities are'} downloaded.</div></div>
      <div class="mf">${left ? `<button class="btn" type="button" data-action="close-modal">Close</button><button class="btn dark" type="button" data-action="dl-missing"${m.running || !state.online ? ' disabled' : ''}>${icon('download')}Download remaining files</button>` : '<button class="btn dark" type="button" data-action="close-modal" autofocus>Done</button>'}</div></div>`;
  }
  function runMissing() {
    const m = state.modal; m.running = true; renderModal();
    mEvery(() => {
      if (state.modal !== m) return;
      const a = m.ids.map(act).find(x => x.dl < 100);
      if (!a) return;
      a.dl = Math.min(100, a.dl + 5);
      if (a.dl >= 100) render();
      renderModal();
    }, 180);
  }

  // Administrative settings (More → Admin Settings)
  function modalAdmin() {
    return `<div class="modal adm" role="dialog" aria-modal="true" aria-labelledby="mt" style="max-width:800px">
      ${mHead('settings', 'Administrative Settings')}
      <div class="mb">${ADMIN.map(([h, tiles]) => `<div class="sec"><h3>${h}</h3><div class="tiles">${tiles.map(([ic, l, a]) => `<button class="tile" type="button" ${a ? `data-action="${a}"` : `data-action="toast" data-msg="${l} isn't part of this prototype yet."`}>${icon(ic, 'fill')}<span>${l}</span></button>`).join('')}</div></div>`).join('')}</div></div>`;
  }

  // Download courses (More → Client Media, or Admin → Client Media)
  function filteredCourses(m) {
    const q = m.q.trim().toLowerCase();
    return state.courses.filter(c => (!q || c.t.toLowerCase().includes(q)) && (m.lang === 'all' || c.lang === m.lang) && (m.cat === 'all' || c.cat === m.cat));
  }
  function modalCourses(m) {
    const list = filteredCourses(m);
    const avail = state.courses.filter(c => c.st === 'ready' || c.st === 'update');
    const busy = state.courses.filter(c => c.st === 'downloading').length;
    const mb = avail.reduce((t, c) => t + c.mb, 0).toFixed(1);
    const uniq = k => [...new Set(state.courses.map(c => c[k]))];
    const status = c => c.st === 'ready' ? 'Ready to download'
      : c.st === 'update' ? '<span class="ctag">Update available</span>'
      : c.st === 'downloading' ? `<div>Downloading ${Math.round(c.p)}%</div><div class="cprog"><div style="width:${c.p}%"></div></div>`
      : c.st === 'done' ? `<span class="cst">${icon('check_circle', 'fill ok')}Downloaded</span>`
      : `<span class="cst">${icon('warning', 'bad')}<span>Download failed<small>Connection interrupted</small></span></span>`;
    const action = c => c.st === 'ready' || c.st === 'update' ? `<button class="iconbtn" type="button" aria-label="Download ${esc(c.t)}" data-action="crs-dl" data-id="${c.id}">${icon('download')}</button>`
      : c.st === 'downloading' ? `<button class="iconbtn" type="button" aria-label="Cancel downloading ${esc(c.t)}" data-action="crs-cancel" data-id="${c.id}">${icon('cancel')}</button>`
      : c.st === 'failed' ? `<button class="retry" type="button" data-action="crs-dl" data-id="${c.id}">Retry</button>` : '';
    return `<div class="modal crs" role="dialog" aria-modal="true" aria-labelledby="mt" style="max-width:1280px">
      <div class="eyebrow-m">Admin settings</div>${mHead('cloud_download', 'Download courses')}
      <div class="mb"><div class="muted desc">Download available courses and updates to this Player.</div>
        <div class="cfil">
          <label class="field">${icon('search')}<span class="sr">Search courses</span><input id="crsQ" type="search" placeholder="Search courses" value="${esc(m.q)}" data-input="crsQ"></label>
          <select class="select" aria-label="Language" data-change-modal="lang"><option value="all">Language</option>${uniq('lang').map(o => `<option${m.lang === o ? ' selected' : ''}>${o}</option>`).join('')}</select>
          <select class="select" aria-label="Category" data-change-modal="cat"><option value="all">Category</option>${uniq('cat').map(o => `<option${m.cat === o ? ' selected' : ''}>${o}</option>`).join('')}</select>
          <select class="select" aria-label="Worksite"><option>Worksite</option><option>Plant 01</option><option>Plant 02</option><option>Distribution Center</option></select>
        </div>
        <div class="cbar"><b>${plural(list.length, 'course')}</b><small>Last checked: ${m.checked}</small><button class="btn sm" type="button" data-action="crs-check"${m.checking ? ' disabled' : ''}>${m.checking ? '<span class="spin sm"></span>Checking…' : `${icon('sync')}Check for updates`}</button></div>
        <div class="ctbl"><table class="tbl"><thead><tr><th>Course</th><th>Language</th><th>Category</th><th>Updated</th><th>Size</th><th>Status</th><th><span class="sr">Action</span></th></tr></thead>
          <tbody>${list.map(c => `<tr><td><span class="cname">${icon(c.video ? 'videocam' : 'description', 'fill')}${esc(c.t)}</span></td><td>${c.lang}</td><td>${c.cat}</td><td>${c.up}</td><td>${c.mb.toFixed(1)} MB</td><td>${status(c)}</td><td class="act">${action(c)}</td></tr>`).join('') || '<tr><td colspan="7" class="empty">No courses match these filters.</td></tr>'}</tbody></table></div>
        <div class="infobox" style="margin:0">${icon('info')}${busy ? `${plural(busy, 'download')} in progress. Downloaded courses will be available on this Player.` : 'Downloaded courses are available on this Player.'}</div></div>
      <div class="mf"><div class="cfoot"><b>${plural(avail.length, 'course')} available · ${mb} MB</b><small>Failed downloads can be retried individually.</small></div>
        <div class="row"><button class="btn" type="button" data-action="close-modal">Close</button><button class="btn dark" type="button" data-action="crs-all"${avail.length ? '' : ' disabled'}>${icon('download')}Download all (${avail.length})</button></div></div></div>`;
  }
  function crsDownload(c) {
    if (!state.online) { toast('You’re offline. Courses download when this Player is back online.'); return; }
    c.st = 'downloading'; c.p = c.p && c.p < 100 ? c.p : 0;
  }
  function runCourses() {
    const m = state.modal;
    mEvery(() => {
      if (state.modal !== m) return;
      let changed = false;
      state.courses.forEach(c => { if (c.st === 'downloading') { c.p = Math.min(100, c.p + 3); if (c.p >= 100) c.st = 'done'; changed = true; } });
      if (changed) renderModal();
    }, 300);
  }

  // Multi-select filter dialogs: Worksites, Groups, Dynamic Groups
  function filterList(m) {
    const q = m.q.trim().toLowerCase();
    return FILTERS[m.key].opts.filter(o => (!q || o.toLowerCase().includes(q)) && (!m.showSel || m.sel.includes(o)));
  }
  function modalFilter(m) {
    const cfg = FILTERS[m.key]; const list = filterList(m);
    const nOn = list.filter(o => m.sel.includes(o)).length;
    return `<div class="modal fdlg" role="dialog" aria-modal="true" aria-labelledby="mt" style="max-width:748px">
      <div class="mh"><h2 id="mt">${cfg.title}</h2><button type="button" class="iconbtn" aria-label="Close" data-action="close-modal">${icon('close')}</button></div>
      <div class="mb"><label class="field">${icon('search')}<span class="sr">${cfg.ph}</span><input id="fq" type="search" placeholder="${cfg.ph}" value="${esc(m.q)}" data-input="fq" autofocus></label>
        <div class="fmeta"><span>${plural(list.length, 'result')}</span><button class="lnk" type="button" data-action="f-showsel">${m.showSel ? 'Show all' : `Show selected (${m.sel.length})`}</button></div></div>
      <div class="flist">${list.length ? `<label class="fall"><input type="checkbox" class="check" id="fAll" data-action="f-all"${nOn === list.length ? ' checked' : ''}${nOn && nOn < list.length ? ' data-ind' : ''}> Select all results</label>` : ''}
        ${list.map(o => `<label class="${m.sel.includes(o) ? 'on' : ''}"><input type="checkbox" class="check" data-action="f-toggle" data-val="${esc(o)}"${m.sel.includes(o) ? ' checked' : ''}> ${esc(o)}</label>`).join('') || '<div class="empty" style="padding:20px 32px">No matches.</div>'}</div>
      <div class="fsum"><span>${m.sel.length} selected</span><button class="lnk" type="button" data-action="f-clear"${m.sel.length ? '' : ' disabled'}>Clear selection</button></div>
      <div class="mf"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn dark" type="button" data-action="f-apply">Apply</button></div></div>`;
  }

  // End session confirmation (Training)
  function modalEndSession() {
    const tr = state.tr, sel = selActs(), left = sel.length - tr.ai - 1;
    return `<div class="modal cnf" role="alertdialog" aria-modal="true" aria-labelledby="mt" aria-describedby="md" style="max-width:612px">
      ${mHead('warning', 'End session?').replace('fill lead', 'lead')}
      <div class="mb" id="md"><p>Responses collected so far are saved.</p><p>${left > 0 ? `${plural(left, 'activity')} after this one won’t be played, and the session is marked “Ended early”.` : 'The current activity stops here.'}</p></div>
      <div class="mf"><button class="btn" type="button" data-action="close-modal" autofocus>Keep training</button><button class="btn dark" type="button" data-action="end-session">End session</button></div></div>`;
  }

  // Activity details (chevron on a library row)
  function modalDetails(m) {
    const a = act(m.id); const on = state.selActs.includes(a.id);
    return `<div class="modal ad" role="dialog" aria-modal="true" aria-labelledby="mt" style="max-width:800px">
      <div class="mh"><h2 id="mt">Activity details</h2><button type="button" class="iconbtn" aria-label="Close" data-action="close-modal">${icon('close')}</button></div>
      <div class="mb"><h3 class="adt">${esc(a.title)}</h3>
        <div class="admeta"><div>${icon('contact_page', 'fill')}<div><small>Category</small>${esc(a.cat)}</div></div><span class="vr" aria-hidden="true"></span><div>${icon('schedule')}<div><small>Duration</small>${a.dur} min</div></div></div>
        <h4>Description</h4><p>${esc(a.long)}</p>
        <h4>Competencies</h4><ul>${a.comp.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
        <h4>Available languages</h4><div class="chips"><span class="pill">English</span><span class="pill">Spanish</span></div>
        <div class="note2">${icon('info')}Choose playback language in Preview session.</div></div>
      <div class="mf"><button class="btn" type="button" data-action="close-modal">Close</button><button class="btn dark" type="button" data-action="detail-toggle" data-id="${a.id}" autofocus>${icon(on ? 'remove' : 'add')}${on ? 'Remove from session' : 'Add to session'}</button></div></div>`;
  }

  // Upload: pending → in progress → complete
  function modalUpload(m) {
    const recs = state.selEmps.length * selActs().length;
    const up = Math.round(m.p / 100 * recs);
    const done = m.p >= 100;
    const summary = `<div class="ov-line">Session summary</div>
      <div class="kv"><div><span>Session</span><span>${esc(curSes().name)}</span></div><div><span>Session ID</span><span>${curSes().id}</span></div>
        <div><span>Employees</span><span>${state.selEmps.length}</span></div><div><span>Activities</span><span>${selActs().length}</span></div><div><span>Training records</span><span>${recs}</span></div></div>`;
    let box, foot, extra = '';
    if (m.stage === 'pending') {
      const failed = curSes().upload === 'Upload failed';
      box = `<div class="banner${failed ? ' fail' : ''}" style="grid-template-columns:auto 1fr">${icon(failed ? 'cloud_off' : 'cloud_upload', 'fill ic')}<div><b>${failed ? 'Upload failed' : 'Pending upload'}</b><p>${failed ? 'The last attempt was interrupted. Try again now.' : 'Results have not synced to Alchemy Manager.'}</p></div></div>`;
      extra = `<div class="muted">${recs} training records are ready to upload.</div>`;
      if (!state.online) extra += `<div class="muted">You’re offline. Results upload automatically when the connection returns.</div>`;
      foot = `<button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn dark" type="button" data-action="start-upload"${state.online ? ' autofocus' : ' disabled'}>${icon('cloud_upload', 'fill')}Upload results</button>`;
    } else {
      box = `<div class="progbox ${done ? 'ok' : ''}" role="status">${done ? icon('check_circle', 'fill') : '<span class="spin"></span>'}<b>${done ? 'Upload complete' : 'Uploading results'}</b><p>${done ? 'Training records are synced to Alchemy Manager.' : 'Sending training records to Alchemy Manager.'}</p></div>`;
      extra = `<div class="split-line"><span>${up} of ${recs} records uploaded</span><span class="muted num-col">${Math.round(m.p)}%</span></div><div class="bar2"><div style="width:${m.p}%"></div></div>
        <div class="muted" style="font-size:var(--fs-sm)">${done ? 'You can close this window.' : 'Please keep Player open until the upload finishes.'}</div>`;
      foot = done ? '<button class="btn dark" type="button" data-action="close-modal" autofocus>Done</button>' : '<button class="btn" type="button" data-action="cancel-upload">Cancel upload</button>';
    }
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="max-width:640px">
      ${mHead('cloud_upload', 'Upload results')}
      <div class="mb"><div>Send training records to Alchemy Manager.</div>${mgrStatus()}${box}${summary}${extra}</div>
      <div class="mf">${foot}</div></div>`;
  }
  // Background upload of queued sessions (top bar Upload while a sync is running)
  function modalUploadBg() {
    const s = state.sync, q = SESSIONS.filter(x => x.upload !== 'Uploaded'), done = s.ul >= 100 || !q.length;
    const rows = (done ? [] : q).map((x, i) => `<div class="r"><b>${esc(x.name)}<small class="muted" style="display:block;font-weight:400;font-size:var(--fs-sm)">${x.id} · ${x.emps} employees</small></b><span class="stt">${i === 0 ? `<span class="spin sm"></span>Uploading · ${s.ul}%<span class="mini-bar"><div style="width:${s.ul}%"></div></span>` : `${icon('schedule', 'q')}Queued`}</span></div>`).join('');
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="max-width:640px">
      ${mHead('cloud_upload', 'Upload results')}
      <div class="mb"><div>Send training records to Alchemy Manager.</div>${mgrStatus()}
        <div class="progbox ${done ? 'ok' : ''}" role="status">${done ? icon('check_circle', 'fill') : '<span class="spin"></span>'}<b>${done ? 'Upload complete' : 'Uploading results'}</b><p>${done ? 'All sessions are synced to Alchemy Manager.' : `Uploading 1 of ${plural(q.length, 'session')}.`}</p></div>
        ${rows ? `<div class="dl-tbl"><div class="r h"><span>Session</span><span>Status</span></div>${rows}</div>` : ''}
        <div class="split-line ov-line"><span>Overall progress</span><span class="num-col">${done ? 100 : s.ul}%</span></div>
        <div class="bar2"><div style="width:${done ? 100 : s.ul}%"></div></div>
        <div class="muted" style="font-size:var(--fs-sm)">${done ? 'You can close this window.' : 'Uploads run in the background. Hide this window to keep working.'}</div></div>
      <div class="mf"><button class="btn ${done ? 'dark' : ''}" type="button" data-action="close-modal" autofocus>${done ? 'Close' : 'Hide'}</button></div></div>`;
  }
  function runUpload() {
    const m = state.modal; m.stage = 'progress'; m.p = 0; renderModal();
    mEvery(() => {
      if (state.modal !== m || m.p >= 100) return;
      m.p = Math.min(100, m.p + 6 + Math.random() * 6);
      if (m.p >= 100) { curSes().upload = 'Uploaded'; render(); }
      renderModal();
    }, 280);
  }

  // Response history
  function modalHistory(m) {
    const tr = state.tr || newRun();
    const a = selActs()[tr.ai];
    const qs = Array.from({ length: a.questions }, (_, i) => i + 1);
    const q = m.q || tr.q;
    const rows = q === 2 ? RESPONSE_LOG : RESPONSE_LOG.slice(1, 8).map((r, i) => [r[0], `09:0${q + 1}:${String(10 + i * 3).padStart(2, '0')}`, r[2], 'Initial', 'A', true, 'A']);
    return `<div class="modal rh" role="dialog" aria-modal="true" aria-labelledby="mt" style="max-width:1160px">
      ${mHead('history', 'Response history').replace('fill lead', 'lead')}
      <div class="mb">
        <div>${esc(a.title)}</div>
        <div class="row1"><select class="select" aria-label="Question" data-change-modal="q">${qs.map(n => `<option value="${n}"${n === q ? ' selected' : ''}>Question ${n} of ${a.questions}</option>`).join('')}</select>
          <span class="pill">${q < tr.q ? 'Question closed' : 'Question open'}</span></div>
        <h3>${q === 2 ? 'Before entering a production area, what should you check?' : `Question ${q}: What does the “E-STOP RESET” button do?`}</h3>
        <div class="opts">${q === 2 ? 'A: Required protective equipment · B: The break schedule · C: The weather forecast · D: Available parking' : 'A: Stops all activity and sounds an alarm · B: Speeds up productivity · C: Nothing · D: Sounds an alarm'}</div>
        <div class="infobox" style="align-items:flex-start">${icon('info')}<div>Employees can change answers while the question is open.<br>Once a correct answer is received, it is retained even if a later response is incorrect.</div></div>
        <div class="counts"><span>${rows.length} responses · ${state.selEmps.length} employees · ${q === 2 ? '1 remediation round' : 'no remediation'}</span><span>Received order: oldest first</span></div>
        <div class="scroll-x"><table class="tbl"><thead><tr><th>Remote #</th><th>Received</th><th>Employee</th><th>Round</th><th>Answer</th><th>Result</th><th>Retained</th></tr></thead>
          <tbody>${rows.map(r => `<tr${r[7] ? ' class="hl"' : ''}><td>${r[0]}</td><td class="num-col">${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td>
            <td><span class="res ${r[5] ? 'ok' : 'bad'}">${icon(r[5] ? 'check_circle' : 'close', r[5] ? 'fill' : '')}${r[5] ? 'Correct' : 'Incorrect'}</span></td>
            <td>${r[6]}${r[7] ? ' <span class="res ok">' + icon('check_circle', 'fill') + '</span>' : ''}</td></tr>`).join('')}</tbody></table></div>
        <div class="muted" style="font-size:14px">Retained shows the answer kept for scoring after each response.</div>
      </div>
      <div class="mf"><button class="btn dark" type="button" data-action="close-modal">Close</button></div></div>`;
  }

  // Single-field name dialog: "Save as playlist" / "Add Playlist Name", and the top-bar training location (m.room).
  function modalPlaylist(m) {
    const t = m.room
      ? { h: 'Training location', d: 'Enter where this training takes place. You can change it anytime.', l: 'Location', b: 'Save location' }
      : { h: 'Save playlist', d: 'Save these activities as a playlist for future sessions.', l: 'Playlist name', b: 'Save playlist' };
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="max-width:612px">
      ${mHead('playlist_add', t.h).replace(icon('playlist_add', 'fill lead'), '')}
      <div class="mb"><div>${t.d}</div>
        <label for="plName" style="font-weight:700">${t.l} <span style="color:var(--error)">*</span></label>
        <label class="field" style="height:48px"><input id="plName" autofocus autocomplete="off" value="${esc(m.name)}" data-input="plName"${m.room ? ' placeholder="e.g. Room 57, Plant 01 break room"' : ''}></label></div>
      <div class="mf" style="border:0;margin-top:0"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn dark" type="button" data-action="confirm-playlist"${m.name.trim() ? '' : ' disabled'}>${t.b}</button></div></div>`;
  }

  // ---------- Routing and rendering ----------
  const ROUTES = { home: viewHome, sessions: viewSessions, 'select-activities': viewSelect, 'add-employees': viewAdd, 'preview': viewPreview, 'training': viewTraining, 'results': viewResults };
  const TITLES = { home: 'Alchemy Player', sessions: 'Recent sessions', 'select-activities': 'Select activities', 'add-employees': 'Add employees', preview: 'Preview session', training: 'Training in progress', results: 'Session results' };
  function route() { const r = location.hash.slice(1); return ROUTES[r] ? r : 'home'; }
  // Shareable entry points for the three start-page states in the Figma file.
  function applyAlias() {
    const h = location.hash.slice(1);
    if (h === 'home-paused') { state.tr = { ai: 1, q: 1, sec: 0, paused: true, got: 0 }; state.home = 'paused'; state.online = true; }
    else if (h === 'home-offline') { state.online = false; }
    else if (h === 'home-ready') { state.home = 'ready'; state.online = true; }
    else return;
    history.replaceState(null, '', '#home');
  }
  // Nav icons pulse while a background sync runs; status bar reflects connection state.
  function syncNav() {
    const s = state.sync, r = lastRoute;
    const dlBusy = state.online && autoOn() && s.dl < 100, ulBusy = state.online && s.ul < 100 && queuedUploads() > 0;
    const di = $('#navDlIcon'), ui = $('#navUlIcon');
    di.textContent = dlBusy ? 'cloud_sync' : 'cloud_download'; di.classList.toggle('pulse', dlBusy);
    ui.textContent = ulBusy ? 'cloud_sync' : 'cloud_upload'; ui.classList.toggle('pulse', ulBusy);
    const mgr = $('#stMgr'), base = $('#stBase');
    mgr.innerHTML = state.online ? `${icon('check_circle', 'fill ok')}Alchemy Manager connected` : `${icon('do_not_disturb_on', 'warnic')}Alchemy Manager disconnected`;
    mgr.title = state.online ? 'Prototype: select to simulate going offline' : 'Prototype: select to reconnect';
    const baseOn = r !== 'home' && r !== 'sessions';
    base.innerHTML = baseOn ? `${icon('check_circle', 'fill ok')}Base Station connected` : `${icon('do_not_disturb_on', 'warnic')}Base Station disconnected`;
  }
  function guard(r) {
    if ((r === 'add-employees' || r === 'preview' || r === 'training') && !state.selActs.length) return 'select-activities';
    if ((r === 'preview' || r === 'training') && !state.selEmps.length) return 'add-employees';
    return r;
  }
  let lastRoute = null;
  function render() {
    let r = guard(route());
    if (r !== route()) { history.replaceState(null, '', '#' + r); }
    const ws = $('#workspace');
    const keep = r === lastRoute ? { top: window.scrollY, id: document.activeElement && document.activeElement.id, sel: document.activeElement && document.activeElement.selectionStart } : null;
    ws.innerHTML = ROUTES[r]();
    document.querySelectorAll('.check[data-ind]').forEach(c => { c.indeterminate = true; });
    const all = $('#actAll'); if (all) { const l = filteredActivities(); const n = l.filter(a => state.selActs.includes(a.id)).length; all.indeterminate = n > 0 && n < l.length; }
    const ea = $('#empAll'); if (ea) { const l = filteredEmployees(); const n = l.filter(e => state.selEmps.includes(e.id)).length; ea.indeterminate = n > 0 && n < l.length; }
    if (keep) { window.scrollTo(0, keep.top); if (keep.id) { const el = document.getElementById(keep.id); if (el) { el.focus(); if (keep.sel != null && el.setSelectionRange) try { el.setSelectionRange(keep.sel, keep.sel); } catch (e) {} } } }
    else window.scrollTo(0, 0);
    if (r !== lastRoute) {
      clearTimers();
      if (r === 'training') every(tickTraining, 1000);
      document.title = r === 'home' ? 'Alchemy Player' : TITLES[r] + ' · Alchemy Player';
    }
    lastRoute = r;
    syncNav();
    bindDrag();
    wrapLinks(ws);
  }
  function wrapLinks(root) {
    root.querySelectorAll('.link').forEach(l => {
      [...l.childNodes].forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) { const u = document.createElement('span'); u.className = 'u'; u.textContent = n.textContent; n.replaceWith(u); } });
    });
  }
  function go(r) { if (location.hash === '#' + r) render(); else location.hash = r; }

  // Drag to reorder session activities
  function bindDrag() {
    const q = $('#queue'); if (!q) return;
    let dragId = null;
    q.querySelectorAll('li').forEach(li => {
      li.addEventListener('dragstart', e => { dragId = li.dataset.id; li.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragId); } catch (err) {} });
      li.addEventListener('dragend', () => li.classList.remove('dragging'));
      li.addEventListener('dragover', e => { e.preventDefault(); });
      li.addEventListener('drop', e => {
        e.preventDefault();
        const to = li.dataset.id; if (!dragId || dragId === to) return;
        const arr = state.selActs.filter(id => id !== dragId);
        arr.splice(arr.indexOf(to) + (state.selActs.indexOf(dragId) < state.selActs.indexOf(to) ? 1 : 0), 0, dragId);
        state.selActs = arr; render();
      });
    });
  }

  // ---------- Events ----------
  document.addEventListener('click', e => {
    const goEl = e.target.closest('[data-go]');
    const el = e.target.closest('[data-action]');
    const menu = $('#moreMenu');
    if (!e.target.closest('#moreMenu') && !e.target.closest('#moreBtn') && !menu.hidden) { menu.hidden = true; $('#moreBtn').setAttribute('aria-expanded', 'false'); }
    if (notif.open && e.isTrusted && !e.target.closest('#notifPanel') && !e.target.closest('#bellBtn')) setNotifs(false);
    if (goEl) { e.preventDefault(); go(goEl.dataset.go); return; }
    if (!el) return;
    const a = el.dataset.action, id = el.dataset.id;
    if (a === 'scrim') { if (e.target === el) { if (state.modal && state.modal.type === 'cancelDl') { state.modal = state.modal.prev; renderModal(); } else closeModal(); } return; }
    if (el.closest('#moreMenu')) { menu.hidden = true; }
    switch (a) {
      case 'toast': toast(el.dataset.msg); break;
      case 'toggle-notifs': setNotifs(!notif.open, !notif.open ? false : true); break;
      case 'n-close': setNotifs(false, true); break;
      case 'n-tab': notif.tab = el.dataset.tab; renderNotifs(); break;
      case 'n-read': notif.list.find(x => x.id === id).unread = false; renderNotifs(); { const f = $(`#notifPanel [data-id="${id}"].nact`); if (f) f.focus(); } break;
      case 'n-all-read': notif.list.forEach(x => { x.unread = false; }); renderNotifs(); break;
      case 'n-dismiss': notif.list = notif.list.filter(x => x.id !== id); renderNotifs(); { const f = $('#notifPanel .nlist .nbtn, #notifPanel [data-action="n-close"]'); if (f) f.focus(); } break;
      case 'n-see-all': toast('The full Notifications page isn’t part of this prototype yet.'); break;
      case 'n-act': {
        const x = notif.list.find(y => y.id === id); x.unread = false; setNotifs(false);
        if (x.run.startsWith('go:')) go(x.run.slice(3));
        else if (x.run.startsWith('toast:')) toast(x.run.slice(6));
        else if (x.run === 'open-courses') $('#moreMenu [data-action="open-courses"]').click();
        else $(`.topnav [data-action="${x.run}"]`).click();
        break;
      }
      case 'toggle-menu': menu.style.right = '120px'; menu.hidden = !menu.hidden; el.setAttribute('aria-expanded', String(!menu.hidden)); break;
      case 'tab': state.tab = el.dataset.tab; render(); break;
      case 'rtab': state.rosterTab = el.dataset.tab; render(); break;
      case 'toggle-act': {
        if (e.target.matches('input') && el.matches('tr')) return; // checkbox handles itself
        setActs(state.selActs.includes(id) ? state.selActs.filter(x => x !== id) : [...state.selActs, id]);
        render(); break;
      }
      case 'remove-act': setActs(state.selActs.filter(x => x !== id)); render(); break;
      case 'toggle-all-acts': {
        const l = filteredActivities(); const allOn = l.every(x => state.selActs.includes(x.id));
        setActs(allOn ? state.selActs.filter(x => !l.some(y => y.id === x)) : [...state.selActs, ...l.filter(x => !state.selActs.includes(x.id)).map(x => x.id)]);
        render(); break;
      }
      case 'toggle-customize': state.customize = !state.customize; render(); break;
      case 'confirm-end': openModal({ type: 'endSes' }); break;
      case 'restore-sel': state.selActs = state.lastSel || []; state.lastSel = null; render(); break;
      case 'open-details': openModal({ type: 'details', id }); break;
      case 'detail-toggle': setActs(state.selActs.includes(id) ? state.selActs.filter(x => x !== id) : [...state.selActs, id]); closeModal(); render(); toast(state.selActs.includes(id) ? `Added “${act(id).title}” to the session.` : `Removed “${act(id).title}” from the session.`); break;
      case 'go-home': {
        e.preventDefault();
        if (lastRoute === 'training' && state.tr) { state.tr.paused = true; state.home = 'paused'; toast('Session paused. Resume it from the start page.'); }
        go('home'); break;
      }
      case 'resume': state.tr.paused = false; state.home = 'ready'; go('training'); break;
      case 'toggle-online': state.online = !state.online; toast(state.online ? 'Back online. Downloads and uploads resume.' : 'Simulating offline: no connection to Alchemy Manager.'); render(); if (state.modal) renderModal(); break;
      case 'view-results': state.resSes = id; go('results'); break;
      case 'open-filter': { const k = el.dataset.key; openModal({ type: 'filter', key: k, sel: [...state[k]], q: '', showSel: false }); break; }
      case 'f-toggle': { const m = state.modal, v = el.dataset.val; m.sel = m.sel.includes(v) ? m.sel.filter(x => x !== v) : [...m.sel, v]; renderModal(); break; }
      case 'f-all': { const m = state.modal, l = filterList(m); const allOn = l.every(o => m.sel.includes(o)); m.sel = allOn ? m.sel.filter(o => !l.includes(o)) : [...new Set([...m.sel, ...l])]; renderModal(); break; }
      case 'f-clear': state.modal.sel = []; state.modal.showSel = false; renderModal(); break;
      case 'f-showsel': state.modal.showSel = !state.modal.showSel; renderModal(); break;
      case 'f-apply': state[state.modal.key] = [...state.modal.sel]; closeModal(); render(); break;
      case 'open-admin': openModal({ type: 'admin' }); break;
      case 'admin-download': openModal({ type: 'dlSettings', admin: true, pick: { user: true, course: true, media: true } }); break;
      case 'open-courses': openModal({ type: 'courses', q: '', lang: 'all', cat: 'all', checked: 'Today, 9:41 AM' }); runCourses(); break;
      case 'crs-dl': crsDownload(state.courses.find(c => c.id === id)); renderModal(); break;
      case 'crs-cancel': { const c = state.courses.find(x => x.id === id); c.st = c.p ? 'ready' : 'ready'; c.p = 0; renderModal(); toast(`Stopped downloading “${c.t}”.`); break; }
      case 'crs-all': state.courses.filter(c => c.st === 'ready' || c.st === 'update').forEach(crsDownload); renderModal(); break;
      case 'crs-check': { const m = state.modal; m.checking = true; renderModal(); mLater(() => { if (state.modal !== m) return; m.checking = false; m.checked = `Today, ${nowTime()}`; renderModal(); toast('No new course updates found.'); }, 1200); break; }
      case 'open-missing': openModal({ type: 'missing', ids: missingActs().map(a => a.id) }); break;
      case 'dl-missing': runMissing(); break;
      case 'dl-pick': state.modal.pick[el.dataset.k] = el.checked; renderModal(); break;
      case 'dl-auto': state.sync.auto[el.dataset.k] = el.checked; if (el.checked && state.sync.dl >= 100) { /* already up to date */ } render(); renderModal(); break;
      case 'start-download': startDownload(DL_ITEMS.map(([k]) => k).filter(k => state.modal.pick[k])); break;
      case 'download-now': if (!state.online) { toast('You’re offline.'); break; } startDownload(['user', 'course', 'media']); break;
      case 'ask-cancel-download': openModal({ type: 'cancelDl', prev: state.modal }); break;
      case 'keep-download': state.modal = state.modal.prev; renderModal(); break;
      case 'clear-act-filters': state.actSearch = ''; state.actCat = 'all'; state.actLang = 'all'; render(); break;
      case 'toggle-emp': { const i = state.selEmps.indexOf(id); if (i >= 0) state.selEmps.splice(i, 1); else state.selEmps.push(id); render(); break; }
      case 'toggle-all-emps': {
        const l = filteredEmployees(); const allOn = l.every(x => state.selEmps.includes(x.id));
        if (allOn) state.selEmps = state.selEmps.filter(x => !l.some(y => y.id === x)); else l.forEach(x => { if (!state.selEmps.includes(x.id)) state.selEmps.push(x.id); });
        render(); break;
      }
      case 'save-playlist': openModal({ type: 'playlist', name: state.playlistName || 'Morning Shift Safety' }); break;
      case 'edit-room': openModal({ type: 'playlist', room: true, name: state.room }); break;
      case 'confirm-playlist':
        if (state.modal.room) { state.room = state.modal.name.trim(); $('#roomName').textContent = state.room; closeModal(); toast(`Training location set to “${state.room}”.`); break; }
        state.playlistName = state.modal.name.trim(); closeModal(); render(); toast(`Saved playlist “${state.playlistName}”.`); break;
      case 'open-register': {
        const done = state.selEmps.length && state.selEmps.every(x => state.remotes[x]);
        openModal({ type: 'register', step: done ? 'done' : 1, badge: '' }); break;
      }
      case 'register-more': Object.assign(state.modal, { step: 1, badge: '', emp: null, err: '' }); renderModal(); break;
      case 'find-employee': findEmployee(); break;
      case 'reg-emp': {
        // Row remote button: skip the badge step and go straight to waiting for this employee's remote.
        const e = emp(id);
        if (!state.selEmps.includes(id)) state.selEmps.push(id);
        openModal({ type: 'register', step: 2, badge: e.eid, emp: id, reassign: !!state.remotes[id] }); // Cancel keeps any existing remote
        waitForRemote(state.modal, e); render(); break;
      }
      case 'register-next': {
        // Load the next roster employee without a remote and go straight to waiting for their response.
        const nx = nextOnRoster(state.modal.emp);
        if (!nx) { state.modal.step = 'done'; renderModal(); break; } // everyone has a remote
        openModal({ type: 'register', step: 2, badge: emp(nx).eid, emp: nx });
        waitForRemote(state.modal, emp(nx)); break;
      }
      case 'open-download': if (dlJob) { openModal(dlJob); break; } if (dlBusy()) { openModal({ type: 'download', bg: true, items: bgItems() }); break; } openModal({ type: 'dlSettings', admin: false, pick: { user: true, course: true, media: true } }); break;
      case 'cancel-download': {
        const bg = state.modal && state.modal.prev && state.modal.prev.bg;
        if (state.modal && state.modal.prev === dlJob) { clearInterval(dlTimer); dlJob = null; }
        closeModal();
        if (bg) { Object.keys(state.sync.auto).forEach(k => { state.sync.auto[k] = false; }); render(); toast('Download cancelled and automatic download turned off. Finished items stay available.'); }
        else toast('Download cancelled. Items that finished downloading stay available.');
        break;
      }
      case 'open-upload': if (ulBusy()) { openModal({ type: 'uploadBg', bg: true }); break; } { const up = curSes().upload === 'Uploaded'; openModal({ type: 'upload', stage: up ? 'progress' : 'pending', p: up ? 100 : 0 }); break; }
      case 'start-upload': runUpload(); break;
      case 'cancel-upload': closeModal(); toast('Upload cancelled. Results are still pending upload.'); break;
      case 'open-history': openModal({ type: 'history' }); break;
      case 'close-modal': closeModal(); break;
      case 'start-training': {
        state.tr = newRun(); state.home = 'ready';
        const cur = SESSIONS[0]; cur.upload = 'Pending upload'; cur.name = state.playlistName || 'Morning Shift Safety'; cur.emps = state.selEmps.length; cur.acts = String(state.selActs.length); cur.dur = `${totalMin() + 4} min`; cur.status = 'Completed';
        state.resSes = cur.id; go('training'); break;
      }
      case 'pause': state.tr.paused = !state.tr.paused; render(); break;
      case 'next-q': {
        const tr = state.tr, sel = selActs(), a = sel[tr.ai];
        if (tr.q < a.questions) { tr.q++; }
        else if (tr.ai < sel.length - 1) { tr.ai++; tr.q = 1; tr.sec = 0; }
        else { state.home = 'ready'; go('results'); break; }
        tr.got = 0; render(); break;
      }
      case 'end-session': { closeModal(); const tr = state.tr; state.home = 'ready'; const cur = SESSIONS[0]; if (tr.ai < selActs().length - 1) { cur.status = 'Ended early'; cur.acts = `${tr.ai + 1} of ${selActs().length}`; } go('results'); toast('Session ended. Results are ready to upload.'); break; }
      case 'fullscreen': { const m = $('.media'); if (m && m.requestFullscreen) m.requestFullscreen().catch(() => toast('Full screen isn’t available here.')); break; }
    }
  });
  document.addEventListener('input', e => {
    const k = e.target.dataset.input; if (!k) return;
    if (k === 'actSearch') { state.actSearch = e.target.value; render(); }
    if (k === 'empSearch') { state.empSearch = e.target.value; render(); }
    if (k === 'sesSearch') { state.sesSearch = e.target.value; render(); }
    if (k === 'fq') { state.modal.q = e.target.value; renderModal(); }
    if (k === 'crsQ') { state.modal.q = e.target.value; renderModal(); }
    if (k === 'badge') { state.modal.badge = e.target.value; state.modal.err = ''; const b = $('#findBtn'); if (b) b.disabled = !e.target.value.trim(); }
    if (k === 'plName') { state.modal.name = e.target.value; const b = $('[data-action="confirm-playlist"]'); if (b) b.disabled = !e.target.value.trim(); }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.change) { state[t.dataset.change] = t.value; render(); return; }
    if (t.dataset.changeModal) { const k = t.dataset.changeModal; state.modal[k] = k === 'q' ? Number(t.value) : t.value; renderModal(); return; }
    if (t.dataset.setting) {
      const s = state.settings[t.dataset.id]; s[t.dataset.setting] = t.type === 'checkbox' ? t.checked : t.value; render(); return;
    }
    if (t.dataset.global) {
      const k = t.dataset.global, v = t.type === 'checkbox' ? t.checked : t.value;
      state.global[k] = v; state.selActs.forEach(id => { state.settings[id][k] = v; }); render();
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && notif.open && !state.modal) { setNotifs(false, true); return; }
    if (e.key === 'Escape') { if (state.modal && state.modal.type === 'cancelDl') { state.modal = state.modal.prev; renderModal(); return; } if (state.modal) closeModal(); const m = $('#moreMenu'); if (!m.hidden) m.hidden = true; }
    if (e.key === 'Enter' && e.target.id === 'badge') findEmployee();
    if (e.key === 'Enter' && e.target.id === 'plName' && state.modal.name.trim()) { e.preventDefault(); $('[data-action="confirm-playlist"]').click(); } // preventDefault: focus returns to the opener, which would reactivate on Enter
    if (e.key === 'Tab' && state.modal) { // keep focus inside the dialog
      const f = [...document.querySelectorAll('#modalRoot button:not([disabled]), #modalRoot input, #modalRoot select')];
      if (!f.length) return; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  setInterval(tickHome, 1000);
  window.addEventListener('hashchange', () => { applyAlias(); render(); });
  applyAlias();
  render();
})();
