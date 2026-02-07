const copy = [
  {
    id: 'ONB_PAGE_001',
    bg: "linear-gradient(180deg, rgba(11,22,35,0.28), rgba(5,13,22,0.66)), url('https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1100&q=80')",
    title_kr: '하루를 남기는 방식', title_en: 'A way to mark a day',
    body_kr: ['하루는 지나가지만','그날의 모습은 남길 수 있습니다','','이 앱은','순간을 모으기보다','시간을 이어갑니다'],
    body_en: ['Days pass','But how you were that day','can stay'],
    cta_kr: '여정 시작하기 →'
  },
  {
    id: 'ONB_PAGE_002',
    bg: "linear-gradient(180deg, rgba(15,21,34,0.25), rgba(8,14,22,0.68)), url('https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1100&q=80')",
    title_kr: '어제에서 오늘로', title_en: 'From yesterday to today',
    body_kr: ['어제의 당신이','오늘의 당신을 부릅니다','','조금 더 가까이','조금 더 비슷하게','','하루는 그렇게','서로를 닮아갑니다'],
    body_en: ['Yesterday calls to today','Not exactly the same','Just close enough to feel time']
  },
  {
    id: 'ONB_PAGE_003',
    bg: "linear-gradient(180deg, rgba(15,23,35,0.25), rgba(7,12,18,0.66)), url('https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1100&q=80')",
    title_kr: '매일 다른 자리에서', title_en: 'In different places, every day',
    body_kr: ['집에서도','친구 곁에서도','땀을 흘린 뒤에도','','아이는','각자의 하루 속에서','조금씩 자랍니다'],
    body_en: ['At home','With friends','After moving, playing, growing','','Life changes','And so do they']
  },
  {
    id: 'ONB_PAGE_004',
    bg: "linear-gradient(180deg, rgba(18,24,39,0.25), rgba(6,11,18,0.7)), url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1100&q=80')",
    title_kr: '나중에 알게 되는 것들', title_en: 'What you’ll see later',
    body_kr: ['하루하루는','크게 달라 보이지 않지만','','시간이 지나','다시 보면','분명한 변화가 있습니다'],
    body_en: ['Not much changes in a day','But everything changes','when days come together'],
    cta_kr: '여정 시작하기 →'
  }
];

const thumbs = [
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1472120435266-53107fd0c44a?auto=format&fit=crop&w=600&q=80'
];

const state = {
  lang: localStorage.getItem('lang') || 'kr',
  screen: 'home',
  onboardingPage: 0,
  onboardingCompleted: localStorage.getItem('onboardingCompleted') === 'true',
  silhouetteOpacity: Number(localStorage.getItem('silhouetteOpacity') || 45),
  reminderTime: localStorage.getItem('reminderTime') || '20:00',
  auth: localStorage.getItem('auth') || 'guest',
  pay: localStorage.getItem('pay') || 'none', // none | subscribed
  albums: JSON.parse(localStorage.getItem('albums') || '[{"albumId":"a1","title":"Post-workout","createdAt":"2026-01-01"},{"albumId":"a2","title":"Morning Coffee","createdAt":"2026-01-12"},{"albumId":"a3","title":"Sunset Watch","createdAt":"2026-02-01"}]'),
  activeAlbum: localStorage.getItem('activeAlbum') || 'a1',
  entries: JSON.parse(localStorage.getItem('entries') || '{}'),
  adCooldownAt: 0,
  adCount: 0,
  export: {
    range: '7',
    speed: 'normal',
    resolution: '1080p',
    removeWatermark: false,
  },
  exportJob: {
    status: 'idle', // idle | running | done | canceled
    progress: 0,
    updatedAt: null,
  },
  paywallPlan: localStorage.getItem('paywallPlan') || 'yearly',
  paywallFrom: 'home',
  pendingPremiumAction: null,
  billingState: 'idle', // idle | restoring | purchasing
  adGateState: 'idle', // idle | loading | showing | rewarded | canceled | failed
  exportHistory: JSON.parse(localStorage.getItem('exportHistory') || '[]'),
};

const $ = (s) => document.querySelector(s);
const fmtDate = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
let adTimer = null;
let exportTimer = null;
let cameraFacingMode = 'environment';
const LEGAL_URLS = {
  privacy: '',
  terms: '',
};

const AdsService = {
  showRewarded({ onTick, onFinished, onCanceled }) {
    if (adTimer) return Promise.reject(new Error('ad_already_running'));

    return new Promise((resolve, reject) => {
      let remain = 30;
      const cleanup = () => {
        if (adTimer) {
          clearInterval(adTimer);
          adTimer = null;
        }
        window.__cancelRewardedAd = null;
      };

      onTick(remain);
      adTimer = setInterval(() => {
        remain -= 1;
        onTick(Math.max(0, remain));
        if (remain <= 0) {
          cleanup();
          onFinished?.();
          resolve({ rewarded: true });
        }
      }, 1000);

      const cancel = () => {
        cleanup();
        onCanceled?.();
        reject(new Error('ad_canceled'));
      };

      window.__cancelRewardedAd = cancel;
    });
  },
};

const BillingService = {
  purchase(plan) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ok: true, plan }), 1200);
    });
  },
  restore() {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ok: true, restored: true }), 1200);
    });
  },
};


const CameraService = {
  stream: null,
  isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },
  async start(videoEl, facingMode = 'environment') {
    if (!this.isSupported()) throw new Error('camera_not_supported');
    this.stop();
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: false,
    });
    videoEl.srcObject = this.stream;
    await videoEl.play();
  },
  stop() {
    if (!this.stream) return;
    this.stream.getTracks().forEach((t) => t.stop());
    this.stream = null;
  },
  async captureFrame(videoEl) {
    if (!videoEl.videoWidth || !videoEl.videoHeight) throw new Error('camera_frame_unavailable');
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((value) => {
        if (!value) reject(new Error('camera_blob_failed'));
        else resolve(value);
      }, 'image/jpeg', 0.92);
    });
    return blob;
  },
};

const FileService = {
  async saveImage(blob, filename) {
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'JPEG Image', accept: { 'image/jpeg': ['.jpg', '.jpeg'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { method: 'file-system-access' };
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { method: 'download' };
  },
};

function save() {
  localStorage.setItem('lang', state.lang);
  localStorage.setItem('onboardingCompleted', String(state.onboardingCompleted));
  localStorage.setItem('silhouetteOpacity', String(state.silhouetteOpacity));
  localStorage.setItem('reminderTime', state.reminderTime);
  localStorage.setItem('auth', state.auth);
  localStorage.setItem('pay', state.pay);
  localStorage.setItem('albums', JSON.stringify(state.albums));
  localStorage.setItem('activeAlbum', state.activeAlbum);
  localStorage.setItem('entries', JSON.stringify(state.entries));
  localStorage.setItem('paywallPlan', state.paywallPlan);
  localStorage.setItem('exportHistory', JSON.stringify(state.exportHistory));
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 1800);
}

function openModal(html) { $('#modal').innerHTML = html; $('#modalBackdrop').classList.remove('hidden'); }
function closeModal() { $('#modalBackdrop').classList.add('hidden'); }
$('#modalBackdrop').addEventListener('click', (e) => { if (e.target.id === 'modalBackdrop') closeModal(); });

function setTitle(v) { $('#screenTitle').textContent = v; }
function showNav(v = true) { $('#bottomNav').classList.toggle('hidden', !v); }
function showTopBar(v = true) { $('.top-bar').classList.toggle('hidden', !v); }
function showFab(v = true) { $('#fab').classList.toggle('hidden', !v); }


function goPaywall(from = state.screen, pendingAction = null) {
  state.paywallFrom = from;
  state.pendingPremiumAction = pendingAction;
  state.screen = 'paywall';
  render();
}

function runPendingPremiumAction() {
  if (!state.pendingPremiumAction) return;
  if (state.pendingPremiumAction === 'unlock4k') {
    state.export.resolution = '4k';
    toast('4K 잠금 해제됨');
  }
  if (state.pendingPremiumAction === 'toggleWatermark') {
    state.export.removeWatermark = true;
    toast('워터마크 제거가 활성화되었습니다.');
  }
  state.pendingPremiumAction = null;
}

function countAlbumEntries(albumId) {
  return Object.keys(state.entries).filter((k) => k.startsWith(`${albumId}:`)).length;
}

function onboardingView() {
  showNav(false); showTopBar(false); showFab(false);
  const page = copy[state.onboardingPage];
  const body = (state.lang === 'kr' ? page.body_kr : page.body_en).join('\n');
  $('#main').innerHTML = `
    <section class="onb-wrap">
      <div class="onb-visual" style="background:${page.bg}">
        <div class="onb-controls"><span>⌗</span><span>⚡</span></div>
        <div class="ghost-shape"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 22H22L12 2Z" fill="white" fill-opacity="0.18"></path><path d="M12 2L2 22H22L12 2Z" stroke="white" stroke-dasharray="4 2" stroke-width="0.7"></path></svg></div>
        <div class="focus-box"><div class="focus-dot"></div></div>
        <div class="align-badge">🪄 ALIGNING...</div>
      </div>
      <div class="onb-content">
        <div class="dots">${copy.map((_,i)=>`<span class="dot ${i===state.onboardingPage?'active':''}"></span>`).join('')}</div>
        <h2 class="onb-title">${state.lang === 'kr' ? page.title_kr : page.title_en}</h2>
        <p class="onb-subtitle">${state.lang === 'kr' ? page.title_en : page.title_kr}</p>
        <p class="onb-desc">${body}</p>
        <div class="onb-actions">
          ${page.cta_kr ? `<button class="cta-main" id="ctaBtn">${state.lang === 'kr' ? page.cta_kr : 'Start Journey →'}</button>` : `<button class="btn secondary" id="nextBtn">다음으로</button>`}
          <button class="cta-subtle" id="loginBtn">Already have an account? <b>Log in</b></button>
          ${state.onboardingPage > 0 ? '<button class="btn secondary" id="prevBtn">이전 페이지</button>' : ''}
        </div>
      </div>
    </section>`;

  const next = () => {
    if (state.onboardingPage === copy.length - 1) {
      state.onboardingCompleted = true;
      state.screen = 'home';
      save();
      toast('온보딩 완료!');
      render();
      return;
    }
    state.onboardingPage += 1;
    onboardingView();
  };
  $('#ctaBtn')?.addEventListener('click', next);
  $('#nextBtn')?.addEventListener('click', next);
  $('#prevBtn')?.addEventListener('click', () => { state.onboardingPage -= 1; onboardingView(); });
  $('#loginBtn')?.addEventListener('click', () => toast('로그인 화면은 다음 단계에서 연결됩니다.'));

  let startX = 0;
  $('#main').ontouchstart = (e) => { startX = e.touches[0].clientX; };
  $('#main').ontouchend = (e) => {
    const delta = e.changedTouches[0].clientX - startX;
    if (Math.abs(delta) < 35) return;
    if (delta < 0 && state.onboardingPage < copy.length - 1) state.onboardingPage += 1;
    if (delta > 0 && state.onboardingPage > 0) state.onboardingPage -= 1;
    onboardingView();
  };
}

function loopCard(a, i) {
  const total = countAlbumEntries(a.albumId) || (i + 1) * 20;
  const streak = Math.max(3, Math.min(42, total % 45));
  const doneToday = !!state.entries[`${a.albumId}:${fmtDate()}`];
  const statusText = doneToday ? 'Perfect streak!' : `${streak} Day Streak`;
  const progress = doneToday ? 100 : Math.min(95, 35 + streak);

  return `
    <article class="loop-card">
      <div class="loop-body">
        <div class="loop-thumb" style="background-image:url('${thumbs[i % thumbs.length]}')"><span class="loop-day">${total}</span></div>
        <div class="loop-content">
          <div>
            <h3 class="loop-title">${a.title}</h3>
            <p class="loop-meta">Started ${new Date(a.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p>
            <div class="badge-line ${doneToday ? 'ok' : ''}"><span class="material-symbols-outlined">${doneToday ? 'verified' : 'local_fire_department'}</span><span>${statusText}</span></div>
          </div>
          <button class="card-btn" data-snap="${a.albumId}">${doneToday ? 'Done for today' : 'Snap Today'}</button>
        </div>
      </div>
      <div class="progress-wrap"><div class="progress" style="width:${progress}%"></div></div>
    </article>`;
}

function homeView() {
  showNav(true); showTopBar(true); showFab(true); setTitle('Loopic');
  const totalSnaps = Object.keys(state.entries).length || 1248;
  const topStreak = Math.max(...state.albums.map((a) => countAlbumEntries(a.albumId)), 42);

  $('#main').innerHTML = `
    <section class="stats-grid">
      <article class="stat-card"><p class="stat-label"><span class="material-symbols-outlined">photo_library</span>Total Snaps</p><p class="stat-value">${totalSnaps}</p></article>
      <article class="stat-card"><p class="stat-label"><span class="material-symbols-outlined">local_fire_department</span>Top Streak</p><p class="stat-value">${topStreak}<span style="font-size:13px;color:var(--muted)"> days</span></p></article>
    </section>
    <section class="section-head"><h2>Active Loops</h2><button id="goExport">Export</button></section>
    <section class="loop-list">${state.albums.map(loopCard).join('')}</section>
    <section class="empty-box"><span class="material-symbols-outlined" style="font-size:34px;color:var(--primary)">add_a_photo</span><p style="margin-top:8px">Start a new time loop</p></section>`;

  $('#goExport').onclick = () => { state.screen = 'export'; setActiveNav('export'); render(); };
  document.querySelectorAll('[data-snap]').forEach((btn) => {
    btn.onclick = () => {
      state.activeAlbum = btn.dataset.snap;
      state.screen = 'camera';
      setActiveNav('camera');
      save();
      render();
    };
  });
}

function cameraView() {
  showNav(false); showTopBar(false); showFab(false); setTitle('Camera');
  const today = fmtDate();
  const key = `${state.activeAlbum}:${today}`;
  const exists = !!state.entries[key];
  const streak = Math.max(1, countAlbumEntries(state.activeAlbum));

  $('#main').innerHTML = `
    <section class="camera-shell">
      <div class="camera-stage cinematic">
        <video id="cameraPreview" class="camera-preview" playsinline autoplay muted></video>
        <div class="camera-vignette"></div>

        <div class="camera-top-actions">
          <button class="cam-icon-btn" id="camClose">✕</button>
          <div class="cam-icon-group">
            <button class="cam-icon-btn" id="timerBtn">⏱</button>
            <button class="cam-icon-btn" id="flipBtn">⟲</button>
          </div>
        </div>

        <div class="camera-meta">
          <span class="streak-pill">🔥 ${streak} Day Streak</span>
          <span class="date-pill">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>

        <div class="ghost-panel">
          <div class="ghost-head"><span>Ghost Frame Opacity</span><b>${state.silhouetteOpacity}%</b></div>
          <input id="opacity" class="slider ghost-slider" type="range" min="0" max="100" value="${state.silhouetteOpacity}">
        </div>

        <div id="cameraStatus" class="camera-status">카메라 연결 중...</div>

        <div class="camera-bottom-actions">
          <button class="mini-action" id="galleryBtn">Gallery</button>
          <button class="shutter-btn" id="captureBtn" aria-label="capture"></button>
          <button class="mini-action" id="retakeBtn">Retake</button>
        </div>
      </div>

      <input id="upload" type="file" accept="image/*" class="hidden" />
      <p class="camera-hint">${exists ? '오늘 기록이 있어요. 저장하면 덮어쓰기 됩니다.' : '어제 프레임과 정렬해 오늘을 기록해보세요.'}</p>
    </section>`;

  const videoEl = $('#cameraPreview');
  const statusEl = $('#cameraStatus');
  const opacityEl = $('#opacity');
  const opacityLabel = document.querySelector('.ghost-head b');

  opacityEl.oninput = (e) => {
    state.silhouetteOpacity = Number(e.target.value);
    opacityLabel.textContent = `${state.silhouetteOpacity}%`;
    save();
  };

  const saveEntry = async (blob, source) => {
    const entryKey = `${state.activeAlbum}:${fmtDate()}`;
    if (state.entries[entryKey] && !confirm('오늘 기록을 덮어쓸까요?')) return;

    const filename = `loopic-${state.activeAlbum}-${fmtDate()}-${Date.now()}.jpg`;
    try {
      await FileService.saveImage(blob, filename);
      state.entries[entryKey] = { imageUri: filename, updatedAt: new Date().toISOString(), source };
      save();
      toast('저장 완료!');
      state.screen = 'home';
      setActiveNav('home');
      render();
    } catch {
      toast('파일 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const initCamera = async () => {
    if (!CameraService.isSupported()) {
      statusEl.textContent = '이 브라우저는 카메라 SDK(WebRTC)를 지원하지 않습니다.';
      return;
    }

    try {
      await CameraService.start(videoEl, cameraFacingMode);
      statusEl.classList.add('hidden');
    } catch {
      statusEl.textContent = '카메라 권한이 필요합니다. 브라우저 설정에서 허용해주세요.';
      statusEl.classList.remove('hidden');
    }
  };

  $('#captureBtn').onclick = async () => {
    if (!CameraService.stream) {
      toast('카메라 연결 후 다시 시도해주세요.');
      return;
    }

    try {
      const blob = await CameraService.captureFrame(videoEl);
      await saveEntry(blob, 'camera');
    } catch {
      toast('촬영에 실패했습니다. 다시 시도해주세요.');
    }
  };

  $('#upload').onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await saveEntry(file, 'upload');
    e.target.value = '';
  };

  $('#galleryBtn').onclick = () => $('#upload').click();
  $('#retakeBtn').onclick = () => {
    toast('프레임을 재정렬했어요.');
    initCamera();
  };
  $('#camClose').onclick = () => {
    state.screen = 'home';
    setActiveNav('home');
    render();
  };
  $('#timerBtn').onclick = () => toast('3초 타이머는 다음 단계에서 연결됩니다.');
  $('#flipBtn').onclick = async () => {
    cameraFacingMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    await initCamera();
    toast(cameraFacingMode === 'user' ? '전면 카메라' : '후면 카메라');
  };

  initCamera();
}
function timelineView() {
  showNav(true); showTopBar(true); showFab(false); setTitle('Calendar');
  const now = new Date();
  const y = now.getFullYear(); const m = now.getMonth();
  const start = new Date(y, m, 1); const days = new Date(y, m + 1, 0).getDate();
  let grid = '';
  for (let i = 0; i < start.getDay(); i++) grid += '<span></span>';
  for (let d = 1; d <= days; d++) {
    const date = new Date(y, m, d).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
    const key = `${state.activeAlbum}:${date}`;
    const cls = `${state.entries[key] ? 'done' : ''} ${date === fmtDate() ? 'today' : ''}`;
    grid += `<button class="day ${cls}" data-date="${date}">${d}</button>`;
  }
  $('#main').innerHTML = `<section class="card"><h2>${y}.${m + 1} 기록</h2><div class="timeline-grid" style="margin-top:12px;">${grid}</div><div class="btn-row"><button id="toExport" class="btn primary">타임랩스 내보내기</button></div></section>`;
  document.querySelectorAll('.day').forEach((el) => {
    el.onclick = () => {
      const key = `${state.activeAlbum}:${el.dataset.date}`;
      toast(state.entries[key] ? `${el.dataset.date} 기록 있음` : `${el.dataset.date} 비어 있음`);
    };
  });
  $('#toExport').onclick = () => { state.screen = 'export'; setActiveNav('export'); render(); };
}


function startExportGeneration() {
  if (state.exportJob.status === 'running') return;
  if (exportTimer) clearInterval(exportTimer);

  state.exportJob = { status: 'running', progress: 0, updatedAt: new Date().toISOString() };
  render();

  exportTimer = setInterval(() => {
    const step = Math.floor(Math.random() * 12) + 8;
    state.exportJob.progress = Math.min(100, state.exportJob.progress + step);
    state.exportJob.updatedAt = new Date().toISOString();

    if (state.exportJob.progress >= 100) {
      clearInterval(exportTimer);
      exportTimer = null;
      state.exportJob.status = 'done';
      state.exportHistory.unshift({
        id: `exp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        resolution: state.export.resolution,
        speed: state.export.speed,
        range: state.export.range,
        watermarkRemoved: state.export.removeWatermark,
      });
      state.exportHistory = state.exportHistory.slice(0, 8);
      save();
      toast(`영상 생성 완료 (${state.export.resolution.toUpperCase()}, ${state.export.speed})`);
      render();
      return;
    }

    render();
  }, 700);
}

function cancelExportGeneration() {
  if (exportTimer) {
    clearInterval(exportTimer);
    exportTimer = null;
  }
  state.exportJob.status = 'canceled';
  state.exportJob.updatedAt = new Date().toISOString();
  toast('영상 생성이 취소되었습니다.');
  render();
}

function exportView() {
  showNav(true); showTopBar(true); showFab(false); setTitle('Export Timelapse');
  const frameMap = { '7': 7, '30': 30, 'all': Math.max(45, Object.keys(state.entries).length || 100) };
  const frames = frameMap[state.export.range];
  const missing = Math.max(0, (state.export.range === 'all' ? 120 : Number(state.export.range)) - frames);
  const ratio = Math.max(0, Math.min(100, Math.round((frames / (frames + missing || 1)) * 100)));

  $('#main').innerHTML = `
    <section class="export-hero" style="background-image:linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.45)),url('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80')">
      <button class="play-btn material-symbols-outlined">play_arrow</button>
      <p class="preview-label">PREVIEW</p>
    </section>

    <section class="segmented">
      ${['7','30','all'].map((r)=>`<button class="seg-btn ${state.export.range===r?'active':''}" data-range="${r}">${r==='7'?'Last 7 Days':r==='30'?'Last 30 Days':'All Time'}</button>`).join('')}
    </section>

    <section class="card export-progress">
      <div class="export-top"><div><span class="big">${frames}</span><span class="mut"> frames ready</span></div><span class="pill">GREAT CONSISTENCY!</span></div>
      <div class="bar"><div class="bar-fill" style="width:${ratio}%"></div></div>
      <div class="meta"><span>${ratio}% complete</span><span>${missing} missing days</span></div>
    </section>

    <section class="export-settings">
      <h2>Video Settings</h2>
      <div>
        <p class="set-label">Speed</p>
        <div class="opt-grid3">
          ${['slow','normal','fast'].map((s)=>`<button class="opt-btn ${state.export.speed===s?'active':''}" data-speed="${s}">${s[0].toUpperCase()+s.slice(1)}</button>`).join('')}
        </div>
      </div>

      <div>
        <p class="set-label">Resolution</p>
        <div class="opt-grid2">
          <button class="opt-btn ${state.export.resolution==='1080p'?'active':''}" data-resolution="1080p">1080p HD <span class="chip">Free</span></button>
          <button class="opt-btn lock ${state.export.resolution==='4k'?'active':''}" data-resolution="4k">4K Ultra <span class="material-symbols-outlined">diamond</span></button>
        </div>
      </div>

      <div class="wm-card">
        <div><strong>Loopic Watermark</strong><p>Remove branding from video</p></div>
        <button id="wmBtn" class="pro-btn">${state.pay==='subscribed' ? (state.export.removeWatermark ? 'ON' : 'OFF') : 'PRO ◈'}</button>
      </div>

      <div class="job-card">
        <div class="job-head">
          <strong>${state.exportJob.status === 'running' ? 'Generating...' : state.exportJob.status === 'done' ? 'Last export completed' : state.exportJob.status === 'canceled' ? 'Last export canceled' : 'Ready to export'}</strong>
          <span>${state.exportJob.progress}%</span>
        </div>
        <div class="bar"><div class="bar-fill" style="width:${state.exportJob.progress}%"></div></div>
      </div>

      <button id="generateBtn" class="generate-btn" ${state.exportJob.status === 'running' ? 'disabled' : ''}><span class="material-symbols-outlined">movie_creation</span>${state.exportJob.status === 'running' ? 'Generating...' : 'Generate Video'}</button>
      ${state.exportJob.status === 'running' ? '<button id="cancelGenerate" class="btn secondary">생성 취소</button>' : ''}

      ${state.exportJob.status === 'done' && state.exportHistory.length ? `
      <section class="card result-card">
        <h3>Latest Video</h3>
        <p>${new Date(state.exportHistory[0].createdAt).toLocaleString()} · ${state.exportHistory[0].resolution.toUpperCase()} · ${state.exportHistory[0].speed}</p>
        <div class="btn-row">
          <button id="previewResult" class="btn secondary">미리보기</button>
          <button id="saveResult" class="btn secondary">저장</button>
          <button id="shareResult" class="btn primary">공유</button>
        </div>
      </section>` : ''}

      ${state.exportHistory.length ? `
      <section class="card result-history">
        <h3>Export History</h3>
        <ul>
          ${state.exportHistory.map((h) => `<li><span>${new Date(h.createdAt).toLocaleDateString()} · ${h.range==='all'?'ALL':h.range+'D'}</span><b>${h.resolution.toUpperCase()}</b></li>`).join('')}
        </ul>
      </section>` : ''}
    </section>`;

  document.querySelectorAll('[data-range]').forEach((el) => {
    el.onclick = () => { state.export.range = el.dataset.range; render(); };
  });
  document.querySelectorAll('[data-speed]').forEach((el) => {
    el.onclick = () => { state.export.speed = el.dataset.speed; render(); };
  });
  document.querySelectorAll('[data-resolution]').forEach((el) => {
    el.onclick = () => {
      if (el.dataset.resolution === '4k' && state.pay !== 'subscribed') {
        goPaywall('export', 'unlock4k');
        return;
      }
      state.export.resolution = el.dataset.resolution;
      render();
    };
  });

  $('#wmBtn').onclick = () => {
    if (state.pay !== 'subscribed') {
      goPaywall('export', 'toggleWatermark');
      return;
    }
    state.export.removeWatermark = !state.export.removeWatermark;
    toast(state.export.removeWatermark ? '워터마크 제거 ON' : '워터마크 제거 OFF');
    render();
  };

  $('#generateBtn').onclick = () => {
    if (state.exportJob.status === 'running') return;

    if (state.pay === 'subscribed') {
      startExportGeneration();
      return;
    }

    openRewardAdGate(startExportGeneration);
  };

  $('#cancelGenerate')?.addEventListener('click', cancelExportGeneration);
  $('#previewResult')?.addEventListener('click', () => toast('미리보기 재생 준비 중입니다.'));
  $('#saveResult')?.addEventListener('click', () => toast('갤러리에 저장되었습니다.'));
  $('#shareResult')?.addEventListener('click', () => toast('공유 시트가 열렸습니다.'));
}

function openRewardAdGate(onComplete) {
  if (state.adGateState !== 'idle') return;
  if (adTimer) clearInterval(adTimer);
  state.adGateState = 'loading';

  openModal(`
    <h3>영상 준비 중</h3>
    <p style="color:var(--muted)">잠시만 기다려주세요.</p>
    <div class="bar" style="margin:8px 0 4px"><div id="adProgress" class="bar-fill" style="width:0%"></div></div>
    <p id="adTimer" class="meta" style="display:block;text-align:center">광고 로딩 중...</p>
    <div class="btn-row">
      <button class="btn secondary" id="cancelAd">취소</button>
    </div>`);

  state.adGateState = 'showing';
  AdsService.showRewarded({
    onTick: (remain) => {
      const pct = Math.round(((30 - remain) / 30) * 100);
      $('#adProgress').style.width = `${pct}%`;
      $('#adTimer').textContent = `${remain}초 남음`;
    },
    onFinished: () => {
      state.adGateState = 'rewarded';
    },
    onCanceled: () => {
      state.adGateState = 'canceled';
    },
  }).then(() => {
    closeModal();
    onComplete();
  }).catch(() => {
    closeModal();
    toast('생성이 취소되었습니다.');
  }).finally(() => {
    state.adGateState = 'idle';
    window.__cancelRewardedAd = null;
  });

  $('#cancelAd').onclick = () => {
    window.__cancelRewardedAd?.();
  };
}

function createAlbum() {
  const title = prompt('새 앨범 이름');
  if (!title) return;
  const id = `a${Date.now()}`;
  state.albums.push({ albumId: id, title, createdAt: new Date().toISOString() });
  state.activeAlbum = id;
  save();
  toast('새 앨범 생성 완료');
  render();
}

function settingsModal() {
  openModal(`
    <h3>설정</h3>
    <label>언어<select id="langSel" class="btn secondary" style="width:100%;margin-top:6px;"><option value="kr" ${state.lang === 'kr' ? 'selected' : ''}>한국어</option><option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option></select></label>
    <label>리마인드 시간<input id="timeSel" type="time" value="${state.reminderTime}" class="btn secondary" style="width:100%;margin-top:6px;"/></label>
    <div class="btn-row"><button class="btn primary" id="saveSettings">저장</button><button class="btn secondary" id="authBtn">${state.auth === 'googleLinked' ? '로그아웃' : 'Google 연결'}</button><button class="btn secondary" id="proBtn">${state.pay==='subscribed'?'Pro 해제':'Pro 체험'}</button></div>`);
  $('#saveSettings').onclick = () => { state.lang = $('#langSel').value; state.reminderTime = $('#timeSel').value; save(); closeModal(); render(); toast('설정 저장 완료'); };
  $('#authBtn').onclick = () => { state.auth = state.auth === 'googleLinked' ? 'guest' : 'googleLinked'; save(); closeModal(); toast(state.auth === 'googleLinked' ? 'Google 연결 완료' : '로그아웃 완료'); };
  $('#proBtn').onclick = () => { closeModal(); goPaywall(state.screen, null); };
}


function paywallView() {
  showNav(false); showTopBar(false); showFab(false); setTitle('Loopic Premium');

  $('#main').innerHTML = `
    <section class="paywall">
      <div class="pay-bg"></div>

      <div class="pay-top">
        <button id="payClose" class="pay-icon material-symbols-outlined">close</button>
        <button id="restoreBtn" class="pay-restore" ${state.billingState !== 'idle' ? 'disabled' : ''}>${state.billingState==='restoring'?'RESTORING...':'RESTORE PURCHASE'}</button>
      </div>

      <div class="pay-hero">
        <span class="pay-badge"><span class="material-symbols-outlined">diamond</span> LOOPIC PREMIUM</span>
        <h2>Master Time.</h2>
        <p>Unlock the full power of time travel with daily tracking.</p>
      </div>

      <div class="pay-features">
        <article><span class="material-symbols-outlined">collections_bookmark</span><div><h3>Unlimited Albums</h3><p>Track everything, everywhere. No limits on how many memories you save.</p></div></article>
        <article><span class="material-symbols-outlined">calendar_month</span><div><h3>Long-Term Vision</h3><p>Unlock 365+ day projects. Visualize your progress over years.</p></div></article>
        <article><span class="material-symbols-outlined">4k</span><div><h3>Cinema Quality</h3><p>Export in 4K HD Video. Share your story with crystal clear quality.</p></div></article>
        <article><span class="material-symbols-outlined">cloud_upload</span><div><h3>Secure Cloud</h3><p>Automatic Data Backup. Never lose a moment of your timeline.</p></div></article>
      </div>

      <div class="pay-bottom">
        <p class="trust">Trusted by 10k+ loopers</p>
        <div class="pay-plans">
          <label class="plan ${state.paywallPlan==='monthly'?'active':''}">
            <input type="radio" name="plan" value="monthly" ${state.paywallPlan==='monthly'?'checked':''} />
            <div><strong>Monthly</strong><p>$2.99 / mo</p></div>
          </label>
          <label class="plan ${state.paywallPlan==='yearly'?'active':''}">
            <input type="radio" name="plan" value="yearly" ${state.paywallPlan==='yearly'?'checked':''} />
            <div><strong>Yearly</strong><p>$19.99 / year</p><small>7-Day Free Trial Included</small></div>
            <span class="save-tag">SAVE 45%</span>
          </label>
        </div>

        <button id="startTrial" class="pay-cta" ${state.billingState !== 'idle' ? 'disabled' : ''}>${state.billingState==='purchasing'?'Processing...':'Start 7-Day Free Trial'}</button>
        <p class="pay-note">Recurring billing. Cancel anytime in Settings.</p>
        <div class="pay-links"><button id="privacyBtn">Privacy Policy</button><span>•</span><button id="termsBtn">Terms of Service</button></div>
      </div>
    </section>`;

  document.querySelectorAll('input[name="plan"]').forEach((el) => {
    el.addEventListener('change', () => {
      state.paywallPlan = el.value;
      paywallView();
    });
  });

  $('#payClose').onclick = () => {
    state.screen = state.paywallFrom || 'home';
    setActiveNav(state.screen === 'paywall' ? 'home' : state.screen);
    render();
  };
  $('#restoreBtn').onclick = async () => {
    if (state.billingState !== 'idle') return;
    state.billingState = 'restoring';
    render();
    toast('구매 복원 중...');
    try {
      const result = await BillingService.restore();
      if (!result.ok) throw new Error('restore_failed');
      state.pay = 'subscribed';
      save();
      runPendingPremiumAction();
      toast('구매 복원이 완료되었습니다.');
      state.screen = state.paywallFrom || 'home';
      setActiveNav(state.screen === 'paywall' ? 'home' : state.screen);
      render();
    } catch {
      toast('구매 복원에 실패했습니다. 다시 시도해주세요.');
    } finally {
      state.billingState = 'idle';
      render();
    }
  };
  $('#startTrial').onclick = async () => {
    if (state.billingState !== 'idle') return;
    state.billingState = 'purchasing';
    render();
    toast('결제 처리 중...');
    try {
      const result = await BillingService.purchase(state.paywallPlan);
      if (!result.ok) throw new Error('purchase_failed');
      state.pay = 'subscribed';
      save();
      runPendingPremiumAction();
      toast(state.paywallPlan === 'yearly' ? '연간 플랜 체험 시작!' : '월간 플랜 구독 시작!');
      state.screen = state.paywallFrom || 'export';
      setActiveNav(state.screen === 'paywall' ? 'home' : state.screen);
      render();
    } catch {
      toast('결제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      state.billingState = 'idle';
      render();
    }
  };
  $('#privacyBtn').onclick = () => {
    if (LEGAL_URLS.privacy) {
      window.open(LEGAL_URLS.privacy, '_blank', 'noopener');
      return;
    }
    openModal('<h3>Privacy Policy</h3><p style="color:var(--muted)">개인정보 처리방침 초안입니다. 실제 배포 시 정식 문서 URL로 연결하세요.</p><div class="btn-row"><button class="btn primary" id="closeLegal">닫기</button></div>');
  };
  $('#termsBtn').onclick = () => {
    if (LEGAL_URLS.terms) {
      window.open(LEGAL_URLS.terms, '_blank', 'noopener');
      return;
    }
    openModal('<h3>Terms of Service</h3><p style="color:var(--muted)">이용약관 초안입니다. 실제 배포 시 정식 문서 URL로 연결하세요.</p><div class="btn-row"><button class="btn primary" id="closeLegal">닫기</button></div>');
  };
  $('#modal').addEventListener('click', (e) => { if (e.target && e.target.id === 'closeLegal') closeModal(); }, { once: true });
}

function setActiveNav(screen) {
  document.querySelectorAll('.nav-btn').forEach((n) => n.classList.toggle('active', n.dataset.screen === screen));
}

function attachGlobal() {
  $('#openSettings').onclick = settingsModal;
  $('#fab').onclick = () => createAlbum();
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.onclick = () => {
      state.screen = btn.dataset.screen;
      setActiveNav(state.screen);
      render();
    };
  });
}

function render() {
  if (state.screen !== 'camera') CameraService.stop();
  if (!state.onboardingCompleted) return onboardingView();
  ({ home: homeView, camera: cameraView, timeline: timelineView, export: exportView, paywall: paywallView }[state.screen] || homeView)();
}

attachGlobal();
render();
