const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function checkPng(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    
    // Find IDAT chunk
    let pos = 8; // skip PNG signature
    let idatBuffers = [];
    let width = 0, height = 0, colorType = 0;
    
    while (pos < buf.length) {
      const length = buf.readUInt32BE(pos);
      const type = buf.toString('ascii', pos + 4, pos + 8);
      if (type === 'IHDR') {
        width = buf.readUInt32BE(pos + 8);
        height = buf.readUInt32BE(pos + 12);
        colorType = buf.readUInt8(pos + 17);
      } else if (type === 'IDAT') {
        idatBuffers.push(buf.slice(pos + 8, pos + 8 + length));
      }
      pos += 12 + length;
    }
    
    const idatBuf = Buffer.concat(idatBuffers);
    const decompressed = zlib.inflateSync(idatBuf);
    
    let transparentPixels = 0;
    let whiteBackgroundPixels = 0;
    let scanlineLength = 1 + width * 4;
    
    // Check if colorType is RGBA (ColorType 6)
    if (colorType === 6) {
      for (let y = 0; y < height; y++) {
        let offset = y * scanlineLength + 1; // skip filter byte
        for (let x = 0; x < width; x++) {
          let idx = offset + x * 4;
          if (idx + 3 < decompressed.length) {
            let a = decompressed[idx + 3];
            if (a < 255) {
              transparentPixels++;
            }
          }
        }
      }
    }
    
    console.log(`File: ${path.basename(filePath)} | Width: ${width} | Height: ${height} | ColorType: ${colorType} | Transparent Pixels: ${transparentPixels} | Is Transparent: ${transparentPixels > 0}`);
  } catch (e) {
    console.error(`Error processing ${filePath}:`, e.message);
  }
}

const dir = 'public/assets/logos';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.png')) {
    checkPng(path.join(dir, file));
  }
});
