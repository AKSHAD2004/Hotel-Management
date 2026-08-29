const fs = require('fs');
const path = require('path');

const src = 'C:/Users/hp/.gemini/antigravity/brain/ca0bea33-60b7-4581-abe6-e11184f9d720/.user_uploaded/media_1787810164664.jpg';
const destDir = path.join(__dirname, 'public');
const dest = path.join(destDir, 'hotel-bg.jpg');

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log('HOTEL_BG_COPIED_SUCCESSFULLY');
} catch (err) {
  console.error('COPY_ERROR:', err);
}
