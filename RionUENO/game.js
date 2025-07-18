// enchant.jsを初期化
enchant();

// ゲームのメイン処理
window.onload = function() {
    // ゲームオブジェクトの作成（320x320ピクセル）
    const game = new Game(320, 320);
    game.fps = 15; // フレームレート設定
    
    // リソースの事前読み込み
    game.preload('sarubobo/images/tomato_icon.png');
    
    // ゲーム開始時の処理
    game.onload = function() {
        // 背景色の設定
        game.rootScene.backgroundColor = '#feffb3';
        
        // プレイヤーキャラクターの作成
        const player = new Sprite(96, 98);
        player.image = game.assets['sarubobo/images/tomato_icon.png'];
        player.x = 120; // 初期X座標
        player.y = 120; // 初期Y座標
        player.frame = 0; // キャラクターの表示フレーム
        
        // プレイヤーの毎フレームの動作
        player.onenterframe = function() {
            // 左右移動
            if (game.input.left) {
                this.x -= 10;
                this.scaleX = -1; // 左向き
            } else if (game.input.right) {
                this.x += 5;
                this.scaleX = 1;  // 右向き
            } else if (game.input.up) {
                this.y -= 20;
                this.scaleY = 1; // 上向き                
            } else if (game.input.down) {
                this.y += 5;
                this.scaleY = -1; // 下向き
            } else {
                this.frame = 0; // 静止画像
            }
            
            // 画面端の処理
            if (this.x < 0) {
                this.x = 0;
            }
            if (this.x > game.width - this.width) {
                this.x = game.width - this.width;
            }
            if (this.y < 0) {
                this.y = 0;
            }
            if (this.y > game.height - this.height) {
                this.y = game.height - this.height;
            }
        };
        
        // プレイヤーをシーンに追加
        game.rootScene.addChild(player);
    };
    
    // ゲーム開始
    game.start();
};
