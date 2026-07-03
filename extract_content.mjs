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

  // Extract texts from tags (h1-h6, p, span, button, a)
  // This is a rough regex to get text content inside tags.
  // We remove the script and style blocks first.
  let cleanedContent = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  cleanedContent = cleanedContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleanedContent = cleanedContent.replace(/---[\s\S]*?---/, ''); // Remove astro frontmatter
  
  const textRegex = /<(h[1-6]|p|span|button|a|li)[^>]*>([\s\S]*?)<\/\1>/gi;
  const texts = [];
  let textMatch;
  while ((textMatch = textRegex.exec(cleanedContent)) !== null) {
    // Clean up inner html tags and excessive whitespace
    let text = textMatch[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    if (text.length > 0 && !text.includes('{') && !text.includes('}')) {
      texts.push({ tag: textMatch[1], text: text });
    }
  }

  output += `## Arquivo: \`${file}\`\n\n`;
  
  if (images.length > 0) {
    output += `### 🖼️ Imagens / Mídias encontradas:\n`;
    images.forEach(img => {
      output += `- \`${img}\`\n`;
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

fs.writeFileSync('extracted_content.md', output);
console.log('Extraction complete. Output written to extracted_content.md');
