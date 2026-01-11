// ========================
// CANVAS SETUP
// ========================
const canvas = document.querySelector("canvas");
canvas.focus();
const c = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];

for (let i = 0; i < 80; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.2 + 0.5,
        speed: Math.random() * 2 + 0.5
    });
}

const blueStars = [];

for (let i = 0; i < 40; i++) {
    blueStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 1.5 + 0.5
    });
}

const orangeStars = [];

for (let i = 0; i < 50; i++) {
    orangeStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.8 + 0.8,
        speed: Math.random() * 2 + 1
    });
}

function drawStars() {
    c.fillStyle = "white";
    stars.forEach(s => {
        c.beginPath();
        c.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        c.fill();

        s.y += s.speed;

        if (s.y > canvas.height) {
            s.y = 0;
            s.x = Math.random() * canvas.width;
        }
    });
}

function drawBlueStars() {
    c.fillStyle = "#44aaff";
    blueStars.forEach(s => {
        c.beginPath();
        c.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        c.fill();

        s.y += s.speed;
        if (s.y > canvas.height) {
            s.y = 0;
            s.x = Math.random() * canvas.width;
        }
    });
}

function drawOrangeStars() {
    c.fillStyle = "orange";
    orangeStars.forEach(s => {
        c.beginPath();
        c.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        c.fill();

        s.y += s.speed;
        if (s.y > canvas.height) {
            s.y = 0;
            s.x = Math.random() * canvas.width;
        }
    });
}


// ========================
// Sound
// ========================

const sounds = {};

function loadSound(name, src, volume = 1) {
    const audio = new Audio(src);
    audio.volume = volume;
    sounds[name] = audio;
}

loadSound("shoot", "sounds/shoot.wav", 0.4);
loadSound("explode", "sounds/explode.mp3", 0.6);
loadSound("explode2", "sounds/explode2.mp3", 0.6);
loadSound("powerup", "sounds/powerup.mp3", 0.5);
loadSound("laser", "sounds/laser.wav", 0.7);
loadSound("bomb", "sounds/bomb.mp3", 0.8);

function playExplosionSound() {
    const sound = Math.random() < 0.5 ? "explode" : "explode2";
    playSound(sound);
}

// UI
const ui = document.getElementById("gameWrapper");
const hud = document.getElementById("ui");
const scoreEl = ui.querySelector("#score");
const livesEl = ui.querySelector("#lives");
const bombsEl = ui.querySelector("#bombs");
const boss3Bombs = [];


let score = 0;
let gameStarted = false;
let shakeTime = 0;
let shakeStrength = 0;
let stageText = "STAGE 1";
let stageAlpha = 1;
let showStage = false;
let boss2 = null;
let gameState = "stage1"; 
let stateTimer = 0;
let finalBossSpawned = false;
let paused = false;
let justRespawned = false;

function startShake(strength = 10, duration = 10) {
    shakeStrength = strength;
    shakeTime = duration;
    }

let gameOver = false;
let startTime = Date.now();
let stats = {
    enemiesKilled: 0,
    bossesKilled: 0
};

const sprites = {};

function loadSprite(name, src) {
    const img = new Image();
    img.src = src;
    sprites[name] = img;
}

loadSprite("player", "sprites/player.png");
loadSprite("enemy", "sprites/enemy.png");
loadSprite("enemy2", "sprites/enemy2.png");
loadSprite("enemy3", "sprites/enemy3.png");
loadSprite("boss", "sprites/boss.png");
loadSprite("boss2", "sprites/boss2.png");
loadSprite("boss3", "sprites/boss3.png");
loadSprite("drone", "sprites/drone.png");
loadSprite("orangePU", "sprites/orangePU.png");
loadSprite("greenPU", "sprites/greenPU.png");
loadSprite("purplePU", "sprites/purplePU.png");
loadSprite("bluePU", "sprites/bluePU.png");
loadSprite("yellowPU", "sprites/yellowPU.png");
loadSprite("rock", "sprites/rock.png");
loadSprite("bombPU", "sprites/bombPU.png");
loadSprite("bomb", "sprites/bomb.png");

// ========================
// INPUT
// ========================
function resetKeys() {
    for (let k in keys) keys[k] = false;
}

window.addEventListener("blur", resetKeys);
document.addEventListener("visibilitychange", resetKeys);
document.addEventListener("fullscreenchange", resetKeys);

const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

let mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

let mouseDown = false;

addEventListener("mousedown", () => {
    mouseDown = true;
});

addEventListener("mouseup", () => {
    mouseDown = false;
});

window.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();

    if (key in keys) keys[key] = true;

    if (key === "shift" && player && player.dashCooldown <= 0) {
        player.startDash();
    }

    if (key === "f") {
        toggleFullscreen();
    }

    if (key === "enter" && !gameStarted) {
        gameStarted = true;
        const screen = document.getElementById("startScreen");
        if (screen) screen.remove();
        startTime = Date.now();
        showStage = true;
        stageAlpha = 1;
        canvas.focus();
        hud.style.display = "block";
        animate();
    }

    if (key === " " && gameStarted && !gameOver) {
        player.useBomb();
    }

    if (key === "p" && gameStarted) {
        paused = !paused;
        if (paused) {
            hud.style.display = "none";
        } else {
            hud.style.display = "block";
        }  
    }
});

window.addEventListener("keyup", e => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = false;
});

addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

addEventListener("fullscreenchange", () => {
    resizeCanvas();
});

addEventListener("resize", resizeCanvas);

// ========================
// Hilfsfunktionen
// ========================

function createExplosion(x, y, size = 20, color = "orange") {
    for (let i = 0; i < size; i++) {
        particles.push(new Particle(x, y, color, 4));
    }
}

function playSound(name) {
    if (!sounds[name]) return;
    const s = sounds[name].cloneNode();
    s.volume = sounds[name].volume;
    s.play();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.getElementById("gameWrapper").requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function detonateBomb(x, y) {
    playSound("bomb");
    createExplosion(x, y, 250, "orange");
    createExplosion(x, y, 150, "red");
    createExplosion(x, y, 80, "white");


    // Gegner töten
    enemies.forEach((e, i) => {
        if (distance({ x, y }, e.position) < 600) {
            enemies.splice(i, 1);
            stats.enemiesKilled++;
            score += 100;
            playExplosionSound();
        }
    });

    // Boss Schaden
    if (boss) {
        const dx = boss.centerX - x;
        const dy = boss.centerY - y;
        const dist = Math.hypot(dx, dy);

        if (dist < 400) {
            boss.health -= 50;
        }
    }
    // Boss2 Schaden
    if (boss2 && !boss2.immun) {
        const dx = boss2.center.x - x;
        const dy = boss2.center.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist < 400) {
            boss2.health -= 250;

            if (boss2.health <= 0) {
                const bx = boss2.center.x;
                const by = boss2.center.y;
                boss2 = null;
                stats.bossesKilled++;
                score += 10000;
                scoreEl.textContent = score;
                playExplosionSound();
                createExplosion(bx, by, 150, "purple");
            }
        }
    }
    // Boss3 Schaden
    if (boss3) {
        const dx = boss3.center.x - x;
        const dy = boss3.center.y - y;
        const dist = Math.hypot(dx, dy);

        if (dist < 400) {
            boss3.health -= 400;   // starke Bombe

            if (boss3.health <= 0) {
                const bx = boss3.center.x;
                const by = boss3.center.y;
                boss3 = null;
                stats.bossesKilled++;
                score += 25000;
                scoreEl.textContent = score;
                playExplosionSound();
                createExplosion(bx, by, 200, "red");
            }
        }
    }
}

function drawPauseScreen() {
    // 🔒 Canvas komplett resetten
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    c.shadowColor = "transparent";
    c.shadowBlur = 0;
    c.lineWidth = 1;
    c.textAlign = "center";
    c.textBaseline = "middle";

    // Hintergrund
    c.fillStyle = "rgba(0,0,0,0.8)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Titel
    c.fillStyle = "white";
    c.font = "bold 64px Arial";
    c.fillText("PAUSED", canvas.width / 2, 80);

    c.font = "24px Arial";
    c.fillText("Press P to continue", canvas.width / 2, 120);

    // Box
    const w = 600;
    const h = 360;
    const x = canvas.width / 2 - w / 2;
    const y = 170;

    c.fillStyle = "rgba(0,0,0,0.6)";
    c.fillRect(x, y, w, h);

    c.strokeStyle = "white";
    c.lineWidth = 2;
    c.strokeRect(x, y, w, h);

    // Überschrift
    c.textAlign = "left";
    c.font = "28px Arial";
    c.fillStyle = "white";
    c.fillText("POWER UPS", x + 20, y + 40);

    c.font = "22px Arial";

    const lines = [
        "Green  - +1 Life",
        "Yellow - Rapid Fire (10s)",
        "Orange - Big Bullets (10s)",
        "Purple - Spread Shot (10s)",
        "Blue   - Shield",
        "Bomb   - +1 Bomb"
    ];

    for (let i = 0; i < lines.length; i++) {
        c.fillText(lines[i], x + 40, y + 80 + i * 40);
    }
}

function takeDamage(amount = 1) {
    if (player.isDashing) return;

    if (player.shield > 0) {
        player.shield -= 40;
        if (player.shield < 0) player.shield = 0;
        return;
    }

    player.lives -= amount;
    livesEl.textContent = player.lives;

    startShake(10, 10);

    if (player.lives <= 0) {
        respawnAtStage();
    }
}

// ========================
// SIMPLE PIXEL SPRITES
// ========================
function drawShip(x, y, size, color) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(x, y - size);
    c.lineTo(x - size, y + size);
    c.lineTo(x + size, y + size);
    c.closePath();
    c.fill();
}

function respawnAtStage() {
    justRespawned = true;
    // Score reset
    score = 0;
    scoreEl.textContent = score;

    // Player neu setzen
    player.position.x = canvas.width / 2;
    player.position.y = canvas.height - 80;
    player.shield = 0;
    player.bombs = 1;
    bombsEl.textContent = player.bombs;
    player.spread = false;
    player.bulletSize = 5;
    player.fireRate = 320;

    // Alle Projektile & Objekte löschen
    projectiles.length = 0;
    enemies.length = 0;
    enemies2.length = 0;
    enemies3.length = 0;
    powerUps.length = 0;
    rocks.length = 0;
    particles.length = 0;
    drones.length = 0;
    boss3Bombs.length = 0;

    boss = null;
    boss2 = null;
    boss3 = null;
    finalBossSpawned = false;

    // Stage-spezifisch resetten
    stateTimer = 0;

    if (gameState === "boss1") gameState = "stage1";
    if (gameState === "boss2") gameState = "stage2";
    if (gameState === "boss3") gameState = "stage3";

    stageText =
        gameState === "stage1" ? "STAGE 1" :
        gameState === "stage2" ? "STAGE 2" :
        gameState === "stage3" ? "STAGE 3" :
        gameState === "chaos"  ? "CHAOS" : "";

    showStage = true;
    stageAlpha = 1;

    // Player bekommt neue Leben für diese Stage
    player.lives = 3;
    livesEl.textContent = player.lives;
}


// ========================
// PLAYER
// ========================
class Player {
    constructor(config) {
        this.width = config.width;
        this.height = config.height;
        this.speed = config.speed;
        this.lives = config.lives;
        this.fireRate = 320;        // Zeit zwischen Schüssen
        this.lastShot = 0;
        this.bulletSize = 5;
        this.spread = false;
        this.enemySlow = false;
        this.shield = 0;      // aktuelle Schildenergie
        this.maxShield = 100;
        this.dashCooldown = 0;
        this.isDashing = false;
        this.dashTime = 0;
        this.bombs = 1;
        this.activeBomb = null;
        bombsEl.textContent = this.bombs;
        this.position = {
            x: canvas.width / 2,
            y: canvas.height - 80
        };
    }

    draw() {
        c.drawImage(
            sprites.player,
            this.position.x - this.width / 2,
            this.position.y - this.height / 2,
            this.width,
            this.height
        );
        // Schild anzeigen
        if (this.shield > 0) {
            c.strokeStyle = "rgba(0,200,255,0.7)";
            c.lineWidth = 4;
            c.beginPath();
            c.arc(this.position.x, this.position.y, 30, 0, Math.PI * 2);
            c.stroke();
        }
        if (this.isDashing) {
        c.strokeStyle = "rgba(255,255,255,0.8)";
        c.lineWidth = 6;
        c.beginPath();
        c.arc(this.position.x, this.position.y, 35, 0, Math.PI * 2);
        c.stroke();
        }


    }

    update() {

        this.updateDash();

        // Movement WASD
        if (keys.a) this.position.x -= this.speed;
        if (keys.d) this.position.x += this.speed;
        if (keys.w) this.position.y -= this.speed;
        if (keys.s) this.position.y += this.speed;

        // 🔒 Grenzen erzwingen (nach der Bewegung!)
        const margin = this.width / 2;
        this.position.x = Math.max(margin, Math.min(this.position.x, canvas.width - margin));
        this.position.y = Math.max(margin, Math.min(this.position.y, canvas.height - margin));

        this.draw();
    }

    startDash() {
    this.isDashing = true;
    this.dashTime = 10;     // Frames
    this.dashCooldown = 120; // 2 Sekunden Cooldown
}

    updateDash() {
        if (this.dashCooldown > 0) this.dashCooldown--;

        if (this.isDashing) {
            this.dashTime--;

            const speed = 20;

            if (keys.a) this.position.x -= speed;
            if (keys.d) this.position.x += speed;
            if (keys.w) this.position.y -= speed;
            if (keys.s) this.position.y += speed;

            // 🔒 Bildschirm-Grenzen erzwingen
            const margin = this.width / 2;
            this.position.x = Math.max(margin, Math.min(this.position.x, canvas.width - margin));
            this.position.y = Math.max(margin, Math.min(this.position.y, canvas.height - margin));

            if (this.dashTime <= 0) {
                this.isDashing = false;
            }
        }
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot < this.fireRate) return;
        this.lastShot = now;
        playSound("shoot");
        const angle = Math.atan2(
            mouse.y - this.position.y,
            mouse.x - this.position.x
        );

        const speed = 12;

        // Normaler Schuss
        projectiles.push(
            new Projectile({
                x: this.position.x,
                y: this.position.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                fromEnemy: false,
                radius: this.bulletSize,
                damage: this.bulletSize > 5 ? 15 : 5
            })
        );


        // Spread Shot
        if (this.spread) {
            for (let offset of [-0.3, 0.3]) {
                projectiles.push(
                    new Projectile({
                        x: this.position.x,
                        y: this.position.y,
                        vx: Math.cos(angle + offset) * speed,
                        vy: Math.sin(angle + offset) * speed,
                        fromEnemy: false,
                        radius: this.bulletSize,
                        damage: this.bulletSize > 5 ? 15 : 5
                    })
                );
            }
        }
    }

    useBomb() {
        // Keine aktive Bombe → neue werfen
        if (!this.activeBomb && this.bombs > 0) {
            this.bombs--;
            bombsEl.textContent = this.bombs;

            const angle = Math.atan2(
                mouse.y - this.position.y,
                mouse.x - this.position.x
            );

            this.activeBomb = new Bomb(this.position.x, this.position.y, angle);
        return;
        }

        // Bombe existiert → detonieren
        if (this.activeBomb) {
            detonateBomb(this.activeBomb.position.x, this.activeBomb.position.y);
            this.activeBomb = null;
        }
    }
}

// ========================
// PROJECTILES
// ========================
class Projectile {
    constructor({ x, y, vx, vy, fromEnemy, radius = 5, damage = 5 }) {
        this.position = { x, y };
        this.velocity = { x: vx, y: vy };
        this.radius = radius;
        this.fromEnemy = fromEnemy;
        this.damage = damage;
    }



    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.fromEnemy ? "red" : "yellow";
        c.fill();

        }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.draw();
    }
}

// ========================
// BOMB
// ========================

class Bomb {
    constructor(x, y, angle) {
        this.position = { x, y };
        this.velocity = {
            x: Math.cos(angle) * 6,
            y: Math.sin(angle) * 6
        };
        this.radius = 12;
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (sprites.bomb && sprites.bomb.complete) {
            c.drawImage(
                sprites.bomb,
                this.position.x - 16,
                this.position.y - 16,
                32,
                32
            );
        } else {
            // Fallback
            c.fillStyle = "orange";
            c.beginPath();
            c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            c.fill();
        }
    }
}

// ========================
// ENEMIES
// ========================

class Enemy {
    constructor(x, y) {
        this.position = { x, y };
        this.size = 20;
    }

    draw() {
        if (sprites.enemy && sprites.enemy.complete) {
            c.drawImage(
                sprites.enemy,
                this.position.x - 30,
                this.position.y - 30,
                60,
                60
            );
        } else {
            // Fallback falls Bild noch nicht geladen ist
            drawShip(this.position.x, this.position.y, 15, "orange");
        }
    }


    update() {
    let speed = player.enemySlow ? 0.2 : 0.6;
    this.position.y += speed;
    this.draw();
    }


    shoot() {
        if (Math.random() < 0.005) {
            const angle = Math.atan2(
                player.position.y - this.position.y,
                player.position.x - this.position.x
            );

            projectiles.push(
                new Projectile({
                    x: this.position.x,
                    y: this.position.y,
                    vx: Math.cos(angle) * 4,
                    vy: Math.sin(angle) * 4,
                    fromEnemy: true
                })
            );
        }
    }
}

class Enemy2 {
    constructor(x, y) {
        this.position = { x, y };
        this.width = 100;
        this.height = 100;
        this.direction = Math.random() < 0.5 ? -1 : 1;
        this.speed = 2.5;
        this.lastShot = 0;
    }

    update() {
        this.position.x += this.speed * this.direction;

        if (this.position.x < 0 || this.position.x + this.width > canvas.width) {
            this.direction *= -1;
        }

        if (Date.now() - this.lastShot > 1200) {
            this.shoot();
            this.lastShot = Date.now();
        }

        this.draw();
    }

    shoot() {
        projectiles.push(new Projectile({
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height,
            vx: 0,
            vy: 8, // schneller als normale Enemies
            fromEnemy: true,
            radius: 6
        }));
    }

    draw() {
        if (sprites.enemy2 && sprites.enemy2.complete) {
            c.shadowColor = "#44aaff";
            c.shadowBlur = 20;
            c.drawImage(
                sprites.enemy2,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );
            c.shadowBlur = 0;
        } else {
            // Fallback
            c.fillStyle = "purple";
            c.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }
}

class Enemy3 {
    constructor(x, y) {
        this.position = { x, y };
        this.size = 150;
        this.speed = 4.5;
        this.hp = 3;
    }

    update() {
        // Direkt auf den Spieler zielen
        const angle = Math.atan2(
            player.position.y - this.position.y,
            player.position.x - this.position.x
        );

        this.position.x += Math.cos(angle) * this.speed;
        this.position.y += Math.sin(angle) * this.speed;

        this.draw();
    }

    draw() {
        if (sprites.enemy3 && sprites.enemy3.complete) {
            c.drawImage(
                sprites.enemy3,
                this.position.x - this.size / 2,
                this.position.y - this.size / 2,
                this.size,
                this.size
            );
        } else {
            // Fallback
            c.fillStyle = "red";
            c.beginPath();
            c.arc(this.position.x, this.position.y, this.size / 2, 0, Math.PI * 2);
            c.fill();
        }
    }
}

class Drone {
    constructor(x, y) {
        this.size = 150;
        this.position = { x, y };
        this.hp = 3;

        const dirs = [
            { x: 1, y: 0 }, { x: -1, y: 0 },
            { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: 1, y: 1 }, { x: -1, y: 1 },
            { x: 1, y: -1 }, { x: -1, y: -1 }
        ];
        const d = dirs[Math.floor(Math.random() * dirs.length)];
        this.velocity = { x: d.x * 6, y: d.y * 6 };

        this.lastShot = 0;
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.x < 0 || this.position.x > canvas.width - this.size) this.velocity.x *= -1;
        if (this.position.y < 0 || this.position.y > canvas.height - this.size) this.velocity.y *= -1;

        // High-rate random shooting
        if (Date.now() - this.lastShot > 150) {
            this.shoot();
            this.lastShot = Date.now();
        }

        this.draw();
    }

    shoot() {
        const angle = Math.random() * Math.PI * 2;
        projectiles.push(new Projectile({
            x: this.position.x + this.size / 2,
            y: this.position.y + this.size / 2,
            vx: Math.cos(angle) * 6,
            vy: Math.sin(angle) * 6,
            fromEnemy: true,
            radius: 5
        }));
    }

    draw() {
        if (sprites.drone && sprites.drone.complete) {
            c.drawImage(sprites.drone, this.position.x, this.position.y, this.size, this.size);
        } else {
            c.fillStyle = "cyan";
            c.fillRect(this.position.x, this.position.y, this.size, this.size);
        }
    }

    get center() {
        return {
            x: this.position.x + this.size / 2,
            y: this.position.y + this.size / 2
        };
    }
}

// ========================
// BOSS
// ========================

class Boss {
    constructor() {
        this.width = 180;
        this.height = 100;
        this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: 120 - this.height / 2
        };


        this.speed = 2;      // Wie schnell
        this.direction = 1; // 1 = rechts, -1 = links

        this.health = 600;
        this.maxHealth = 600;
        this.lastShot = 0;
        this.phase = 1;

        this.laserCharge = 0;
        this.laserActive = false;
        this.laserAngle = 0;

    }

    updatePhase() {
        const hp = this.health / this.maxHealth;

        if (hp < 0.33) {
            this.phase = 3; // Rage
            this.speed = 5;
        } else if (hp < 0.66) {
            this.phase = 2; // Aggressiv
            this.speed = 3.5;
        } else {
            this.phase = 1; // Normal
            this.speed = 2;
        }
    }

    draw() {
        // Farbe je nach Phase
        if (this.phase === 1) c.fillStyle = "darkred";
        if (this.phase === 2) c.fillStyle = "orangered";
        if (this.phase === 3) c.fillStyle = "magenta";

       c.drawImage(
            sprites.boss,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );


        // Lebensbalken
        const barWidth = 300;
        const hpPercent = this.health / this.maxHealth;

        c.fillStyle = "red";
        c.fillRect(canvas.width / 2 - barWidth / 2, 20, barWidth, 15);

        c.fillStyle = "lime";
        c.fillRect(canvas.width / 2 - barWidth / 2, 20, barWidth * hpPercent, 15);
    }

    shoot() {
        const now = Date.now();

        // Laser nur in Phase 2 und 3
        if (!this.laserActive && this.phase >= 2 && Math.random() < 0.01) {
        this.startLaser();
        }

        if (now - this.lastShot < (this.phase === 3 ? 400 : this.phase === 2 ? 700 : 1000)) return;
        this.lastShot = now;

        

        if (this.phase === 1) {
            // Einfache 3er Salve
            for (let a of [-0.2, 0, 0.2]) {
                projectiles.push(
                    new Projectile({
                        x: this.centerX,
                        y: this.centerY + this.height / 2,

                        vx: Math.sin(a) * 4,
                        vy: 4,
                        fromEnemy: true
                    })
                );
            }
        }

        if (this.phase === 2) {
            // 7er Fächer
            for (let a of [-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6]) {
                projectiles.push(
                    new Projectile({
                       x: this.centerX,
                        y: this.centerY + this.height / 2,

                        vx: Math.sin(a) * 5,
                        vy: 5,
                        fromEnemy: true
                    })
                );
            }
        }

        if (this.phase === 3) {
            // Rage: Kreisschuss
            for (let i = 0; i < 16; i++) {
                const angle = (Math.PI * 2 / 16) * i;
                projectiles.push(
                    new Projectile({
                        x: this.centerX,
                        y: this.centerY,
                        vx: Math.cos(angle) * 5,
                        vy: Math.sin(angle) * 5,
                        fromEnemy: true
                    })
                );
            }
        }
    }

    update() {
        this.updatePhase();

        // Links-Rechts Pendeln
        this.position.x += this.speed * this.direction;


        // Kollision mit Bildschirmrändern
        if (this.position.x <= 0) {
            this.position.x = 0;
            this.direction = 1;   // nach rechts
        }

        if (this.position.x + this.width >= canvas.width) {
            this.position.x = canvas.width - this.width;
            this.direction = -1; // nach links
        }


        this.shoot();
        this.updateLaser();
        this.draw();
    }


    startLaser() {
        playSound("laser");
        this.laserCharge = 60; // Frames aufladen
        this.laserActive = true;

        // Zielrichtung zum Spieler
        this.laserAngle = Math.atan2(
            player.position.y - this.position.y,
            player.position.x - this.position.x
        );
    }

    updateLaser() {
        if (!this.laserActive) return;

        this.laserCharge--;

        // Warnstrahl (gelb)
        if (this.laserCharge > 20) {
            this.drawLaser("rgba(255,255,0,0.4)", 4);
        } 
        // Echter Laser (rot)
        else {
            this.drawLaser("red", 10);
            this.checkLaserHit();
        }

        if (this.laserCharge <= 0) {
            this.laserActive = false;
        }
    }

    drawLaser(color, width) {
        c.strokeStyle = color;
        c.lineWidth = width;
        c.beginPath();
        c.moveTo(this.centerX, this.centerY);
        c.lineTo(
            this.centerX + Math.cos(this.laserAngle) * 2000,
            this.centerY + Math.sin(this.laserAngle) * 2000
        );
        c.stroke();
    }

       checkLaserHit() {
        const dx = player.position.x - this.centerX;
        const dy = player.position.y - this.centerY;

        const dist = Math.abs(
            Math.sin(this.laserAngle) * dx - Math.cos(this.laserAngle) * dy
        );

        if (dist < 20) {
            takeDamage(1);
        }
    }

    get centerX() {
        return this.position.x + this.width / 2;
    }

    get centerY() {
        return this.position.y + this.height / 2;
    }
}

class Boss2 {
    constructor() {
        this.size = 300;
        this.position = {
            x: Math.random() * (canvas.width - this.size),
            y: Math.random() * (canvas.height / 2 - this.size)
        };
        this.laserCharge = 0;
        this.laserActive = false;
        this.laserAngle = 0;
        const directions = [
            { x:  1, y:  0 }, // →
            { x: -1, y:  0 }, // ←
            { x:  0, y:  1 }, // ↓
            { x:  0, y: -1 }, // ↑
            { x:  1, y:  1 }, // ↘
            { x:  1, y: -1 }, // ↗
            { x: -1, y:  1 }, // ↙
            { x: -1, y: -1 }  // ↖
        ];

        const d = directions[Math.floor(Math.random() * directions.length)];
        const speed = 3.5;

        this.velocity = {
            x: d.x * speed,
            y: d.y * speed
        };


        this.maxHealth = 1500;
        this.health = this.maxHealth;
        this.lastShot = 0;
        this.immun = false;
        this.triggered = [false, false, false]; // 75%, 50%, 25%
        this.minionsAlive = 0;
    }

    get center() {
        return {
            x: this.position.x + this.size / 2,
            y: this.position.y + this.size / 2
        };
    }

    update() {
        if (!this.laserActive && Math.random() < 0.008) {
            this.startLaser();
        }
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        const minX = 0;
        const maxX = canvas.width - this.size;
        const minY = 0;
        const maxY = canvas.height - this.size;
        // X wall
        if (this.position.x <= minX || this.position.x >= maxX) {
            this.position.x = Math.max(minX, Math.min(this.position.x, maxX));
            this.velocity.x = -this.velocity.x;

            // falls Y zu klein geworden ist → neu setzen
            if (Math.abs(this.velocity.y) < 1) {
                this.velocity.y = (Math.random() < 0.5 ? -1 : 1) * Math.abs(this.velocity.x);
            }
        }
        // Y wall
        if (this.position.y <= minY || this.position.y >= maxY) {
            this.position.y = Math.max(minY, Math.min(this.position.y, maxY));
            this.velocity.y = -this.velocity.y;

            // falls X zu klein geworden ist → neu setzen
            if (Math.abs(this.velocity.x) < 1) {
                this.velocity.x = (Math.random() < 0.5 ? -1 : 1) * Math.abs(this.velocity.y);
            }
        }
        // Schießen
        if (Date.now() - this.lastShot > 700) {
            this.shoot();
            this.lastShot = Date.now();
        }

        this.checkPhases();
        this.updateLaser();
        this.draw();
    }

    shoot() {
        const angle = Math.atan2(
            player.position.y - this.center.y,
            player.position.x - this.center.x
        );

        projectiles.push(new Projectile({
            x: this.center.x,
            y: this.center.y,
            vx: Math.cos(angle) * 7,
            vy: Math.sin(angle) * 7,
            fromEnemy: true,
            radius: 7
        }));
    }

    checkPhases() {
        const hp = this.health / this.maxHealth;

        if (hp <= 0.75 && !this.triggered[0]) this.spawnMinions(0);
        if (hp <= 0.5 && !this.triggered[1]) this.spawnMinions(1);
        if (hp <= 0.25 && !this.triggered[2]) this.spawnMinions(2);
    }

    spawnMinions(index) {
        this.triggered[index] = true;
        this.immun = true;

        for (let i = 0; i < 5; i++) {
            const e = new Enemy2(
            Math.random() * (canvas.width - 50),
            40
            );

            e.isBossMinion = true;
            enemies2.push(e);
            this.minionsAlive++;
        }
    }

    draw() {
        if (sprites.boss2 && sprites.boss2.complete) {
            c.drawImage(
                sprites.boss2,
                this.position.x,
                this.position.y,
                this.size,
                this.size
            );
        } else {
            c.fillStyle = this.immun ? "purple" : "red";
            c.fillRect(this.position.x, this.position.y, this.size, this.size);
        }

        // Immun-Glow
        if (this.immun) {
            c.strokeStyle = "#aa00ff";
            c.lineWidth = 6;
            c.strokeRect(this.position.x, this.position.y, this.size, this.size);
        }

        // HP Bar
        c.fillStyle = "black";
        c.fillRect(this.position.x, this.position.y - 20, this.size, 10);
        c.fillStyle = "lime";
        c.fillRect(
            this.position.x,
            this.position.y - 20,
            (this.health / this.maxHealth) * this.size,
            10
        );
    }

    startLaser() {
        playSound("laser");
        this.laserCharge = 70;   // 70 Frames
        this.laserActive = true;

        this.laserAngle = Math.atan2(
            player.position.y - this.center.y,
            player.position.x - this.center.x
        );
    }

    updateLaser() {
        if (!this.laserActive) return;

        this.laserCharge--;

        // Warnphase
        if (this.laserCharge > 25) {
            this.drawLaser("rgba(255,255,0,0.4)", 4);
        }
        // Schussphase
        else {
            this.drawLaser("red", 10);
            this.checkLaserHit();
        }

        if (this.laserCharge <= 0) {
            this.laserActive = false;
        }
    }

    drawLaser(color, width) {
        c.strokeStyle = color;
        c.lineWidth = width;
        c.beginPath();
        c.moveTo(this.center.x, this.center.y);
        c.lineTo(
            this.center.x + Math.cos(this.laserAngle) * 2000,
            this.center.y + Math.sin(this.laserAngle) * 2000
        );
        c.stroke();
    }

    checkLaserHit() {
        const dx = player.position.x - this.center.x;
        const dy = player.position.y - this.center.y;

        const dist = Math.abs(
            Math.sin(this.laserAngle) * dx -
            Math.cos(this.laserAngle) * dy
        );

        if (dist < 22) {
            takeDamage(1);
        }
    }
}

class Boss3 {
    constructor() {
        this.size = 350;
        this.position = {
            x: canvas.width / 2 - this.size / 2,
            y: 50
        };

        this.speed = 0.8;
        this.maxHealth = 3000;
        this.health = this.maxHealth;
        this.phase = 1;
        this.lastDrone = 0;
        this.lastBomb = 0;

        // Laser
        this.laserCharge = 0;
        this.laserActive = false;
        this.laserAngle = 0;
    }

    get center() {
        return {
            x: this.position.x + this.size / 2,
            y: this.position.y + this.size / 2
        };
    }

    update() {
        // Phase 2 ab 50% HP
        if (this.health <= this.maxHealth * 0.5) {
            this.phase = 2;
        }

        // Slow follow
        const angle = Math.atan2(
            player.position.y - this.center.y,
            player.position.x - this.center.x
        );
        this.position.x += Math.cos(angle) * this.speed;
        this.position.y += Math.sin(angle) * this.speed;

        // Spawn drone every 5 sec
        if (Date.now() - this.lastDrone > 5000) {
            drones.push(new Drone(this.center.x - 30, this.center.y - 30));
            this.lastDrone = Date.now();
        }

        // Phase 2 Bomben
        if (this.phase === 2 && Date.now() - this.lastBomb > 1500) {
            this.shootBomb();
            this.lastBomb = Date.now();
        }

        // Laser
        if (!this.laserActive && Math.random() < 0.01) {
            this.startLaser();
        }

        this.updateLaser();
        this.draw();

        // Touch = instant death
        if (distance(this.center, player.position) < 120) {
            respawnAtStage();
        }
    }

    startLaser() {
        playSound("laser");
        this.laserCharge = 80;
        this.laserActive = true;
        this.laserAngle = Math.atan2(
            player.position.y - this.center.y,
            player.position.x - this.center.x
        );
    }

    shootBomb() {
        const angle = Math.random() * Math.PI * 2;

        boss3Bombs.push({
            position: { x: this.center.x, y: this.center.y },
            velocity: {
                x: Math.cos(angle) * 5,
                y: Math.sin(angle) * 5
            },
            timer: 90
        });
    }

    updateLaser() {
        if (!this.laserActive) return;
        this.laserCharge--;

        if (this.laserCharge > 30) {
            this.drawLaser("rgba(255,255,0,0.4)", 4);
        } else {
            this.drawLaser("red", 12);
            this.checkLaserHit();
        }

        if (this.laserCharge <= 0) this.laserActive = false;
    }

    drawLaser(color, width) {
        c.strokeStyle = color;
        c.lineWidth = width;
        c.beginPath();
        c.moveTo(this.center.x, this.center.y);
        c.lineTo(
            this.center.x + Math.cos(this.laserAngle) * 2000,
            this.center.y + Math.sin(this.laserAngle) * 2000
        );
        c.stroke();
    }

    checkLaserHit() {
        const dx = player.position.x - this.center.x;
        const dy = player.position.y - this.center.y;
        const dist = Math.abs(
            Math.sin(this.laserAngle) * dx -
            Math.cos(this.laserAngle) * dy
        );

        if (dist < 25 && !player.isDashing) {
            takeDamage(1);
        }
    }

    draw() {
        if (sprites.boss3 && sprites.boss3.complete) {
            c.drawImage(sprites.boss3, this.position.x, this.position.y, this.size, this.size);
        } else {
            c.fillStyle = "black";
            c.fillRect(this.position.x, this.position.y, this.size, this.size);
        }
        // HP Bar
        const barWidth = 300;
        const hp = this.health / this.maxHealth;

        c.fillStyle = "black";
        c.fillRect(canvas.width / 2 - barWidth / 2, 20, barWidth, 16);

        c.fillStyle = "red";
        c.fillRect(canvas.width / 2 - barWidth / 2, 20, barWidth * hp, 16);

    }
}

// ========================
// Rock
// ========================

class Rock {
    constructor() {
        this.size = 64; // Größe des Sprites
        this.position = {
            x: Math.random() * (canvas.width - this.size),
            y: -this.size
        };
        this.speed = 2 + Math.random() * 3;
    }

    draw() {
        if (sprites.rock && sprites.rock.complete) {
            c.drawImage(
                sprites.rock,
                this.position.x,
                this.position.y,
                this.size,
                this.size
            );
        } else {
            // Fallback, falls Sprite noch nicht geladen
            c.fillStyle = "gray";
            c.fillRect(this.position.x, this.position.y, this.size, this.size);
        }
    }

    update() {
        this.position.y += this.speed;
        this.draw();
    }
}

// ========================
// Particles (Explosion)
// ========================

class Particle {
    constructor(x, y, color, size) {
        this.position = { x, y };
        this.velocity = {
            x: (Math.random() - 0.5) * 6,
            y: (Math.random() - 0.5) * 6
        };
        this.life = 30;
        this.size = size;
        this.color = color;
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.life--;
    }

    draw() {
        c.fillStyle = this.color;
        c.globalAlpha = this.life / 30;
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;
    }
}

// ========================
// POWERUPS
// ========================

class PowerUp {
    constructor(x, y) {
        this.position = { x, y };
        this.size = 24;

        // Zufälliger Typ
        const types = ["life", "rapid", "big", "spread", "shield", "bomb"];

        this.type = types[Math.floor(Math.random() * types.length)];

        this.spriteMap = {
            life: sprites.greenPU,
            rapid: sprites.yellowPU,
            big: sprites.orangePU,
            spread: sprites.purplePU,
            shield: sprites.bluePU,
            bomb: sprites.bombPU
        };
    }

    draw() {
        const img = this.spriteMap[this.type];

        if (img && img.complete) {
            c.drawImage(
                img,
                this.position.x - this.size,
                this.position.y - this.size,
                this.size * 2,
                this.size * 2
            );
        } else {
            // Fallback falls Bild noch lädt
            c.fillStyle = "white";
            c.beginPath();
            c.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
            c.fill();
        }
    }


    update() {
        this.position.y += 1;
        this.draw();
    }
}

// ========================
// GAME OBJECTS
// ========================

let boss = null;
let player;
const projectiles = [];
const enemies = [];
const enemies2 = [];
const enemies3 = [];
const powerUps = [];
const rocks = [];
const particles = [];
let boss3 = null;
const drones = [];


// ========================
// SPAWN ENEMIES & POWERUPS
// ========================

setInterval(() => {
    if (paused || !gameStarted || gameOver) return;

    if (gameState === "stage1" || gameState === "stage2" || gameState === "stage3") {
        enemies.push(new Enemy(Math.random() * canvas.width, -20));
    }
}, 600);
 // alle 0,6 sek ein enemy1 ind stage 1,2,3

setInterval(() => {
    if (paused || !gameStarted || gameOver) return;

    if (gameState === "stage2" || gameState === "stage3") {
        enemies2.push(
            new Enemy2(Math.random() * (canvas.width - 100), 40)
        );
    }
}, 2500);
 // alle 2,5 Sekunden ein enemy2 in stage 2,3

setInterval(() => {
    if (paused || !gameStarted || gameOver) return;

    if (gameState === "stage3") {
        enemies3.push(
            new Enemy3(Math.random() * canvas.width, -50)
        );
    }
}, 3500);
 // alle 3,5 Sekunden ein enemy3 in stage 3

setInterval(() => {
    if (paused || !gameStarted || gameOver) return;

    rocks.push(new Rock());
}, 3000);
 // alle 3 Sekunden ein Felsen

setInterval(() => {
    if (paused || !gameStarted || gameOver) return;

    powerUps.push(new PowerUp(Math.random() * canvas.width, -20));
}, 7000);
// alle 7 sekunden ein PowerUp

// ========================
// COLLISION
// ========================

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

// ========================
// MAIN LOOP
// ========================

function animate() {
    if (!gameStarted || gameOver) return;
    if (justRespawned) {
        justRespawned = false;
        requestAnimationFrame(animate);
        return;
    }
    if (paused) {
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.globalAlpha = 1;   // 🔥 ganz wichtig
        drawPauseScreen();
        requestAnimationFrame(animate);
        return;
    }

    if (!document.hasFocus()) {
        for (let k in keys) keys[k] = false;
    }
    stateTimer++;
    switch (gameState) {

        case "stage1":
            if (stateTimer > 1800) {   // 30 Sekunden
                boss = new Boss();
                gameState = "boss1";
                stateTimer = 0;
            }
            break;

        case "boss1":
            if (!boss) {
                gameState = "stage2";
                stateTimer = 0;
                stageText = "STAGE 2";
                showStage = true;
                stageAlpha = 1;
            }
            break;

        case "stage2":
            if (stateTimer > 1500) {   // 25 Sekunden
                boss2 = new Boss2();
                gameState = "boss2";
                stateTimer = 0;
            }
            break;

        case "boss2":
            if (!boss2) {
                gameState = "stage3";
                stageText = "STAGE 3";
                showStage = true;
                stageAlpha = 1;
                stateTimer = 0;
            }
            break;

        case "stage3":
            if (stateTimer > 1800) {   // 30 Sekunden
                boss3 = new Boss3();
                gameState = "boss3";
                stateTimer = 0;
            }
            break;
        
        case "boss3":
            if (!boss3) {
                gameState = "chaos";
                stageText = "CHAOS STAGE";
                showStage = true;
                stageAlpha = 1;
                stateTimer = 0;
            }
            break;

        case "chaos":

            // CHAOS Wellen
            if (stateTimer % 30 === 0 && stateTimer < 600) {
                for (let i = 0; i < 3; i++) {
                    enemies.push(new Enemy(Math.random() * canvas.width, -20));
                }
            }

            if (stateTimer > 600 && stateTimer < 1200 && stateTimer % 15 === 0) {
                rocks.push(new Rock());
                rocks.push(new Rock());
            }

            // ===== CHAOS ENEMY2 SPAWNER =====
            if (stateTimer > 600 && !finalBossSpawned) {

            // Spawn-Rate steigt mit der Zeit
                const spawnRate =
                    stateTimer < 1200 ? 180 :     // alle 3 Sekunden
                    stateTimer < 1600 ? 120 :     // alle 2 Sekunden
                    60;                          // jede Sekunde (End-Chaos)

                if (stateTimer % spawnRate === 0) {
                    const count =
                        stateTimer < 1200 ? 1 :
                        stateTimer < 1600 ? 2 :
                        3;

                    for (let i = 0; i < count; i++) {
                        enemies2.push(new Enemy2(
                            Math.random() * (canvas.width - 100),
                            40
                        ));
                    }
                }
            }
            // ===== FINAL BOSSES =====
            if (stateTimer >= 1800 && !finalBossSpawned) {
                boss = new Boss();
                boss.health = 1000;
                boss.maxHealth = 1000;
                boss.speed = 3;

                boss2 = new Boss2();
                boss2.maxHealth = 3000;
                boss2.health = 3000;
                boss2.velocity.x *= 1.5;
                boss2.velocity.y *= 1.5;

                stageText = "FINAL CHAOS";
                showStage = true;
                stageAlpha = 1;

                finalBossSpawned = true;
            }

            // ===== WIN CONDITION =====
            if (finalBossSpawned && !boss && !boss2) {
                respawnAtStage();
            }
        break;

    }
    let offsetX = 0;
    let offsetY = 0;

    if (shakeTime > 0) {
        shakeTime--;
        offsetX = (Math.random() - 0.5) * shakeStrength;
        offsetY = (Math.random() - 0.5) * shakeStrength;
    }

    c.setTransform(1, 0, 0, 1, offsetX, offsetY);
    c.fillStyle = "rgba(0,0,0,0.4)";
    c.fillRect(-offsetX, -offsetY, canvas.width, canvas.height);
    drawStars();
    if (gameState === "stage2" || gameState === "boss2") drawBlueStars();
    if (gameState === "stage3" || gameState === "boss3") drawOrangeStars();
    player.update();
        if (mouseDown && !gameOver && gameStarted) {
        player.shoot();
    }
    if (player.activeBomb) {
    player.activeBomb.update();
    }
    rocks.forEach((r, ri) => {
        r.update();

        // Wenn unten raus → löschen
        if (r.position.y > canvas.height) {
            rocks.splice(ri, 1);
            return; // wichtig, damit kein weiterer Code auf diesem Rock läuft
        }

        // Spieler trifft Felsen → -1 life
        const playerRadius = 20;

        if (
            player.position.x > r.position.x - playerRadius &&
            player.position.x < r.position.x + r.size + playerRadius &&
            player.position.y > r.position.y - playerRadius &&
            player.position.y < r.position.y + r.size + playerRadius
        ) {
        takeDamage(1);
        rocks.splice(ri, 1);   // Rock verschwindet
        }
});

    // Projectiles
    projectiles.forEach((p, pi) => {
        p.update();

        if (
            p.position.x < 0 || p.position.x > canvas.width ||
            p.position.y < 0 || p.position.y > canvas.height
        ) {
            projectiles.splice(pi, 1);
            return;
        }

        // === Spieler trifft Projektil ===
        if (p.fromEnemy && distance(p.position, player.position) < 20) {
            projectiles.splice(pi, 1);

            if (player.isDashing) return;

            if (player.shield > 0) {
                player.shield -= 25;
                if (player.shield < 0) player.shield = 0;
            } else {
                startShake(12, 12);
                player.lives--;
                livesEl.textContent = player.lives;
                if (player.lives <= 0) respawnAtStage();
            }
            return;
        }

        // === Boss2 Hit ===
        if (boss2 && !p.fromEnemy) {
            const dx = p.position.x - boss2.center.x;
            const dy = p.position.y - boss2.center.y;
            const dist = Math.hypot(dx, dy);

            if (dist < boss2.size / 2 && !boss2.immun) {
                boss2.health -= p.damage;
                projectiles.splice(pi, 1);

                if (boss2.health <= 0) {
                    const bx = boss2.center.x;
                    const by = boss2.center.y;
                    boss2 = null;
                    createExplosion(p.position.x, p.position.y, 120, "purple");
                    playExplosionSound();
                    stats.bossesKilled++;
                    stageText = "CHAOS STAGE";
                    showStage = true;
                    stageAlpha = 1;
                    score += 75000;
                    scoreEl.textContent = score;
                }
            }
        }
    });

    particles.forEach((p, i) => {
        p.update();
        p.draw();
        if (p.life <= 0) particles.splice(i, 1);
    });

    // Enemy1
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
        const e = enemies[ei];
        e.update();
        e.shoot();

            for (let pi = projectiles.length - 1; pi >= 0; pi--) {
            const p = projectiles[pi];

            if (!p.fromEnemy && distance(p.position, e.position) < 40) {
                enemies.splice(ei, 1);
                projectiles.splice(pi, 1);
                playExplosionSound();
                createExplosion(e.position.x, e.position.y, 20, "orange");
                score += 100;
                stats.enemiesKilled++;
                scoreEl.textContent = score;
                break; // Gegner ist tot → weiter zum nächsten
            }
        }
    }
    // Enemy2
    for (let i = enemies2.length - 1; i >= 0; i--) {
        const e = enemies2[i];
        e.update();

        const center = {
            x: e.position.x + e.width / 2,
            y: e.position.y + e.height / 2
        };

        for (let pi = projectiles.length - 1; pi >= 0; pi--) {
            const p = projectiles[pi];

            if (!p.fromEnemy && distance(p.position, center) < e.width / 2) {
                if (e.isBossMinion && boss2) boss2.minionsAlive--;
                enemies2.splice(i, 1);
                projectiles.splice(pi, 1);
                createExplosion(e.position.x, e.position.y, 30, "purple");
                playExplosionSound();
                stats.enemiesKilled++;
                score += 150;
                scoreEl.textContent = score;
                break;
            }
        }
    }
    // Enemy3
    for (let i = enemies3.length - 1; i >= 0; i--) {
        const e = enemies3[i];
        e.update();

        // Player Kollision → Explosion & Schaden
        if (distance(e.position, player.position) < 35) {
            createExplosion(e.position.x, e.position.y, 40, "red");
            playExplosionSound();
            enemies3.splice(i, 1);

            if (!player.isDashing) {
                if (player.shield > 0) {
                    player.shield -= 50;
                } else {
                    player.lives--;
                    livesEl.textContent = player.lives;
                    if (player.lives <= 0) respawnAtStage();
                }
            }
            continue;
        }

        // Projektile treffen Enemy3
        for (let pi = projectiles.length - 1; pi >= 0; pi--) {
            const p = projectiles[pi];

            if (!p.fromEnemy && distance(p.position, e.position) < e.size / 2) {

                // Big PowerUp = One-Shot
                if (player.bulletSize > 5) {
                e.hp = 0;
                } else {
                    e.hp--;
                }

                projectiles.splice(pi, 1);

                if (e.hp <= 0) {
                    createExplosion(e.position.x, e.position.y, 50, "orange");
                    playExplosionSound();
                    enemies3.splice(i, 1);
                    score += 200;
                    scoreEl.textContent = score;
                }
                break;
            }
        }
    }

    // ===== DRONES =====
    for (let i = drones.length - 1; i >= 0; i--) {
        const d = drones[i];
        d.update();

        // Player bullets hit drones
        for (let pi = projectiles.length - 1; pi >= 0; pi--) {
            const p = projectiles[pi];
            if (!p.fromEnemy && distance(p.position, d.center) < d.size / 2) {
                projectiles.splice(pi, 1);
                d.hp--;

                if (d.hp <= 0) {
                    createExplosion(d.position.x, d.position.y, 50, "cyan");
                    playExplosionSound();
                    drones.splice(i, 1);
                }
                break;
            }
        }

        // Drone touches player
        if (distance(d.center, player.position) < d.size / 2 && !player.isDashing) {
            takeDamage(1);
            drones.splice(i, 1);   // Drone stirbt
            return;
        }
    }

    if (boss) {
    boss.update();

    projectiles.forEach((p, pi) => {
        if (!p.fromEnemy) {

            const bx = boss.position.x;
            const by = boss.position.y;
            const bw = boss.width;
            const bh = boss.height;

            const closestX = Math.max(bx, Math.min(p.position.x, bx + bw));
            const closestY = Math.max(by, Math.min(p.position.y, by + bh));

            const dx = p.position.x - closestX;
            const dy = p.position.y - closestY;

            if (dx * dx + dy * dy < (p.radius + 4) * (p.radius + 4)) {
                projectiles.splice(pi, 1);
                boss.health -= p.damage;

                if (boss.health <= 0) {
                    boss._dead = true;
                }
            }
        }
    });
        if (boss && boss._dead) {
            const bx = boss.centerX;
            const by = boss.centerY;

            boss = null;

            score += 5000;
            stats.bossesKilled++;
            scoreEl.textContent = score;
            playExplosionSound();
            createExplosion(bx, by, 80, "red");

            gameState = "stage2";
            stateTimer = 0;
            stageText = "STAGE 2";
            showStage = true;
            stageAlpha = 1;
        }

    }

    if (boss2) {
        boss2.update();
        if (boss2 && boss2.immun && boss2.minionsAlive <= 0) {
            boss2.immun = false;
        }
        // Spieler berührt Boss2 → tot
        if (distance(boss2.center, player.position) < 80) {
            respawnAtStage();
        }
    }

    if (boss3) {
    boss3.update();

    for (let pi = projectiles.length - 1; pi >= 0; pi--) {
        const p = projectiles[pi];
        if (!p.fromEnemy) {

            const dx = p.position.x - boss3.center.x;
            const dy = p.position.y - boss3.center.y;
            const dist = Math.hypot(dx, dy);

            if (dist < boss3.size / 2) {
                projectiles.splice(pi, 1);
                boss3.health -= p.damage;

                if (boss3.health <= 0) {
                    createExplosion(boss3.center.x, boss3.center.y, 200, "red");
                    playExplosionSound();
                    boss3 = null;
                    stats.bossesKilled++;
                }
            }
        }
    }
    }

    // ===== BOSS3 BOMBS =====
    for (let i = boss3Bombs.length - 1; i >= 0; i--) {
        const b = boss3Bombs[i];

        b.position.x += b.velocity.x;
        b.position.y += b.velocity.y;
        b.timer--;

        // draw bomb with red glow
        c.shadowColor = "red";
        c.shadowBlur = 25;
        c.drawImage(sprites.bomb, b.position.x - 16, b.position.y - 16, 32, 32);
        c.shadowBlur = 0;

        if (b.timer <= 0) {
            createExplosion(b.position.x, b.position.y, 120, "red");

            if (distance(b.position, player.position) < 180) {
                takeDamage(1);
            }
            boss3Bombs.splice(i, 1);
        }
    }

    // PowerUps
    for (let pi = powerUps.length - 1; pi >= 0; pi--) {
        const p = powerUps[pi];
        p.update();

        for (let pj = projectiles.length - 1; pj >= 0; pj--) {
            const proj = projectiles[pj];

            if (!proj.fromEnemy && distance(p.position, proj.position) < 20) {
                powerUps.splice(pi, 1);
                projectiles.splice(pj, 1);
                activatePowerUp(p.type);
                playSound("powerup");
                break;
            }
        }
    }

function activatePowerUp(type) {
    switch (type) {

        case "life":
            player.lives++;
            livesEl.textContent = player.lives;
            break;

        case "rapid":
            player.fireRate = 90;

            clearTimeout(player.rapidTimer);
            player.rapidTimer = setTimeout(() => {
                player.fireRate = 450;
            }, 10000);
            break;

        case "big":
            player.bulletSize = 12;
            clearTimeout(player.bigTimer);
            player.bigTimer = setTimeout(() => {
                player.bulletSize = 5;
            }, 10000);
            break;

        case "spread":
            player.spread = true;
            clearTimeout(player.spreadTimer);
            player.spreadTimer = setTimeout(() => {
                player.spread = false;
            }, 10000);
            break;

        case "shield":
            player.shield = player.maxShield;
            break;

        case "bomb":
            player.bombs++;
            bombsEl.textContent = player.bombs;
            break;
    }
}
c.setTransform(1, 0, 0, 1, 0, 0); // Reset

// ===== STAGE TEXT =====
if (showStage) {
    c.globalAlpha = stageAlpha;
    c.fillStyle = "white";
    c.font = "bold 64px Arial";
    c.textAlign = "center";
    c.fillText(stageText, canvas.width / 2, canvas.height / 2);
    c.globalAlpha = 1;

    stageAlpha -= 0.01;
    if (stageAlpha <= 0) {
        showStage = false;
    }
}

requestAnimationFrame(animate);
}

// ========================
// LOAD PLAYER VIA FETCH
// ========================

function showStartScreen() {
    const screen = document.createElement("div");
    screen.id = "startScreen";
    screen.style.position = "fixed";
    screen.style.top = 0;
    screen.style.left = 0;
    screen.style.width = "100%";
    screen.style.height = "100%";
    screen.style.background = "black";
    screen.style.color = "white";
    screen.style.display = "flex";
    screen.style.flexDirection = "column";
    screen.style.alignItems = "center";
    screen.style.justifyContent = "center";
    screen.style.fontFamily = "Arial";
    screen.style.zIndex = 2000;

    screen.innerHTML = `
        <h1 style="font-size:72px; margin-bottom:20px;">🚀 SPACE VIBES</h1>
        <p style="font-size:22px; line-height:1.8; text-align:center;">
            WASD – Move<br>
            Left Mouse – Shoot<br>
            Shift – Dash<br>
            Space – Bomb<br>
            F – Fullscreen<br>
            P – Pause
        </p>
        <br>
        <p style="font-size:26px;">Press ENTER to Start</p>
    `;
    document.body.appendChild(screen);
}

function endGame(victory) {
    if (gameOver) return;
    gameOver = true;

    const wasFullscreen = document.fullscreenElement !== null;

    if (wasFullscreen) {
        document.exitFullscreen();
    }

    const timeSurvived = Math.floor((Date.now() - startTime) / 1000);

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.9)";
    overlay.style.color = "white";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.fontSize = "26px";
    overlay.style.zIndex = 9999;

    overlay.innerHTML = `
        <h1>${victory ? "YOU WIN 🚀" : "GAME OVER 💀"}</h1>
        <p>Score: ${score}</p>
        <p>Zeit überlebt: ${timeSurvived}s</p>
        <p>Gegner zerstört: ${stats.enemiesKilled}</p>
        <p>Bosse besiegt: ${stats.bossesKilled}</p>
        <br>
        <p>Drücke [R] für Neustart</p>
    `;

    document.body.appendChild(overlay);

    addEventListener("keydown", e => {
        if (e.key.toLowerCase() === "r") location.reload();
    });
}

fetch("player.json")
    .then(res => res.json())
    .then(data => {
    player = new Player(data);
    livesEl.textContent = player.lives;
    showStartScreen();
});
