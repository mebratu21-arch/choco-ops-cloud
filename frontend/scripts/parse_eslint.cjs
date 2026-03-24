const fs = require('fs');
const report = JSON.parse(fs.readFileSync('eslint_report.json', 'utf8'));
const filesWithErrors = report
  .filter(file => file.errorCount > 0)
  .map(file => ({
    file: file.filePath.split(/[\\\/]/).pop(),
    path: file.filePath,
    count: file.errorCount
  }))
  .sort((a, b) => b.count - a.count);

console.log('Top 30 files with lint errors:');
console.table(filesWithErrors.slice(0, 30));
