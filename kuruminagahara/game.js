const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const BG_WIDTH = 2471;
const BG_HEIGHT = 480;

canvas.width = window.innerWidth;
canvas.height = BG_HEIGHT;

//BGM設定
const bgm = new Audio("music/下弦の月.mp3");
bgm.loop = true;
bgm.volume = 0.1;
let bgmStarted = false;

// ★追加：クリア画面用BGM
const clearBGM = new Audio("music/ワスレナグサ.mp3");
clearBGM.loop = true;
clearBGM.volume = 0.1;
let clearBGMStarted = false; // クリアBGMの再生状態を管理

const bgImage = new Image();
bgImage.src = "images/gamebg.png";

//start
const startImage = new Image();
startImage.src = "images/Start.png";

const playerImage = new Image();
playerImage.src = "images/Player.png";

const junkImage = new Image();
junkImage.src = "images/Spacejunk.png";

const lifeImage = new Image();
lifeImage.src = "images/life.png";

const theoImage = new Image();
theoImage.src = "images/Theo.png";

const playerTalkImage = new Image();
playerTalkImage.src = "images/Player-talk.png";

const theoTalk1Image = new Image();
theoTalk1Image.src = "images/Theo-talk1.png";

const theoTalk2Image = new Image();
theoTalk2Image.src = "images/Theo-talk2.png";

const az018Image = new Image();
az018Image.src = "images/Az018.png";

const lukeImage = new Image();
lukeImage.src = "images/Luke.png";

const messageSound = new Audio("sounds/メッセージ表示音1.mp3");
messageSound.volume = 0.2; // 音量

const cursorSound = new Audio("sounds/カーソル移動1.mp3");
cursorSound.volume = 0.2;

//敵
const enemy1Image = new Image();
enemy1Image.src = "images/enemy1.png";

const enemy2Image = new Image();
enemy2Image.src = "images/enemy2.png";

const enemy3Image = new Image();
enemy3Image.src = "images/enemy3.png";

const keyImage = new Image();
keyImage.src = "images/key.png";

//流れ星
const starImage = new Image();
starImage.src = "images/star.png";

const clearImage = new Image();
clearImage.src = "images/clear.png";

let showClearScreen = false;

let conversationStarted = false;

let bgX = 0;
let keys = {};

let stage = 1;
let inConversation = false;
let showBlackout = false;
let blackoutAlpha = 0;
let currentDialogue = 0;

let gameStarted = false;
let showStartScreen = true;
let startBlackout = false;
let startAlpha = 0;

let displayedText = "";
let textIndex = 0;
let textTimer = 0;
let textSpeed = 7; // 小さいほど速く表示
let textFinished = false;

const dialogues = [
  "やあ、ニウリアちゃん。ここまでよく来たね",
  "約束の彼もこの先で待っているよ。頑張ってね",
];

const az018TalkImage = new Image();
az018TalkImage.src = "images/Az018-talk.png";

const az018Dialogues = [
  "おや、ニウリアじゃないですか。",
  "よくここまで無事でしたね。",
  "あいつと約束をしているんでしょう？早く行ってあげてください",
];

// 新しいルークのトーク画像
const lukeTalk1Image = new Image();
lukeTalk1Image.src = "images/Luke-talk1.png";

const lukeTalk2Image = new Image();
lukeTalk2Image.src = "images/Luke-talk2.png";

const lukeTalk3Image = new Image();
lukeTalk3Image.src = "images/Luke-talk3.png";

// ニウリアの新しいトーク画像（もしあれば）
const playerTalk2Image = new Image();
playerTalk2Image.src = "images/Player-talk2.png"; // 「ニウリア「きづいたら、つきのはてで ひとりだった」などで使う画像

// ルークとの会話データ
const lukeDialogues = [
  { speaker: "luke", text: "・・・・・・！ニウリア", image: lukeTalk1Image },
  { speaker: "player", text: "・・・あるじ", image: playerTalkImage }, // 既存のPlayer-talk.pngを使用
  { speaker: "luke", text: "どこに行っていたの。一人では危ないと言っただろう", image: lukeTalk2Image },
  { speaker: "player", text: "きづいたら、つきのはてで ひとりだった", image: playerTalk2Image },
  { speaker: "luke", text: "・・・一人で大丈夫だった？ケガは？", image: lukeTalk1Image },
  { speaker: "player", text: "だいじょうぶ。\nでも、あるじをひとりにしないって、”やくそく”した", image: playerTalk2Image }, // 複数行のテキストは \n で改行可能
  { speaker: "player", text: "ただいま、あるじ", image: playerTalk2Image },
  { speaker: "luke", text: "・・・おかえり、ニウリア", image: lukeTalk3Image },
];

let az018ConversationStarted = false;
let currentSpeaker = "theo"; // "theo" or "az018"

//セオ設定
const theo = {
  worldX: 3300, // スタート時に絶対見えない場所
  y: canvas.height - 220,
  width: 74,
  height: 220,
};

//アズ設定
const az018 = {
  worldX: 3300,
  x: 0,
  y: canvas.height - 180,
  width: 200,
  height: 170,
};

//ルーク設定
// 既存の会話関連変数に追加
let inLukeConversation = false; // ルークとの会話中かどうか
let currentLukeDialogueIndex = 0; // ルークとの会話の現在のインデックス

const luke = {
  worldX: 3300,
  x: 0,
  y: canvas.height - 200,
  width: 100,
  height: 163,
};

const theoTrigger = {
  worldX: 1800,
  width: 100,
  height: canvas.height,
};

let player = {
  x: 100,
  y: canvas.height - 170,
  width: 80,
  height: 170,
  worldX: 100,
  frame: 0,
  moving: false,
  life: 10,
  vy: 0,
  gravity: 0.3,
  jumpStrength: -8,
  jumpCount: 0,
  maxJumps: 3,
  isInvincible: false,
  invincibleTimer: 0,
};

let cameraX = 0;

const enemyList = [];

let starList = [];

const enemyTypes = [
  {
    image: enemy1Image,
    width: 64,
    height: 77,
    frameCount: 2,
    frameWidth: 64,
    frameHeight: 77,
    animate: true,
  },
  {
    image: enemy2Image,
    width: 50,
    height: 50,
    frameCount: 1,
    frameWidth: 50,
    frameHeight: 50,
    animate: false,
  },
  {
    image: enemy3Image,
    width: 76,
    height: 100,
    frameCount: 2,
    frameWidth: 76,
    frameHeight: 100,
    animate: true,
  },
];

// ステージ2開始時に敵を配置
function initializeEnemies() {
  enemyList.length = 0; // リセット

  const minDistance = 400; // 最低距離
  const maxDistance = 700; // 最大距離
  let x = 400; // 開始位置

  while (x < 3000) {
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const moveType = Math.random() < 0.5 ? "static" : "vertical";

    enemyList.push({
      type,
      worldX: x,
      x: 0,
      y: canvas.height - type.height - Math.random() * 150,
      direction: Math.random() < 0.5 ? -1 : 1,
      speed: 1 + Math.random(),
      frame: 0,
      frameTimer: 0,
      moveType,
    });

    //次の敵の位置
    x += minDistance + Math.random() * (maxDistance - minDistance);
  }
}

let frameCount = 0;

const junkFrames = 2;
const junkSize = 50;
const junkList = [];
const junkHeights = [
  canvas.height - junkSize - 50,
  canvas.height - junkSize * 3 - 50,
  canvas.height - junkSize * 5.5 - 50,
];

for (let i = 0; i < 3; i++) {
  junkList.push({
    worldX: 600 + i * 700,
    x: 0,
    y: junkHeights[Math.floor(Math.random() * junkHeights.length)],
    width: junkSize,
    height: junkSize,
    frame: 0,
  });
}

// 入力処理
document.addEventListener("keydown", (e) => {
  // 1. スタート画面中の処理を最優先に
  if (showStartScreen) {
    if (e.code === "Space" || e.key === " ") {
      cursorSound.currentTime = 0;
      cursorSound.play().catch(() => {});
      startBlackout = true;
      e.preventDefault();
      return; // スタート画面の処理が終わったら、他の入力は無視して終了
    }
  }

  // 2. クリア画面中の処理 (追加)
  if (showClearScreen) {
    if (e.code === "Space" || e.key === " ") {
      cursorSound.currentTime = 0;
      cursorSound.play().catch(() => {});
      // ゲームをスタート画面の状態にリセット
      showClearScreen = false;
      showStartScreen = true;
      gameStarted = false;
      startBlackout = false;
      startAlpha = 0;
      bgX = 0;
      player.x = 100;
      player.y = canvas.height - 170;
      player.life = 10;
      stage = 1;
      inConversation = false;
      showBlackout = false;
      blackoutAlpha = 0;
      currentDialogue = 0;
      az018ConversationStarted = false;
      inLukeConversation = false;
      currentLukeDialogueIndex = 0;
      displayedText = "";
      textIndex = 0;
      textTimer = 0;
      textFinished = false;
      enemyList.length = 0; // 敵をクリア
      starList.length = 0; // 流れ星をクリア

      // ★修正：クリアBGMを停止
      if (clearBGMStarted) {
        clearBGM.pause();
        clearBGM.currentTime = 0;
        clearBGMStarted = false;
      }
      // 通常BGMの状態もリセットしておく
      bgm.pause();
      bgm.currentTime = 0;
      bgmStarted = false;

      e.preventDefault();
      return;
    }
  }

  // 3. ルークとの会話中の処理（スタート画面もクリア画面も終了していることが前提）
  if (inLukeConversation) {
    if (e.code === "Space" || e.key === "Enter") {
      if (!textFinished) {
        displayedText = lukeDialogues[currentLukeDialogueIndex].text;
        textFinished = true;
      } else {
        currentLukeDialogueIndex++;
        if (currentLukeDialogueIndex >= lukeDialogues.length) {
          inLukeConversation = false;
          showClearScreen = true; // ここでクリア画面へ遷移
          // ★修正：クリア画面に遷移する際、通常のBGMを停止し、クリアBGMを再生
          if (bgmStarted) {
            bgm.pause();
            bgm.currentTime = 0;
            bgmStarted = false;
          }
          if (!clearBGMStarted) {
            clearBGM.play().catch((err) => console.warn("Clear BGM再生失敗:", err));
            clearBGMStarted = true;
          }
        } else {
          displayedText = "";
          textIndex = 0;
          textTimer = 0;
          textFinished = false;
          messageSound.currentTime = 0;
          messageSound.play().catch(() => {});
        }
      }
    }
    e.preventDefault();
    return; // ルークとの会話中なので他のキー入力は無視
  }

  // 4. セオ/アズとの会話中の処理（スタート画面もクリア画面もルーク会話も終了していることが前提）
  if (inConversation) {
    if (e.code === "Space" || e.key === "Enter") {
      const activeDialogues = currentSpeaker === "az018" ? az018Dialogues : dialogues;
      if (!textFinished) {
        displayedText = activeDialogues[currentDialogue];
        textFinished = true;
      } else {
        currentDialogue++;
        if (currentDialogue >= activeDialogues.length) {
          inConversation = false;
          showBlackout = true;
        } else {
          displayedText = "";
          textIndex = 0;
          textTimer = 0;
          textFinished = false;
          messageSound.currentTime = 0;
          messageSound.play().catch(() => {}); // メッセージ音を追加
        }
      }
    }
    e.preventDefault();
    return; // 会話中なので他のキー入力は無視
  }

  keys[e.key] = true;

  if ((e.code === "Space" || e.key === " ") && player.jumpCount < player.maxJumps) {
    player.vy = player.jumpStrength;
    player.jumpCount++;
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function update() {
  //ここがupdate!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  if (showStartScreen || showClearScreen) return;

  if (showBlackout) return;

  player.moving = false;

  if (!inConversation && keys["ArrowRight"]) {
    player.x += 5;
    bgX -= 1;
    player.moving = true;
  }
  if (!inConversation && keys["ArrowLeft"]) {
    player.x -= 5;
    bgX += 1;
    player.moving = true;
  }

  console.log(`Player座標: x=${player.x.toFixed(2)}, y=${player.y.toFixed(2)}`);

  // ルークとの会話中のテキスト更新ロジック
  if (inLukeConversation && !textFinished) {
    textTimer++;
    if (textTimer >= textSpeed) {
      textTimer = 0;
      textIndex++;
      const currentLukeText = lukeDialogues[currentLukeDialogueIndex].text;
      if (textIndex <= currentLukeText.length) {
        displayedText = currentLukeText.substring(0, textIndex);
        if (textIndex === 1) {
          // 最初の文字が表示されたときに音を鳴らす
          messageSound.currentTime = 0;
          messageSound.play().catch(() => {});
        }
      }

      if (textIndex >= currentLukeText.length) {
        textFinished = true;
      }
    }
  }

  if (inConversation && !textFinished) {
    const activeDialogues = currentSpeaker === "az018" ? az018Dialogues : dialogues;

    textTimer++;
    if (textTimer >= textSpeed) {
      textTimer = 0;
      textIndex++;
      if (textIndex <= activeDialogues[currentDialogue].length) {
        displayedText = activeDialogues[currentDialogue].substring(0, textIndex);

        if (textIndex === 1) {
          messageSound.currentTime = 0;
          messageSound.play().catch(() => {});
        }
      }

      if (textIndex >= activeDialogues[currentDialogue].length) {
        textFinished = true;
      }
    }
  }

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > BG_WIDTH) player.x = BG_WIDTH - player.width;

  if (bgX <= -BG_WIDTH) bgX = 0;
  if (bgX >= BG_WIDTH) bgX = 0;

  player.frame = player.moving ? 1 : 0;
  player.vy += player.gravity;
  player.y += player.vy;

  const groundY = canvas.height - player.height;
  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.jumpCount = 0;
  }

  if (player.isInvincible) {
    player.invincibleTimer++;
    if (player.invincibleTimer > 60) {
      player.isInvincible = false;
      player.invincibleTimer = 0;
    }
  }

  if (frameCount % 20 === 0) {
    for (let junk of junkList) {
      junk.frame = (junk.frame + 1) % junkFrames;
    }
  }

  for (let junk of junkList) {
    junk.x = junk.worldX - player.x + 100;
  }

  if (stage === 1) {
    for (let junk of junkList) {
      if (
        !player.isInvincible &&
        player.x < junk.x + junk.width &&
        player.x + player.width > junk.x &&
        player.y < junk.y + junk.height &&
        player.y + player.height > junk.y
      ) {
        player.life--;
        player.isInvincible = true;
        player.invincibleTimer = 0;

        junk.worldX = player.x + canvas.width + Math.random() * 500;
        junk.y = junkHeights[Math.floor(Math.random() * junkHeights.length)];

        if (player.life <= 0) {
          alert("ゲームオーバー！");
          location.reload();
        }
      }
    }
  }

  // セオとの接近判定
  if (stage === 1 && !inConversation) {
    const playerRight = player.x + player.width;
    const triggerLeft = theoTrigger.worldX;
    const triggerRight = theoTrigger.worldX + theoTrigger.width;

    const hasEnteredTrigger = playerRight >= triggerLeft && player.x <= triggerRight;

    if (hasEnteredTrigger) {
      inConversation = true;
      currentSpeaker = "theo"; //セオが話すように設定
      currentDialogue = 0;

      displayedText = "";
      textIndex = 0;
      textTimer = 0;
      textFinished = false;

      console.log("Theoとの会話開始");
    }
  }

  if (stage === 2) {
    az018.x = az018.worldX - player.x + 100;
  } else {
    az018.x = -9999; // ステージ3では画面外に追い出す
  }

  if (stage === 2) {
    for (let enemy of enemyList) {
      // Az018の300px手前（3000px）より敵が奥ならスキップ
      if (enemy.worldX >= 3000) {
        continue;
      }

      if (enemy.moveType === "vertical") {
        enemy.y += enemy.speed * enemy.direction;
        if (enemy.y <= 100 || enemy.y >= canvas.height - enemy.type.height) {
          enemy.direction *= -1;
        }
      }

      enemy.x = enemy.worldX - player.x + 100;

      if (enemy.type.animate) {
        enemy.frameTimer++;
        if (enemy.frameTimer >= 20) {
          enemy.frame = (enemy.frame + 1) % enemy.type.frameCount;
          enemy.frameTimer = 0;
        }
      }

      // 当たり判定
      if (
        !player.isInvincible &&
        player.x < enemy.x + enemy.type.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.type.height &&
        player.y + player.height > enemy.y
      ) {
        player.life--;
        player.isInvincible = true;
        player.invincibleTimer = 0;

        if (player.life <= 0) {
          alert("ゲームオーバー！");
          location.reload();
        }
      }
    }
  }

  if (stage === 2 && !inConversation && !az018ConversationStarted && player.x >= 1700) {
    inConversation = true;
    az018ConversationStarted = true;
    currentSpeaker = "az018";

    displayedText = "";
    textIndex = 0;
    textTimer = 0;
    textFinished = false;

    currentDialogue = 0;
  }

  if (stage === 3 && frameCount % 12 === 0 && Math.random() < 0.4) {
    const spawnX = Math.random() * canvas.width; // 横位置は画面内ランダム
    const angle = Math.random() * Math.PI / 4 - Math.PI / 8; // -30°〜+30°
    const speed = 5 + Math.random() * 1.5;

    const size = 10 + Math.random() * 10;

    starList.push({
      x: spawnX,
      y: -size,
      width: size,
      height: size,
      speedX: speed * Math.sin(angle),
      speedY: speed * Math.cos(angle),
      trail: [],
    });
  }

  for (let i = starList.length - 1; i >= 0; i--) {
    const star = starList[i];

    const prevX = star.x;
    const prevY = star.y;

    star.x += star.speedX;
    star.y += star.speedY;

    star.trail.push({ x: prevX + star.width / 2, y: prevY + star.height / 2 });
    if (star.trail.length > 10) star.trail.shift();

    if (stage === 3 && !inLukeConversation) {
      // ステージ3かつルークとの会話中でない場合
      // ルークの当たり判定範囲を定義 (適宜調整してください)
      const lukeTriggerX = luke.worldX - player.x + 100; // ルークの表示位置を計算
      const lukeTriggerWidth = luke.width + 100; // ルークの幅より少し広めに設定

      // プレイヤーとルークの衝突判定
      if (
        player.x + player.width > lukeTriggerX &&
        player.x < lukeTriggerX + lukeTriggerWidth &&
        player.y + player.height > luke.y && // y座標も考慮する
        player.y < luke.y + luke.height
      ) {
        inLukeConversation = true;
        currentLukeDialogueIndex = 0;
        // 会話開始時に既存のテキスト表示変数をリセット
        displayedText = "";
        textIndex = 0;
        textTimer = 0;
        textFinished = false;
        console.log("Lukeとの会話開始");
      }
    }

    // プレイヤーとの当たり判定
    if (
      !player.isInvincible &&
      player.x < star.x + star.width &&
      player.x + player.width > star.x &&
      player.y < star.y + star.height &&
      player.y + player.height > star.y
    ) {
      player.life--;
      player.isInvincible = true;
      player.invincibleTimer = 0;
      starList.splice(i, 1); // 流れ星を消す

      if (player.life <= 0) {
        alert("ゲームオーバー！");
        location.reload();
      }
      continue;
    }

    if (star.x + star.width < 0 || star.y > canvas.height) {
      starList.splice(i, 1);
    }
  }

  frameCount++;
}

function draw() {
  //ここがdraw!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. クリア画面の描画を最優先
  if (showClearScreen) {
    const imgWidth = clearImage.width;
    const imgHeight = clearImage.height;
    const scale = Math.min(canvas.width / imgWidth, canvas.height / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const drawX = (canvas.width - drawWidth) / 2;
    const drawY = (canvas.height - drawHeight) / 2;
    ctx.drawImage(clearImage, drawX, drawY, drawWidth, drawHeight);

    ctx.fillStyle = "white";
    ctx.font = "30px sans-serif";
    ctx.textAlign = "center";
    
    return; // クリア画面表示中は他の描画をしない
  }

  // 2. スタート画面の描画
  if (showStartScreen) {
    // スタート画像を中央に表示
    const imgWidth = 1323;
    const imgHeight = 412;
    const scale = Math.min((canvas.width / imgWidth) * 1.3, (canvas.height / imgHeight) * 1);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const drawX = (canvas.width - drawWidth) / 2;
    const drawY = (canvas.height - drawHeight) / 2;
    ctx.drawImage(startImage, drawX, drawY, drawWidth, drawHeight);

    // 暗転処理
    if (startBlackout) {
      startAlpha += 0.02;
      ctx.fillStyle = `rgba(0,0,0,${startAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (startAlpha >= 1) {
        showStartScreen = false;
        gameStarted = true;
        startBlackout = false;
        startAlpha = 0;

        // BGM再生
        // ★修正：ゲーム開始時に通常のBGMを再生
        if (!bgmStarted) {
          bgm.play().catch((err) => console.warn("BGM再生失敗:", err));
          bgmStarted = true;
        }
      }
    }
    return; // スタート画面表示中は他の描画をしない
  }

  // 通常のゲーム描画（背景、プレイヤー、敵など）
  ctx.drawImage(bgImage, bgX, 0);
  ctx.drawImage(bgImage, bgX + BG_WIDTH, 0);

  if (stage === 1) {
    //
  }

  ctx.save();
  const shouldDrawPlayer = !player.isInvincible || Math.floor(frameCount / 5) % 2 === 0;
  if (shouldDrawPlayer) {
    if (keys["ArrowLeft"]) {
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      ctx.scale(-1, 1);
      ctx.drawImage(
        playerImage,
        player.frame * player.width,
        0,
        player.width,
        player.height,
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height,
      );
    } else {
      ctx.translate(player.x, player.y);
      ctx.drawImage(
        playerImage,
        player.frame * player.width,
        0,
        player.width,
        player.height,
        0,
        0,
        player.width,
        player.height,
      );
    }
  }
  ctx.restore();

  if (stage === 1) {
    for (let junk of junkList) {
      if (junk.x + junk.width > 0 && junk.x < canvas.width) {
        ctx.drawImage(
          junkImage,
          junk.frame * junk.width,
          0,
          junk.width,
          junk.height,
          junk.x,
          junk.y,
          junk.width,
          junk.height,
        );
      }
    }
  }

  if (stage === 3) {


    
    for (let star of starList) {
      // 軌跡の線を1点ずつ描画（透明度付き）
      if (star.trail.length > 1) {
        for (let i = 1; i < star.trail.length; i++) {
          const p1 = star.trail[i - 1];
          const p2 = star.trail[i];
          const alpha = i / star.trail.length;

          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.7})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          if (stage === 3) {
            luke.x = luke.worldX - player.x + 100;

            if (
              luke.x + luke.width > -100 &&
              luke.x < canvas.width + 100 &&
              lukeImage.complete &&
              lukeImage.naturalWidth !== 0
            ) {
              const centerX = luke.x + luke.width / 2;
              const centerY = luke.y + luke.height / 2;
              const radius = 120;

              const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
              gradient.addColorStop(0, "rgba(181, 218, 247, 0.4)");
              gradient.addColorStop(1, "rgba(200, 222, 255, 0)");

              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
              ctx.fill();

              ctx.drawImage(lukeImage, luke.x, luke.y, luke.width, luke.height);

              // 画像描画
              ctx.drawImage(lukeImage, 0, 0, luke.width, luke.height, luke.x, luke.y, luke.width, luke.height);
            }
          }
        }
      }

      //発光エフェクト
      ctx.save();
      ctx.shadowColor = "rgba(255, 255, 200, 0.8)";
      ctx.shadowBlur = 20;
      ctx.drawImage(starImage, star.x, star.y, star.width, star.height);
      ctx.restore();
    }
  }

  // Theoの描画
  if (!inConversation && stage === 1) {
    //Theoのスポットライト描画
    if (!inConversation && stage === 1) {
      const centerX = theo.worldX - player.x + 100 + theo.width / 2;
      const centerY = theo.y + theo.height / 2;
      const radius = 120;

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, "rgba(181, 218, 247, 0.4)");
      gradient.addColorStop(1, "rgba(200, 222, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    theo.x = theo.worldX - player.x + 100;
    if (theo.x + theo.width > 0 && theo.x < canvas.width) {
      ctx.drawImage(theoImage, 0, 0, theo.width, theo.height, theo.x, theo.y, theo.width, theo.height);
    }
  }

  if (stage === 2) {
    for (let enemy of enemyList) {
      if (enemy.worldX >= 3000) {
        continue;
      }

      if (enemy.x + enemy.type.width > 0 && enemy.x < canvas.width) {
        ctx.drawImage(
          enemy.type.image,
          enemy.frame * enemy.type.frameWidth,
          0,
          enemy.type.frameWidth,
          enemy.type.frameHeight,
          enemy.x,
          enemy.y,
          enemy.type.width,
          enemy.type.height,
        );
      }
    }
  }

  // Az018のスポットライト描画（Theoと同様に）
  if (stage === 2 && az018.x + az018.width > 0 && az018.x < canvas.width) {
    const centerX = az018.x + az018.width / 2 - 50;
    const centerY = az018.y + az018.height / 2;
    const radius = 120;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, "rgba(181, 218, 247, 0.4)");
    gradient.addColorStop(1, "rgba(200, 222, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  //Az描画（ステージ2のみ表示）
  if (stage === 2 && az018.x + az018.width > 0 && az018.x < canvas.width) {
    ctx.drawImage(az018Image, 0, 0, az018.width, az018.height, az018.x, az018.y, az018.width, az018.height);
  }

  // 操作説明（左上に表示）
  if (gameStarted && !inConversation && !showBlackout) {
    const keyScale = 0.15; // ← 画像を25%に縮小（調整可能）
    const keyWidth = keyImage.width * keyScale;
    const keyHeight = keyImage.height * keyScale;
    const keyX = 10; // 左から10px
    const keyY = 10; // 上から10px

    ctx.drawImage(keyImage, keyX, keyY, keyWidth, keyHeight);
  }

  for (let i = 0; i < player.life; i++) {
    ctx.drawImage(lifeImage, canvas.width - 60 - i * 60, 10, 50, 50);
  }

  // ルーク会話中の描画
  // ルーク会話中の描画
  if (inLukeConversation) {
    const pOriginalWidth = 433;
    const pOriginalHeight = 589;
    const lOriginalWidth = 433;
    const lOriginalHeight = 589;

    const maxCharHeight = canvas.height - 40;
    // 画面の幅に応じて、画像のスケールを調整
    // 適切なスケール値を見つけるために、0.85 は調整してください
    const scaleFactor = Math.min((canvas.width * 0.85) / (pOriginalWidth + lOriginalWidth), maxCharHeight / Math.max(pOriginalHeight, lOriginalHeight));
    
    const pWidth = pOriginalWidth * scaleFactor;
    const pHeight = pOriginalHeight * scaleFactor;
    const lWidth = lOriginalWidth * scaleFactor;
    const lHeight = lOriginalHeight * scaleFactor;

    // キャラクター間の中心からの距離を調整するための値
    // この値を大きくするとキャラ同士が離れ、小さくすると近づきます
    const characterGap = 70; 

    // プレイヤー画像（左）のX座標を計算
    // キャンバスの中央からルークの画像幅の半分とcharacterGapを引いた位置
    const playerX = (canvas.width / 2) - (lWidth / 2) - pWidth + characterGap;
    // ルーク画像（右）のX座標を計算
    // キャンバスの中央からプレイヤーの画像幅の半分とcharacterGapを足した位置
    const lukeX = (canvas.width / 2) + (pWidth / 2) - characterGap;
    
    // Y座標はキャラクターの高さに合わせて調整
    const playerY = canvas.height - pHeight;
    const lukeY = canvas.height - lHeight;

    ctx.drawImage(
      playerTalkImage,
      0,
      0,
      pOriginalWidth,
      pOriginalHeight,
      playerX, // 新しく計算したX座標
      playerY,
      pWidth,
      pHeight,
    );

    const currentDialogueData = lukeDialogues[currentLukeDialogueIndex];
    let talkImage = currentDialogueData.image;

    if (currentDialogueData.speaker === "player") {
      ctx.globalAlpha = 0.5;
    }
    ctx.drawImage(
      talkImage,
      0,
      0,
      lOriginalWidth,
      lOriginalHeight,
      lukeX, // 新しく計算したX座標
      lukeY,
      lWidth,
      lHeight,
    );
    ctx.globalAlpha = 1;

    // セリフ枠とテキスト (この部分は変更なしでOK)
    const frameImage = new Image();
    frameImage.src = "images/serif frame.png";
    const frameWidth = 700;
    const frameHeight = 120;
    const frameX = (canvas.width - frameWidth) / 2;
    const frameY = canvas.height - frameHeight;

    ctx.drawImage(frameImage, frameX, frameY, frameWidth, frameHeight);

    ctx.fillStyle = "white";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const speakerName = currentDialogueData.speaker === "luke" ? "ルーク" : "ニウリア";
    ctx.fillText(speakerName, frameX + 40, frameY + 10);

    ctx.font = "22px sans-serif";
    const lines = displayedText.split("\n");
    let textY = frameY + 50;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], frameX + 40, textY + i * 25);
    }
  }

  if (inConversation) {
    // キャラ画像の元サイズ
    const pOriginalWidth = 433;
    const pOriginalHeight = 589;
    const tOriginalWidth = 600;
    const tOriginalHeight = 649;

    const maxCharHeight = canvas.height - 40;
    const pScale = Math.min((canvas.width / 2 - 100) / pOriginalWidth, maxCharHeight / pOriginalHeight);
    const tScale = Math.min((canvas.width / 2 - 100) / tOriginalWidth, maxCharHeight / tOriginalHeight);

    const pWidth = pOriginalWidth * pScale;
    const pHeight = pOriginalHeight * pScale;
    const tWidth = tOriginalWidth * tScale;
    const tHeight = tOriginalHeight * tScale;

    const sideMargin = 150;

    // プレイヤー画像（左）
    ctx.drawImage(
      playerTalkImage,
      0,
      0,
      pOriginalWidth,
      pOriginalHeight,
      sideMargin,
      canvas.height - pHeight,
      pWidth,
      pHeight,
    );

    // 相手キャラ画像（右）を切り替え
    let talkImage;
    let talkImageY = canvas.height - pHeight;
    let scale = 1;

    if (currentSpeaker === "az018") {
      talkImage = az018TalkImage;
      talkImageY -= 10; // 100px下にずらす
      scale = 1.1;
    } else {
      talkImage = currentDialogue === 0 ? theoTalk1Image : theoTalk2Image;
    }

    const scaledWidth = tWidth * scale;
    const scaledHeight = tHeight * scale;

    ctx.drawImage(
      talkImage,
      0,
      0,
      tOriginalWidth,
      tOriginalHeight,
      canvas.width - scaledWidth - sideMargin, // 位置も大きさに合わせて調整
      talkImageY,
      scaledWidth,
      scaledHeight,
    );

    // セリフ枠とテキスト
    const frameImage = new Image();
    frameImage.src = "images/serif frame.png";
    const frameWidth = 700;
    const frameHeight = 120;
    const frameX = (canvas.width - frameWidth) / 2;
    const frameY = canvas.height - frameHeight;

    ctx.drawImage(frameImage, frameX, frameY, frameWidth, frameHeight);

    // キャラ名表示
    ctx.fillStyle = "white";
    ctx.font = "18px sans-serif";

    const speakerName = currentSpeaker === "az018" ? "Az018" : "セオ";

    if (currentSpeaker === "az018") {
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(speakerName, frameX + 30, frameY + 5); // 左上に表示
    } else {
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(speakerName, frameX + 40, frameY + 23); // セオは今まで通り
    }

    // セリフ表示
    ctx.font = "22px sans-serif";

    const textY = currentSpeaker === "az018" ? frameY + 68 : frameY + 80;
    ctx.fillText(displayedText, frameX + 40, textY);
  }

  if (showBlackout) {
    blackoutAlpha += 0.02;
    ctx.fillStyle = `rgba(0,0,0,${blackoutAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (blackoutAlpha >= 1) {
      if (stage === 1) {
        stage = 2;
        initializeEnemies(); // ステージ2の敵初期化
      } else if (stage === 2) {
        stage = 3; // 🔁 ステージ3に進む
      }

      player.x = 100;
      inConversation = false;
      showBlackout = false;
      blackoutAlpha = 0;
      currentDialogue = 0;
    }
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = BG_HEIGHT;
  player.y = canvas.height - player.height;
});

bgImage.onload = () => {
  gameLoop();
};