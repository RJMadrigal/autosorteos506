import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.html') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace LuxuryWheels references
    content = content.replace(/LuxuryWheels CR/g, 'AutoSorteos506');
    content = content.replace(/LuxuryWheelsCR/g, 'AutoSorteos506');
    content = content.replace(/LuxuryWheels/g, 'AutoSorteos506');
    content = content.replace(/luxurywheelscr\.com/g, 'autosorteos506.com');
    content = content.replace(/luxurywheels\.cr/g, 'autosorteos506.com');

    // Replace logo in Nav.tsx, Footer.tsx, admin.tsx
    content = content.replace(/<img[^>]*src="\/logo\.png"[^>]*\/>/g, '<div className="text-2xl font-black tracking-tighter">LOGO</div>');
    
    // Replace logo in email.server.ts
    content = content.replace(/<img[^>]*src="[^"]*logo\.png"[^>]*\/>/g, '<div style="font-size: 24px; font-weight: bold; margin-bottom: 15px;">LOGO</div>');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
