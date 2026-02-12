const fs = require('fs');
const report = JSON.parse(fs.readFileSync('eslint-report.json', 'utf8'));

const ruleCounts = {};
const fileCounts = [];

report.forEach(file => {
  if (file.errorCount > 0) {
    fileCounts.push({ path: file.filePath, count: file.errorCount });
    file.messages.forEach(msg => {
      const ruleId = msg.ruleId || 'unknown';
      ruleCounts[ruleId] = (ruleCounts[ruleId] || 0) + 1;
    });
  }
});

// Sort by count
const sortedRules = Object.entries(ruleCounts)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 20);

const sortedFiles = fileCounts.sort((a, b) => b.count - a.count).slice(0, 20);

console.log('--- Top 20 Rules ---');
sortedRules.forEach(([rule, count]) => console.log(`${count}: ${rule}`));

console.log('\n--- Top 20 Files ---');
sortedFiles.forEach(file => console.log(`${file.count}: ${file.path}`));
