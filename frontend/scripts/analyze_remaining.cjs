const fs = require('fs');
const path = require('path');

const reportFile = 'remaining_lint.json';
if (!fs.existsSync(reportFile)) {
    console.error('Report file not found');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
const filesWithErrors = data.filter(f => f.errorCount > 0);

console.log(`Total files with errors: ${filesWithErrors.length}`);

const sortedFiles = filesWithErrors.sort((a, b) => b.errorCount - a.errorCount);

console.log('\nTop offenders:');
sortedFiles.slice(0, 15).forEach(f => {
    const relativePath = path.relative(process.cwd(), f.filePath);
    console.log(`${relativePath}: ${f.errorCount} errors`);
});
