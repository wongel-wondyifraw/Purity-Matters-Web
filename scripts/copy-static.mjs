import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve('.next', 'static');
const destDir = path.resolve('public', '_next', 'static');

try {
  if (fs.existsSync(srcDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    fs.cpSync(srcDir, destDir, { recursive: true, force: true });
    console.log('✓ Successfully copied .next/static to public/_next/static for cPanel/LiteSpeed static serving.');
  } else {
    console.warn('⚠️ .next/static not found; build may not have completed yet.');
  }
} catch (error) {
  console.error('Failed to copy static assets to public/_next/static:', error);
}
