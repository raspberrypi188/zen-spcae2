import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ==================== 场景基础 ====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0f14);
scene.fog = new THREE.FogExp2(0x0a0f14, 0.022);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 6, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 4;
controls.maxDistance = 25;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0, 1, 0);
controls.enablePan = false;

// ==================== 光照 ====================
const ambientLight = new THREE.AmbientLight(0x404860, 0.5);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight(0xc8d8e8, 1.2);
moonLight.position.set(-8, 15, 6);
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(2048, 2048);
moonLight.shadow.camera.left = -20;
moonLight.shadow.camera.right = 20;
moonLight.shadow.camera.top = 20;
moonLight.shadow.camera.bottom = -20;
moonLight.shadow.camera.far = 50;
scene.add(moonLight);

const lanternPositions = [[-6, -4], [6, -4], [-4, 5], [4, 5]];
const lanternLights = [];
lanternPositions.forEach(([x, z]) => {
  const light = new THREE.PointLight(0xffaa55, 1.2, 8, 2);
  light.position.set(x, 1.2, z);
  scene.add(light);
  lanternLights.push(light);
});

// ==================== 地面 ====================
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(20, 64),
  new THREE.MeshStandardMaterial({ color: 0x1a201c, roughness: 0.95, metalness: 0.05 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// 石板路
const pathMat = new THREE.MeshStandardMaterial({ color: 0x3a4038, roughness: 0.9 });
for (let i = 0; i < 30; i++) {
  const angle = (i / 30) * Math.PI * 2;
  const r = 8 + Math.sin(i * 0.5) * 0.5;
  const stone = new THREE.Mesh(
    new THREE.BoxGeometry(0.8 + Math.random() * 0.3, 0.05, 0.5 + Math.random() * 0.3),
    pathMat
  );
  stone.position.set(Math.cos(angle) * r, 0.025, Math.sin(angle) * r);
  stone.rotation.y = Math.random() * Math.PI;
  stone.receiveShadow = true;
  scene.add(stone);
}

// ==================== 竹林 ====================
function createBamboo(x, z, height = 6) {
  const group = new THREE.Group();
  const segments = 6;
  const segHeight = height / segments;
  const bambooMat = new THREE.MeshStandardMaterial({ color: 0x2a4a30, roughness: 0.7 });

  for (let i = 0; i < segments; i++) {
    const radius = 0.12 - i * 0.012;
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius + 0.01, segHeight * 0.95, 6),
      bambooMat
    );
    seg.position.y = i * segHeight + segHeight / 2;
    seg.castShadow = true;
    group.add(seg);

    const knot = new THREE.Mesh(
      new THREE.TorusGeometry(radius + 0.015, 0.008, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x1a3020 })
    );
    knot.rotation.x = Math.PI / 2;
    knot.position.y = i * segHeight;
    group.add(knot);
  }

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3a5a40, roughness: 0.8, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 3), leafMat);
    leaf.position.set(
      (Math.random() - 0.5) * 0.5,
      height - 0.5 + Math.random() * 0.5,
      (Math.random() - 0.5) * 0.5
    );
    leaf.rotation.z = (Math.random() - 0.5) * 0.8;
    leaf.rotation.x = (Math.random() - 0.5) * 0.8;
    group.add(leaf);
  }

  group.position.set(x, 0, z);
  group.rotation.y = Math.random() * Math.PI * 2;
  return group;
}

for (let i = 0; i < 40; i++) {
  const angle = (i / 40) * Math.PI * 2 + Math.random() * 0.1;
  const r = 14 + Math.random() * 3;
  scene.add(createBamboo(Math.cos(angle) * r, Math.sin(angle) * r, 4 + Math.random() * 4));
}

// ==================== 石灯笼 ====================
function createLantern(x, z) {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4a45, roughness: 0.9 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.3, 6), stoneMat);
  base.position.y = 0.15;
  base.castShadow = true;
  group.add(base);

  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 1.0, 6), stoneMat);
  pillar.position.y = 0.8;
  pillar.castShadow = true;
  group.add(pillar);

  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), stoneMat);
  housing.position.y = 1.55;
  housing.castShadow = true;
  group.add(housing);

  const glow = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.35, 0.35),
    new THREE.MeshBasicMaterial({ color: 0xffaa55, transparent: true, opacity: 0.9 })
  );
  glow.position.y = 1.55;
  group.add(glow);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.3, 4), stoneMat);
  cap.position.y = 1.95;
  cap.rotation.y = Math.PI / 4;
  cap.castShadow = true;
  group.add(cap);

  group.position.set(x, 0, z);
  return group;
}
lanternPositions.forEach(([x, z]) => scene.add(createLantern(x, z)));

// ==================== 中央佛台 ====================
const platform = new THREE.Mesh(
  new THREE.CylinderGeometry(2.5, 2.8, 0.4, 32),
  new THREE.MeshStandardMaterial({ color: 0x3a3a35, roughness: 0.9 })
);
platform.position.y = 0.2;
platform.receiveShadow = true;
platform.castShadow = true;
scene.add(platform);

const buddhaGroup = new THREE.Group();
const buddhaMat = new THREE.MeshStandardMaterial({ color: 0xc8a860, roughness: 0.4, metalness: 0.6 });
const buddhaBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 0.8, 8, 16), buddhaMat);
buddhaBody.position.y = 1.2;
buddhaBody.castShadow = true;
buddhaGroup.add(buddhaBody);
const buddhaHead = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 24), buddhaMat);
buddhaHead.position.y = 2.1;
buddhaHead.castShadow = true;
buddhaGroup.add(buddhaHead);
const bun = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), buddhaMat);
bun.position.y = 2.5;
buddhaGroup.add(bun);
const halo = new THREE.Mesh(
  new THREE.TorusGeometry(0.8, 0.05, 8, 48),
  new THREE.MeshBasicMaterial({ color: 0xffdd88, transparent: true, opacity: 0.4 })
);
halo.position.y = 2.1;
buddhaGroup.add(halo);
buddhaGroup.position.y = 0.4;
scene.add(buddhaGroup);

const incense = new THREE.Mesh(
  new THREE.CylinderGeometry(0.5, 0.6, 0.4, 16),
  new THREE.MeshStandardMaterial({ color: 0x6a5a40, roughness: 0.5, metalness: 0.4 })
);
incense.position.set(0, 0.6, 2.5);
scene.add(incense);

const incenseParticles = [];
for (let i = 0; i < 20; i++) {
  const p = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 4, 4),
    new THREE.MeshBasicMaterial({ color: 0xffaa55, transparent: true, opacity: 0 })
  );
  p.position.set(0, 0.8, 2.5);
  p.userData.life = 0;
  p.userData.maxLife = 2 + Math.random() * 2;
  p.userData.offset = Math.random() * 10;
  scene.add(p);
  incenseParticles.push(p);
}

// ==================== 星空与月亮 ====================
const starsGeo = new THREE.BufferGeometry();
const starPositions = new Float32Array(800 * 3);
for (let i = 0; i < 800; i++) {
  const r = 40 + Math.random() * 30;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI * 0.4;
  starPositions[i * 3] = Math.cos(theta) * Math.sin(phi) * r;
  starPositions[i * 3 + 1] = Math.cos(phi) * r + 5;
  starPositions[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * r;
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const stars = new THREE.Points(
  starsGeo,
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.6, sizeAttenuation: true })
);
stars.material.transparent = true;
scene.add(stars);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xfff5dd })
);
moon.position.set(-20, 22, -25);
moon.material.transparent = true;
scene.add(moon);
const moonGlow = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xfff5dd, transparent: true, opacity: 0.08 })
);
moonGlow.position.copy(moon.position);
moonGlow.material.transparent = true;
scene.add(moonGlow);

// ==================== 飘落粒子 ====================
const particleCount = 200;
const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(particleCount * 3);
const particleData = [];
for (let i = 0; i < particleCount; i++) {
  particlePos[i * 3] = (Math.random() - 0.5) * 40;
  particlePos[i * 3 + 1] = Math.random() * 15 + 1;
  particlePos[i * 3 + 2] = (Math.random() - 0.5) * 40;
  particleData.push({
    vy: -0.01 - Math.random() * 0.02,
    phase: Math.random() * Math.PI * 2,
  });
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
const particles = new THREE.Points(
  particleGeo,
  new THREE.PointsMaterial({
    color: 0xffeebb, size: 0.06, transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, sizeAttenuation: true,
  })
);
scene.add(particles);

// ==================== 音效（Web Audio 合成） ====================
class AudioManager {
  constructor() { this.ctx = null; this.enabled = false; this.masterGain = null; }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.ctx.destination);
    this.startAmbient();
  }

  startAmbient() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.05;

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
    lfo.start();

    const drone = this.ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 55;
    const droneGain = this.ctx.createGain();
    droneGain.gain.value = 0.02;
    drone.connect(droneGain);
    droneGain.connect(this.masterGain);
    drone.start();
  }

  playWoodfish(freq = 800) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, t);
    osc1.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.1);
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.5, t);
    osc2.frequency.exponentialRampToValueAtTime(freq * 0.9, t + 0.08);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.3);
    osc2.stop(t + 0.3);
  }

  toggle() {
    if (!this.ctx) { this.init(); this.enabled = true; return true; }
    this.enabled = !this.enabled;
    this.masterGain.gain.linearRampToValueAtTime(this.enabled ? 0.3 : 0, this.ctx.currentTime + 0.5);
    return this.enabled;
  }
}
const audio = new AudioManager();

// ==================== 玩家 ====================
const players = new Map();
let selfId = null;
let WORLD_BOUND = 13;

function createAvatar(color, name, isSelf = false) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.5, 6, 12), bodyMat);
  body.position.y = 0.55;
  body.castShadow = true;
  group.add(body);

  const headMat = new THREE.MeshStandardMaterial({ color: 0xe8cfa0, roughness: 0.8 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), headMat);
  head.position.y = 1.05;
  head.castShadow = true;
  group.add(head);

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2a2a2a });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeMat);
  eyeL.position.set(-0.07, 1.08, 0.18);
  group.add(eyeL);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeMat);
  eyeR.position.set(0.07, 1.08, 0.18);
  group.add(eyeR);

  if (isSelf) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.4, 0.45, 32),
      new THREE.MeshBasicMaterial({ color: 0x6ab880, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 28px "Songti SC", "STSong", serif';
  ctx.fillStyle = 'rgba(200, 220, 200, 0.95)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 128, 32);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(canvas), transparent: true, depthTest: false,
  }));
  sprite.position.y = 1.55;
  sprite.scale.set(1.2, 0.3, 1);
  group.add(sprite);

  return group;
}

function addPlayer(data, isSelf = false) {
  const mesh = createAvatar(data.color, data.name, isSelf);
  mesh.position.set(data.x, 0, data.z);
  scene.add(mesh);
  players.set(data.id, {
    id: data.id, name: data.name, color: data.color, mesh,
    target: { x: data.x, z: data.z },
    renderPos: { x: data.x, z: data.z },
    action: data.action || 'idle',
    focusStart: data.focusStart || Date.now(),
  });
}

// ==================== WebSocket ====================
const protocol = location.protocol === 'https:' ? 'wss://' : 'ws://';
const ws = new WebSocket(`${protocol}${location.host}?room=main`);

ws.onopen = () => {
  document.getElementById('status').classList.add('connected');
  document.getElementById('status-text').textContent = '已连接';
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === 'init') {
    selfId = msg.selfId;
    WORLD_BOUND = msg.bound || 13;
    addPlayer(msg.self, true);
    document.getElementById('self-name').textContent = msg.self.name;
    msg.users.forEach(u => addPlayer(u, false));
    updatePlayerList();
    document.getElementById('loading').classList.add('hidden');
  }

  if (msg.type === 'user_joined') {
    addPlayer(msg.user, false);
    updatePlayerList();
    if (players.size <= 10) showToast(`${msg.user.name} 已加入`);
  }

  if (msg.type === 'user_left') {
    const p = players.get(msg.id);
    if (p) {
      scene.remove(p.mesh);
      players.delete(msg.id);
      updatePlayerList();
    }
  }

  if (msg.type === 'move') {
    const p = players.get(msg.id);
    if (p && msg.id !== selfId) {
      p.target.x = msg.x;
      p.target.z = msg.z;
      if (msg.action) p.action = msg.action;
    }
  }

  if (msg.type === 'action') {
    const p = players.get(msg.id);
    if (p) p.action = msg.action;
  }

  if (msg.type === 'population') {
    document.getElementById('pop-count').textContent = msg.count;
  }

  if (msg.type === 'focus_reset') {
    const p = players.get(msg.id);
    if (p) p.focusStart = msg.focusStart;
  }
};

ws.onclose = () => {
  document.getElementById('status').classList.remove('connected');
  document.getElementById('status-text').textContent = '连接已断开';
};

// ==================== 输入 ====================
const keys = {};
const moveMap = {
  w: [0, -1], a: [-1, 0], s: [0, 1], d: [1, 0],
  arrowup: [0, -1], arrowleft: [-1, 0], arrowdown: [0, 1], arrowright: [1, 0],
};

addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === ' ') {
    e.preventDefault();
    camera.position.set(0, 6, 12);
    controls.target.set(0, 1, 0);
  }
});
addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// ==================== 动作按钮 ====================
document.querySelectorAll('#hud button').forEach((btn) => {
  btn.onclick = () => {
    const action = btn.dataset.action;
    const self = players.get(selfId);
    if (self && self.action === action) return;
    document.querySelectorAll('#hud button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action', action }));
      if (action === 'bow' && audio.enabled) audio.playWoodfish(600 + Math.random() * 200);
    }
    if (self) self.action = action;
  };
});

document.getElementById('audio-toggle').onclick = (e) => {
  const enabled = audio.toggle();
  e.target.textContent = enabled ? '🔊' : '🔇';
  if (enabled) showToast('音效已开启');
};

// ==================== 玩家列表 ====================
function updatePlayerList() {
  const container = document.getElementById('players');
  container.innerHTML = '';
  for (const [id, p] of players) {
    const item = document.createElement('div');
    item.className = 'player-item';
    const dot = document.createElement('div');
    dot.className = 'player-dot';
    dot.style.background = '#' + p.color.toString(16).padStart(6, '0');
    const name = document.createElement('span');
    name.className = 'player-name' + (id === selfId ? ' player-self' : '');
    name.textContent = p.name + (id === selfId ? '（我）' : '');
    item.appendChild(dot);
    item.appendChild(name);
    container.appendChild(item);
  }
}

let toastTimer = null;
function showToast(text) {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

// ==================== 主循环 ====================
let lastSend = 0;
const SEND_INTERVAL = 50;
const clock = new THREE.Clock();

// ==================== 昼夜循环 ====================
const dayCycle = {
  useRealTime: false,   // true: 跟随真实本地时间；false: 加速循环
  cycleMinutes: 1,     // useRealTime=false 时，现实 6 分钟走完游戏内一天
  startTime: performance.now(),
  startHour: 6,        // 加速模式的起始小时
};

// 关键帧：小时 -> 天空/雾/环境光/主光
const skyKeys = [
  { h: 0,    sky: 0x060a12, fog: 0x060a12, amb: 0x2a3550, ambI: 0.35, sun: 0x8899cc, sunI: 0.25 },
  { h: 5,    sky: 0x1a2030, fog: 0x1a2030, amb: 0x3a4055, ambI: 0.45, sun: 0xcc9977, sunI: 0.35 },
  { h: 6.5,  sky: 0xf0a070, fog: 0xd09070, amb: 0x8a7a70, ambI: 0.75, sun: 0xffbb88, sunI: 1.00 },
  { h: 9,    sky: 0x9cc4e0, fog: 0xa8c8dd, amb: 0xc8d8e8, ambI: 1.05, sun: 0xfff2dd, sunI: 1.70 },
  { h: 12,   sky: 0xaad4f0, fog: 0xb0d0e8, amb: 0xd8e8f5, ambI: 1.20, sun: 0xffffff, sunI: 2.00 },
  { h: 16,   sky: 0x9cc4e0, fog: 0xa8c8dd, amb: 0xc8d8e8, ambI: 1.05, sun: 0xfff2dd, sunI: 1.70 },
  { h: 18,   sky: 0xe08a55, fog: 0xc07a55, amb: 0x9a7060, ambI: 0.80, sun: 0xffaa66, sunI: 1.10 },
  { h: 19.5, sky: 0x3a2a40, fog: 0x2a2030, amb: 0x4a4055, ambI: 0.50, sun: 0xaa7788, sunI: 0.40 },
  { h: 21,   sky: 0x0a0f1a, fog: 0x0a0f1a, amb: 0x2a3550, ambI: 0.35, sun: 0x8899cc, sunI: 0.25 },
  { h: 24,   sky: 0x060a12, fog: 0x060a12, amb: 0x2a3550, ambI: 0.35, sun: 0x8899cc, sunI: 0.25 },
];

const _cA = new THREE.Color();
const _cB = new THREE.Color();

function lerpColorInto(target, aHex, bHex, t) {
  _cA.set(aHex);
  _cB.set(bHex);
  target.copy(_cA).lerp(_cB, t);
}

function getDayState(hour) {
  for (let i = 0; i < skyKeys.length - 1; i++) {
    const k0 = skyKeys[i];
    const k1 = skyKeys[i + 1];
    if (hour >= k0.h && hour <= k1.h) {
      const t = (hour - k0.h) / (k1.h - k0.h);
      return {
        sky: [k0.sky, k1.sky, t],
        fog: [k0.fog, k1.fog, t],
        amb: [k0.amb, k1.amb, t],
        ambI: k0.ambI + (k1.ambI - k0.ambI) * t,
        sun: [k0.sun, k1.sun, t],
        sunI: k0.sunI + (k1.sunI - k0.sunI) * t,
      };
    }
  }
  return getDayState(0);
}

function updateDayNight() {
  let hour;
  if (dayCycle.useRealTime) {
    const d = new Date();
    hour = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  } else {
    const elapsedMin = (performance.now() - dayCycle.startTime) / 60000;
    hour = (dayCycle.startHour + (elapsedMin / dayCycle.cycleMinutes) * 24) % 24;
  }

  const s = getDayState(hour);

  lerpColorInto(scene.background, s.sky[0], s.sky[1], s.sky[2]);
  lerpColorInto(scene.fog.color, s.fog[0], s.fog[1], s.fog[2]);
  lerpColorInto(ambientLight.color, s.amb[0], s.amb[1], s.amb[2]);
  ambientLight.intensity = s.ambI;
  lerpColorInto(moonLight.color, s.sun[0], s.sun[1], s.sun[2]);
  moonLight.intensity = s.sunI;

  // 太阳/月亮方位：6 点东升，12 点最高，18 点西落
  const sunAngle = ((hour - 6) / 12) * Math.PI;
  moonLight.position.set(
    Math.cos(sunAngle) * 18,
    Math.max(3, Math.sin(sunAngle) * 20),
    Math.sin(sunAngle * 0.7) * 10
  );

  // 夜晚程度：太阳强度越低，星星月亮越亮
  const night = THREE.MathUtils.clamp(1 - s.sunI / 1.5, 0, 1);
  stars.material.opacity = night * 0.6;
  moon.material.opacity = night;
  moonGlow.material.opacity = night * 0.08;
  moon.visible = night > 0.05;
  moonGlow.visible = moon.visible;

  // 灯笼：白天几乎不亮，夜里明显
  lanternLights.forEach((l, i) => {
    l.intensity = (0.25 + night * 1.1) * (1 + Math.sin(performance.now() * 0.003 + i * 1.5) * 0.2);
  });

  // 萤火粒子：只有夜里可见
  particles.material.opacity = night * 0.7;

  return hour;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
updateDayNight();
  const t = performance.now();

  const self = players.get(selfId);
  if (self) {
    let dx = 0, dz = 0;
    for (const [key, [mx, mz]] of Object.entries(moveMap)) {
      if (keys[key]) { dx += mx; dz += mz; }
    }
    if (dx || dz) {
      const len = Math.hypot(dx, dz);
      const speed = 3.5 * dt;
      self.target.x = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, self.renderPos.x + (dx / len) * speed));
      self.target.z = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, self.renderPos.z + (dz / len) * speed));
      if (t - lastSend > SEND_INTERVAL) {
        ws.send(JSON.stringify({ type: 'move', x: self.target.x, z: self.target.z, action: self.action }));
        lastSend = t;
      }
    } else {
      self.target.x = self.renderPos.x;
      self.target.z = self.renderPos.z;
    }
  }

  // 平滑插值所有玩家位置
  for (const [id, p] of players) {
    const factor = Math.min(1, dt * (id === selfId ? 20 : 12));
    p.renderPos.x += (p.target.x - p.renderPos.x) * factor;
    p.renderPos.z += (p.target.z - p.renderPos.z) * factor;
    p.mesh.position.x = p.renderPos.x;
    p.mesh.position.z = p.renderPos.z;
    applyActionPose(p, dt);
  }

  // 粒子
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    const d = particleData[i];
    positions[i * 3 + 1] += d.vy;
    positions[i * 3] += Math.sin(t * 0.001 + d.phase) * 0.005;
    positions[i * 3 + 2] += Math.cos(t * 0.001 + d.phase) * 0.005;
    if (positions[i * 3 + 1] < 0) {
      positions[i * 3 + 1] = 15;
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
  }
  particles.geometry.attributes.position.needsUpdate = true;

  // 香火
  incenseParticles.forEach((p, i) => {
    if (t * 0.001 > p.userData.offset && p.userData.life <= 0) {
      p.userData.life = p.userData.maxLife;
      p.position.set(0, 0.8, 2.5);
    }
    if (p.userData.life > 0) {
      p.userData.life -= dt;
      const progress = 1 - p.userData.life / p.userData.maxLife;
      p.position.y += dt * 0.5;
      p.position.x = Math.sin(t * 0.002 + i) * 0.1 * progress;
      p.position.z = 2.5 + Math.cos(t * 0.002 + i) * 0.1 * progress;
      p.material.opacity = Math.sin(progress * Math.PI) * 0.8;
      const s = 0.02 + progress * 0.03;
      p.scale.set(s, s, s);
    } else {
      p.material.opacity = 0;
    }
  });

  halo.rotation.z = t * 0.0005;
  


  if (self) {
    const elapsed = Math.floor((Date.now() - self.focusStart) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    document.getElementById('focus-time').textContent = `${mm}:${ss}`;
  }

  controls.update();
  renderer.render(scene, camera);
}

function applyActionPose(player, dt) {
  const m = player.mesh;
  let targetRotX = 0;
  let targetScale = 1;
  const t = performance.now() * 0.001;

  if (player.action === 'sit') {
    targetRotX = -0.3;
    targetScale = 0.85;
  } else if (player.action === 'bow') {
    targetRotX = -0.4 - Math.sin(t * 1.2) * 0.2;
    targetScale = 0.75;
  }

  m.rotation.x += (targetRotX - m.rotation.x) * Math.min(1, dt * 8);
  const newScale = m.scale.y + (targetScale - m.scale.y) * Math.min(1, dt * 8);
  m.scale.set(1, newScale, 1);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

requestAnimationFrame(animate);