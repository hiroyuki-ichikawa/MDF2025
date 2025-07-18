// 使うカード画像（ペア分）
const allCardsData = [
  'img1.png', 'img2.png', 'img3.png', 'img4.png',
  'img5.png', 'img6.png', 'img7.png', 'img8.png',
  'img9.png', 'img10.png', 'img11.png', 'img12.png'
];

let selectedCards = [];
let deck = [];
let firstCard = null;
let lockBoard = false;
let matchedPairs = 0;
let timer;
let timeLeft = 60;
let totalPairs = 0;

// 効果音（ファイル名は任意）
const matchSound = new Audio('match.mp3');
const mismatchSound = new Audio('mismatch.mp3');
const clearSound = new Audio('clear.mp3');
const clickSound = new Audio('click.mp3');

function startGame() {

  const bgm = document.getElementById('bgm');
  bgm.volume = 0.4; // 音量（0〜1）
  bgm.play().catch(e => {
    console.log("自動再生ブロック中。クリックで再開可能");
  });
  const difficulty = document.getElementById('difficulty').value;
  switch (difficulty) {
    case 'easy':
      selectedCards = allCardsData.slice(0, 5);
      timeLeft = 45;
      break;
    case 'normal':
      selectedCards = allCardsData.slice(0, 8);
      timeLeft = 60;
      break;
    case 'hard':
      selectedCards = allCardsData.slice(0, 12);
      timeLeft = 75;
      break;
  }
  totalPairs = selectedCards.length;
  matchedPairs = 0;
  firstCard = null;
  lockBoard = false;

  // 画面切替
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('clear-screen').classList.add('hidden');
  document.getElementById('gameover-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');

  setupBoard();
  startTimer();
  updatePairs();
  updateTimeDisplay();
}

function setupBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  // ペア分のカードを2枚ずつ用意
  deck = [];
  selectedCards.forEach(img => {
    deck.push({ img, id: generateId() });
    deck.push({ img, id: generateId() });
  });

  // シャッフル
  deck = shuffle(deck);

  // グリッドの列数調整（画面幅によって変わる場合があれば対応可能）
  const pairsCount = selectedCards.length;
  if (pairsCount <= 5) {
    board.style.gridTemplateColumns = 'repeat(5, 80px)';
  } else if (pairsCount <= 8) {
    board.style.gridTemplateColumns = 'repeat(4, 80px)';
  } else {
    board.style.gridTemplateColumns = 'repeat(6, 80px)';
  }

  // カードを作成して配置
  deck.forEach(cardData => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.img = cardData.img;
    card.dataset.id = cardData.id;

    const cardInner = document.createElement('div');
    cardInner.classList.add('card-inner');

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');
    cardFront.style.backgroundImage = `url(${cardData.img})`;

    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);

    card.addEventListener('click', () => onCardClick(card));
    board.appendChild(card);
  });
}

function onCardClick(card) {
  if (lockBoard) return;
  if (card.classList.contains('flipped')) return;
  clickSound.play();

  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  // 2枚目のカードがクリックされた
  lockBoard = true;

  if (firstCard.dataset.img === card.dataset.img) {
    // ペア成立
    matchSound.play();
    matchedPairs++;
    updatePairs();

    // マッチアニメーションを付ける
    firstCard.querySelector('.card-inner').classList.add('matched');
    card.querySelector('.card-inner').classList.add('matched');

    firstCard.removeEventListener('click', () => onCardClick(firstCard));
    card.removeEventListener('click', () => onCardClick(card));

    firstCard = null;
    lockBoard = false;

    if (matchedPairs === totalPairs) {
      clearSound.play();
      clearTimeout(timer);
      setTimeout(() => {
        showClearScreen();
      }, 700);
    }
  } else {
    // 不成立
    mismatchSound.play();
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      card.classList.remove('flipped');
      firstCard = null;
      lockBoard = false;
    }, 1000);
  }
}

function updatePairs() {
  document.getElementById('pairs').textContent = `ペア: ${matchedPairs}`;
}

function startTimer() {
  updateTimeDisplay();
  timer = setInterval(() => {
    timeLeft--;
    updateTimeDisplay();
    if (timeLeft <= 10) {
      document.getElementById('time').classList.add('blinking');
    }
    if (timeLeft <= 0) {
      clearInterval(timer);
      showGameOverScreen();
    }
  }, 1000);
}

function updateTimeDisplay() {
  const min = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const sec = (timeLeft % 60).toString().padStart(2, '0');
  document.getElementById('time').textContent = `タイム: ${min}:${sec}`;
}

function showClearScreen() {
// 拍手を鳴らす
const clapSound = document.getElementById('clap');
clapSound.currentTime = 0; // 連続プレイに備えて最初から
clapSound.play();

  // 飛び出し演出を開始
  flyOutMonsters().then(() => {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('clear-screen').classList.remove('hidden');
    document.getElementById('time').classList.remove('blinking');
    showCelebrationMonsters();
  });
}
function showCelebrationMonsters() {
  const container = document.getElementById('celebration-container');
  container.innerHTML = '';

  const left = document.createElement('div');
  const right = document.createElement('div');

  left.className = 'celebration-monster';
  right.className = 'celebration-monster';

  left.style.backgroundImage = "url('img1.png')";
  right.style.backgroundImage = "url('img2.png')";

  left.style.animation = 'celebrateIn-left 1.5s forwards';
  right.style.animation = 'celebrateIn-right 1.5s forwards';

  container.appendChild(left);
  container.appendChild(right);
}


function showGameOverScreen() {
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('gameover-screen').classList.remove('hidden');
  document.getElementById('time').classList.remove('blinking');
}

function restart() {
  // タイマー停止
  clearTimeout(timer);
  clearInterval(timer);

  document.getElementById('clear-screen').classList.add('hidden');
  document.getElementById('gameover-screen').classList.add('hidden');
  document.getElementById('start-screen').classList.remove('hidden');
  document.getElementById('pairs').textContent = 'ペア: 0';
  document.getElementById('time').textContent = 'タイム: 00:00';
}

// 乱数で一意ID生成
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// 配列シャッフル関数（Fisher-Yates）
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  while(currentIndex !== 0){
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

// 飛び出す演出のPromiseを返す関数
function flyOutMonsters() {
  return new Promise((resolve) => {
    const flyoutContainer = document.getElementById('flyout-container');
    flyoutContainer.innerHTML = '';

    // 全マッチ済みカードの表面画像を取得
    const matchedCards = [...document.querySelectorAll('.card.flipped')];

    matchedCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const imgUrl = card.dataset.img;

      const flyout = document.createElement('div');
      flyout.classList.add('flyout-monster');
      flyout.style.backgroundImage = `url(${imgUrl})`;

      // 初期位置をカードと同じにする
      flyout.style.left = rect.left + 'px';
      flyout.style.top = rect.top + 'px';

      // ランダムに飛ぶ方向と距離（px）
      const randomX = (Math.random() - 0.5) * 300 + 'px'; // -150〜150 px
      const randomY = - (Math.random() * 300 + 150) + 'px'; // 上方向へ150〜450 px
      const randomRot = (Math.random() * 720 - 360) + 'deg'; // -360°〜360°

      // CSSカスタムプロパティで渡す
      flyout.style.setProperty('--x', randomX);
      flyout.style.setProperty('--y', randomY);
      flyout.style.setProperty('--rot', randomRot);

      flyoutContainer.appendChild(flyout);
    });

    // 1.5秒後に消してPromise解決
    setTimeout(() => {
      flyoutContainer.innerHTML = '';
      resolve();
    }, 1600);
  });
}
function endGame(cleared) {
  clearInterval(timer);
  document.getElementById('game-screen').classList.add('hidden');

  if (cleared) {
    clearSound.currentTime = 0;
    clearSound.play();
    playConfetti();
    const clear = document.getElementById('clear-screen');
    clear.classList.add('pop-in'); // ←ここ
    clear.classList.remove('hidden');
  } else {
    const over = document.getElementById('gameover-screen');
    over.classList.add('pop-in'); // ←ここ追加
    over.classList.remove('hidden');
  }
}
