// ============================================================
// Firebase 초기화 (compat)
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
// 전역 변수
// ============================================================
let currentDifficulty = 'veryslow';
let currentGame = 'game1';
let gameData = {};
let backgroundAudio = null;
let gameLoopId = null;
const imageCache = {};

// ============================================================
// 단어-이미지 매핑
// ============================================================
const wordImages = {
  game1: {
    '양': 'assets/images/양.png',
    '기도': 'assets/images/기도.png',
    '수박': 'assets/images/수박.png',
    '예수님': 'assets/images/예수님.png',
    '십자가': 'assets/images/십자가.png'
  },
  game2: {
    '물': 'assets/images/물.png',
    '불': 'assets/images/불.png',
    '빵': 'assets/images/빵.png',
    '밥': 'assets/images/밥.png',
    '밤': 'assets/images/밤.png'
  },
  game3: {
    '빨강': '🔴',
    '파랑': '🔵'
  },
  game4: {
    '빨강': '🔴',
    '파랑': '🔵',
    '노랑': '🟡',
    '검정': '⚫'
  }
};

// ============================================================
// 기본 게임 데이터
// ============================================================
const DEFAULT_GAME_DATA = {
  game1: {
    1: ['양','양','기도','양','기도','기도','양','양'],
    2: ['양','양','기도','수박','수박','수박','양','양'],
    3: ['양','기도','기도','예수님','예수님','양','양','수박'],
    4: ['수박','예수님','양','기도','예수님','수박','양','기도'],
    5: ['예수님','십자가','예수님','기도','십자가','예수님','수박','예수님']
  },
  game2: {
    1: ['물','불','물','불','불','물','불','물'],
    2: ['불','불','불','물','물','불','물','물'],
    3: ['빵','밥','밤','빵','밤','밤','밥','밥'],
    4: ['밥','밤','빵','밤','밥','밤','빵','밥'],
    5: ['빵','밥','빵','밤','밤','밥','밥','빵']
  },
  game3: {
    1: ['빨강','빨강','빨강','빨강','빨강','빨강','빨강','빨강'],
    2: ['파랑','파랑','파랑','파랑','파랑','파랑','파랑','파랑'],
    3: ['빨강','빨강','파랑','파랑','빨강','빨강','파랑','파랑'],
    4: ['빨강','파랑','빨강','파랑','빨강','파랑','빨강','파랑'],
    5: ['빨강','파랑','파랑','빨강','빨강','파랑','파랑','빨강']
  },
  game4: {
    1: ['빨강','빨강','파랑','파랑','빨강','빨강','파랑','파랑'],
    2: ['파랑','파랑','빨강','노랑','빨강','빨강','파랑','노랑'],
    3: ['빨강','파랑','노랑','파랑','파랑','빨강','파랑','노랑'],
    4: ['파랑','노랑','빨강','노랑','검정','파랑','빨강','파랑'],
    5: ['빨강','노랑','검정','파랑','빨강','검정','파랑','노랑']
  }
};

// ============================================================
// 이미지 프리로드
// ============================================================
function preloadImages() {
  Object.keys(wordImages.game1).forEach(word => {
    const img = new Image();
    img.src = wordImages.game1[word];
    imageCache[word] = img;
  });
  Object.keys(wordImages.game2).forEach(word => {
    const img = new Image();
    img.src = wordImages.game2[word];
    imageCache[word] = img;
  });
}

// ============================================================
// 게임 데이터 로드 (Firebase → localStorage → 기본값)
// ============================================================
async function loadGameData() {
  try {
    const snapshot = await db.ref('gameData').get();
    if (snapshot.exists()) {
      const raw = snapshot.val();
      const converted = {};
      for (const game of ['game1', 'game2', 'game3', 'game4']) {
        if (!raw[game]) {
          converted[game] = DEFAULT_GAME_DATA[game];
          continue;
        }
        const firstKey = Object.keys(raw[game])[0];
        if (['veryslow','slow','normal','fast'].includes(firstKey)) {
          converted[game] = raw[game]['veryslow'] || DEFAULT_GAME_DATA[game];
          console.log('⚠️ 구 구조 감지, veryslow 사용:', game);
        } else {
          converted[game] = raw[game];
        }
      }
      gameData = converted;
      console.log('✅ Firebase에서 gameData 로드 성공');
    } else {
      throw new Error('Firebase에 데이터 없음');
    }
  } catch (e) {
    console.warn('⚠️ Firebase 로드 실패, localStorage 시도:', e);
    const saved = localStorage.getItem('rhythmGameData');
    if (saved) {
      try {
        gameData = JSON.parse(saved);
        console.log('✅ localStorage에서 gameData 로드');
      } catch {
        gameData = JSON.parse(JSON.stringify(DEFAULT_GAME_DATA));
        console.log('✅ 기본 데이터 사용');
      }
    } else {
      gameData = JSON.parse(JSON.stringify(DEFAULT_GAME_DATA));
      console.log('✅ 기본 데이터 사용');
    }
  }
}

// ============================================================
// 플래시 오프셋 로드 (Firebase → localStorage)
// ============================================================
async function getFlashOffset(game, stage) {
  try {
    const snapshot = await db.ref(`flashOffsets/${game}/${stage}`).get();
    if (snapshot.exists()) {
      return parseFloat(snapshot.val()) || 0;
    }
  } catch (e) {
    // fallback
  }
  return parseFloat(localStorage.getItem(`flashOffset_${game}_${stage}`) || '0');
}

// ============================================================
// 화면 전환
// ============================================================
function goToStart() {
  document.getElementById('startScreen').classList.add('active');
  document.getElementById('settingScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('endingScreen').classList.remove('active');
  if (backgroundAudio) { backgroundAudio.pause(); backgroundAudio.currentTime = 0; }
  if (gameLoopId) { cancelAnimationFrame(gameLoopId); gameLoopId = null; }
  hideIntro();
}

function goToSetting() {
  document.getElementById('startScreen').classList.remove('active');
  document.getElementById('settingScreen').classList.add('active');
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('endingScreen').classList.remove('active');
  if (backgroundAudio) { backgroundAudio.pause(); backgroundAudio.currentTime = 0; }
  if (gameLoopId) { cancelAnimationFrame(gameLoopId); gameLoopId = null; }
  hideIntro();
}

function goToEnding() {
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('endingScreen').classList.add('active');
  if (backgroundAudio) { backgroundAudio.pause(); }
  if (gameLoopId) { cancelAnimationFrame(gameLoopId); gameLoopId = null; }
}

// ============================================================
// 게임/난이도 선택
// ============================================================
function selectGame(game) {
  currentGame = game;
  document.querySelectorAll('#settingScreen .game-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  console.log('✅ 게임 선택:', currentGame);
}

function selectDifficulty(difficulty) {
  currentDifficulty = difficulty;
  document.querySelectorAll('#settingScreen .option-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  console.log('✅ 난이도 선택:', currentDifficulty);
}

// ============================================================
// 게임 시작
// ============================================================
function startGame() {
  if (backgroundAudio) { backgroundAudio.pause(); backgroundAudio.currentTime = 0; }
  if (gameLoopId) { cancelAnimationFrame(gameLoopId); gameLoopId = null; }

  loadGameData().then(() => {
    document.getElementById('settingScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');

    const gameLabels = {
      game1: '🙏 조이패밀리',
      game2: '🔥 물불빵밥밤',
      game3: '🌈 색깔맞추기',
      game4: '🎨 색깔맞추기2'
    };
    const diffLabels = {
      veryslow: '아주느림 🐌',
      slow: '느림 🐢',
      normal: '보통 🏃',
      fast: '빠름 ⚡'
    };
    document.getElementById('gameDisplay').textContent = gameLabels[currentGame];
    document.getElementById('diffDisplay').textContent = diffLabels[currentDifficulty];

    console.log('✅ 게임 시작 - 게임:', currentGame, '| 난이도:', currentDifficulty);
    initGame();
  });
}

// ============================================================
// 인트로 표시/숨김
// ============================================================
function displayIntro() {
  if (!document.getElementById('introScreen')) {
    const screen = document.createElement('div');
    screen.id = 'introScreen';
    screen.style.cssText = `
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: linear-gradient(-45deg, #6366f1, #8b5cf6, #ec4899, #f97316);
      background-size: 400% 400%;
      display: flex; justify-content: center; align-items: center;
      z-index: 1000; font-size: 48px; color: white;
      text-align: center; font-weight: bold; padding: 20px;
    `;
    screen.innerHTML = '🎵 오렌지스쿨 즐거운 게임시간 🎵';
    document.body.appendChild(screen);
  }
}

function hideIntro() {
  const screen = document.getElementById('introScreen');
  if (screen) { screen.remove(); }
}

// ============================================================
// 레벨 카드 표시
// ============================================================
function displayLevel(level) {
  console.log('📍 displayLevel:', { level, currentGame });

  let words = null;
  if (gameData[currentGame] && gameData[currentGame][level]) {
    words = gameData[currentGame][level];
  } else {
    console.warn('⚠️ Firebase 데이터 없음, 기본값 사용');
    words = DEFAULT_GAME_DATA[currentGame][level];
  }

  if (!words) {
    console.error('❌ words undefined:', { currentGame, level });
    return;
  }

  const grid = document.getElementById('imagesGrid');
  grid.innerHTML = '';

  words.forEach((word, index) => {
    const card = document.createElement('div');
    card.className = 'image-card';
    card.id = `card-${index}`;

    if (currentGame === 'game3' || currentGame === 'game4') {
      card.textContent = wordImages[currentGame][word];
      card.style.fontSize = '50px';
      card.style.display = 'flex';
      card.style.justifyContent = 'center';
      card.style.alignItems = 'center';
    } else {
      const img = document.createElement('img');
      img.src = wordImages[currentGame][word];
      img.alt = word;
      card.appendChild(img);
    }

    grid.appendChild(card);
  });

  document.getElementById('levelDisplay').textContent = level + '단계';
}

// ============================================================
// 카드 초기화 & 프로그레스 업데이트
// ============================================================
function clearAllCards() {
  for (let i = 0; i < 8; i++) {
    const card = document.getElementById(`card-${i}`);
    if (card) card.classList.remove('active');
  }
}

function updateProgress(elapsed, total) {
  document.getElementById('progressFill').style.width =
    Math.min((elapsed / total) * 100, 100) + '%';
}

// ============================================================
// 메인 게임 루프
// ============================================================
async function initGame() {
  const speedConfig = { veryslow: 0.6, slow: 0.8, normal: 1.0, fast: 1.3 };
  const speed = speedConfig[currentDifficulty];

  const introTime      = 2.15 / speed;
  const totalGameTime  = 30   / speed;
  const flashDuration  = 2.6  / speed;
  const imageFlashTime = flashDuration / 8;

  const cardShowTimes = {
    1: 2.20  / speed,
    2: 8.10  / speed,
    3: 13.05 / speed,
    4: 18.35 / speed,
    5: 23.90 / speed
  };

  // 플래시 오프셋 로드
  const firstFlashTimes = {};
  const baseTimes = [5.20, 10.30, 15.45, 20.65, 25.75];
  for (let s = 1; s <= 5; s++) {
    const offsetMs = await getFlashOffset(currentGame, s);
    firstFlashTimes[s] = (baseTimes[s - 1] + offsetMs / 1000) / speed;
  }

  console.log('🎮 speed:', speed, '| totalGameTime:', totalGameTime.toFixed(2));
  console.log('⏱️ cardShowTimes:', cardShowTimes);
  console.log('💥 firstFlashTimes:', firstFlashTimes);

  // ✅ 오디오 재사용 + oncanplay에서 playbackRate 설정
  if (!backgroundAudio) {
    backgroundAudio = new Audio('assets/sounds/background.mp3');
  }
  backgroundAudio.currentTime = 0;
  backgroundAudio.loop = false;

  backgroundAudio.oncanplay = function () {
    console.log('🎵 oncanplay | playbackRate:', speed);
    backgroundAudio.playbackRate = speed;
    backgroundAudio.play().catch(e => console.warn('오디오 재생 실패:', e));
    backgroundAudio.oncanplay = null;
  };

  if (backgroundAudio.readyState >= 3) {
    console.log('🎵 즉시 재생 | playbackRate:', speed);
    backgroundAudio.playbackRate = speed;
    backgroundAudio.play().catch(e => console.warn('오디오 재생 실패:', e));
    backgroundAudio.oncanplay = null;
  }

  let gameRunning = true;
  let gameStartTime = performance.now();
  let currentLevel = 0;
  let currentImageIndex = -1;

  displayIntro();

  function gameLoop() {
    if (!gameRunning) return;

    const elapsed = (performance.now() - gameStartTime) / 1000;

    // 인트로 숨김
    if (elapsed > introTime && document.getElementById('introScreen')) {
      hideIntro();
    }

    // 게임 종료
    if (elapsed > totalGameTime) {
      gameRunning = false;
      clearAllCards();
      goToEnding();
      return;
    }

    // 레벨 전환
    let newLevel = 0;
    for (let level = 1; level <= 5; level++) {
      if (elapsed >= cardShowTimes[level]) newLevel = level;
      else break;
    }
    if (newLevel !== currentLevel && newLevel > 0) {
      currentLevel = newLevel;
      currentImageIndex = -1;
      displayLevel(currentLevel);
      console.log('📊 레벨 전환:', currentLevel, '| elapsed:', elapsed.toFixed(3));
    }

    // 플래시 처리
    const flashStart = firstFlashTimes[currentLevel];
    if (flashStart && elapsed >= flashStart) {
      const timeInFlash = elapsed - flashStart;
      if (timeInFlash < flashDuration) {
        const newIdx = Math.floor(timeInFlash / imageFlashTime);
        if (newIdx !== currentImageIndex && newIdx < 8) {
          if (currentImageIndex >= 0) {
            const prev = document.getElementById(`card-${currentImageIndex}`);
            if (prev) prev.classList.remove('active');
          }
          currentImageIndex = newIdx;
          const cur = document.getElementById(`card-${currentImageIndex}`);
          if (cur) cur.classList.add('active');
        }
      } else {
        clearAllCards();
        currentImageIndex = -1;
      }
    }

    updateProgress(elapsed, totalGameTime);
    gameLoopId = requestAnimationFrame(gameLoop);
  }

  gameLoopId = requestAnimationFrame(gameLoop);
}

// ============================================================
// 페이지 로드
// ============================================================
window.addEventListener('load', () => {
  loadGameData();
  preloadImages();
  console.log('✅ 페이지 로드 완료');
});
