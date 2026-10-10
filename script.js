import * as THREE from "three";

// ---------- 3D background ----------
const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07070d, 0.035);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 14;

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const light1 = new THREE.PointLight(0x7c5cff, 2, 60);
light1.position.set(6, 6, 10);
scene.add(light1);
const light2 = new THREE.PointLight(0x00e0c6, 2, 60);
light2.position.set(-6, -4, 8);
scene.add(light2);

const geometries = [
  new THREE.IcosahedronGeometry(1, 0),
  new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16),
  new THREE.OctahedronGeometry(1, 0),
  new THREE.TorusGeometry(0.7, 0.25, 16, 60),
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
];
const colors = [0x7c5cff, 0x00e0c6, 0xff5c8a, 0x5cc8ff, 0xffd166];

const shapes = [];
for (let i = 0; i < 28; i++) {
  const geo = geometries[i % geometries.length];
  const mat = new THREE.MeshStandardMaterial({
    color: colors[i % colors.length],
    metalness: 0.6,
    roughness: 0.25,
    wireframe: i % 5 === 0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(
    (Math.random() - 0.5) * 36,
    (Math.random() - 0.5) * 24,
    (Math.random() - 0.5) * 20 - 4
  );
  const s = 0.4 + Math.random() * 0.9;
  mesh.scale.setScalar(s);
  mesh.userData = {
    rx: (Math.random() - 0.5) * 0.01,
    ry: (Math.random() - 0.5) * 0.012,
    floatSpeed: 0.3 + Math.random() * 0.6,
    floatOffset: Math.random() * Math.PI * 2,
    baseY: mesh.position.y,
  };
  scene.add(mesh);
  shapes.push(mesh);
}

// Starfield
const starGeo = new THREE.BufferGeometry();
const starCount = 1500;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 120;
starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.7 })
);
scene.add(stars);

// Mouse parallax
const mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

const clock = new THREE.Clock();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animate() {
  const t = clock.getElapsedTime();
  for (const m of shapes) {
    m.rotation.x += m.userData.rx * (reduceMotion ? 0 : 1);
    m.rotation.y += m.userData.ry * (reduceMotion ? 0 : 1);
    if (!reduceMotion) {
      m.position.y = m.userData.baseY + Math.sin(t * m.userData.floatSpeed + m.userData.floatOffset) * 0.6;
    }
  }
  stars.rotation.y = t * 0.01;

  camera.position.x += (mouse.x * 2 - camera.position.x) * 0.03;
  camera.position.y += (-mouse.y * 1.5 - camera.position.y) * 0.03;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- Typing effect ----------
const roles = ["Web Developer", "3D Enthusiast", "Problem Solver", "Creative Coder"];
const typedEl = document.getElementById("typed");
let r = 0, c = 0, deleting = false;
function type() {
  const word = roles[r];
  typedEl.textContent = deleting ? word.slice(0, c--) : word.slice(0, c++);
  let delay = deleting ? 60 : 120;
  if (!deleting && c > word.length) { deleting = true; delay = 1500; }
  else if (deleting && c < 0) { deleting = false; r = (r + 1) % roles.length; c = 0; delay = 400; }
  setTimeout(type, delay);
}
type();

// ---------- Scroll reveal ----------
const observer = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) e.target.classList.add("visible");
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ---------- Card tilt ----------
document.querySelectorAll(".tilt").forEach((card) => {
  const inner = card.querySelector(".card-inner");
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    inner.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
  });
  card.addEventListener("mouseleave", () => { inner.style.transform = ""; });
});

document.getElementById("year").textContent = new Date().getFullYear();
