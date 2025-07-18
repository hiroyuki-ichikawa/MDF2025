// モデルファイルのパス設定
const URL = "model/";
const modelURL = URL + "model.json";
const metadataURL = URL + "metadata.json";

// グローバル変数の定義
let model, webcam, ctx, labelContainer, maxPredictions;
let waitMessage; // Class 3 (何もしていない) 表示用
let gestureDisplay; // ジェスチャー表示用の要素
const statusElement = document.getElementById("status");
// 成功時に鳴らす効果音
const successSound = new Audio("material/seikai.mp3");
successSound.preload = "auto";

const levels = [
  { className: "Class 2", img: "material/image01.jpg" },  // Level 1
  { className: "Class 3", img: "material/image02.jpg" },  // Level 2
  { className: "Class 4", img: "material/image03.jpg" }   // Level 3
];
let currentLevel = 0;
const refImg   = document.getElementById("reference-img");
const levelNum = document.getElementById("level-num");

// ステータスメッセージを表示する関数
function showStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.style.display = "block";
  statusElement.className = isError ? "error" : "success";
  console.log(isError ? "エラー:" : "状態:", message);
}

// ジェスチャー表示を更新する関数
function updateGestureDisplay(classIndex) {
  if (!gestureDisplay) return;
  
  switch(classIndex) {
    // Class 2/3/4: ○を白色で表示
    case 2:
    case 3:
    case 4:
      gestureDisplay.textContent = "○";
      gestureDisplay.style.color = "#ffffff"; // 白色
      gestureDisplay.style.display = "block";
      break;
    default:
      gestureDisplay.style.display = "none";
      break;
  }
}
function levelUp() {
  currentLevel++;
  if (currentLevel >= levels.length) {
    gameComplete = true;
    waitMessage.textContent = "全レベルクリア！おめでとう！";
    // 長いテキストがはみ出さないように折り返し許可＆フォントサイズ調整
    waitMessage.style.whiteSpace = "normal";
    waitMessage.style.fontSize   = "28px";
    waitMessage.style.display = "block";
    gestureDisplay.style.display = "none";
    levelNum.textContent = levels.length;   // 表示を 3 のまま固定
    return;
  }
  refImg.src = levels[currentLevel].img;
  levelNum.textContent = currentLevel + 1;
  waitMessage.style.display = "none";
}

// 初期化関数
async function init() {
  try {
    // ジェスチャー表示用の要素を作成
    gestureDisplay = document.createElement("div");
    gestureDisplay.id = "gesture-display";
    gestureDisplay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 200px;
      font-weight: bold;
      z-index: 1000;
      display: none;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(gestureDisplay);
    
    // モデルの読み込み
    showStatus("モデルを読み込んでいます...");
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    showStatus("モデルの読み込みが完了しました");
    
    // Webカメラのセットアップ
    showStatus("カメラを初期化しています...");
    webcam = new tmPose.Webcam(640, 480, true); // true = 鏡像反転
    await webcam.setup();
    await webcam.play();
    showStatus("カメラの初期化が完了しました");
    
    // Webカメラのキャンバスを追加
    const webcamContainer = document.getElementById("webcam-container");
    webcamContainer.appendChild(webcam.canvas);
    ctx = webcam.canvas.getContext("2d");
    
    // --- サイズ同期（カメラとお手本画像を同じ大きさへ） ---
    function syncBoxSize() {
      const w = webcam.canvas.clientWidth;
      const h = webcam.canvas.clientHeight;
      const refBox = document.getElementById("reference-container");
      refBox.style.width  = w + "px";
      refBox.style.height = h + "px";
    }
    // 初期同期
    syncBoxSize();
    // ウィンドウリサイズ時にも同期
    window.addEventListener("resize", syncBoxSize);
    
    // 予測結果表示用の要素を作成
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
      labelContainer.appendChild(document.createElement("div"));
    }
    // 文字の表示
    waitMessage = document.createElement("div");
    waitMessage.id = "wait-message";
    waitMessage.style.cssText = `
      margin-top: 16px;
      font-size: 32px;
      font-weight: bold;
      text-align: center;
      white-space: nowrap;
      display: none;
    `;
    // 参照画像をボックスいっぱいに表示
    refImg.style.width = "100%";
    refImg.style.height = "100%";
    refImg.style.objectFit = "cover";
    labelContainer.appendChild(waitMessage);
    
    // 初期参照画像を設定
    refImg.src = levels[currentLevel].img;
    
    // 予測ループを開始
    window.requestAnimationFrame(loop);
    statusElement.style.display = "none";
    
  } catch (error) {
    showStatus(`初期化に失敗しました: ${error.message}`, true);
    console.error("エラーの詳細:", error);
  }
}

// メインループ関数
let levelUpCooldown = false; // 連続でレベルアップしないためのフラグ
let gameComplete = false;    // 全レベルクリア済みかどうか
async function loop() {
  try {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
  } catch (error) {
    showStatus(`予測中にエラーが発生しました: ${error.message}`, true);
    console.error("ループエラーの詳細:", error);
  }
}

// 予測実行関数
async function predict() {
  try {
    // ポーズの推定
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    
    // クラスの予測
    let detectedGesture = -1;   // 何も検出していない状態
    const predictions = await model.predict(posenetOutput);
    
    // --- Idle 判定 (Class 1 または いずれのクラスも 99% 未満) ---
    if (!levelUpCooldown && !gameComplete) {
      const idlePred = predictions.find(p => p.className === "Class 1" && p.probability >= 0.90);
      const confidentPred = predictions.find(p => p.probability >= 0.99); // 99% 以上なら検出あり
      if (idlePred || !confidentPred) {
        waitMessage.textContent = "お手本さんを真似しよう！";
        waitMessage.style.display = "block";
      } else {
        waitMessage.style.display = "none";
      }
    }
    
    const targetClass = levels[currentLevel].className;
    const targetPred  = predictions.find(p => p.className === targetClass);
    if (targetPred && targetPred.probability >= 0.90 && !levelUpCooldown) {
      levelUpCooldown = true;
      const classNumber = parseInt(targetClass.split(" ")[1], 10); // 2 / 3 / 4
      successSound.currentTime = 0; // 連続時に先頭から再生
      successSound.play().catch(()=>{}); // 自動再生制限対策でエラーは無視
      updateGestureDisplay(classNumber);   // show ○
      waitMessage.textContent = "いい感じ！！";
      waitMessage.style.display = "block";
      setTimeout(() => {
        levelUp();
        if (!gameComplete) {
          waitMessage.textContent = "お手本さんを真似しよう！";
          waitMessage.style.whiteSpace = "nowrap";
          waitMessage.style.fontSize   = "32px";
          waitMessage.style.display = "none";
        }
        gestureDisplay.style.display = "none";
        if (!gameComplete) {
          levelUpCooldown = false;
        }
      }, 2000);
    }
    
    for (let i = 0; i < maxPredictions; i++) {
      const probability = predictions[i].probability * 100;
      const classPrediction = 
        `${predictions[i].className}: ${probability.toFixed(2)}%`;
      labelContainer.childNodes[i].innerHTML = classPrediction;

      if (probability >= 99.0) {
        detectedGesture = i;
        console.log(`ジェスチャー検出: Class ${i} (${probability.toFixed(2)}%)`);
      }
    }
    
    // ジェスチャーß表示を更新
    if (!gameComplete && detectedGesture !== -1) {
      updateGestureDisplay(detectedGesture);
    } else {
      // 90%以上の確率のジェスチャーが検出されない場合は非表示
      gestureDisplay.style.display = "none";
    }
    
    // キャンバスにポーズを描画
    ctx.drawImage(webcam.canvas, 0, 0);
    model.drawPose(pose, ctx);
    
  } catch (error) {
    console.error("予測実行中にエラー:", error);
  }
}

// アプリケーションの初期化を実行
init();