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
var BACKGROUND_WIDTH = 2384;    // 背景の幅
var BACKGROUND_HEIGHT = 480;    // 背景の高さ

var SCROLL_SPEED = -2;           // スクロール速度
var FPS = 15;
var STONE_TIME = 8;            // 石の消滅までに３０コマ
var touch_status = 0;
var MOVE_MODE = 0;              // 0は移動可能、1は移動不可
var Stone_Timer = 0;            // 射程までのカウント時間
var STONE_TIME_MAX = 8;         // 次回の射程までの時間
var Total_Counter = 0;

var BOBO = 0;                   // 消さないNode
var TAMA = 1;                   // 弾のNode
var TEKI = 2;                   // 敵のNode
var OTHER = -1;                 // その他のNode

// リソースデータ
var SARUBOBO_IMAGE   = "images/neko.png";
var STONE_IMAGE      = "images/nikukyuu.png";
var BACKGROUND_IMAGE = "images/back.png";
var TEKIBOBO_IMAGE   = "images/inu.png";
var NYANBOBO_IMAGE   = "images/nezumi.png";
var FLYBOBO_IMAGE    = "images/karasu.png";
var END_IMAGE        = "end1.png";
var PASS_IMAGE       = "images/tairyoku.png";
var HIT_IMAGE        = "images/love.png";
var TITLE_BGM = "music/title.mp3";
var GAME_BGM = "music/game.mp3";
var SE_THROW = "music/hit.mp3";
var CLEAR_IMAGE = "images/clear.png";
var ENDING_IMAGE = "images/END.gif";
var HEAL_SE = "music/heal.mp3";
var SAKANA_IMAGE = "images/sakana.png";

// アセット一覧　利用するリソースは必ず含める。
var ASSETS = [ SARUBOBO_IMAGE, STONE_IMAGE, TEKIBOBO_IMAGE, NYANBOBO_IMAGE, FLYBOBO_IMAGE, END_IMAGE, PASS_IMAGE, HIT_IMAGE, BACKGROUND_IMAGE,TITLE_BGM, GAME_BGM,SE_THROW,CLEAR_IMAGE,ENDING_IMAGE,HEAL_SE,SAKANA_IMAGE];

// グローバルで利用するクラスの実体
var game  = null;
var saru  = null;
var scene = null;
var scoreLabel = null;
var pass  = [ null, null, null, null, null ];
var hit   = [ null, null, null ];

// さるぼぼちゃんステータス
var bobo_hit  = 0;               // 当たった数
var bobo_pass = 0;               // 逃した数
var hosei     = 0.0;             // 補正の値


/////////////////////
// エンドクラス
/////////////////////
var Ending = Class.create(Sprite, {
    initialize: function(){
        Sprite.call( this, 189, 97 );
        this.image = game.assets[ END_IMAGE ];
        this.moveTo( 350, 200 );
        this.mode  = OTHER;
    },
    // フレームごとの動作
    onenterframe : function(){
        if( MOVE_MODE == 0 ){
            this.parentNode.removeChild( this );
        }
    },
});

/////////////////////
// さるぼぼクラス
/////////////////////
var Sarubobo = Class.create(Sprite, {
    initialize: function(){
        Sprite.call( this, 76, 100 );
        this.image = game.assets[ SARUBOBO_IMAGE ];
        this.moveTo( 40, 350 );
        this.timer = 0;
        this.flg   = 0;
        this.mode  = BOBO;
    },

    // フレームごとの動作
    onenterframe : function(){
        if( MOVE_MODE == 0 ){
            this.frame += 1;
            this.frame %= 2;

            //　ジャンプ処理
            if( ( touch_status != 0 ) && ( this.flg == 0 ) ){
                this.flg = 1;
                this.timer = 40;
            }
            if( this.flg == 1 ){
                this.timer--;
                if( this.timer == 35 ){
                    touch_status = -12;
                }
                if( this.timer == 20 ){
                    touch_status = 12;
                }
                if( this.timer == 5 ){
                    touch_status = 14;
                }
                if( this.timer == 1 ){
                    this.flg = 0;
                    touch_status = 0;
                }
            }

            this.moveBy( 0, touch_status );
            if( this.x > 320 ) this.x = 0;
        }
    },

});

/////////////////////
// 敵ぼぼクラス
/////////////////////
var Tekibobo = Class.create(Sprite, {
    initialize: function(){
        Sprite.call( this, 76, 100 );
        this.image = game.assets[ TEKIBOBO_IMAGE ];
        this.moveTo( 800, 350 );
        this.timer = 0;
        this.flg   = 0;
        this.count = 0;
        this.mode  = TEKI;
    },

    // フレームごとの動作
    onenterframe : function(){
        if( MOVE_MODE == 0 ){
            this.frame += 1;
            this.frame %= 2;

            if( ( this.count % 12 ) < 6 ){
                this.moveBy( -8, -6 );
            }else{
                this.moveBy( -8, 6 );
            }

            this.count++;
            
            // 画面外に行ってしまった場合
            if( this.x < -76 ){
                this.parentNode.removeChild( this );
                f_pass();
            }

            // さるぼぼちゃんとぶつかったら消滅
            if( saru.intersect(this) ){
                this.parentNode.removeChild( this );     
                f_hit();
            }
        }
    },

});

/////////////////////
// 敵ぼぼクラス
/////////////////////
var Flybobo = Class.create(Sprite, {
    initialize: function(){
        Sprite.call( this, 64, 77 );
        this.image = game.assets[ FLYBOBO_IMAGE ];
        this.moveTo( 800, Math.random() * 150 + 100 );
        this.timer = 0;
        this.flg   = 0;
        this.count = 0;
        this.mode  = TEKI;
        this.speed = Math.random() * -15 -5;
    },

    // フレームごとの動作
    onenterframe : function(){
        if( MOVE_MODE == 0 ){
            this.frame += 1;
            this.frame %= 2;

            if( ( this.count % 12 ) < 6 ){
                this.moveBy( this.speed, -6 );
            }else{
                this.moveBy( this.speed, 8 );
            }

            this.count++;
            
            // 画面外に行ってしまった場合
            if( this.x < -64 ){
                this.parentNode.removeChild( this );
                f_pass();
            }

            // さるぼぼちゃんとぶつかったら消滅
            if( saru.intersect(this) ){
                this.parentNode.removeChild( this ); 
                f_hit();
            }
        }
    },

});

/////////////////////
// 敵ニャンボボクラス
/////////////////////
var Nyanbobo = Class.create(Sprite, {
    initialize: function(){
        Sprite.call( this, 36, 38 );
        this.image = game.assets[ NYANBOBO_IMAGE ];
        this.moveTo( 800, 418 );
        this.timer = 0;
        this.flg   = 0;
        this.mode  = TEKI;
        this.speed = Math.random() * -4 -14;
    },

    // フレームごとの動作
    onenterframe : function(){
        if( MOVE_MODE == 0 ){
//            this.frame += 1;
//            this.frame %= 2;

            this.moveBy( this.speed, 0 );
            
            // 画面外に行ってしまった場合
            if( this.x < -32 ){
                this.parentNode.removeChild( this );
                f_pass();
            }

            // さるぼぼちゃんとぶつかったら消滅
            if( saru.intersect(this) ){
                this.parentNode.removeChild( this );     
                f_hit();
            }
        }
    },

});

////////////////////
// Pass 判定
////////////////////
function f_pass(){
    scene.removeChild( pass[ bobo_pass ] );
    bobo_pass++;

    if( bobo_pass == 5 ){
        MOVE_MODE = 1;
        var end = new Ending();
        scene.addChild( end );
    }  
}

////////////////////
// 効果音再生（ここに追加！）
////////////////////
function playSE(name) {
    var se = game.assets[name].clone();
    se.play();
}

////////////////////
// Hit 判定
////////////////////
function f_hit(){
    scene.removeChild( hit[ bobo_hit ] );
    bobo_hit++;

    // ヒットしすぎの場合はゲームオーバー
    if( bobo_hit == 3 ){
        MOVE_MODE = 1;
        var end = new Ending();
        scene.addChild( end );
    }    
}

/////////////////////
// 石投げクラス
/////////////////////
var Stone = Class.create(Sprite, {
    initialize: function( x, y, sarux, saruy ){
        Sprite.call( this, 32, 32 );
        this.image = game.assets[ STONE_IMAGE ];
        this.moveTo( sarux, saruy );
        this.timer = 0;
        this.flg   = 0;
        
        this.targetx = x - 16;
        this.targety = y - 16;
        this.sarux = sarux;
        this.saruy = saruy;

        this.mode  = TAMA;
    },

    // フレームごとの動作
    onenterframe : function(){
        if( MOVE_MODE == 0 ){
            var xx = ( this.targetx - this.sarux ) / STONE_TIME;
            var yy = ( this.targety - this.saruy ) / STONE_TIME;
            var flg = 0;
            //console.log( scene.childNodes.length );

            // 敵キャラとの当たり判定
            for( var ix = 0; ix < scene.childNodes.length; ix++ ){
                //console.log( "find" );
                // 敵の場合は衝突判定
                if( scene.childNodes[ ix ].mode == TEKI ){
                    if( scene.childNodes[ ix ].intersect( this ) ){
                        console.log( "find1" );

                        this.parentNode.removeChild( scene.childNodes[ ix ] );            
                        this.parentNode.removeChild( this );
                        flg = 1;
                        break;                
                    }
                }
            }

            if( flg != 1 ){
                this.timer++;

                this.moveTo( this.sarux + xx * this.timer, this.saruy + yy * this.timer);

                if( this.timer == STONE_TIME ){
                    this.parentNode.removeChild( this );
                }
            }
        }
    },

});


/////////////////////
// 通過の画像クラス
/////////////////////
var Pass = Class.create(Sprite, {
    initialize: function( x, y ){
        Sprite.call( this, 50, 50 );
        this.image = game.assets[ PASS_IMAGE ];
        this.moveTo( x, 25 );
        this.width = 49;
        this.height = 23;
        this.timer = 0;
        this.flg   = 0;
        
        this.mode  = BOBO;
    },
});

/////////////////////
// HPの画像クラス
/////////////////////
var Hit = Class.create(Sprite, {
    initialize: function( x, y ){
        Sprite.call( this, 50, 50 );
        this.image = game.assets[ HIT_IMAGE ];
        this.moveTo( x, y );
        this.timer = 0;
        this.flg   = 0;
        
        this.mode  = BOBO;
    },
});

/////////////////////
// 回復アイテム（魚）クラス
/////////////////////
var Sakana = Class.create(Sprite, {
    initialize: function(){
        Sprite.call(this, 49, 21);
        this.image = game.assets[SAKANA_IMAGE];
        this.moveTo(800, 400); // 登場位置
        this.mode = OTHER;
        this.speed = -8;
    },

    onenterframe: function(){
        if( MOVE_MODE == 0 ){
            this.moveBy(this.speed, 0);

            // 画面外に出たら削除
            if(this.x < -50){
                this.parentNode.removeChild(this);
            }

            // さるぼぼちゃんと当たったら回復処理
            if(saru.intersect(this)){
                this.parentNode.removeChild(this);

                // ライフを回復（減っている分があるなら追加）
                if(bobo_hit > 0){
                    bobo_hit--;
                    scene.addChild(hit[bobo_hit]); // 表示も復活
                }

                // 通過ライフの回復
                if(bobo_pass > 0){
                 bobo_pass--;
                 scene.addChild(pass[bobo_pass]); // 表示も復活
                }

                // SE（あれば）playSE("music/heal.mp3"); など
                playSE("music/heal.mp3");
            }
        }
    }
});


// ウインドウのメイン処理
window.onload = function () {
    game = new Game(SCREEN_WIDTH,SCREEN_HEIGHT); // Gameオブジェクトの作成
    
    game.preload( ASSETS );             // アセットの
 //   game.fps = FPS;                     // フレームレートのセット

    // BGM制御
var titleBGMInstance = null;
var gameBGMInstance = null;

function playBGM(name) {
    var bgm = game.assets[name].clone();
    bgm.play();
    bgm.loop = true;
    return bgm;
}

    game.onload = function () {         // ゲームが開始された時の関数をセット
        scene = game.rootScene;     // game.rootSceneは長いのでsceneに参照を割り当て
        scene.backgroundColor = "black";

        titleBGMInstance = playBGM(TITLE_BGM);//最初にタイトルBGMを再生

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
                
                if( ( Total_Counter % 15 ) == 0 ) {scoreLabel.score++;
                 // ←ここに追加！
            if (scoreLabel.score === 100) {
             MOVE_MODE = 1;

            // 🎉 ゲームクリア画像を表示
              var clearSprite = new Sprite(256, 95); // 画像サイズに合わせて調整
              clearSprite.image = game.assets[CLEAR_IMAGE];
             clearSprite.moveTo(320, 180); // 表示位置を調整
              scene.addChild(clearSprite);

              if (gameBGMInstance) gameBGMInstance.stop();
              // ⏳ 2秒後にエンディング画像に切り替える
             game.rootScene.tl.delay(30).then(function() {
              // 既存の背景やクリア文字を削除
             scene.removeChild(clearSprite);
             scene.removeChild(background); // スクロール背景を消す

              // 📽 動画を表示
              var video = document.createElement("video");
              video.src = "images/END.mp4";
              video.autoplay = true;
              video.controls = false;
              video.loop = true;
              video.playbackRate = 0.5;
              video.style.position = "absolute";
              video.style.top = "0px";
              video.style.left = "0px";
               video.style.width = "100vw";
               video.style.height = "auto";
               video.style.objectFit = "cover";
                document.body.appendChild(video);

                // BGMを作成して再生
                var bgm = new Audio("music/ending.mp3"); // BGMファイルのパスを指定
                bgm.loop = true;
                bgm.volume = 0.5; // 音量調整（0.0〜1.0）
                bgm.play();
                 });
              }
              }

              // background.onenterframe の中
               if (Math.random() > 0.998) {
                var sakana = new Sakana();
                 scene.addChild(sakana);
                 }

                if( ( scoreLabel % 10 ) == 0 ) hosei -= 0.1;

                if( Stone_Timer > 0 ) Stone_Timer--;
                this.x += SCROLL_SPEED;

                if( this.x <= ( -2384 + SCREEN_WIDTH ) ){
                    background.moveTo( 0, 0 );
                }

                if( Math.random() > ( 0.98 + hosei ) ){
                    var teki = new Tekibobo();
                    scene.addChild( teki );
                }
                if( Math.random() > ( 0.99 + hosei ) ){
                    var nyan = new Nyanbobo();
                    scene.addChild( nyan );
                }
                if( Math.random() > ( 0.99 + hosei ) ){
                    var fly = new Flybobo();
                    scene.addChild( fly );
                }
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

        ////////////////////////////
        // さるぼぼの制御
        ////////////////////////////
        saru = new Sarubobo();
        scene.addChild( saru );

        // 通過ライフ用
        pass[ 0 ] = new Pass( 600, 10 );
        scene.addChild( pass[ 0 ] );
        pass[ 1 ] = new Pass( 650, 10 );
        scene.addChild( pass[ 1 ] );
        pass[ 2 ] = new Pass( 700, 10 );
        scene.addChild( pass[ 2 ] );
        pass[ 3 ] = new Pass( 750, 10 );
        scene.addChild( pass[ 3 ] );
        pass[ 4 ] = new Pass( 800, 10 );
        scene.addChild( pass[ 4 ] );

        // 体当たりライフ用
        hit[ 0 ] = new Hit( 700, 60 );
        scene.addChild( hit[ 0 ] );
        hit[ 1 ] = new Hit( 750, 60 );
        scene.addChild( hit[ 1 ] );
        hit[ 2 ] = new Hit( 800, 60 );
        scene.addChild( hit[ 2 ] );


        // 初期画面
        scene.onenter = function(){
            game.fps = FPS;                     // フレームレートのセット
        };

        ///////////////////////////////////////
        // シーンに「タッチイベント」を追加します。
        ///////////////////////////////////////
        game.rootScene.addEventListener(Event.TOUCH_START, function(e) {
            console.log( "tap" );

             // 🔊 タイトルBGM止めてゲームBGMを流す
                 if (titleBGMInstance) titleBGMInstance.stop();
                 if (!gameBGMInstance) gameBGMInstance = playBGM(GAME_BGM);

            if( MOVE_MODE == 0 ){

                // 石を投げる
                if( ( e.x > 120 ) == ( Stone_Timer == 0 ) ){
                    var stone = new Stone( e.x, e.y, saru.x + 32, saru.y + 50 );
                    scene.addChild(stone);

                    console.log( scene.childNodes.length );

                    Stone_Timer = STONE_TIME_MAX;

                    playSE(SE_THROW); // ← ここで投げる音を鳴らす！
                }

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
                bobo_pass = 0;
                Total_Counter = 0;
                scoreLabel.score = 0;
                hosei     = 0.0;

                var del = [];
                var Nodes = scene.childNodes.length;

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

                // 通過ライフ用
                scene.addChild( pass[ 0 ] );
                scene.addChild( pass[ 1 ] );
                scene.addChild( pass[ 2 ] );
                scene.addChild( pass[ 3 ] );
                scene.addChild( pass[ 4 ] );

                // 体当たりライフ用
                scene.addChild( hit[ 0 ] );
                scene.addChild( hit[ 1 ] );
                scene.addChild( hit[ 2 ] );


            }
        });
    };
    game.start();
};


