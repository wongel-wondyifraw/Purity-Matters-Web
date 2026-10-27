const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function createIcoFromPngBuffers(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let currentOffset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4); // Count of images

  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Data size
    entry.writeUInt32LE(currentOffset, 12); // Offset
    dirEntries.push(entry);
    currentOffset += item.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((p) => p.buffer)]);
}

async function buildAllIcons() {
  const cardPath = path.join(__dirname, '..', 'public', 'purity_matters_card.jpg');
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  const publicDir = path.join(__dirname, '..', 'public');
  const appDir = path.join(__dirname, '..', 'src', 'app');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Extract the PM monogram section: left: 1023, top: 389, width: 707, height: 384
  const pmCrop = await sharp(cardPath)
    .extract({ left: 1023, top: 389, width: 707, height: 384 })
    .png()
    .toBuffer();

  // Helper to compose PM onto a pure white square canvas
  async function createPngBuffer(canvasSize, logoWidth) {
    const logoHeight = Math.round((logoWidth * 384) / 707);
    const left = Math.round((canvasSize - logoWidth) / 2);
    const top = Math.round((canvasSize - logoHeight) / 2);

    const resizedLogo = await sharp(pmCrop)
      .resize(logoWidth, logoHeight, {
        kernel: 'lanczos3',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toBuffer();

    return await sharp({
      create: {
        width: canvasSize,
        height: canvasSize,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([{ input: resizedLogo, left, top }])
      .png()
      .toBuffer();
  }

  // 1. Standard 512x512 icon (Home screen & install banner)
  const png512 = await createPngBuffer(512, 390);
  fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), png512);
  console.log('Generated public/icons/icon-512x512.png (512x512)');

  // 2. Maskable 512x512 icon (PM logo safely within 80% safe zone for Android adaptive masks)
  const pngMaskable512 = await createPngBuffer(512, 336);
  fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.png'), pngMaskable512);
  console.log('Generated public/icons/icon-maskable-512x512.png (512x512)');

  // 3. 192x192 icon (Standard PWA icon)
  const png192 = await createPngBuffer(192, 146);
  fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), png192);
  console.log('Generated public/icons/icon-192x192.png (192x192)');

  // 4. Apple Touch Icon 180x180 (iOS Add to Home Screen)
  const pngApple = await createPngBuffer(180, 138);
  fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), pngApple);
  console.log('Generated public/icons/apple-touch-icon.png (180x180)');

  // 5. Favicons: PNG 32x32 & 48x48
  const png48 = await createPngBuffer(48, 38);
  const png32 = await createPngBuffer(32, 26);
  const png16 = await createPngBuffer(16, 13);
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), png32);
  console.log('Generated public/favicon.png (32x32)');

  // Multi-resolution true Windows .ico (48x48, 32x32, 16x16)
  const multiIco = createIcoFromPngBuffers([
    { width: 48, height: 48, buffer: png48 },
    { width: 32, height: 32, buffer: png32 },
    { width: 16, height: 16, buffer: png16 },
  ]);

  // Write to both public/favicon.ico and src/app/favicon.ico (Next.js App Router takes src/app/favicon.ico!)
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), multiIco);
  console.log('Generated public/favicon.ico (Multi-size 48/32/16)');

  fs.writeFileSync(path.join(appDir, 'favicon.ico'), multiIco);
  console.log('Generated src/app/favicon.ico (Multi-size 48/32/16 - Overwrites default Next.js template favicon)');

  // 6. SVG Icon with embedded crisp PM PNG on rounded square canvas (512x512, rx=110)
  const b64 = (await sharp(pmCrop).resize(390, 212, { kernel: 'lanczos3' }).png().toBuffer()).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="110" fill="#FFFFFF" />
  <image href="data:image/png;base64,${b64}" x="61" y="150" width="390" height="212" />
</svg>
`;
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent, 'utf8');
  console.log('Generated public/icons/icon.svg (Vector squircle with crisp monogram)');

  // Clean up any test artifacts
  const testFiles = ['pm_raw.png', 'test_icon_512.png', 'test_icon_512_fixed.png', 'test.ico'];
  for (const f of testFiles) {
    for (const dir of [iconsDir, publicDir]) {
      const p = path.join(dir, f);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  }

  console.log('✓ All PWA, browser, desktop, and mobile icons successfully synchronized and updated!');
}

buildAllIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
