const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 高DPI対応
const scale = window.devicePixelRatio || 1;
canvas.width = 1920 * scale;
canvas.height = 1080 * scale;
ctx.scale(scale, scale);

// ゲーム状態
let gameState = "title";
let fadeAlpha = 0;
let fadeDir = 0;
let fadeSpeed = 0.002; // デフォルトのフェード速度

// 入力状態（WASD）
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// 画像ロード
const titleImg = new Image();
const subtitleImg = new Image();
const subtitle02Img = new Image();
const bgImg = new Image();
const fgImg = new Image();
const wasdHintImg = new Image();
const playerSprite = new Image();
const fishSprite = new Image();
const fishSprite02 = new Image();
// 泡のスプライト
const bubbleLargeImg = new Image();
const bubbleMediumImg = new Image();
const bubbleSmallImg = new Image();

titleImg.src = "images/title.jpg";
subtitleImg.src = "images/subtitle.jpg";
subtitle02Img.src = "images/subtitle02.jpg";
bgImg.src = "images/background.jpg";
fgImg.src = "images/front.png";
wasdHintImg.src = "images/cursor.png";
playerSprite.src = "images/player.png";
fishSprite.src = "images/fish01.png";
fishSprite02.src = "images/fish02.png";
bubbleLargeImg.src = "images/awa01.png";
bubbleMediumImg.src = "images/awa02.png";
bubbleSmallImg.src = "images/awa03.png";

const totalAssets = 12;
let assetsLoaded = 0;
function checkAssetsLoaded() {
  assetsLoaded++;
  if (assetsLoaded === totalAssets) {
    requestAnimationFrame(update);
  }
}
[titleImg, subtitleImg, subtitle02Img, bgImg, fgImg, wasdHintImg, playerSprite, fishSprite, fishSprite02, bubbleLargeImg, bubbleMediumImg, bubbleSmallImg].forEach(img => {
  img.onload = checkAssetsLoaded;
});

// プレイヤー定義（魚）
const player = {
  x: 350,
  y: 480,
  width: 300,
  height: 300,
  speed: 4,
  frameIndex: 0,
  frameCount: 3,
  frameTimer: 0,
  frameInterval: 30,
  sprite: playerSprite,
  facingLeft: false,
  swayAngle: 0,
  swaySpeed: 0.03
};

let wasdHintActive = true;
let scrollX = 0;
let scrollY = 0;

// 魚定義
const fishes = [];
const maxFish = 8 + Math.floor(Math.random() * 5);
for (let i = 0; i < maxFish; i++) {
    const useFish02 = Math.random() < 0.5;
  fishes.push({
    x: 1920 + Math.random() * 4000,
    y: 300 + Math.random() * 400,
    baseY: 300 + Math.random() * 400,
    width: 300,
    height: 300,
    speed: 1 + Math.random() * 2,
    frameIndex: 0,
    frameCount: 3,
    frameTimer: 0,
    frameInterval: 30 + Math.random() * 20,
    swayAngle: Math.random() * Math.PI * 2,
    swaySpeed: 0.02 + Math.random() * 0.02,
    sprite: useFish02 ? fishSprite02 : fishSprite
  });
}

// 泡定義
const bubbles = [];
const bubbleSizes = [
    { name: "large", img: bubbleLargeImg, scale: 1, minSpeed: 0.5, maxSpeed: 1 },
    { name: "medium", img: bubbleMediumImg, scale: 0.7, minSpeed: 0.8, maxSpeed: 1.5 },
    { name: "small", img: bubbleSmallImg, scale: 0.4, minSpeed: 1.0, maxSpeed: 2.0 }
];
const maxBubbles = 20; // 泡の最大数

function createBubble() {
    const sizeConfig = bubbleSizes[Math.floor(Math.random() * bubbleSizes.length)];
    const baseWidth = 300;
    const currentWidth = baseWidth * sizeConfig.scale;
    const currentHeight = baseWidth * sizeConfig.scale;

    return {
        // ★★変更点：泡のX座標を現在のゲーム画面（スクロール考慮）内でランダムに生成★★
        x: scrollX + Math.random() * 1920, // 現在の画面領域（1920px）内でランダムなX座標
        y: 1080 + Math.random() * 200, // 画面下部より少し下に配置
        width: currentWidth,
        height: currentHeight,
        speed: sizeConfig.minSpeed + Math.random() * (sizeConfig.maxSpeed - sizeConfig.minSpeed),
        swayAngle: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.02,
        swayMagnitude: 10 + Math.random() * 20,
        sprite: sizeConfig.img,
        opacity: 0.5 + Math.random() * 0.5
    };
}

// 初期泡生成
// ゲーム開始時（または画面遷移時）に泡を初期化する
function initializeBubbles() {
    bubbles.length = 0; // 既存の泡をクリア
    for (let i = 0; i < maxBubbles; i++) {
        const bubble = createBubble();
        // 初期生成時は画面全体の下の方に均等に配置
        bubble.y = Math.random() * (1080 + 200) + 1080; // 画面内から少し下にかけて散らばせる
        bubbles.push(bubble);
    }
}


function startFade(nextState, customSpeed = fadeSpeed) {
  fadeAlpha = 0;
  fadeDir = 1;
  fadeSpeed = customSpeed;
  gameState = nextState;
}

// メインループ
function update() {
  updateLogic();
  draw();
  requestAnimationFrame(update);
}

function updateLogic() {
  // フェード処理
  if (fadeDir !== 0) {
    fadeAlpha += fadeDir * fadeSpeed;
    if (fadeAlpha >= 1) {
      fadeAlpha = 1;
      if (gameState === "fadeToSubtitle") {
        gameState = "subtitle";
        fadeDir = -1;
      } else if (gameState === "fadeToGame") {
        gameState = "game";
        fadeDir = -1;
          initializeBubbles(); // ★★追加：ゲーム開始時に泡を初期化★★
      } else if (gameState === "fadeToSecondSubtitle") {
            gameState = "secondSubtitle";
            fadeDir = -1;
        }
    } else if (fadeAlpha <= 0) {
      fadeAlpha = 0;
      fadeDir = 0;
    }
  }

  if (gameState === "game") {
    if (!wasdHintActive) {
      handleMovement();
      updateFish();
      updateBubbles();
    }

    // ヒント解除
    if (wasdHintActive &&
        (keys["KeyW"] || keys["KeyA"] || keys["KeyS"] || keys["KeyD"])) {
      wasdHintActive = false;
    }
  }

  // プレイヤーの揺れ
  player.swayAngle += player.swaySpeed;
  player.swayOffset = Math.sin(player.swayAngle) * 10;
}

function handleMovement() {
  let moving = false;
  if (keys["KeyA"]) {
    player.x -= player.speed;
    player.facingLeft = true;
    moving = true;
  }
  if (keys["KeyD"]) {
    player.x += player.speed;
    player.facingLeft = false;
    moving = true;
  }
  if (keys["KeyW"]) {
    player.y -= player.speed;
    moving = true;
  }
  if (keys["KeyS"]) {
    player.y += player.speed;
    moving = true;
  }

  // 移動アニメーション
  if (moving) {
    player.frameTimer++;
    if (player.frameTimer >= player.frameInterval) {
      player.frameIndex = (player.frameIndex + 1) % player.frameCount;
      player.frameTimer = 0;
    }
  } else {
    player.frameIndex = 1;
  }

  const marginX = 960 - player.width / 2;
  const marginY = 540 - player.height / 2;
  scrollX = Math.max(0, Math.min(player.x - marginX, bgImg.width - 1920));
  scrollY = Math.max(0, Math.min(player.y - marginY, bgImg.height - 1080));

    // プレイヤーが画面右端に到達したらフェードアウト開始
    const maxScrollX = bgImg.width - 1920;
    if (scrollX >= maxScrollX && player.x - scrollX + player.width > 1920 - player.width / 2 && fadeDir === 0) {
        startFade("fadeToSecondSubtitle", 0.004);
    }
}

function updateFish() {
  for (let fish of fishes) {
    fish.x -= fish.speed;
    fish.swayAngle += fish.swaySpeed;
    fish.y = fish.baseY + Math.sin(fish.swayAngle) * 20;

    fish.frameTimer++;
    if (fish.frameTimer >= fish.frameInterval) {
      fish.frameIndex = (fish.frameIndex + 1) % fish.frameCount;
      fish.frameTimer = 0;
    }

    // 画面外に出たら右に戻す
    if (fish.x < -fish.width) {
      fish.x = bgImg.width + Math.random() * 1000;
      fish.baseY = 300 + Math.random() * 400;
      fish.sprite = Math.random() < 0.5 ? fishSprite02 : fishSprite;
    }
  }
}

function updateBubbles() {
    for (let bubble of bubbles) {
        // 上昇
        bubble.y -= bubble.speed;
        // 左右に揺れる
        bubble.swayAngle += bubble.swaySpeed;
        bubble.x += Math.sin(bubble.swayAngle) * bubble.swayMagnitude * 0.05;

        // 画面上部に出たら下に戻す
        if (bubble.y < -bubble.height) {
            Object.assign(bubble, createBubble());
            bubble.y = 1080 + Math.random() * 200; // 画面下部より少し下に再配置
            bubble.x = scrollX + Math.random() * 1920; // ★★変更：再出現時のX座標も現在の画面に合わせる★★
        }
    }
}

function draw() {
  ctx.clearRect(0, 0, 1920, 1080);

  if (gameState === "title" || gameState === "fadeToSubtitle") {
    drawFullHeightCentered(titleImg);
  } else if (gameState === "subtitle" || gameState === "fadeToGame") {
    drawFullHeightCentered(subtitleImg);
  } else if (gameState === "secondSubtitle") {
      drawFullHeightCentered(subtitle02Img);
  } else if (gameState === "game") {
    // 背景
    ctx.drawImage(bgImg, -scrollX, -scrollY);

    // 泡の描画
    for (let bubble of bubbles) {
        ctx.globalAlpha = bubble.opacity;
        ctx.drawImage(bubble.sprite, 0, 0, 300, 300, bubble.x - scrollX, bubble.y - scrollY, bubble.width, bubble.height);
        ctx.globalAlpha = 1.0;
    }

    // プレイヤー
    const sx = player.frameIndex * player.width;
    const drawY = player.y + player.swayOffset;
    ctx.save();
    if (player.facingLeft) {
      ctx.translate(player.x - scrollX + player.width, drawY - scrollY);
      ctx.scale(-1, 1);
      ctx.drawImage(player.sprite, sx, 0, player.width, player.height, 0, 0, player.width, player.height);
    } else {
      ctx.drawImage(player.sprite, sx, 0, player.width, player.height, player.x - scrollX, drawY - scrollY, player.width, player.height);
    }
    ctx.restore();

    // 魚たち
    for (let fish of fishes) {
      const fsx = fish.frameIndex * fish.width;
      ctx.drawImage(fish.sprite, fsx, 0, fish.width, fish.height, fish.x - scrollX, fish.y - scrollY, fish.width, fish.height);
    }

    // 前景
    ctx.drawImage(fgImg, -scrollX, -scrollY);

    // WASDヒント（右下に配置）
    if (wasdHintActive) {
      const hintX = 1920 - wasdHintImg.width - 20;
      const hintY = 1080 - wasdHintImg.height - 20;
      ctx.drawImage(wasdHintImg, hintX, hintY);
    }
  }

  // フェード（白）
  if (fadeAlpha > 0) {
    ctx.fillStyle = `rgba(255,255,255,${fadeAlpha})`;
    ctx.fillRect(0, 0, 1920, 1080);
  }
}

function drawFullHeightCentered(img) {
    if (img.width === 1920 && img.height === 1080) {
        ctx.drawImage(img, 0, 0, 1920, 1080);
    } else {
        const scaleFactor = 1080 / img.height;
        const drawWidth = img.width * scaleFactor;
        const drawX = (1920 - drawWidth) / 2;
        ctx.drawImage(img, drawX, 0, drawWidth, 1080);
    }
}

// 画面クリックで遷移
canvas.addEventListener("click", () => {
  if (gameState === "title" && fadeDir === 0) {
    startFade("fadeToSubtitle", 0.004);
  } else if (gameState === "subtitle" && fadeDir === 0) {
    startFade("fadeToGame", 0.008);
  } else if (gameState === "secondSubtitle" && fadeDir === 0) {
      gameState = "title";
      fadeDir = -1;
  }
});