// Check hard links
const fs = require('fs');
const path = require('path');

const files = [
  'd:/Desktop/exe201/App.tsx',
  'd:/Desktop/exe201/src/services/api.ts',
  'd:/Desktop/exe201/src/services/authService.ts'
];

files.forEach(f => {
  try {
    const stats = fs.statSync(f);
    console.log(f, '-> inode:', stats.ino, 'nlink:', stats.nlink);
  } catch(e) {
    console.log(f, '-> ERROR:', e.message);
  }
});
