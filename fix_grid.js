const fs = require('fs');

const files = [
  'data/es/003-consistencia-interactive.json',
  'data/en/003-consistencia-interactive.json'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace('</div><div class="interactive-grid"><div class="w-full md:w-1/3', '</div><div class="flex flex-col md:flex-row gap-6"><div class="w-full md:w-1/3');
    fs.writeFileSync(file, content);
  }
}
