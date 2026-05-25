const fs = require('fs');
const zlib = require('zlib');

function checkPng(filePath) {
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
  
  console.log(`File: ${filePath}, Width: ${width}, Height: ${height}, ColorType: ${colorType}`);
  
  const idatBuf = Buffer.concat(idatBuffers);
  try {
    const decompressed = zlib.inflateSync(idatBuf);
    console.log(`Decompressed size: ${decompressed.length}`);
    
    // In PNG color type 6, each scanline starts with a filter byte (1 byte)
    // followed by width * 4 bytes of pixel data.
    let transparentPixels = 0;
    let whiteBackgroundPixels = 0;
    let scanlineLength = 1 + width * 4;
    
    for (let y = 0; y < height; y++) {
      let offset = y * scanlineLength + 1; // skip filter byte
      for (let x = 0; x < width; x++) {
        let idx = offset + x * 4;
        if (idx + 3 < decompressed.length) {
          let r = decompressed[idx];
          let g = decompressed[idx + 1];
          let b = decompressed[idx + 2];
          let a = decompressed[idx + 3];
          if (a < 255) {
            transparentPixels++;
          }
          if (r === 255 && g === 255 && b === 255 && a === 255) {
            whiteBackgroundPixels++;
          }
        }
      }
    }
    
    console.log(`Transparent pixels: ${transparentPixels}`);
    console.log(`White pixels: ${whiteBackgroundPixels}`);
    console.log(`Total pixels: ${width * height}`);
    console.log(`Is transparent: ${transparentPixels > 0}`);
  } catch (e) {
    console.error('Error decompressing IDAT:', e);
  }
}

checkPng('public/assets/logos/Logo_Juventude_ACRE.png');
checkPng('public/assets/logos/Logo_Juventude_Livre_MG.png');
