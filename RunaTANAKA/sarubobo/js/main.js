// 2015/12/31 H.Ichikawa（市川電産）
// さるぼぼゲーム

//////////////////////
// おまじない
//////////////////////
enchant();  // 初期化

//////////////////////
// 変数、定数関係
//////////////////////
var SCREEN_WIDTH  = 860;        // スクリーンの幅
var SCREEN_HEIGHT = 480;        // スクリーンの高さ
var BACKGROUND_WIDTH = 3353;    // 背景の幅
var BACKGROUND_HEIGHT = 480;    // 背景の高さ

var SCROLL_SPEED = -4;           // スクロール速度
var FPS = 15;
//var STONE_TIME = 8;            // 石の消滅までに３０コマ
var touch_status = 0;
var MOVE_MODE = 0;              // 0は移動可能、1は移動不可
//var Stone_Timer = 0;            // 射程までのカウント時間
//var STONE_TIME_MAX = 8;         // 次回の射程までの時間
var Total_Counter = 0;

var BOBO = 0;                   // 消さないNode
var TAMA = 1;                   // 弾のNode
var TEKI = 2;                   // 敵のNode
var OTHER = -1;                 // その他のNode

var SARU_DAMAGE_COOLDOWN = 20;  // さるぼぼがダメージを受けるクールダウンフレーム数
var saru_damage_timer = 0;

// リソースデータ
//var SARUBOBO_IMAGE   = "images/sarubobo.png";
//var STONE_IMAGE      = "images/kagamimochi32.png";
var BACKGROUND_IMAGE = "images/game-back.png";
var TEKIBOBO_IMAGE   = "images/teki_sample.png";
var SAFETY_IMAGE     ="images/safetyImage.png";
//var NYANBOBO_IMAGE   = "images/nyanbobo.png";
//var FLYBOBO_IMAGE    = "images/flysarubobo.png";
var END_IMAGE        = "end.png";
var CLEAR_IMAGE      = "clear.png";
var SARUBOBO_IMAGE_GAMEOVER   = "images/player_gameover.png";
//var PASS_IMAGE       = "images/tomato_icon.png";
//var HIT_IMAGE        = "images/love.png";

var HP_IMAGE_01 = "images/hp-01.png"; // 新しく追加する画像アセット
var HP_IMAGE_02 = "images/hp-02.png";
var HP_IMAGE_03 = "images/hp-03.png";
var HP_IMAGE_04 = "images/hp-04.png"; // ゲームオーバー時の画像（または何も表示しない）

var SARUBOBO_IMAGE_RIGHT_STOP  = "images/player_right_stop.png";
var SARUBOBO_IMAGE_RIGHT_WALK1 = "images/player_right_walk1.png";
var SARUBOBO_IMAGE_RIGHT_WALK2 = "images/player_right_walk2.png";

var SARUBOBO_IMAGE_DOWN_STOP  = "images/player_down_stop.png";
var SARUBOBO_IMAGE_DOWN_WALK1 = "images/player_down_walk1.png";
var SARUBOBO_IMAGE_DOWN_WALK2 = "images/player_down_walk2.png";
var SARUBOBO_IMAGE_UP_STOP    = "images/player_up_stop.png";
var SARUBOBO_IMAGE_UP_WALK1   = "images/player_up_walk1.png";
var SARUBOBO_IMAGE_UP_WALK2   = "images/player_up_walk2.png";

// アセット一覧　利用するリソースは必ず含める。
var ASSETS = [ SARUBOBO_IMAGE_RIGHT_STOP, SARUBOBO_IMAGE_RIGHT_WALK1, SARUBOBO_IMAGE_RIGHT_WALK2, 
               SARUBOBO_IMAGE_DOWN_STOP, SARUBOBO_IMAGE_DOWN_WALK1, SARUBOBO_IMAGE_DOWN_WALK2,SARUBOBO_IMAGE_UP_STOP,   SARUBOBO_IMAGE_UP_WALK1,   SARUBOBO_IMAGE_UP_WALK2,
               //SARUBOBO_IMAGE, 
               //STONE_IMAGE, 
               TEKIBOBO_IMAGE,SAFETY_IMAGE,//NYANBOBO_IMAGE, FLYBOBO_IMAGE,
               END_IMAGE, CLEAR_IMAGE, SARUBOBO_IMAGE_GAMEOVER,
               //PASS_IMAGE, HIT_IMAGE, 
               HP_IMAGE_01, HP_IMAGE_02, HP_IMAGE_03, HP_IMAGE_04, BACKGROUND_IMAGE ];

// グローバルで利用するクラスの実体
var game  = null;
var saru  = null;
var scene = null;
var scoreLabel = null;
var gameClear = false; // ゲームクリア状態を管理するフラグ
var clearImageSprite = null; // クリア時に表示する画像スプライト
var pass  = [ null, null, null, null, null ];
var hit   = [ null, null, null ];
var hitSprite = null; // HP表示用のスプライトを一つだけ用意

// さるぼぼちゃんステータス
var bobo_hit  = 0;               // 当たった数
//var bobo_pass = 0;               // 逃した数
var hosei     = 0.0;             // 補正の値

var current_hp_image_index = 0; // 現在表示されているHP画像のインデックス (0:hp-01, 1:hp-02, 2:hp-03, 3:hp-04)


/////////////////////
// ゲームオーバークラス（END_IMAGEを使用）
/////////////////////
var Ending = Class.create(Sprite, {
    initialize: function(){
        Sprite.call( this, 189, 97 ); // 画像サイズに合わせる
        this.image = game.assets[ END_IMAGE ];
        this.moveTo( 350, 200 ); // 中央よりやや下
        this.mode  = OTHER;
    },
    // フレームごとの動作
    onenterframe : function(){
        // MOVE_MODEが0以外の場合（ゲームオーバー状態）は常に表示
        // リスタート時にparentNodeから削除される
    },
});

/////////////////////
// ゲームクリアクラス（CLEAR_IMAGEを使用）
/////////////////////
var GameClear = Class.create(Sprite, {
    initialize: function(){
        Sprite.call( this, 189, 48 ); // 画像サイズに合わせる
        this.image = game.assets[ CLEAR_IMAGE ];
        this.moveTo( SCREEN_WIDTH / 2 - this.width / 2, SCREEN_HEIGHT / 2 - this.height / 2 - 50 ); // 中央より少し上に配置
        this.mode  = OTHER;
    },
    // フレームごとの動作
    onenterframe : function(){
        // MOVE_MODEが0以外の場合（ゲームクリア状態）は常に表示
        // リスタート時にparentNodeから削除される
    },
});

/////////////////////
// さるぼぼクラス
/////////////////////
var Sarubobo = Class.create(Sprite, {
    initialize: function(){
        Sprite.call( this, 64, 64 );
        this.image = game.assets[ SARUBOBO_IMAGE_RIGHT_STOP ];
        this.moveTo( 100, 200 );
        //this.timer = 0;
        //this.flg   = 0;
        this.mode  = BOBO;

        // 64x64に拡大するスケール値を計算 (64/50 = 1.28)
        this.scaleX = 100 / 64;
        this.scaleY = 100 / 64;

        // さるぼぼの移動速度
        this.speed = 6; // 移動速度

        // 現在の方向 (0:下, 2:右, 3:上)
        this.direction = 2; // 初期方向を右に設定
        // アニメーションフレーム管理用
        this.animationFrame = 0; // 0:停止, 1:右足前, 2:左足前
        this.animationTimer = 0; // アニメーション切り替えのタイマー

        // 各方向の画像アセットを格納するマップ
        this.imageMap = {
            'down':  [SARUBOBO_IMAGE_DOWN_STOP,  SARUBOBO_IMAGE_DOWN_WALK1,  SARUBOBO_IMAGE_DOWN_WALK2],
            'up':    [SARUBOBO_IMAGE_UP_STOP,    SARUBOBO_IMAGE_UP_WALK1,    SARUBOBO_IMAGE_UP_WALK2],
            'right': [SARUBOBO_IMAGE_RIGHT_STOP, SARUBOBO_IMAGE_RIGHT_WALK1, SARUBOBO_IMAGE_RIGHT_WALK2]
        };
        
        // アニメーションシーケンス (停止, 右足, 停止, 左足)
        this.walkSequence = [0, 1, 0, 2]; // 0:停止, 1:右足前, 2:左足前
        this.currentWalkFrameIndex = 0; // 現在のアニメーションシーケンスのインデックス

        this.isGameOver = false;
        this.zIndex = 100;

    },

    // フレームごとの動作
    onenterframe : function(){
        if (this.isGameOver) {
            this.image = game.assets[SARUBOBO_IMAGE_GAMEOVER];
            return; // 以降の移動・アニメーション処理を行わない
        }
        if( MOVE_MODE == 0 ){
            //this.frame += 1;
            //this.frame %= 2;

            var moving = false; // さるぼぼが移動しているかどうかのフラグ

            // キー入力による移動処理
            if (game.input.up) {
                this.y -= this.speed;
                this.direction = 3; // 上
                moving = true;
            } else if (game.input.down) {
                this.y += this.speed;
                this.direction = 0; // 下
                moving = true;
            }
            
            if (this.y < 0) this.y = 0;
            if (this.y > SCREEN_HEIGHT - this.height) this.y = SCREEN_HEIGHT - this.height;

            // アニメーションフレームの更新と画像切り替え
            if (moving) {
                this.animationTimer++;
                if (this.animationTimer % 4 == 0) { // 4フレームごとに画像を切り替える (速度調整可能)
                    this.animationFrame++;
                    this.currentWalkFrameIndex = (this.currentWalkFrameIndex + 1) % this.walkSequence.length;
                    this.animationFrame = this.walkSequence[this.currentWalkFrameIndex];
                }
            } else {
                // 移動していない場合は右向きの足踏みアニメーションを行う
                this.direction = 2; // 右向きに固定
                this.animationTimer++;
                if (this.animationTimer % 4 == 0) {
                    this.animationFrame++;
                    this.currentWalkFrameIndex = (this.currentWalkFrameIndex + 1) % this.walkSequence.length;
                    this.animationFrame = this.walkSequence[this.currentWalkFrameIndex];
                }
            }

            // 現在の方向とアニメーションフレームに基づいて画像をセット
            var currentImageArray;
            switch (this.direction) {
                case 0: currentImageArray = this.imageMap['down']; break;
                // case 1: currentImageArray = this.imageMap['left']; break; // 削除またはコメントアウト
                case 2: currentImageArray = this.imageMap['right']; break; // 削除またはコメントアウト
                case 3: currentImageArray = this.imageMap['up']; break;
            }
            this.image = game.assets[currentImageArray[this.animationFrame]];
        }

        // ゲームクリア時のさるぼぼの自動移動
        if (gameClear) {
            if (gameClear && this.x < SCREEN_WIDTH) { // 画面右端に到達するまで移動
                this.x += this.speed; // 右に移動
                this.direction = 2; // 右向き（アニメーションフレームを調整する必要がある場合、別途定義）
                this.animationTimer++;
                if (this.animationTimer % 4 == 0) { // 4フレームごとに画像を切り替える
                    this.currentWalkFrameIndex = (this.currentWalkFrameIndex + 1) % this.walkSequence.length;
                    this.animationFrame = this.walkSequence[this.currentWalkFrameIndex];
                }
                this.image = game.assets[this.imageMap['right'][this.animationFrame]]; // 右移動時は右向き歩行アニメーションを適用
            }
        }
    },
});

/////////////////////
// 敵ぼぼクラス
/////////////////////
var Tekibobo = Class.create(Sprite, {
    initialize: function(width,height,yPos ){
        Sprite.call( this, width, height );
        this.image = game.assets[ TEKIBOBO_IMAGE ];
        //this.moveTo( 800, 350 );
        this.moveTo( SCREEN_WIDTH, yPos ); // X座標はSCREEN_WIDTHから、Y座標は引数で
        this.timer = 0;
        this.flg   = 0;
        this.count = 0;
        this.mode  = TEKI;
        this.opacity = 0;

    },

    // フレームごとの動作
    onenterframe : function(){
        if( MOVE_MODE == 0 ){

            if( ( this.count % 1 ) ){
                this.moveBy( -4, 0);
            }else{
                this.moveBy( -4, 0 );
            }

            this.count++;
            
            // 画面外に行ってしまった場合
            if( this.x + this.width < 0 ){
                this.parentNode.removeChild( this );
                //f_pass();

                // シーケンスの最後の敵が画面外に出たらクリアと判定
                // ENEMY_SEQUENCEの最後のEND_OF_SEQUENCEの直前の敵が消滅した時
                if (enemySequenceIndex >= ENEMY_SEQUENCE.length -1 && !gameClear) { // -1はEND_OF_SEQUENCEを除いた最後の要素

                    // ここで、現在のシーンにTEKIモードのオブジェクトが残っていないか最終確認
                    var remainingEnemies = false;
                    for(var i = 0; i < scene.childNodes.length; i++) {
                        if(scene.childNodes[i].mode === TEKI) {
                            remainingEnemies = true;
                            break;
                        }
                    }

                    if (!remainingEnemies) { // シーンにTEKIが残っていなければクリア
                    gameClear = true;
                    console.log("ゲームクリア！");
                    f_gameClear(); // クリア処理を呼び出す
                    }
            }

            }
            if( saru.intersect(this) ){
                // さるぼぼがSafetyと触れていない場合のみダメージを与える
                var isSafe = false;
                for (var i = 0; i < scene.childNodes.length; i++) {
                    var node = scene.childNodes[i];
                    if (node instanceof Safety && saru.intersect(node)) { // Safetyクラスのインスタンスで、かつさるぼぼと衝突しているか
                        isSafe = true;
                        break;
                    }
                }

                if (!isSafe && saru_damage_timer === 0) { // Safetyと触れておらず、クールダウン中ではない場合のみダメージ
                    f_hit(); // 体当たりライフを減らす関数を呼び出し
                    saru_damage_timer = SARU_DAMAGE_COOLDOWN; // クールダウンタイマーをセット
                }
            }
        }
    },

});

// リソースデータの定義の下あたりに追記
// 敵ぼぼ出現シーケンスデータ
var ENEMY_SEQUENCE = [
    // [待ちフレーム数, 敵の種類 (Tekibobo, Nyanbobo, Flybobo), 幅, 高さ, Y座標]
    // 待ちフレーム数は、前の敵が出終わるか、シーケンスの開始からの経過時間
    [ 0, 'Tekibobo', 660, 180, 250 ],
    [ 0, 'Tekibobo', 140, 260, 0 ],    
    [ 160, 'Tekibobo', 120, 80, 325 ],   // 60フレーム後にTekibobo (80x80) がy=350に出現
    [ 25, 'Tekibobo', 480, 140, 290 ],   // その30フレーム後にTekibobo (90x90) がy=200に出現
    [ 85, 'Tekibobo', 900, 140, 250 ],   // その90フレーム後にNyanbobo (50x50) がy=418に出現
    [ 0, 'Tekibobo', 220, 500, 0 ],
    [ 165, 'Tekibobo',  270, 320, 0 ],   // FlyboboはランダムY座標を使う場合はY座標は無視されるか、
                                       // initializeでy引数を使わないように調整
    [ 50, 'Tekibobo', 100, 150, 310 ],
    // ... さらに敵を追加 ...
    [ 180, 'END_OF_SEQUENCE', 0, 0, 0 ] // シーケンスの終了を示すマーク (最後に入れる)
];

// 敵ぼぼ生成の進行管理用変数
var enemySequenceIndex = 0; // 現在シーケンスのどの敵を処理中か
var enemySpawnTimer = 0;    // 次の敵が出現するまでのカウントダウンタイマー

/////////////////////
// Safetyクラス
/////////////////////
var Safety = Class.create(Sprite, {
    initialize: function(width,height,yPos ){
        Sprite.call( this, width, height );
        this.image = game.assets[ SAFETY_IMAGE ];
        this.moveTo( SCREEN_WIDTH, yPos ); // X座標はSCREEN_WIDTHから、Y座標は引数で
        this.mode  = OTHER; // 他のオブジェクトと区別するため
        this.speed = -5; // スクロール速度と同じにするか、調整してください
        this.isTouchedBySaru = false; // さるぼぼが触れているかどうかのフラグ
        this.zIndex = 5;
    },

    // フレームごとの動作
    onenterframe : function(){
        if( MOVE_MODE == 0 ){
            this.moveBy( this.speed, 0 );
            
            // 画面外に行ってしまった場合
            if( this.x + this.width < 0 ){
                this.parentNode.removeChild( this );
            }

            // さるぼぼと衝突しているか判定
            if (saru.intersect(this)) {
                this.isTouchedBySaru = true;
            }
        }
    },
});

// Safety出現シーケンスデータ
var SAFETY_SEQUENCE = [
    // [待ちフレーム数, 幅, 高さ, Y座標]
    [ 20, 80, 60, 280 ],// SafetyImageの例 (出現位置やサイズを調整)
    [ 10, 220, 150, 200 ], 
    [ 20, 150, 80, 250 ],

    [ 50, 80, 50, 300 ],

    [ 80, 80, 50, 280 ],
    [ 10, 150, 100, 250 ],
    [ 25, 100, 80, 270 ],
    [ 10, 80, 50, 300 ],

    [ 30, 80, 40, 250 ],
    [ 10, 80, 60, 240 ],

    [ 30, 100, 100, 200 ],
    [ 10, 180, 150, 180 ],
    [ 30, 80, 80, 200 ],

    [ 50, 100, 50, 300 ],
    [ 10, 80, 30, 320 ],

    [ 50, 120, 80, 230 ],
    [ 20, 180, 150, 180 ],
    [ 20, 120, 100, 230 ],
    [ 20, 100, 80, 250 ], // さらに別のSafetyImage
    [ 180, 'END_OF_SEQUENCE', 0, 0, 0 ] // シーケンスの終了を示すマーク (最後に入れる)
];


// Safety生成の進行管理用変数
var safetySequenceIndex = 0;
var safetySpawnTimer = 0;

////////////////////
// Hit 判定
////////////////////
function f_hit(){
    bobo_hit++; // ダメージカウントを増やす

    // 現在のダメージ量に応じてHP画像を切り替える
    var newImage = null;
    if (bobo_hit === 0) {
        newImage = HP_IMAGE_01;
    } else if (bobo_hit === 1) {
        newImage = HP_IMAGE_02;
    } else if (bobo_hit === 2) {
        newImage = HP_IMAGE_03;
    } else if (bobo_hit === 3) {
        newImage = HP_IMAGE_04;
    } else if (bobo_hit >= 4) { // 4回ダメージでゲームオーバー
        // ゲームオーバー時はHP画像を非表示にするため、画像をnullにするか、removeChildする
        // ここでは画像を非表示にするため、f_hitの前にremoveChildすることで対応します
    }

    if (bobo_hit < 4) { // ゲームオーバー前であれば画像を更新
        // 既存のhitSpriteがあれば一度削除して新しい画像で作り直す
        if (hitSprite && hitSprite.parentNode) {
            scene.removeChild(hitSprite);
        }
        hitSprite = new Hit(100, 390, newImage); // 同じ位置に新しい画像で作成
        scene.addChild(hitSprite);
    }


    // ヒットしすぎの場合はゲームオーバー
    if( bobo_hit == 4 ){
        MOVE_MODE = 1;
        var end = new Ending();
        scene.addChild( end );

        saru.isGameOver = true; 
        saru.scaleX = 100 / 64; // 元のサイズに戻すか、倒れた画像に合わせて調整
        saru.scaleY = 100 / 64;

        if (hitSprite && hitSprite.parentNode) {
            scene.removeChild(hitSprite);
            hitSprite = null; // 参照もクリア
        }
    }    
}

////////////////////
// Game Clear 処理
////////////////////
function f_gameClear(){
        MOVE_MODE = 1; // ゲーム操作を停止
        clearImageSprite = new GameClear(); // GameClearクラスを使用
        scene.addChild(clearImageSprite);

        // さるぼぼを右に歩かせるために、gameClearフラグをtrueにする
        // このフラグはSaruboboのonenterframeで使われます
        // gameClear = true; // Tekiboboのonenterframeで既にtrueに設定済み
    }
    

/////////////////////
// HPの画像クラス
/////////////////////
var Hit = Class.create(Sprite, {
    // 初期化時に表示する画像パスを受け取るように変更
    initialize: function(x, y, imagePath){
        Sprite.call( this, 100, 100 ); // 画像サイズは適宜調整してください
        this.image = game.assets[ imagePath ]; // 受け取った画像パスを設定
        this.moveTo( x, y );
        // this.timer と this.flg はHP表示スプライトでは不要なので削除
        this.mode  = BOBO; // 消さないNode

        this.scaleX = 150 / 100;
        this.scaleY = 150 / 100;
    },
    // フレームごとの動作は不要になるため削除
    // onenterframe : function(){ }
});

// ウインドウのメイン処理
window.onload = function () {
    game = new Game(SCREEN_WIDTH,SCREEN_HEIGHT); // Gameオブジェクトの作成
    
    game.preload( ASSETS );             // アセットの
 //   game.fps = FPS;                     // フレームレートのセット

    game.onload = function () {         // ゲームが開始された時の関数をセット
        scene = game.rootScene;     // game.rootSceneは長いのでsceneに参照を割り当て
        scene.backgroundColor = "black";

        // 敵の出現シーケンス関連の初期化
    enemySequenceIndex = 0;
    // 最初の敵の待ち時間をタイマーにセット
    if (ENEMY_SEQUENCE.length > 0) {
        enemySpawnTimer = ENEMY_SEQUENCE[0][0];
    } else {
        enemySpawnTimer = 0;
    }

    // Safetyの出現シーケンス関連の初期化をここに追加
    safetySequenceIndex = 0;
    if (SAFETY_SEQUENCE.length > 0) {
        safetySpawnTimer = SAFETY_SEQUENCE[0][0];
    } else {
        safetySpawnTimer = 0;
    }


        ///////////////////////////
        // 背景のスクロール制御
        ///////////////////////////
        var background = new Sprite(BACKGROUND_WIDTH,BACKGROUND_HEIGHT);
        background.image = game.assets[BACKGROUND_IMAGE];
        background.moveTo( 0, 0 );
        background.mode = BOBO;

        background.onenterframe = function(){
            if( MOVE_MODE == 0 ){
                Total_Counter++;
                if( ( Total_Counter % 15 ) == 0 ) scoreLabel.score++;
                if( ( scoreLabel % 10 ) == 0 ) hosei -= 0.1;

                // さるぼぼのダメージクールダウンタイマーを減らす
                if (saru_damage_timer > 0) {
                    saru_damage_timer--;
                }

                //if( Stone_Timer > 0 ) Stone_Timer--;
                this.x += SCROLL_SPEED;

                if (this.x <= -(BACKGROUND_WIDTH - SCREEN_WIDTH)) {
                    this.x = -(BACKGROUND_WIDTH - SCREEN_WIDTH); // スクロールを停止
                }

                // --- 敵の出現シーケンス処理ここから ---
                if (enemySequenceIndex < ENEMY_SEQUENCE.length) { // シーケンスがまだ続いている場合
                    // タイマーが0になったら次の敵を出現させる
                    if (enemySpawnTimer <= 0) {
                        var enemyData = ENEMY_SEQUENCE[enemySequenceIndex];
                        var waitTime = enemyData[0];
                        var enemyType = enemyData[1];
                        var width = enemyData[2];
                        var height = enemyData[3];
                        var yPos = enemyData[4];

                        if (enemyType === 'END_OF_SEQUENCE') {
                            // シーケンス終了マークの場合、特に何もしないか、
                            // 新しいフェーズへの移行処理などを記述
                            console.log("敵の出現シーケンスが終了しました。");
                            // 例: シーケンスを繰り返す場合は enemySequenceIndex = 0; にリセット
                            // enemySequenceIndex = 0; // 無限ループさせたい場合
                            // game.end(); // ゲームを終了させたい場合
                        } else {
                            // 敵を生成してシーンに追加
                            var newEnemy;
                            if (enemyType === 'Tekibobo') {
                                newEnemy = new Tekibobo(width, height, yPos);
                            } else if (enemyType === 'Nyanbobo') {
                                newEnemy = new Nyanbobo(width, height, yPos);
                            } else if (enemyType === 'Flybobo') {
                                newEnemy = new Flybobo(width, height, yPos);
                            }
                            if (newEnemy) {
                                scene.addChild(newEnemy);
                            }
                        }

                        // 次の敵データに進み、タイマーを設定
                        enemySequenceIndex++;
                        if (enemySequenceIndex < ENEMY_SEQUENCE.length) {
                             enemySpawnTimer = ENEMY_SEQUENCE[enemySequenceIndex][0];
                        }
                    } else {
                        enemySpawnTimer--; // タイマーを減らす
                    }
                }
                // --- 敵の出現シーケンス処理ここまで ---

                // --- Safetyオブジェクトの出現処理ここから ---
                if (safetySequenceIndex < SAFETY_SEQUENCE.length) {
                    if (safetySpawnTimer <= 0) {
                        var safetyData = SAFETY_SEQUENCE[safetySequenceIndex];
                        // safetyData[0] は待ちフレーム数
                        var waitTime = safetyData[0]; // 待ち時間
                        var width = safetyData[1];    // 幅を取得
                        var height = safetyData[2];   // 高さを取得
                        var yPos = safetyData[3];     // Y座標を取得


                        if (safetyData[1] === 'END_OF_SEQUENCE') { // シーケンス終了マークの判定
                            console.log("Safetyの出現シーケンスが終了しました。");
                        } else {
                            
                            var safety = new Safety(width, height, yPos); // Y座標を渡して生成
                            scene.addChild(safety);
                        }
                        
                        safetySequenceIndex++;
                        if (safetySequenceIndex < SAFETY_SEQUENCE.length) {
                            safetySpawnTimer = SAFETY_SEQUENCE[safetySequenceIndex][0];
                        }
                    } else {
                        safetySpawnTimer--;
                    }
                }
                // --- Safetyオブジェクトの出現処理ここまで ---

                //if (Total_Counter % 180 === 0) { // 出現頻度を調整
                    //var safety = new Safety();
                    //scene.addChild(safety);
                //}
                
            }
        };

        scene.addChild(background);

        ////////////////////////////
        // スコア
        ////////////////////////////
        scoreLabel = new ScoreLabel( 10, 10 );
        scoreLabel.score = 0;
        //scoreLabel._element.style.zIndex = 100;
        scoreLabel.mode = BOBO;
        scene.addChild( scoreLabel );

        // 体当たりライフ用
        // ゲーム開始時にhp-01を表示
        hitSprite = new Hit(100, 390, HP_IMAGE_01);
        scene.addChild(hitSprite);

        ////////////////////////////
        // さるぼぼの制御
        ////////////////////////////
        saru = new Sarubobo();
        scene.addChild( saru );


        // 初期画面
        scene.onenter = function(){
            game.fps = FPS;                     // フレームレートのセット
        };

        /////this.cameras.main.startFollow(this.player);

        ///////////////////////////////////////
        // シーンに「タッチイベント」を追加します。
        ///////////////////////////////////////
        game.rootScene.addEventListener(Event.TOUCH_START, function(e) {
            console.log( "tap" );

            if( MOVE_MODE == 0 ){
                
                // ジャンプ中でなければ処理を開始する。
                if( ( touch_status == 0 ) && ( e.x < 120 ) ){
                     touch_status = -14;
                }
            }else{
                ////////////////////////
                // リスタート
                ////////////////////////

                // 再スタート 初期化
                MOVE_MODE = 0;
                bobo_hit  = 0;
                //bobo_pass = 0;
                Total_Counter = 0;
                scoreLabel.score = 0;
                hosei     = 0.0;
                gameClear = false; // クリア状態をリセット
                if (clearImageSprite) {
                    scene.removeChild(clearImageSprite); // クリア画像を削除
                    clearImageSprite = null;
                }
                // ゲームオーバー画像を削除（もし表示されていたら）
                for (var i = scene.childNodes.length - 1; i >= 0; i--) { // 後ろからループして安全に削除
                        var node = scene.childNodes[i];
                        if (node instanceof GameOver || node instanceof GameClear) {
                            scene.removeChild(node);
                            break; // ゲームオーバー/クリア画像は1つのみなので見つけたら終了
                        }
                    }

                    saru.isGameOver = false;
                saru.scaleX = 100 / 64; // 初期スケールに戻す
                saru.scaleY = 100 / 64;
                saru.image = game.assets[SARUBOBO_IMAGE_RIGHT_STOP]; // 初期画像に戻す

                var del = [];
                var Nodes = scene.childNodes.length;

                // シーケンス管理変数をリセット
                enemySequenceIndex = 0;
                enemySpawnTimer = ENEMY_SEQUENCE.length > 0 ? ENEMY_SEQUENCE[0][0] : 0;

                safetySequenceIndex = 0;
                safetySpawnTimer = SAFETY_SEQUENCE.length > 0 ? SAFETY_SEQUENCE[0][0] : 0;

                // 元のデータを削除
                // 途中で削除してしまうと、childNodesの構成が変わってしまう。
                for( var ix = 0; ix < Nodes; ix++ ){
                    console.log( "find", scene.childNodes[ ix ].mode );
                    // 敵の場合は衝突判定
                    if( scene.childNodes[ ix ].mode != BOBO ){
                        //console.log( "delete" );
                        //scene.removeChild( scene.childNodes[ ix ] );            
                        del[ ix ] = 1;
                    }else{
                        del[ ix ] = 0;
                    }
                }

                for( var ix = Nodes - 1; ix >= 0; ix-- ){
                    if( del[ ix ] == 1 ){
                        console.log( "delete" );
                        scene.removeChild( scene.childNodes[ ix ] );            
                    }
                }

                // 体当たりライフ用
                if (hitSprite && hitSprite.parentNode) {
                    scene.removeChild(hitSprite); // 既存のものを削除
                }
                hitSprite = new Hit(100, 390, HP_IMAGE_01);
                scene.addChild(hitSprite);
            }
        });
    };
    game.start();
};

