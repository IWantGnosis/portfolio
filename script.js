import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Loader ----------
const loader = document.getElementById("loader");
const countEl = document.getElementById("count");
let count = 0;
const counter = setInterval(() => {
  count = Math.min(100, count + Math.ceil(Math.random() * 9));
  countEl.textContent = String(count).padStart(2, "0");
  if (count >= 100) {
    clearInterval(counter);
    gsap.to(loader, { yPercent: -100, duration: 1, ease: "expo.inOut", delay: 0.2, onComplete: () => loader.remove() });
    introHero();
  }
}, 40);

function introHero() {
  gsap.from(".hero .line > span", { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.12, delay: 0.3 });
  gsap.from(".hero .eyebrow, .nav, .scroll-cue", { opacity: 0, duration: 1.2, delay: 0.6, ease: "power2.out" });
}

// ---------- Custom cursor ----------
const cursor = document.getElementById("cursor");
const dot = document.getElementById("cursorDot");
const pos = { x: innerWidth / 2, y: innerHeight / 2 };
const ring = { x: pos.x, y: pos.y };
window.addEventListener("mousemove", (e) => {
  pos.x = e.clientX; pos.y = e.clientY;
  dot.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
});
document.querySelectorAll("a, .skill").forEach((el) => {
  el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
});

// ---------- Hero 3D ----------
const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.z = 7;

function resize() {
  const hero = canvas.parentElement;
  const w = hero.clientWidth, h = hero.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);

const group = new THREE.Group();
scene.add(group);
group.position.x = 1.8;

const blobGeo = new THREE.IcosahedronGeometry(1.7, 48);
const basePos = blobGeo.attributes.position.array.slice();
const blob = new THREE.Mesh(
  blobGeo,
  new THREE.MeshBasicMaterial({ color: 0xd4ff3a, wireframe: true, transparent: true, opacity: 0.28 })
);
const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.45, 5),
  new THREE.MeshBasicMaterial({ color: 0x0a0a0a })
);
group.add(core, blob);

const ringMesh = new THREE.Mesh(
  new THREE.TorusGeometry(2.7, 0.012, 8, 220),
  new THREE.MeshBasicMaterial({ color: 0xf2f2ee, transparent: true, opacity: 0.5 })
);
ringMesh.rotation.x = Math.PI / 2.4;
group.add(ringMesh);

const ring2 = new THREE.Mesh(
  new THREE.TorusGeometry(2.2, 0.01, 8, 200),
  new THREE.MeshBasicMaterial({ color: 0xd4ff3a, transparent: true, opacity: 0.6 })
);
ring2.rotation.y = Math.PI / 3;
group.add(ring2);

// dust particles
const dustCount = 700;
const dustGeo = new THREE.BufferGeometry();
const dustArr = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount * 3; i++) dustArr[i] = (Math.random() - 0.5) * 14;
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustArr, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xf2f2ee, size: 0.02, transparent: true, opacity: 0.5 }));
scene.add(dust);

const mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / innerWidth - 0.5) * 2;
  mouse.y = (e.clientY / innerHeight - 0.5) * 2;
});

// smooth noise-like displacement, no external libs
function noise(x, y, z, t) {
  return (
    Math.sin(x * 1.4 + t) * Math.cos(y * 1.7 - t * 0.7) +
    Math.sin(z * 2.1 + t * 0.6) * 0.6 +
    Math.cos((x + y) * 1.1 - t * 0.9) * 0.4
  ) / 2;
}

const posAttr = blobGeo.attributes.position;
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime() * (reduceMotion ? 0.2 : 1);

  for (let i = 0; i < posAttr.count; i++) {
    const ox = basePos[i * 3], oy = basePos[i * 3 + 1], oz = basePos[i * 3 + 2];
    const len = Math.hypot(ox, oy, oz);
    const nx = ox / len, ny = oy / len, nz = oz / len;
    const d = 1 + 0.16 * noise(nx, ny, nz, t * 0.8);
    posAttr.setXYZ(i, nx * len * d, ny * len * d, nz * len * d);
  }
  posAttr.needsUpdate = true;

  group.rotation.y = t * 0.12 + mouse.x * 0.35;
  group.rotation.x = mouse.y * 0.2;
  ringMesh.rotation.z = t * 0.15;
  ring2.rotation.x = t * 0.2;
  dust.rotation.y = t * 0.02;

  ring.x += (pos.x - ring.x) * 0.15;
  ring.y += (pos.y - ring.y) * 0.15;
  cursor.style.transform = `translate(${ring.x}px, ${ring.y}px)`;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// ---------- Clock (IST) ----------
const clockEl = document.getElementById("clock");
function tick() {
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date());
  clockEl.textContent = `India ${time} IST`;
}
tick();
setInterval(tick, 30000);

// ---------- About word reveal ----------
const aboutEl = document.getElementById("aboutText");
const words = aboutEl.textContent.trim().split(/\s+/);
aboutEl.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(" ");
gsap.to(aboutEl.querySelectorAll(".w"), {
  opacity: 1,
  stagger: 0.1,
  ease: "none",
  scrollTrigger: { trigger: aboutEl, start: "top 80%", end: "bottom 45%", scrub: true },
});

// ---------- Scroll reveals ----------
gsap.utils.toArray("[data-reveal]").forEach((el) => {
  gsap.from(el, {
    y: 60,
    opacity: 0,
    duration: 1.1,
    ease: "expo.out",
    scrollTrigger: { trigger: el, start: "top 88%" },
  });
});

// ---------- Project hover preview ----------
const preview = document.getElementById("preview");
const previewInner = preview.querySelector(".preview-inner");
const previewLabel = document.getElementById("previewLabel");
const previewPos = { x: 0, y: 0 };
const previewTarget = { x: 0, y: 0 };

document.querySelectorAll(".work-row").forEach((row) => {
  row.addEventListener("mouseenter", () => {
    previewInner.style.setProperty("--c", row.dataset.color);
    previewLabel.textContent = row.querySelector(".title").textContent;
    preview.classList.add("show");
  });
  row.addEventListener("mouseleave", () => preview.classList.remove("show"));
  row.addEventListener("mousemove", (e) => {
    previewTarget.x = e.clientX + 200;
    previewTarget.y = e.clientY;
  });
});
(function followPreview() {
  previewPos.x += (previewTarget.x - previewPos.x) * 0.15;
  previewPos.y += (previewTarget.y - previewPos.y) * 0.15;
  preview.style.left = previewPos.x + "px";
  preview.style.top = previewPos.y + "px";
  requestAnimationFrame(followPreview);
})();

document.getElementById("year").textContent = new Date().getFullYear();
