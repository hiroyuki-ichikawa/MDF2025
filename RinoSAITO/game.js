//画面取得//
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//初期設定//
let frameCount = 0;
let rice = [];
let timeLeft = 60; //2分45秒にしたかったけど長すぎた
let FPS = 30;
let MOVE_MODE = 0;
let direction = 1;
let keys = {
    ArrowLeft: false,
    ArrowRight: false,
};

//画像//
let OKJO_LEFT = new Image();
    OKJO_LEFT.src = "images/okjo_left.png"
let OKJO_RIGHT = new Image();
    OKJO_RIGHT.src ="images/okjo_right.png";
let BACKGROUND_IMAGE = new Image();
    BACKGROUND_IMAGE.src ="images/haikei.jpeg";
let GENMAI_IMAGE = new Image();
    GENMAI_IMAGE.src = "images/genmai.png";
let HAKUMAI_IMAGE = new Image();
    HAKUMAI_IMAGE.src = "images/hakumai.png";
let DOKKAEBI_IMAGE = new Image();
    DOKKAEBI_IMAGE.src = "images/dokkaebi.png";
let OKJO_CRY = new Image();
    OKJO_CRY.src = "images/okjo_cry.png";
let OKJO_SMAILE = new Image();
    OKJO_SMAILE.src = "images/okjo_smaile.png";
let LIFE_IMAGE = new Image();
    LIFE_IMAGE.src = "images/life.png";
let TITLE_LOGO = new Image();
    TITLE_LOGO.src = "images/logo.png";


//効果音
const catchSound = new Audio("images/catch.mp3");
const damageSound = new Audio("images/damage.mp3");

let gameState = "start"; // "start", "playing", "result"

//アセット//
let ASSETS = [OKJO_LEFT, OKJO_RIGHT, OKJO_CRY, OKJO_SMAILE, BACKGROUND_IMAGE, GENMAI_IMAGE, HAKUMAI_IMAGE, DOKKAEBI_IMAGE, TITLE_LOGO];

//沃沮ちゃんのお米キャッチ！
function drawStart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(BACKGROUND_IMAGE, 0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const logoWidth = 842 / 1.5;
    const logoHeight = 569 / 1.5;
    const logoX = (canvas.width - logoWidth) / 2;
    const logoY = canvas.height / 4 - logoHeight / 2;
    ctx.drawImage(TITLE_LOGO, logoX, logoY, logoWidth, logoHeight);

    ctx.fillStyle = "white";
    ctx.font = "32px 'Potta One'";
    const prompt = "クリックでプレイ";
    const promptWidth = ctx.measureText(prompt).width;
    ctx.fillText(prompt, (canvas.width - promptWidth) / 2, canvas.height / 2 + 100);
}

canvas.addEventListener("click", () => {
    if (gameState === "start") {
        gameState = "playing";
    } else if (gameState === "result") {
        window.location.reload();
    }
});


//沃沮ちゃんの初期位置//
let okjo = {
    posx: 200,
    posy: 340,
    width : 200,
    height: 200,
    speed: 10,
};

//沃沮ちゃんメンタル//
let okjo_catch = 0;
let life = 3;
let hosei = 0.0;


//左右あたふた沃沮ちゃん//
document.addEventListener("keydown", e =>{
    if (e.key in keys)
        keys[e.key] = true;
    });
document.addEventListener("keyup", e => {
    if (e.key in keys)
        keys[e.key] = false;
    });
function moveOkjo() {
    if (keys.ArrowLeft && okjo.posx > 0) {
        okjo.posx -= okjo.speed;
        direction = -1;
    }
    if (keys.ArrowRight && okjo.posx < canvas.width - okjo.width) {
        okjo.posx += okjo.speed;
        direction = 1;
    }
}
function drawOkjo() {
    let img = direction === -1 ? OKJO_LEFT : OKJO_RIGHT;
    ctx.drawImage(img, okjo.posx, okjo.posy, okjo.width, okjo.height);
}

//神の慈悲(※お米)//
let fallingItems = [];
const riceWidth = 16;
function createItem() {
    const rand = Math.random();
    let type = "genmai";
    if (rand < 0.05) {
        type = "dokkaebi";
    } 
    else if (rand < 0.4) {
        type = "hakumai";
    }

    const x = Math.random() * (canvas.width - riceWidth);
    const rotation = Math.random() * 2 * Math.PI;
    const rotationSpeed = (Math.random() * 0.04) - 0.02;

    const size = type === "dokkaebi" ? riceWidth * 3 : riceWidth;
    const swayAmplitude = Math.random() * 20 + 10; 
    const swaySpeed = Math.random() * 0.03 + 0.01;  
    const swayPhase = Math.random() * 2 * Math.PI; 
    
    fallingItems.push({
        x: x,
        baseX: x,
        y: 0,
        type: type,
        rotation: rotation,
        rotationSpeed: rotationSpeed,
        size: size,
        swayAmplitude: swayAmplitude,
        swaySpeed: swaySpeed,
        swayPhase: swayPhase,
    });
}

function updateItems() {
    if (gameState !== "playing") return;
    frameCount++;
    if (frameCount % 20 === 0) {
        for (let i = 0; i < 7; i++) {
            createItem();
        }
    }
    fallingItems.forEach(item => {
        item.y += 3;
        item.rotation += item.rotationSpeed;
    
        const swayOffset = Math.sin(item.y * item.swaySpeed + item.swayPhase) * item.swayAmplitude;
        item.x = item.baseX + swayOffset;
    });
}

function drawItems() {
    fallingItems.forEach(item => {
        let img;
        if (item.type === "genmai") img = GENMAI_IMAGE;
        else if (item.type === "hakumai") img = HAKUMAI_IMAGE;
        else if (item.type === "dokkaebi") img = DOKKAEBI_IMAGE;

        const isDokkaebi = item.type === "dokkaebi";
        const size = isDokkaebi ? riceWidth * 2 : riceWidth;

        const centerX = item.x + item.size / 2;
        const centerY = item.y + item.size / 2;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(item.rotation || 0);
        ctx.drawImage(img, -item.size / 2, -item.size / 2, item.size, item.size);
        ctx.restore();        
    });
}

//当たり判定
function checkCollision() {
    let okjoHitbox;                    //沃沮ちゃん土器
    if (direction === -1) {
        //土器が左
        okjoHitbox = {
            x: okjo.posx + 50,
            y: okjo.posy + 90,
            width: 70,
            height: 30,
            };
    }
    else {
        //土器が右
        okjoHitbox = {
            x: okjo.posx + okjo.width - 100,
            y: okjo.posy + 90,
            width: 70,
            height: 30,
        };
    }
    //お米たち
    for (let i = fallingItems.length - 1; i >= 0; i--) {
        const item = fallingItems[i];
        
        const itemHitbox = {
            x: item.x + 5,
            y: item.y + 5,
            width: item.size - 10,
            height: item.size - 10,
        };        

        //衝突判定
        if (
            itemHitbox.x < okjoHitbox.x + okjoHitbox.width &&
            itemHitbox.x + itemHitbox.width > okjoHitbox.x &&
            itemHitbox.y < okjoHitbox.y + okjoHitbox.height &&
            itemHitbox.y + itemHitbox.height > okjoHitbox.y
        ) {
            //衝突！🌾😭
            catchSound.currentTime = 0;
            catchSound.play();
            if (item.type === "genmai") {
                okjo_catch += 1;
                catchSound.currentTime = 0;
                catchSound.play()
            } else if (item.type === "hakumai") {
                okjo_catch += 3;
                catchSound.currentTime = 0;
                catchSound.play()
            } else if (item.type === "dokkaebi") {
                life -= 1;
                damageSound.currentTime = 0;
                damageSound.play();
            }
            fallingItems.splice(i, 1);
        }
    }
}

//残りの土器たち
function drawLife() {
    const iconSize = 60;
    const margin = 10;
    for (let i = 0; i < life; i++) {
        ctx.drawImage(LIFE_IMAGE, margin + i * (iconSize + 5), 10, iconSize, iconSize);
    }
}

//神の慈悲タイム
setInterval(() => {
    if (gameState === "playing" && timeLeft > 0) {
        timeLeft--;
    }
}, 1000);  // 1000ms = 1秒
function drawTime() {
    ctx.fillStyle = "black";
    ctx.font = "32px 'Potta One'";
    const text = `あと${timeLeft}秒`;
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, canvas.width - textWidth - 20, 40);
}

//沃沮ちゃんが一生懸命とったお米のスコア
    function drawScore() {
        ctx.fillStyle = "black";
        ctx.font = "42px 'Potta One'";
        const text = `${okjo_catch}つぶ`;
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, canvas.width - textWidth - 20, canvas.height - 20);
    }

//結果発表〜〜！！(濱口)
    function checkGameOver() {
        if (life <= 0 || timeLeft <= 0) {
            gameState = "result";
        }
    }
    function drawResult() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(BACKGROUND_IMAGE, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        //分岐
        let resultImage;
        if (okjo_catch >= 200) {
            resultImage = OKJO_SMAILE; //成功
        } 
        else {
            resultImage = OKJO_CRY; //失敗
        }
        //沃沮ちゃん🌾
        const maxImageHeight = 600;
        const scale = maxImageHeight / resultImage.height;
        const displayWidth = resultImage.width * scale;
        const displayHeight = resultImage.height * scale;
        
        ctx.drawImage(
            resultImage,
            canvas.width - displayWidth - 50,
            100,
            displayWidth,
            displayHeight
        );

        //スコア
        ctx.fillStyle = "white";
        ctx.font = "32px 'Potta One'";
        ctx.fillText(`とったお米 ${okjo_catch}`, 50, 150);
        ctx.fillText("クリックでリプレイ", 50, 220);
    }
    canvas.addEventListener("click", () => {
        if (gameState === "result") {
            window.location.reload();
        }
    });    
    


//ゲームループ//
function draw() {
    if (gameState === "start") {
        drawStart();
        return;
    }
    if (gameState === "result") {
        drawResult();
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(BACKGROUND_IMAGE, 0, 0, canvas.width, canvas.height);
    drawOkjo();
    drawItems();
    drawLife();
    drawTime();
    drawScore();
}
function gameLoop() {
    checkGameOver();
    if (gameState === "result") {
        draw();
        return;
    }
    moveOkjo();
    updateItems();
    checkCollision();
    draw();
}

let loadedCount = 0;
const imagesToLoad = [OKJO_LEFT, OKJO_RIGHT, BACKGROUND_IMAGE, GENMAI_IMAGE, HAKUMAI_IMAGE, DOKKAEBI_IMAGE, OKJO_CRY, OKJO_SMAILE, TITLE_LOGO, LIFE_IMAGE];
imagesToLoad.forEach(img => {
    img.onload = () => {
    loadedCount++;
    if (loadedCount === imagesToLoad.length) {
    setInterval(gameLoop, 1000 / FPS);
    }
    };
});