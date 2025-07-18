// キャンバスとコンテキストの取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 画面設定
const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;

// 色の定義
const WHITE = '#FFFFFF';
const BLACK = '#000000';
const BLUE = '#0000FF';

// プレイヤーの設定
const player = {
    width: 30,
    height: 30,
    x: SCREEN_WIDTH / 2 - 30 / 2, // 初期位置をステージ中央に
    y: SCREEN_HEIGHT / 2 - 30 / 2, // 初期位置をステージ中央に
    speed: 5
};

// 凹型ステージの定義
// くり抜かれる部分の矩形 (中央の通路)
const hole = {
    width: 400,
    height: 200,
    x: SCREEN_WIDTH / 2 - 400 / 2,
    y: SCREEN_HEIGHT / 2 - 200 / 2
};

// 凹型ステージを構成する4つの矩形（外側の壁）
const walls = {
    top: { x: 0, y: 0, width: SCREEN_WIDTH, height: hole.y },
    bottom: { x: 0, y: hole.y + hole.height, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - (hole.y + hole.height) },
    left: { x: 0, y: hole.y, width: hole.x, height: hole.height },
    right: { x: hole.x + hole.width, y: hole.y, width: SCREEN_WIDTH - (hole.x + hole.width), height: hole.height }
};

// キー入力の状態を保持するオブジェクト
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// キーイベントリスナー
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// 矩形同士の衝突判定関数
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 矩形1が矩形2を完全に含んでいるか判定
function containsRect(container, contained) {
    return contained.x >= container.x &&
           contained.y >= container.y &&
           contained.x + contained.width <= container.x + container.width &&
           contained.y + contained.height <= container.y + container.height;
}

// ゲームの状態を更新する関数
function update() {
    let newPlayerX = player.x;
    let newPlayerY = player.y;

    // キー入力に応じた移動量の計算
    if (keys.ArrowLeft) {
        newPlayerX -= player.speed;
    }
    if (keys.ArrowRight) {
        newPlayerX += player.speed;
    }
    if (keys.ArrowUp) {
        newPlayerY -= player.speed;
    }
    if (keys.ArrowDown) {
        newPlayerY += player.speed;
    }

    // プレイヤーの新しい位置での矩形
    let tempPlayerRect = {
        x: newPlayerX,
        y: newPlayerY,
        width: player.width,
        height: player.height
    };

    // 画面境界の制限
    if (tempPlayerRect.x < 0) {
        tempPlayerRect.x = 0;
    } else if (tempPlayerRect.x + tempPlayerRect.width > SCREEN_WIDTH) {
        tempPlayerRect.x = SCREEN_WIDTH - tempPlayerRect.width;
    }
    if (tempPlayerRect.y < 0) {
        tempPlayerRect.y = 0;
    } else if (tempPlayerRect.y + tempPlayerRect.height > SCREEN_HEIGHT) {
        tempPlayerRect.y = SCREEN_HEIGHT - tempPlayerRect.height;
    }

    // 凹型ステージの行動範囲制御
    // プレイヤーが穴の中（通路）にいる場合は自由に移動できる
    if (containsRect(hole, tempPlayerRect)) {
        player.x = tempPlayerRect.x;
        player.y = tempPlayerRect.y;
    } else {
        // 穴の外側にいる場合、壁との衝突をチェック
        // 移動前と移動後の位置を比較して、衝突方向を判断し、壁の外に出ないように位置を調整
        // X軸方向の衝突判定と調整
        let collidedX = false;
        if (checkCollision(tempPlayerRect, walls.left) || checkCollision(tempPlayerRect, walls.right)) {
            collidedX = true;
        }

        // Y軸方向の衝突判定と調整
        let collidedY = false;
        if (checkCollision(tempPlayerRect, walls.top) || checkCollision(tempPlayerRect, walls.bottom)) {
            collidedY = true;
        }

        // プレイヤーの移動が衝突を引き起こさないか確認
        // X方向の移動
        if (!collidedX) {
            player.x = tempPlayerRect.x;
        }
        // Y方向の移動
        if (!collidedY) {
            player.y = tempPlayerRect.y;
        }

        // より正確な衝突応答 (めり込み防止)
        // 各壁と個別に衝突判定を行い、めり込みを修正する
        // 上の壁との衝突
        if (checkCollision(tempPlayerRect, walls.top)) {
            player.y = walls.top.y + walls.top.height;
        }
        // 下の壁との衝突
        if (checkCollision(tempPlayerRect, walls.bottom)) {
            player.y = walls.bottom.y - player.height;
        }
        // 左の壁との衝突
        if (checkCollision(tempPlayerRect, walls.left)) {
            player.x = walls.left.x + walls.left.width;
        }
        // 右の壁との衝突
        if (checkCollision(tempPlayerRect, walls.right)) {
            player.x = walls.right.x - player.width;
        }
    }
}

// ゲームを描画する関数
function draw() {
    // 画面をクリア
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 凹型ステージの壁を描画（黒い部分）
    ctx.fillStyle = BLACK;
    ctx.fillRect(walls.top.x, walls.top.y, walls.top.width, walls.top.height);
    ctx.fillRect(walls.bottom.x, walls.bottom.y, walls.bottom.width, walls.bottom.height);
    ctx.fillRect(walls.left.x, walls.left.y, walls.left.width, walls.left.height);
    ctx.fillRect(walls.right.x, walls.right.y, walls.right.width, walls.right.height);

    // プレイヤーを描画
    ctx.fillStyle = BLUE;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// ゲームループ
function gameLoop() {
    update(); // ゲームの状態を更新
    draw();   // 画面を描画
    requestAnimationFrame(gameLoop); // 次のフレームを要求
}

// ゲーム開始
gameLoop();