const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const livesEl = document.querySelector("#lives");
const bestEl = document.querySelector("#best");
const overlay = document.querySelector("#overlay");
const overlayTitle = document.querySelector("#overlay-title");
const overlayText = document.querySelector("#overlay-text");
const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");

const world = { width: 960, height: 540 };
const keys = new Set();
const pointer = { active: false, x: world.width / 2, y: world.height / 2 };
let rafId = 0;
let lastTime = 0;
let spawnTimer = 0;
let running = false;
let paused = false;
let score = 0;
let lives = 3;
let best = Number(localStorage.getItem("orbitRunnerBest") || 0);
let stars = [];
let mines = [];
let particles = [];

const player = {
  x: world.width / 2,
  y: world.height - 90,
  radius: 18,
  speed: 420,
};

bestEl.textContent = best;

function resetGame() {
  score = 0;
  lives = 3;
  spawnTimer = 0;
  stars = [];
  mines = [];
  particles = [];
  player.x = world.width / 2;
  player.y = world.height - 90;
  pointer.x = player.x;
  pointer.y = player.y;
  updateHud();
}

function startGame() {
  resetGame();
  running = true;
  paused = false;
  overlay.hidden = true;
  pauseButton.textContent = "Pause";
  lastTime = performance.now();
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}

function updateHud() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  bestEl.textContent = best;
}

function endGame() {
  running = false;
  paused = false;
  cancelAnimationFrame(rafId);
  if (score > best) {
    best = score;
    localStorage.setItem("orbitRunnerBest", String(best));
  }
  updateHud();
  overlayTitle.textContent = "Game over";
  overlayText.textContent = `Your score: ${score}. Press start to try again.`;
  startButton.textContent = "Play again";
  overlay.hidden = false;
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  pauseButton.textContent = paused ? "Resume" : "Pause";
  if (!paused) {
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }
}

function spawnObject() {
  const isMine = Math.random() < Math.min(0.34, 0.12 + score / 700);
  const item = {
    x: 36 + Math.random() * (world.width - 72),
    y: -30,
    radius: isMine ? 17 : 13,
    vy: 140 + Math.random() * 120 + score * 0.22,
    spin: Math.random() * Math.PI * 2,
  };
  (isMine ? mines : stars).push(item);
}

function burst(x, y, color, amount = 14) {
  for (let i = 0; i < amount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 55 + Math.random() * 165;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.55 + Math.random() * 0.35,
      color,
    });
  }
}

function updatePlayer(dt) {
  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;

  if (pointer.active) {
    const pullX = pointer.x - player.x;
    const pullY = pointer.y - player.y;
    player.x += pullX * Math.min(1, dt * 9);
    player.y += pullY * Math.min(1, dt * 9);
  }

  if (dx || dy) {
    const length = Math.hypot(dx, dy);
    player.x += (dx / length) * player.speed * dt;
    player.y += (dy / length) * player.speed * dt;
  }

  player.x = Math.max(player.radius, Math.min(world.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(world.height - player.radius, player.y));
}

function updateObjects(dt) {
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnObject();
    spawnTimer = Math.max(0.26, 0.78 - score / 900);
  }

  for (const item of [...stars, ...mines]) {
    item.y += item.vy * dt;
    item.spin += dt * 4;
  }

  stars = stars.filter((star) => {
    if (distance(player, star) < player.radius + star.radius) {
      score += 10;
      burst(star.x, star.y, "#ffd166", 18);
      updateHud();
      return false;
    }
    return star.y < world.height + 40;
  });

  mines = mines.filter((mine) => {
    if (distance(player, mine) < player.radius + mine.radius) {
      lives -= 1;
      burst(mine.x, mine.y, "#ef476f", 24);
      updateHud();
      if (lives <= 0) endGame();
      return false;
    }
    return mine.y < world.height + 45;
  });

  particles = particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * dt,
      y: particle.y + particle.vy * dt,
      vy: particle.vy + 110 * dt,
      life: particle.life - dt,
    }))
    .filter((particle) => particle.life > 0);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function drawBackground(time) {
  ctx.fillStyle = "#080b10";
  ctx.fillRect(0, 0, world.width, world.height);

  for (let i = 0; i < 70; i += 1) {
    const x = (i * 137.5) % world.width;
    const y = (i * 71 + time * (18 + (i % 5) * 8)) % world.height;
    const alpha = 0.28 + (i % 4) * 0.08;
    ctx.fillStyle = `rgba(244, 247, 251, ${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.shadowColor = "#55d6ff";
  ctx.shadowBlur = 22;
  ctx.fillStyle = "#55d6ff";
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.lineTo(17, 18);
  ctx.lineTo(0, 10);
  ctx.lineTo(-17, 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f4f7fb";
  ctx.beginPath();
  ctx.arc(0, 1, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStar(star) {
  ctx.save();
  ctx.translate(star.x, star.y);
  ctx.rotate(star.spin);
  ctx.shadowColor = "#ffd166";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? star.radius : star.radius * 0.45;
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMine(mine) {
  ctx.save();
  ctx.translate(mine.x, mine.y);
  ctx.rotate(mine.spin);
  ctx.shadowColor = "#ef476f";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#ef476f";
  ctx.beginPath();
  ctx.arc(0, 0, mine.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f4f7fb";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.lineTo(8, 8);
  ctx.moveTo(8, -8);
  ctx.lineTo(-8, 8);
  ctx.stroke();
  ctx.restore();
}

function drawParticles() {
  for (const particle of particles) {
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function render(time) {
  drawBackground(time / 1000);
  stars.forEach(drawStar);
  mines.forEach(drawMine);
  drawParticles();
  drawPlayer();
}

function loop(time) {
  if (!running || paused) return;
  const dt = Math.min(0.033, (time - lastTime) / 1000);
  lastTime = time;
  updatePlayer(dt);
  updateObjects(dt);
  render(time);
  if (running) rafId = requestAnimationFrame(loop);
}

function setPointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * world.width;
  pointer.y = ((event.clientY - rect.top) / rect.height) * world.height;
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s"].includes(key)) {
    event.preventDefault();
    keys.add(key);
  }
  if (key === " " || key === "p") {
    event.preventDefault();
    togglePause();
  }
});

window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
canvas.addEventListener("pointerdown", (event) => {
  pointer.active = true;
  setPointer(event);
});
canvas.addEventListener("pointermove", (event) => {
  if (pointer.active) setPointer(event);
});
canvas.addEventListener("pointerup", () => {
  pointer.active = false;
});
canvas.addEventListener("pointerleave", () => {
  pointer.active = false;
});
startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);

render(0);
