import fs from 'fs';
import path from 'path';

const componentsDir = 'src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.astro'));

let output = '# Conteúdo da Landing Page (Textos e Imagens)\n\n';

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

  output += `## Arquivo: \`${file}\`\n\n`;
  
  if (images.length > 0) {
    output += `### 🖼️ Imagens / Mídias encontradas:\n\n`;
    images.forEach(img => {
      // Clean up path, mostly they start with / which means public folder.
      let imgPath = img;
      if (imgPath.startsWith('/')) {
        imgPath = 'public' + imgPath;
      }
      
      // Sometimes it's a generic string or #. Let's filter out non-image extensions if we want
      if (imgPath.match(/\.(png|jpe?g|webp|svg|gif)$/i)) {
        output += `![${img}](${imgPath})\n\n`;
        output += `*Caminho: ${img}*\n\n`;
      } else {
        output += `- \`${img}\`\n`;
      }
    });
    output += '\n';
  }

  if (texts.length > 0) {
    output += `### 📝 Textos encontrados:\n`;
    texts.forEach(t => {
      output += `- **${t.tag.toUpperCase()}**: ${t.text}\n`;
    });
    output += '\n';
  }
}

fs.writeFileSync('relatorio_jl.md', output);
console.log('Extraction complete. Output written to relatorio_jl.md');
