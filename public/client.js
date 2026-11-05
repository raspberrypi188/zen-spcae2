import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ==================== 基础场景 ====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a20); // 深色背景，突出佛像的金光
scene.fog = new THREE.FogExp2(0x1a1a20, 0.015);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
// 初始视角拉远一点，以便看清佛像
camera.position.set(0, 4, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2; // 提高曝光，让金色更亮
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.45;
controls.minDistance = 3;
controls.maxDistance = 20;
controls.target.set(0, 2, -2); // 视角中心对准佛像

// ==================== 场景搭建 ====================
// 1. 光源 (重点突出佛像的金属质感)
const ambient = new THREE.AmbientLight(0xffeedd, 0.3);
scene.add(ambient);

// 主光源（从斜上方打下）
const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
scene.add(dirLight);

// 佛像专属打光（暖黄色，从正前方底部往上打，营造神圣感）
const buddhaLight = new THREE.PointLight(0xffaa55, 2.5, 10);
buddhaLight.position.set(0, 1, -1);
scene.add(buddhaLight);

// 2. 木地板
const floorMat = new THREE.MeshStandardMaterial({ color: 0x3a2d22, roughness: 0.8 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 木地板接缝
for (let i = -15; i <= 15; i+=1) {
  const line = new THREE.Mesh(new THREE.BoxGeometry(30, 0.02, 0.02), new THREE.MeshBasicMaterial({color: 0x1a130d}));
  line.position.set(0, 0.01, i);
  scene.add(line);
}

// 3. 木柱
const woodMat = new THREE.MeshStandardMaterial({ color: 0x2b1d12, roughness: 0.9 });
const pillarGeo = new THREE.CylinderGeometry(0.4, 0.4, 8, 16);
const p1 = new THREE.Mesh(pillarGeo, woodMat); p1.position.set(-6, 4, -4); scene.add(p1);
const p2 = new THREE.Mesh(pillarGeo, woodMat); p2.position.set(6, 4, -4); scene.add(p2);

// 4. 蒲团
const cushionMat = new THREE.MeshStandardMaterial({ color: 0x2b3a35, roughness: 1 });
const cushionGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.15, 32);
const cushion = new THREE.Mesh(cushionGeo, cushionMat);
cushion.position.set(0, 0.075, 0);
cushion.receiveShadow = true;
scene.add(cushion);

// 5. 香炉 (移到侧面)
const potMat = new THREE.MeshStandardMaterial({ color: 0x8a8a7a, metalness: 0.3, roughness: 0.7 });
const pot = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), potMat);
pot.position.set(2, 0.15, 1);
scene.add(pot);

// ==================== 佛像生成器 ====================
function createBuddha() {
  const group = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({ 
    color: 0xd4af37, // 金色
    metalness: 0.9,  // 强金属感
    roughness: 0.3   // 表面光滑反光
  });
  const darkGoldMat = new THREE.MeshStandardMaterial({ color: 0xaa8822, metalness: 0.8, roughness: 0.4 });

  // 1. 莲花座
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.3, 32), darkGoldMat);
  base1.position.y = 0.15; group.add(base1);
  
  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.1, 0.2, 32), goldMat);
  base2.position.y = 0.4; group.add(base2);

  // 莲花瓣 (环绕一圈)
  for(let i=0; i<24; i++){
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), goldMat);
    petal.scale.set(1, 1.5, 0.5);
    const angle = (i / 24) * Math.PI * 2;
    petal.position.set(Math.cos(angle)*1.9, 0.55, Math.sin(angle)*1.9);
    petal.rotation.y = -angle;
    petal.rotation.x = Math.PI / 6;
    group.add(petal);
  }

  // 2. 身体 (盘腿)
  const legs = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.6, 32), goldMat);
  legs.scale.set(1, 1, 0.8);
  legs.position.y = 0.9;
  group.add(legs);

  // 躯干
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 0.8, 16, 32), goldMat);
  torso.scale.set(1, 1, 0.6);
  torso.position.y = 1.8;
  group.add(torso);

  // 手臂 (斜向下)
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.2, 16), goldMat);
  armL.position.set(-0.9, 1.5, 0.2);
  armL.rotation.z = Math.PI / 4;
  armL.rotation.x = -Math.PI / 6;
  group.add(armL);

  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.2, 16), goldMat);
  armR.position.set(0.9, 1.5, 0.2);
  armR.rotation.z = -Math.PI / 4;
  armR.rotation.x = -Math.PI / 6;
  group.add(armR);

  // 手印 (禅定印 - 放在腿上)
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), goldMat);
  hand.scale.set(1.5, 0.4, 1);
  hand.position.set(0, 1.0, 0.5);
  group.add(hand);

  // 3. 头部
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.4, 16), goldMat);
  neck.position.y = 2.5; group.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), goldMat);
  head.scale.set(0.9, 1.1, 0.9); // 微微椭圆
  head.position.y = 3.2; group.add(head);

  // 耳朵 (大耳垂)
  const earL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), goldMat);
  earL.scale.set(0.5, 1.5, 0.5);
  earL.position.set(-0.6, 3.1, 0);
  group.add(earL);
  const earR = earL.clone(); earR.position.x = 0.6; group.add(earR);

  // 肉髻 (头顶的凸起)
  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), goldMat);
  bun.position.y = 3.8; group.add(bun);
  const topKnot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), goldMat);
  topKnot.position.y = 4.1; group.add(topKnot);

  // 背光光晕 (使用后处理或者简单叠加一个发光圆环)
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xffdd88, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
  const halo = new THREE.Mesh(new THREE.CircleGeometry(2.5, 32), haloMat);
  halo.position.set(0, 2.8, -0.8);
  group.add(halo);

  group.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return group;
}

// 实例化佛像并放置
const buddha = createBuddha();
buddha.position.set(0, 0, -3); // 放在前方
scene.add(buddha);


// ==================== Q版小和尚 ====================
function createMonk(isSelf) {
  const group = new THREE.Group();
  
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x9eafb5, roughness: 0.9 });
  const robe = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.5, 8, 16), robeMat);
  robe.position.y = 0.6;
  robe.castShadow = true;
  group.add(robe);

  const apronMat = new THREE.MeshStandardMaterial({ color: 0xe0c060, roughness: 0.8 });
  const apron = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.1), apronMat);
  apron.position.set(0, 0.45, 0.3);
  group.add(apron);

  const headMat = new THREE.MeshStandardMaterial({ color: 0xe0a88a, roughness: 0.8 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), headMat);
  head.position.y = 1.25;
  head.castShadow = true;
  group.add(head);

  const blushMat = new THREE.MeshBasicMaterial({ color: 0xe07a7a, transparent: true, opacity: 0.5 });
  const blushL = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), blushMat);
  blushL.position.set(-0.2, 1.2, 0.3); blushL.rotation.y = Math.PI / 4; group.add(blushL);
  const blushR = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), blushMat);
  blushR.position.set(0.2, 1.2, 0.3); blushR.rotation.y = -Math.PI / 4; group.add(blushR);

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2a2a2a });
  const eyeL = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.01, 8, 16, Math.PI), eyeMat);
  eyeL.position.set(-0.12, 1.28, 0.33); eyeL.rotation.z = Math.PI; group.add(eyeL);
  const eyeR = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.01, 8, 16, Math.PI), eyeMat);
  eyeR.position.set(0.12, 1.28, 0.33); eyeR.rotation.z = Math.PI; group.add(eyeR);

  if (isSelf) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.55, 32),
      new THREE.MeshBasicMaterial({ color: 0xffdd88, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    group.add(ring);
  }

  return group;
}

// ==================== 状态与网络 ====================
const players = new Map();
let selfId = null;

const protocol = location.protocol === 'https:' ? 'wss://' : 'ws://';
const ws = new WebSocket(`${protocol}${location.host}?room=main`);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'init') {
    selfId = msg.selfId;
    // 初始面向佛像 (rotation.y = 0 即面向 -z 轴)
    addPlayer({ id: selfId, x: 0, z: 0, action: 'sit' }, true);
    msg.users.forEach(u => addPlayer(u, false));
    document.getElementById('loading').style.opacity = '0';
    setTimeout(() => document.getElementById('loading').style.display = 'none', 500);
  }
  if (msg.type === 'user_joined') addPlayer(msg.user, false);
  if (msg.type === 'user_left') removePlayer(msg.id);
  if (msg.type === 'move') updatePlayerPos(msg.id, msg.x, msg.z, msg.action);
  if (msg.type === 'action') updatePlayerAction(msg.id, msg.action);
  if (msg.type === 'population') document.getElementById('pop-count').textContent = msg.count;
};

function addPlayer(data, isSelf) {
  const mesh = createMonk(isSelf);
  mesh.position.set(data.x, 0, data.z);
  if (data.action === 'sit') mesh.rotation.x = -0.15;
  scene.add(mesh);
  players.set(data.id, { mesh, target: {x: data.x, z: data.z}, action: data.action });
}

function removePlayer(id) {
  const p = players.get(id);
  if (p) { scene.remove(p.mesh); players.delete(id); }
}

function updatePlayerPos(id, x, z, action) {
  const p = players.get(id);
  if (p) { p.target.x = x; p.target.z = z; p.action = action; }
}

function updatePlayerAction(id, action) {
  const p = players.get(id);
  if (p) p.action = action;
}

// ==================== 音频合成 ====================
class ZenAudio {
  constructor() { this.ctx = null; this.enabled = false; }
  init() { if (this.ctx) return; this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.enabled = true; }
  playWoodfish() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600 + Math.random() * 100, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(t + 0.2);
  }
}
const audio = new ZenAudio();

// ==================== UI 交互 ====================
document.getElementById('enter-btn').onclick = () => audio.init();

document.querySelectorAll('.action-btn').forEach(btn => {
  btn.onclick = () => {
    const action = btn.dataset.action;
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action', action }));
      if(action === 'bow') audio.playWoodfish();
    }
    const self = players.get(selfId);
    if (self) self.action = action;
    document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  };
});

let startTime = Date.now();
setInterval(() => {
  const sec = Math.floor((Date.now() - startTime) / 1000);
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `${m}:${s}`;
}, 1000);

document.getElementById('btn-immersive').onclick = () => { document.body.classList.toggle('immersive'); };

// 情绪手记
const mindModal = document.getElementById('modal-mind');
const mindText = document.getElementById('mind-text');
document.getElementById('btn-mind').onclick = () => { mindText.value = localStorage.getItem('zen_mind') || ''; mindModal.classList.add('show'); };
document.getElementById('mind-save').onclick = () => { localStorage.setItem('zen_mind', mindText.value); mindModal.classList.remove('show'); };
document.getElementById('mind-release').onclick = () => {
  localStorage.removeItem('zen_mind'); mindText.value = '';
  mindText.placeholder = '往事如烟，已散入晚风...';
  setTimeout(() => mindModal.classList.remove('show'), 800);
};

// 抄经
const sutraModal = document.getElementById('modal-sutra');
const canvas = document.getElementById('canvas-sutra');
const ctx = canvas.getContext('2d');
let isDrawing = false;
ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#4a3b2c';

document.getElementById('btn-sutra').onclick = () => sutraModal.classList.add('show');
function startDraw(e) {
  isDrawing = true; ctx.beginPath();
  const rect = canvas.getBoundingClientRect();
  ctx.moveTo((e.clientX || e.touches[0].clientX) - rect.left, (e.clientY || e.touches[0].clientY) - rect.top);
}
function draw(e) {
  if (!isDrawing) return; e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  ctx.lineTo((e.clientX || e.touches[0].clientX) - rect.left, (e.clientY || e.touches[0].clientY) - rect.top); ctx.stroke();
}
function endDraw() { isDrawing = false; }
canvas.addEventListener('mousedown', startDraw); canvas.addEventListener('mousemove', draw); canvas.addEventListener('mouseup', endDraw); canvas.addEventListener('mouseout', endDraw);
canvas.addEventListener('touchstart', startDraw, {passive: false}); canvas.addEventListener('touchmove', draw, {passive: false}); canvas.addEventListener('touchend', endDraw);
document.getElementById('sutra-clear').onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
document.getElementById('sutra-save').onclick = () => { const link = document.createElement('a'); link.download = '云上抄经.png'; link.href = canvas.toDataURL(); link.click(); };

// ==================== 渲染循环 ====================
const clock = new THREE.Clock();
let lastSend = 0;
const keys = {};

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = performance.now();

  // 佛像背光呼吸效果
  buddhaLight.intensity = 2.0 + Math.sin(t * 0.002) * 0.5;

  // 玩家插值
  for (const [id, p] of players) {
    const factor = Math.min(1, dt * (id === selfId ? 20 : 10));
    p.mesh.position.x += (p.target.x - p.mesh.position.x) * factor;
    p.mesh.position.z += (p.target.z - p.mesh.position.z) * factor;

    let targetRotX = 0; let targetScale = 1;
    if (p.action === 'sit') { targetRotX = -0.15; targetScale = 0.9; }
    if (p.action === 'bow') { targetRotX = -0.6 + Math.sin(t * 0.005) * 0.1; targetScale = 0.85; }
    
    p.mesh.rotation.x += (targetRotX - p.mesh.rotation.x) * Math.min(1, dt * 10);
    p.mesh.scale.y += (targetScale - p.mesh.scale.y) * Math.min(1, dt * 10);
  }

  // 键盘控制
  const self = players.get(selfId);
  if (self) {
    let dx = 0, dz = 0;
    if (keys['w']) dz -= 1; if (keys['s']) dz += 1;
    if (keys['a']) dx -= 1; if (keys['d']) dx += 1;
    
    if (dx || dz) {
      const len = Math.hypot(dx, dz);
      // 限制活动范围，避免穿模走到佛像后面
      let nextX = self.target.x + (dx / len) * dt * 3;
      let nextZ = self.target.z + (dz / len) * dt * 3;
      
      // 简单碰撞：不要越过佛台
      if (nextZ < -2.2) nextZ = -2.2; 
      if (nextZ > 5) nextZ = 5;
      if (nextX < -5) nextX = -5;
      if (nextX > 5) nextX = 5;

      self.target.x = nextX;
      self.target.z = nextZ;
      
      if (t - lastSend > 50) {
        ws.send(JSON.stringify({ type: 'move', x: self.target.x, z: self.target.z, action: self.action }));
        lastSend = t;
      }
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

animate();