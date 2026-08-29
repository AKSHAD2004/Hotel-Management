const fs = require('fs');
const path = require('path');

const src = 'C:/Users/hp/.gemini/antigravity/brain/ca0bea33-60b7-4581-abe6-e11184f9d720/.user_uploaded/media_1787812361717.png';
const destDir = path.join(__dirname, 'public');
const dest = path.join(destDir, 'butter-naan.jpg');

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log('BUTTER_NAAN_IMAGE_COPIED');
} catch (err) {
  console.error('COPY_ERROR:', err);
}
