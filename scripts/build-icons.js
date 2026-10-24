const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function buildAllIcons() {
  const cardPath = path.join(__dirname, '..', 'public', 'purity_matters_card.jpg');
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  const publicDir = path.join(__dirname, '..', 'public');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Extract the PM monogram section: left: 1023, top: 389, width: 707, height: 384
  const pmCrop = await sharp(cardPath)
    .extract({ left: 1023, top: 389, width: 707, height: 384 })
    .png()
    .toBuffer();

  // Helper to compose PM onto a pure white square canvas
  async function createIcon(canvasSize, logoWidth, outputPath) {
    const logoHeight = Math.round((logoWidth * 384) / 707);
    const left = Math.round((canvasSize - logoWidth) / 2);
    const top = Math.round((canvasSize - logoHeight) / 2);

    const resizedLogo = await sharp(pmCrop)
      .resize(logoWidth, logoHeight, {
        kernel: 'lanczos3',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toBuffer();

    await sharp({
      create: {
        width: canvasSize,
        height: canvasSize,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([{ input: resizedLogo, left, top }])
      .png()
      .toFile(outputPath);

    console.log(`Generated ${path.relative(path.join(__dirname, '..'), outputPath)} (${canvasSize}x${canvasSize})`);
  }

  // 1. Standard 512x512 icon (Home screen & install banner)
  await createIcon(512, 390, path.join(iconsDir, 'icon-512x512.png'));

  // 2. Maskable 512x512 icon (Ensures PM logo is 100% inside the 80% safe circle for Android mask shapes)
  await createIcon(512, 336, path.join(iconsDir, 'icon-maskable-512x512.png'));

  // 3. 192x192 icon (Standard PWA icon)
  await createIcon(192, 146, path.join(iconsDir, 'icon-192x192.png'));

  // 4. Apple Touch Icon 180x180 (iOS Add to Home Screen)
  await createIcon(180, 138, path.join(iconsDir, 'apple-touch-icon.png'));

  // 5. Favicons
  await createIcon(48, 38, path.join(publicDir, 'favicon.ico'));
  await createIcon(32, 26, path.join(publicDir, 'favicon.png'));

  // 6. SVG Icon with embedded crisp PM PNG on rounded square canvas
  const b64 = (await sharp(pmCrop).resize(390, 212, { kernel: 'lanczos3' }).png().toBuffer()).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="110" fill="#FFFFFF" />
  <image href="data:image/png;base64,${b64}" x="61" y="150" width="390" height="212" />
</svg>
`;
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent, 'utf8');
  console.log('Generated public/icons/icon.svg');

  // Clean up any test artifacts
  const testFiles = ['pm_raw.png', 'test_icon_512.png', 'test_icon_512_fixed.png'];
  for (const f of testFiles) {
    const p = path.join(iconsDir, f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  console.log('All PWA and browser icons successfully updated!');
}

buildAllIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
