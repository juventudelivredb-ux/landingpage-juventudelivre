import fs from 'fs';
import path from 'path';

const componentsDir = 'src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.astro'));

let output = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
  img { max-width: 100%; height: auto; max-height: 400px; border-radius: 8px; margin: 10px 0; }
  h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
  h2 { color: #444; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
  h3 { color: #666; }
  .file-section { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
  ul { background: #fff; padding: 15px 30px; border-radius: 8px; border: 1px solid #eee; }
</style>
<title>Relatório Landing Page JL</title>
</head>
<body>
<h1>Conteúdo da Landing Page (Textos e Imagens)</h1>
`;

for (const file of files) {
  const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
  
  // Extract images
  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const images = [];
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    images.push(match[1]);
  }
  
  // Extract background images
  const bgRegex = /url\(['"]?([^'"\)]+)['"]?\)/gi;
  let bgMatch;
  while ((bgMatch = bgRegex.exec(content)) !== null) {
    images.push(bgMatch[1]);
  }

  let cleanedContent = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  cleanedContent = cleanedContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleanedContent = cleanedContent.replace(/---[\s\S]*?---/, '');
  
  const textRegex = /<(h[1-6]|p|span|button|a|li)[^>]*>([\s\S]*?)<\/\1>/gi;
  const texts = [];
  let textMatch;
  while ((textMatch = textRegex.exec(cleanedContent)) !== null) {
    let text = textMatch[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    if (text.length > 0 && !text.includes('{') && !text.includes('}')) {
      texts.push({ tag: textMatch[1], text: text });
    }
  }

  output += `<div class="file-section">\n`;
  output += `<h2>Arquivo: <code>${file}</code></h2>\n`;
  
  if (images.length > 0) {
    output += `<h3>🖼️ Imagens / Mídias encontradas:</h3>\n`;
    images.forEach(img => {
      let imgPath = img;
      if (imgPath.startsWith('/')) {
        imgPath = 'public' + imgPath;
      }
      
      if (imgPath.match(/\.(png|jpe?g|webp|svg|gif)$/i)) {
        output += `<img src="${imgPath}" alt="${img}" /><br/>\n`;
        output += `<em>Caminho: ${img}</em><br/><br/>\n`;
      } else {
        output += `<ul><li><code>${img}</code></li></ul>\n`;
      }
    });
  }

  if (texts.length > 0) {
    output += `<h3>📝 Textos encontrados:</h3>\n<ul>\n`;
    texts.forEach(t => {
      output += `<li><strong>${t.tag.toUpperCase()}</strong>: ${t.text}</li>\n`;
    });
    output += `</ul>\n`;
  }
  
  output += `</div>\n`;
}

output += `</body></html>`;

fs.writeFileSync('relatorio_jl.html', output);
console.log('Extraction complete. Output written to relatorio_jl.html');
