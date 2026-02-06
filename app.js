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

const state = {
  lang: localStorage.getItem('lang') || 'kr',
  screen: 'home',
  onboardingPage: 0,
  onboardingCompleted: localStorage.getItem('onboardingCompleted') === 'true',
  silhouetteOpacity: Number(localStorage.getItem('silhouetteOpacity') || 45),
  reminderTime: localStorage.getItem('reminderTime') || '20:00',
  auth: localStorage.getItem('auth') || 'guest',
  pay: localStorage.getItem('pay') || 'none',
  albums: JSON.parse(localStorage.getItem('albums') || '[{"albumId":"a1","title":"기본 앨범","createdAt":"2026-01-01"}]'),
  activeAlbum: localStorage.getItem('activeAlbum') || 'a1',
  entries: JSON.parse(localStorage.getItem('entries') || '{}'),
  adCooldownAt: 0,
  adCount: 0,
};

const $ = (sel) => document.querySelector(sel);
const fmtDate = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });

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
}

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 1800);
}

function openModal(html) {
  $('#modal').innerHTML = html;
  $('#modalBackdrop').classList.remove('hidden');
}
function closeModal() { $('#modalBackdrop').classList.add('hidden'); }
$('#modalBackdrop').addEventListener('click', (e) => { if (e.target.id === 'modalBackdrop') closeModal(); });

function setTitle(v) { $('#screenTitle').textContent = v; }
function showNav(v = true) { $('#bottomNav').classList.toggle('hidden', !v); }
function showTopBar(v = true) { document.querySelector('.top-bar').classList.toggle('hidden', !v); }

function onboardingView() {
  showNav(false); showTopBar(false); setTitle('Welcome');
  const page = copy[state.onboardingPage];
  const cBody = state.lang === 'kr' ? page.body_kr : page.body_en;
  $('#main').innerHTML = `
    <section class="onb-wrap">
      <div class="onb-visual" style="background:${page.bg};">
        <div class="onb-controls"><span>⌗</span><span>⚡</span></div>
        <div class="ghost-shape">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 22H22L12 2Z" fill="white" fill-opacity="0.18"></path>
            <path d="M12 2L2 22H22L12 2Z" stroke="white" stroke-dasharray="4 2" stroke-width="0.7"></path>
          </svg>
        </div>
        <div class="focus-box"><div class="focus-dot"></div></div>
        <div class="align-badge">🪄 ALIGNING...</div>
      </div>

      <div class="onb-content">
        <div class="dots">${copy.map((_,i)=>`<span class="dot ${i===state.onboardingPage?'active':''}"></span>`).join('')}</div>
        <h2 class="onb-title">${state.lang === 'kr' ? page.title_kr : page.title_en}</h2>
        <p class="onb-subtitle">${state.lang === 'kr' ? page.title_en : page.title_kr}</p>
        <p class="onb-desc">${cBody.join('\n')}</p>

        <div class="onb-actions">
          ${page.cta_kr ? `<button class="cta-main" id="ctaBtn">${state.lang === 'kr' ? page.cta_kr : 'Start Journey →'}</button>` : ''}
          ${!page.cta_kr ? `<button class="btn secondary" id="nextBtn">다음으로</button>` : ''}
          <button class="cta-subtle" id="loginBtn">Already have an account? <b>Log in</b></button>
          ${state.onboardingPage > 0 ? '<button class="btn secondary" id="prevBtn">이전 페이지</button>' : ''}
        </div>
      </div>
    </section>
  `;

  const toNext = () => {
    if (state.onboardingPage === copy.length - 1) {
      state.onboardingCompleted = true;
      save();
      state.screen = 'camera';
      toast('온보딩 완료! 카메라로 이동합니다.');
      render();
      return;
    }
    state.onboardingPage += 1;
    onboardingView();
  };

  $('#ctaBtn')?.addEventListener('click', toNext);
  $('#nextBtn')?.addEventListener('click', toNext);
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

function homeView() {
  showNav(true); showTopBar(true); setTitle('Home');
  const today = fmtDate();
  const albumId = state.activeAlbum;
  const doneToday = !!state.entries[`${albumId}:${today}`];
  const total = Object.keys(state.entries).filter(k => k.startsWith(`${albumId}:`)).length;
  $('#main').innerHTML = `
    <section class="card">
      <h2>${doneToday ? '오늘 기록 완료 🌟' : '오늘의 기록이 비어 있어요'}</h2>
      <p style="color:var(--muted);margin-top:8px;">${doneToday ? '멋져요. 내일도 이어가볼까요?' : '지금 한 장 촬영하고 시간을 이어가세요.'}</p>
      <div class="btn-row">
        <button class="btn primary" id="goCamera">카메라 열기</button>
        <button class="btn secondary" id="goTimeline">기록 보기</button>
      </div>
    </section>
    <section class="kpi-grid">
      <article class="kpi"><p>연속 기록</p><strong>${Math.min(total, 12)}일</strong></article>
      <article class="kpi"><p>총 기록</p><strong>${total}</strong></article>
      <article class="kpi"><p>앨범</p><strong>${state.albums.length}</strong></article>
    </section>
  `;
  $('#goCamera').onclick = () => { state.screen = 'camera'; render(); };
  $('#goTimeline').onclick = () => { state.screen = 'timeline'; render(); };
}

function cameraView() {
  showNav(true); showTopBar(true); setTitle('Camera');
  const today = fmtDate();
  const key = `${state.activeAlbum}:${today}`;
  const exists = !!state.entries[key];
  $('#main').innerHTML = `
    <section class="card">
      <h2>오늘의 촬영</h2>
      <p style="color:var(--muted);margin-top:8px;">${exists ? '오늘 기록이 있어요. 다시 촬영하면 덮어쓰기 됩니다.' : '어제와 오늘을 자연스럽게 이어 촬영해보세요.'}</p>
      <div class="camera-stage">📷 Camera Preview (Prototype)</div>
      <label style="display:block;margin:12px 0 6px;color:var(--muted)">실루엣 투명도 (${state.silhouetteOpacity}%)</label>
      <input id="opacity" class="slider" type="range" min="0" max="100" value="${state.silhouetteOpacity}">
      <div class="btn-row">
        <button class="btn primary" id="captureBtn">촬영 후 저장</button>
        <label class="btn secondary" for="upload">사진 선택</label>
        <input id="upload" type="file" accept="image/*" class="hidden" />
      </div>
    </section>
  `;
  $('#opacity').oninput = (e) => { state.silhouetteOpacity = Number(e.target.value); save(); };
  const store = () => {
    if (exists && !confirm('오늘 기록을 덮어쓸까요?')) return;
    state.entries[key] = { imageUri: `captured-${Date.now()}.jpg`, updatedAt: new Date().toISOString() };
    save(); toast('저장 완료!');
    maybeShowInterstitial(() => {});
    render();
  };
  $('#captureBtn').onclick = store;
  $('#upload').onchange = store;
}

function timelineView() {
  showNav(true); showTopBar(true); setTitle('Timeline');
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
  $('#main').innerHTML = `
    <section class="card">
      <h2>${y}.${m + 1} 기록</h2>
      <div class="timeline-grid" style="margin-top:12px;">${grid}</div>
    </section>
  `;
  document.querySelectorAll('.day').forEach(el => {
    el.onclick = () => {
      const date = el.dataset.date;
      const key = `${state.activeAlbum}:${date}`;
      toast(state.entries[key] ? `${date} 기록 있음` : `${date} 비어 있음`);
    };
  });
}

function albumsView() {
  showNav(true); showTopBar(true); setTitle('Albums');
  $('#main').innerHTML = `
    <section class="card">
      <h2>앨범 관리</h2>
      <p style="color:var(--muted);margin-top:8px;">아이별/프로젝트별 앨범을 관리하세요.</p>
      <div class="btn-row">
        <button class="btn primary" id="newAlbum">새 앨범</button>
      </div>
      <div style="display:grid;gap:8px;margin-top:12px;">
        ${state.albums.map(a => `<div class="album-item"><span>${a.title}</span><div><button class="btn secondary pick" data-id="${a.albumId}">선택</button></div></div>`).join('')}
      </div>
    </section>
  `;
  $('#newAlbum').onclick = () => {
    if (state.pay === 'none') {
      openRewardGate(() => createAlbum());
      return;
    }
    createAlbum();
  };
  document.querySelectorAll('.pick').forEach(btn => btn.onclick = () => { state.activeAlbum = btn.dataset.id; save(); toast('앨범 변경 완료'); render(); });
}

function createAlbum() {
  const title = prompt('새 앨범 이름');
  if (!title) return;
  const id = `a${Date.now()}`;
  state.albums.push({ albumId: id, title, createdAt: new Date().toISOString() });
  state.activeAlbum = id;
  save();
  render();
}

function openRewardGate(onReward) {
  openModal(`
    <h3>리워드 광고 시청</h3>
    <p style="color:var(--muted)">무료 플랜에서는 이 기능을 사용하려면 광고를 완료해야 해요.</p>
    <div class="btn-row">
      <button class="btn primary" id="watchAd">시청 후 계속</button>
      <button class="btn secondary" id="cancelAd">취소</button>
    </div>
  `);
  $('#watchAd').onclick = () => { closeModal(); toast('보상 획득!'); onReward(); };
  $('#cancelAd').onclick = () => { closeModal(); toast('취소되었습니다'); };
}

function maybeShowInterstitial(next) {
  const now = Date.now();
  if (state.pay === 'subscribed' || now < state.adCooldownAt || state.adCount >= 3) { next?.(); return; }
  state.adCooldownAt = now + 60000;
  state.adCount += 1;
  openModal(`
    <h3>Interstitial Ad</h3>
    <p style="color:var(--muted)">닫기 가능한 광고 샘플입니다. 실제 SDK로 교체하세요.</p>
    <div class="btn-row"><button class="btn primary" id="closeAd">닫기</button></div>
  `);
  $('#closeAd').onclick = () => { closeModal(); next?.(); };
}

function settingsModal() {
  openModal(`
    <h3>설정</h3>
    <label>언어
      <select id="langSel" class="btn secondary" style="width:100%;margin-top:6px;">
        <option value="kr" ${state.lang === 'kr' ? 'selected' : ''}>한국어</option>
        <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
      </select>
    </label>
    <label>리마인드 시간
      <input id="timeSel" type="time" value="${state.reminderTime}" class="btn secondary" style="width:100%;margin-top:6px;" />
    </label>
    <div class="btn-row">
      <button class="btn primary" id="saveSettings">저장</button>
      <button class="btn secondary" id="authBtn">${state.auth === 'googleLinked' ? '로그아웃' : 'Google 연결'}</button>
    </div>
  `);
  $('#saveSettings').onclick = () => {
    state.lang = $('#langSel').value;
    state.reminderTime = $('#timeSel').value;
    save(); closeModal(); render(); toast('설정 저장 완료');
  };
  $('#authBtn').onclick = () => {
    state.auth = state.auth === 'googleLinked' ? 'guest' : 'googleLinked';
    save(); closeModal(); toast(state.auth === 'googleLinked' ? 'Google 연결 완료' : '로그아웃 완료');
  };
}

function attachGlobal() {
  $('#openSettings').onclick = settingsModal;
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.nav-btn').forEach(n => n.classList.remove('active'));
      btn.classList.add('active');
      state.screen = btn.dataset.screen;
      if (btn.dataset.screen === 'albums') maybeShowInterstitial(() => render());
      render();
    };
  });
}

function render() {
  if (!state.onboardingCompleted) return onboardingView();
  ({ home: homeView, camera: cameraView, timeline: timelineView, albums: albumsView }[state.screen] || homeView)();
}

attachGlobal();
render();
