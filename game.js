const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let score;
let scoreText;
let highscore;
let highScoreText;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};
let type;
// let bird;
const img = new Image();
const imgObsBird = new Image();
const imgObsCac = new Image();
img.src = 'https://toppng.com/uploads/preview/free-game-character-11549893090wkksr1ro4p.png';

imgObsCac.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScH1MJ3d0PXVJtaJNVfr9AiRdf1Iq4NuykVw&usqp=CAU';
imgObsBird.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1WkYXpBDbmbuCl9pyGwJQuCtukz6aVI00KA&usqp=CAU'

//Event listeners
document.addEventListener('keydown', function(evt){
    
    keys[evt.code] = true
})

document.addEventListener('keyup', function(evt){
    keys[evt.code] = false
})

document.getElementById('game').addEventListener('click', function(e){
    console.log(e.offsetY)
})

class Player {
    constructor(x,y,w,h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        // this.c = c;

        this.dy = 0;
        this.jumpForce = 5;
        this.originalHeight = h;
        this.grounded = false
        this.jumpTimer = 0;
    }
    
    Animate() {
        //Jump
        if (keys['Space'] || keys['KeyW'] || keys['ArrowUp']) {
            this.Jump()
        } else this.jumpTimer = 0;

        if (keys['ShiftRight'] || keys['KeyS'] || keys['ArrowDown'] ) {
            this.h = this.originalHeight / 2
        }else {
            this.h = this.originalHeight;
        }

        this.y += this.dy
        
        // Gravity
        if(this.y + this.h < canvas.height) {
            
            this.dy += gravity
            this.grounded = false
        }
        else{
            this.dy = 0
            this.grounded = true
            this.y = canvas.height - this.h
        }
        
        this.Draw()
    }

    Jump() {
        if (this.grounded && this.jumpTimer == 0){
            this.jumpTimer = 1
            this.dy = -this.jumpForce
            
        } else if (this.jumpTimer > 0 && this.jumpTimer < 15){
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50)
        }
    }
    
    Draw() {
        ctx.beginPath()
        // ctx.fillStyle = this.c;
        // ctx.fillRect(this.x, this.y, this.w, this.h)
        ctx.drawImage(img,this.x, this.y, this.w, this.h);
        ctx.closePath()
    }
}

class Text {
    constructor(t,x,y,a,c,s) {
        this.t = t;
        this.x = x;
        this.y = y;
        this.a = a;
        this.c = c;
        this.s = s;
    }
    
    Draw() {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.font=this.s+"px sans-serif";
        ctx.textAlign = this.a;
        ctx.fillText(this.t, this.x, this.y)
        ctx.closePath();
    }
}


class Obstacle {
    constructor(x, y, w, h, c){
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.c = c
        
        this.dx= -gameSpeed
    }
        Update(){
            this.x += this.dx 
            this.Draw()
            this.dx = -gameSpeed
        }

        Draw(){
            ctx.beginPath()
            // ctx.fillStyle = this.c
            // if(bird){ ctx.drawImage(imgObsBird, this.x, this.y, this.w, this.h)}
            if(type == 0) ctx.drawImage(imgObsCac , this.x, this.y, this.w, this.h)
            else if (type == 1) ctx.drawImage(imgObsBird , this.x, this.y, this.w, this.h)
            ctx.closePath()
        }
    }

function SpawnObstacle () {
    
    //size of obstacle
    let size = RandomIntInRange(40, 80);
    // the type, either 0 or 1, cactus or bird
    type = RandomIntInRange(0, 1);
    
    let obstacle = new Obstacle (canvas.width + size, canvas.height - size, size, size);

    if(type == 1){
        
        //need to reach score 1000 before having bird obstacles
        if(score > 1000){
              obstacle.y -= player.originalHeight - 10;
        }

        else if(score < 500) type = 0;
    }

    obstacles.push(obstacle);
}

function RandomIntInRange(min, max){
    return Math.round(Math.random() * (max - min) + min );
}

function Start () {
    // canvas.width = window.innerWidth - 100
    // canvas.height = window.innerHeight;
    
    canvas.width = canvas.width + 100;
    ctx.font ='20px sans-serif'
    // bird = false;
    gameSpeed = 3
    gravity = 0.1
    
    score = 0;
    highscore = 0;
    
    if(localStorage.getItem('highscore')){
        highscore = localStorage.getItem('highscore');
    }
    
    player = new Player(25, 150 , 50, 70);
    
    scoreText = new Text(undefined, 25, 25, "left","#212121", "20" );
    highScoreText = new Text("Highscore " + highscore, canvas.width - 25, 25, "right", "#212121", "20")
    
    //animationFrame
    Update();
}

let initialSpawnTimer = 200; // start value of spawntiming
let spawnTimer = initialSpawnTimer; 

function Update() {
    
    requestAnimationFrame(Update);
    
    
    // cancelAnimationFrame(250)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spawnTimer--;
    
    if(spawnTimer <= 0){
        
        SpawnObstacle();
        
        spawnTimer = initialSpawnTimer - gameSpeed * 8;
        
        if(spawnTimer < 60) {
            spawnTimer = 60;
        }
    }

    for (let i = 0; i < obstacles.length; i++){

        let o = obstacles[i];

        if(o.x + o.w < 0){
            obstacles.splice(i, 1);
        }


        if(
            player.x < o.x + o.w &&
            player.x + player.w > o.x &&
            player.y < o.y + o.h &&
            player.y + player.h > o.y
        ){
            $("#game").fadeOut().delay(10).fadeIn();
            // player.y = 200;
            obstacles = [];
            score = 0;
            spawnTimer = initialSpawnTimer;
            gameSpeed = 3;
            highScoreText.c = "#212121";
            highScoreText.t = "Highscore " + highscore;
        }

        o.Update()
    }

    player.Animate();
    score++;
    scoreText.t = "Score: " + score;
    scoreText.Draw();

    if(score > highscore){
        highScoreText.c = 'orange'
        highscore = score;
        highScoreText.t = "Highscore " + highscore + '!';
        window.localStorage.setItem('highscore', highscore);
    }

    highScoreText.Draw();
    
    gameSpeed += 0.003;
}

$(document).ready(function(){
    //  window.localStorage.clear()
    Start()
});