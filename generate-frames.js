import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';

const TOTAL_FRAMES = 900;
const WIDTH = 1920;
const HEIGHT = 1080;
const OUTPUT_DIR = './public/frames';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(255 * f(0)),
    Math.round(255 * f(8)),
    Math.round(255 * f(4))
  ];
}

function generateFrame(frameNum) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // Progress from 0 to 1
  const progress = frameNum / TOTAL_FRAMES;
  
  // Create gradient background
  const hue = (progress * 360) % 360;
  const [r, g, b] = hslToRgb(hue, 70, 50);
  
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  // Add some visual elements that change with progress
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  
  // Moving circles
  for (let i = 0; i < 5; i++) {
    const x = WIDTH * (0.2 + i * 0.15 + Math.sin(progress * Math.PI * 2) * 0.1);
    const y = HEIGHT * (0.3 + Math.cos(progress * Math.PI * 2 + i) * 0.2);
    const radius = 100 + Math.sin(progress * Math.PI * 2 + i) * 50;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Center text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Frame ${frameNum + 1} / ${TOTAL_FRAMES}`, WIDTH / 2, HEIGHT / 2);
  
  // Progress indicator at bottom
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(0, HEIGHT - 20, WIDTH * progress, 20);
  
  return canvas.toBuffer('image/jpeg', { quality: 0.8 });
}

console.log('Generating 900 frames...');
const startTime = Date.now();

for (let i = 0; i < TOTAL_FRAMES; i++) {
  const frameNum = String(i + 1).padStart(4, '0');
  const filename = path.join(OUTPUT_DIR, `frame_${frameNum}.jpg`);
  
  const buffer = generateFrame(i);
  fs.writeFileSync(filename, buffer);
  
  if ((i + 1) % 100 === 0) {
    console.log(`Generated ${i + 1}/${TOTAL_FRAMES} frames...`);
  }
}

const duration = ((Date.now() - startTime) / 1000).toFixed(2);
console.log(`✓ Successfully generated all 900 frames in ${duration}s`);
console.log(`Frames saved to: ${OUTPUT_DIR}`);
