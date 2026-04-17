// ============================================================
// Firebase 초기화 (compat 방식 – admin.js)
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyD3W71B8d3fXAewzAn3SpeFLrhXwYnbYiU",
  authDomain: "joy-family-game.firebaseapp.com",
  databaseURL: "https://joy-family-game-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "joy-family-game",
  storageBucket: "joy-family-game.firebasestorage.app",
  messagingSenderId: "1074722125872",
  appId: "1:1074722125872:web:4da78793c358611a2a95f5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ============================================================
// 상수 & 전역 변수
// ============================================================
const ADMIN_PASSWORD = '1234';
const DEFAULT_FLASH_TIMES = [5.20, 10.30, 15.45, 20.65, 25.75];

let currentGameAdmin      = 'game1';
let currentDifficultyAdmin = 'veryslow';
let gameDataAdmin          = {};

const gameNames = { game1: '조이패밀리', game2: '물불빵밥밤', game3: '색깔맞추기' };
const gameWords = {
  game1: ['양', '기도', '수박', '예수님', '십자가'],
  game2: ['물', '불', '빵', '밥', '밤'],
  game3: ['빨강', '파랑']
};

const DEFAULT_GAME_DATA_ADMIN = {
  game1: {
    veryslow: {
      1: ['양','양','기도','양','기도','기도','양','양'],
      2: ['양','양','기도','수박','수박','수박','양','양'],
      3: ['양','기도','기도','예수님','예수님','양','양','수박'],
      4: ['수박','예수님','양','기도','예수님','수박','양','기도'],
      5: ['예수님','십자가','예수님','기도','십자가','예수님','수박','예수님']
    },
    slow: {
      1: ['양','양','기도','양','기도','기도','양','양'],
      2: ['양','양','기도','수박','수박','수박','양','양'],
      3: ['양','기도','기도','예수님','예수님','양','양','수박'],
      4: ['수박','예수님','양','기도','예수님','수박','양','기도'],
      5: ['예수님','십자가','예수님','기도','십자가','예수님','수박','예수님']
    },
    normal: {
      1: ['양','양','기도','양','기도','기도','양','양'],
      2: ['양','양','기도','수박','수박','수박','양','양'],
      3: ['양','기도','기도','예수님','예수님','양','양','수박'],
      4: ['수박','예수님','양','기도','예수님','수박','양','기도'],
      5: ['예수님','십자가','예수님','기도','십자가','예수님','수박','예수님']
    },
    fast: {
      1: ['양','양','기도','양','기도','기도','양','양'],
      2: ['양','양','기도','수박','수박','수박','양','양'],
      3: ['양','기도','기도','예수님','예수님','양','양','수박'],
      4: ['수박','예수님','양','기도','예수님','수박','양','기도'],
      5: ['예수님','십자가','예수님','기도','십자가','예수님','수박','예수님']
    }
  },
  game2: {
    veryslow: {
      1: ['물','불','물','불','불','물','불','물'],
      2: ['불','불','불','물','물','불','물','물'],
      3: ['빵','밥','밤','빵','밤','밤','밥','밥'],
      4: ['밥','밤','빵','밤','밥','밤','빵','밥'],
      5: ['빵','밥','빵','밤','밤','밥','밥','빵']
    },
    slow: {
      1: ['물','불','물','불','불','물','불','물'],
      2: ['불','불','불','물','물','불','물','물'],
      3: ['빵','밥','밤','빵','밤','밤','밥','밥'],
      4: ['밥','밤','빵','밤','밥','밤','빵','밥'],
      5: ['빵','밥','빵','밤','밤','밥','밥','빵']
    },
    normal: {
      1: ['물','불','물','불','불','물','불','물'],
      2: ['불','불','불','물','물','불','물','물'],
      3: ['빵','밥','밤','빵','밤','밤','밥','밥'],
      4: ['밥','밤','빵','밤','밥','밤','빵','밥'],
      5: ['빵','밥','빵','밤','밤','밥','밥','빵']
    },
    fast: {
      1: ['물','불','물','불','불','물','불','물'],
      2: ['불','불','불','물','물','불','물','물'],
      3: ['빵','밥','밤','빵','밤','밤','밥','밥'],
      4: ['밥','밤','빵','밤','밥','밤','빵','밥'],
      5: ['빵','밥','빵','밤','밤','밥','밥','빵']
    }
  },
  game3: {
    veryslow: {
      1: ['빨강','빨강','빨강','빨강','빨강','빨강','빨강','빨강'],
      2: ['파랑','파랑','파랑','파랑','파랑','파랑','파랑','파랑'],
      3: ['빨강','빨강','파랑','파랑','빨강','빨강','파랑','파랑'],
      4: ['빨강','파랑','빨강','파랑','빨강','파랑','빨강','파랑'],
      5: ['빨강','파랑','파랑','빨강','빨강','파랑','파랑','빨강']
    },
    slow: {
      1: ['빨강','빨강','빨강','빨강','빨강','빨강','빨강','빨강'],
      2: ['파랑','파랑','파랑','파랑','파랑','파랑','파랑','파랑'],
      3: ['빨강','빨강','파랑','파랑','빨강','빨강','파랑','파랑'],
      4: ['빨강','파랑','빨강','파랑','빨강','파랑','빨강','파랑'],
      5: ['빨강','파랑','파랑','빨강','빨강','파랑','파랑','빨강']
    },
    normal: {
      1: ['빨강','빨강','빨강','빨강','빨강','빨강','빨강','빨강'],
      2: ['파랑','파랑','파랑','파랑','파랑','파랑','파랑','파랑'],
      3: ['빨강','빨강','파랑','파랑','빨강','빨강','파랑','파랑'],
      4: ['빨강','파랑','빨강','파랑','빨강','파랑','빨강','파랑'],
      5: ['빨강','파랑','파랑','빨강','빨강','파랑','파랑','빨강']
    },
    fast: {
      1: ['빨강','빨강','빨강','빨강','빨강','빨강','빨강','빨강'],
      2: ['파랑','파랑','파랑','파랑','파랑','파랑','파랑','파랑'],
      3: ['빨강','빨강','파랑','파랑','빨강','빨강','파랑','파랑'],
      4: ['빨강','파랑','빨강','파랑','빨강','파랑','빨강','파랑'],
      5: ['빨강','파랑','파랑','빨강','빨강','파랑','파랑','빨강']
    }
  }
};

// ============================================================
// 비밀번호 확인
// ============================================================
function checkPassword() {
  const input = document.getElementById('passwordInput').value;
  if (input === ADMIN_PASSWORD) {
    document.getElementById('loginSection').style.display   = 'none';
    document.getElementById('adminContent').style.display  = 'block';
    loadGameDataAdmin();
  } else {
    document.getElementById('loginError').textContent = '❌ 비밀번호가 틀렸습니다.';
  }
}

function logout() {
  document.getElementById('loginSection').style.display  = 'block';
  document.getElementById('adminContent').style.display  = 'none';
  document.getElementById('passwordInput').value         = '';
  document.getElementById('loginError').textContent      = '';
}

// ============================================================
// 게임 데이터 로드 (Firebase → localStorage → 기본값)
// ============================================================
async function loadGameDataAdmin() {
  try {
    const snapshot = await db.ref('gameData').get();
    if (snapshot.exists()) {
      gameDataAdmin = snapshot.val();
      console.log('✅ Firebase에서 gameData 로드');
    } else {
      throw new Error('Firebase 데이터 없음');
    }
  } catch (e) {
    console.warn('⚠️ Firebase 로드 실패:', e);
    const saved = localStorage.getItem('rhythmGameData');
    if (saved) {
      try { gameDataAdmin = JSON.parse(saved); }
      catch { gameDataAdmin = JSON.parse(JSON.stringify(DEFAULT_GAME_DATA_ADMIN)); }
    } else {
      gameDataAdmin = JSON.parse(JSON.stringify(DEFAULT_GAME_DATA_ADMIN));
    }
  }
  renderTimingControls();
  renderLevelInputs();
  showStatus('✅ 데이터 로드 완료');
}

// ============================================================
// 게임 선택
// ============================================================
function selectGameAdmin(game) {
  currentGameAdmin = game;
  document.querySelectorAll('.game-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll(`.game-tab[onclick*="${game}"]`).forEach(b => b.classList.add('active'));
  renderTimingControls();
  renderLevelInputs();
}

// ============================================================
// 난이도 탭 전환
// ============================================================
function switchTab(difficulty) {
  currentDifficultyAdmin = difficulty;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll(`.tab-btn[onclick*="${difficulty}"]`).forEach(b => b.classList.add('active'));
  renderLevelInputs();
}

// ============================================================
// 타이밍 컨트롤 렌더링
// ============================================================
function renderTimingControls() {
  const container = document.getElementById('timingControls');
  if (!container) return;
  container.innerHTML = '';

  for (let stage = 1; stage <= 5; stage++) {
    const key      = `flashOffset_${currentGameAdmin}_${stage}`;
    const saved    = localStorage.getItem(key);
    const offset   = saved !== null ? parseFloat(saved) : 0;
    const baseTime = DEFAULT_FLASH_TIMES[stage - 1];

    const row = document.createElement('div');
    row.className = 'timing-row';
    row.innerHTML = `
      <label>${stage}단계 플래시 (기본: ${baseTime}초)</label>
      <input type="number" id="offset_${stage}" value="${offset}" step="100"
             placeholder="오프셋(ms)" style="width:120px;padding:6px;border-radius:6px;border:1px solid #ccc;" />
      <button onclick="resetTiming(${stage})" style="padding:6px 12px;background:#e74c3c;color:#fff;border:none;border-radius:6px;cursor:pointer;">초기화</button>
      <span style="color:#666;font-size:0.85em;">실제: ${((baseTime * 1000 + offset) / 1000).toFixed(2)}초</span>
    `;
    container.appendChild(row);
  }
}

// ============================================================
// 타이밍 초기화
// ============================================================
async function resetTiming(stage) {
  const key = `flashOffset_${currentGameAdmin}_${stage}`;
  localStorage.setItem(key, '0');
  const input = document.getElementById(`offset_${stage}`);
  if (input) input.value = '0';

  try {
    await db.ref(`flashOffsets/${currentGameAdmin}/${stage}`).set(0);
    showStatus(`✅ ${stage}단계 타이밍 초기화 완료 (Firebase 저장)`);
  } catch (e) {
    console.warn('⚠️ Firebase 초기화 실패:', e);
    showStatus(`✅ ${stage}단계 타이밍 초기화 완료 (로컬 저장)`);
  }
}

// ============================================================
// 타이밍 오프셋 저장
// ============================================================
async function saveTimingOffsets() {
  const offsets = {};
  for (let stage = 1; stage <= 5; stage++) {
    const input  = document.getElementById(`offset_${stage}`);
    const value  = input ? parseFloat(input.value) || 0 : 0;
    const key    = `flashOffset_${currentGameAdmin}_${stage}`;
    localStorage.setItem(key, String(value));
    offsets[stage] = value;
  }

  try {
    await db.ref(`flashOffsets/${currentGameAdmin}`).set(offsets);
    showStatus('✅ 타이밍 저장 완료 (Firebase + 로컬)');
  } catch (e) {
    console.warn('⚠️ Firebase 저장 실패:', e);
    showStatus('✅ 타이밍 저장 완료 (로컬만)');
  }

  renderTimingControls();
}

// ============================================================
// 단어 레벨 입력 렌더링
// ============================================================
function renderLevelInputs() {
  const container = document.getElementById('levelInputs');
  if (!container) return;
  container.innerHTML = '';

  if (!gameDataAdmin[currentGameAdmin]) {
    gameDataAdmin = JSON.parse(JSON.stringify(DEFAULT_GAME_DATA_ADMIN));
  }
  if (!gameDataAdmin[currentGameAdmin][currentDifficultyAdmin]) {
    gameDataAdmin[currentGameAdmin][currentDifficultyAdmin] =
      DEFAULT_GAME_DATA_ADMIN[currentGameAdmin][currentDifficultyAdmin];
  }

  const words    = gameWords[currentGameAdmin];
  const diffData = gameDataAdmin[currentGameAdmin][currentDifficultyAdmin];

  for (let level = 1; level <= 5; level++) {
    const levelData = diffData[level] || Array(8).fill(words[0]);
    const section   = document.createElement('div');
    section.className = 'level-section';
    section.innerHTML = `<h4 style="margin:10px 0 6px;">${level}단계</h4>`;

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;';

    for (let i = 0; i < 8; i++) {
      const select = document.createElement('select');
      select.id    = `word_${level}_${i}`;
      select.style.cssText = 'padding:4px;border-radius:4px;border:1px solid #ccc;font-size:0.9em;';
      words.forEach(w => {
        const opt      = document.createElement('option');
        opt.value      = w;
        opt.textContent = w;
        if (levelData[i] === w) opt.selected = true;
        select.appendChild(opt);
      });
      grid.appendChild(select);
    }

    section.appendChild(grid);
    container.appendChild(section);
  }
}

// ============================================================
// 난이도 데이터 저장
// ============================================================
async function saveDifficulty() {
  if (!gameDataAdmin[currentGameAdmin])
    gameDataAdmin[currentGameAdmin] = {};
  if (!gameDataAdmin[currentGameAdmin][currentDifficultyAdmin])
    gameDataAdmin[currentGameAdmin][currentDifficultyAdmin] = {};

  for (let level = 1; level <= 5; level++) {
    const levelWords = [];
    for (let i = 0; i < 8; i++) {
      const sel = document.getElementById(`word_${level}_${i}`);
      levelWords.push(sel ? sel.value : gameWords[currentGameAdmin][0]);
    }
    gameDataAdmin[currentGameAdmin][currentDifficultyAdmin][level] = levelWords;
  }

  // 로컬 백업
  localStorage.setItem('rhythmGameData', JSON.stringify(gameDataAdmin));

  // Firebase 저장
  try {
    await db.ref('gameData').set(gameDataAdmin);
    showStatus(`✅ ${gameNames[currentGameAdmin]} - ${currentDifficultyAdmin} 저장 완료 (Firebase + 로컬)`);
  } catch (e) {
    console.error('❌ Firebase 저장 실패:', e);
    showStatus(`⚠️ 로컬 저장 완료 (Firebase 실패: ${e.message})`);
  }
}

// ============================================================
// 상태 메시지 표시
// ============================================================
function showStatus(msg) {
  let el = document.getElementById('statusMsg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'statusMsg';
    el.style.cssText = `
      position:fixed;bottom:20px;right:20px;background:#2ecc71;color:#fff;
      padding:12px 20px;border-radius:8px;font-weight:bold;z-index:9999;
      box-shadow:0 4px 12px rgba(0,0,0,0.2);transition:opacity 0.5s;`;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.opacity = '0'; }, 3000);
}

// ============================================================
// 페이지 로드
// ============================================================
window.addEventListener('load', () => {
  console.log('✅ admin.js 로드 완료');
});
