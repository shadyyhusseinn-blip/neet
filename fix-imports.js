const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src/pages/admin');
const files = fs.readdirSync(adminDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(adminDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/from '\.\.\/audio'/g, "from '../../services/audio'");
  content = content.replace(/from '\.\.\/storage'/g, "from '../../services/storage'");
  content = content.replace(/from '\.\.\/firestoreSync'/g, "from '../../services/firestoreSync'");
  
  fs.writeFileSync(filePath, content);
});

console.log(`Fixed imports in ${files.length} files`);
