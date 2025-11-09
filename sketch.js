//學習8程式碼所在
// Bubble.js
// sketch.js

// 單一檔案版：點擊氣球會爆破並得分
// 規則：點擊顏色為 #6b9080 的泡泡 +2 分；點擊其他顏色 +1 分

let bubbles = [];
const bubbleCount = 30;
let score = 0;
let explosions = [];

const COLORS = ['#6b9080', '#a4c3b2', '#cce3de', '#eaf4f4'];

// audio removed: no preload or sound loading

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < bubbleCount; i++) bubbles.push(new Bubble());
  frameRate(60);
  textFont('sans-serif');
}

function draw() {
  background('#f6fff8');

  // 左上角 ID（粉紅色）與 右上角顯示得分
  push();
  textSize(64);
  fill('#ff69b4'); // 粉紅色
  noStroke();
  textAlign(LEFT, TOP);
  text('414730167', 8, 8);
  textAlign(RIGHT, TOP);
  text('得分: ' + score, width - 8, 8);
  pop();

  // 更新並繪製氣球
  for (let b of bubbles) {
    b.move();
    b.display();
  }

  // 更新並繪製爆破粒子
  for (let i = explosions.length - 1; i >= 0; i--) {
    const ex = explosions[i];
    let alive = false;
    for (let p of ex.particles) {
      p.vy += ex.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.size *= 0.98;
      if (p.life > 0) {
        alive = true;
        fill(red(p.col), green(p.col), blue(p.col), map(p.life, 0, ex.maxLife, 0, 255));
        noStroke();
        circle(p.x, p.y, p.size);
      }
    }
    if (!alive) explosions.splice(i, 1);
  }
}

class Bubble {
  constructor() {
    this.colors = COLORS;
    this.hex = random(this.colors);
    this.r = unhex(this.hex.substring(1, 3));
    this.g = unhex(this.hex.substring(3, 5));
    this.b = unhex(this.hex.substring(5, 7));
    this.diameter = random(50, 200);
    this.x = random(width);
    this.y = random(height, height + this.diameter);
    this.speed = random(0.5, 3.5);
    this.alpha = random(50, 200);
  }

  move() {
    this.y -= this.speed;
    if (this.y < -this.diameter / 2) {
      this.respawn();
    }
  }

  display() {
    noStroke();
    fill(this.r, this.g, this.b, this.alpha);
    circle(this.x, this.y, this.diameter);

    // 右上小白方塊
    let squareSize = this.diameter / 6;
    let offset = (this.diameter / 2) * 0.5;
    let squareCenterX = this.x + offset * cos(PI / 4);
    let squareCenterY = this.y - offset * sin(PI / 4);
    fill(255, 255, 255, this.alpha * 0.8);
    rectMode(CENTER);
    rect(squareCenterX, squareCenterY, squareSize, squareSize);
    rectMode(CORNER);
  }

  respawn() {
    this.x = random(width);
    this.y = height + this.diameter / 2;
    this.diameter = random(50, 200);
    this.hex = random(this.colors);
    this.r = unhex(this.hex.substring(1, 3));
    this.g = unhex(this.hex.substring(3, 5));
    this.b = unhex(this.hex.substring(5, 7));
    this.speed = random(0.5, 3.5);
    this.alpha = random(50, 200);
  }
}

function unhex(str) {
  return parseInt(str, 16);
}

// 產生爆破粒子（以指定位置與顏色）
function triggerExplosionAt(x, y, radius, colHex) {
  // audio removed: no sound will be played

  const count = floor(map(radius, 50, 200, 12, 36));
  const ex = { particles: [], gravity: 0.12, maxLife: 60 };

  const col = color(
    unhex(colHex.substring(1, 3)),
    unhex(colHex.substring(3, 5)),
    unhex(colHex.substring(5, 7)),
    255
  );

  for (let i = 0; i < count; i++) {
    const angle = random(TWO_PI);
    const speed = random(2, map(radius, 50, 200, 4, 10));
    ex.particles.push({
      x: x,
      y: y,
      vx: cos(angle) * speed + random(-0.5, 0.5),
      vy: sin(angle) * speed * 0.9 + random(-0.5, 0.5),
      life: floor(random(ex.maxLife * 0.6, ex.maxLife)),
      size: random(radius / 12, radius / 6),
      col: col
    });
  }

  // 白色亮點
  for (let i = 0; i < floor(count * 0.2); i++) {
    const angle = random(TWO_PI);
    const speed = random(1, 6);
    ex.particles.push({
      x,
      y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      life: floor(random(ex.maxLife * 0.4, ex.maxLife * 0.7)),
      size: random(2, 6),
      col: color(255, 255, 255, 255)
    });
  }

  explosions.push(ex);
}

// audio handling removed

function mousePressed() {
  // 檢查是否點到任一 bubble（由上層到下層）
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    const d = dist(mouseX, mouseY, b.x, b.y);
    if (d <= b.diameter / 2) {
      // 計分規則：#6b9080 -> +2 分；其他顏色 -> +1 分
      if (b.hex && b.hex.toLowerCase() === '#6b9080') score += 2;
      else score += 1;

      // 觸發爆破（使用被點擊位置與顏色）
      triggerExplosionAt(b.x, b.y, b.diameter, b.hex);

      // 立即重生該氣球（不保留原位置）
      b.respawn();

      return; // 只處理第一個被點到的氣球
    }
  }
}

function touchStarted() {
  mousePressed();
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}



