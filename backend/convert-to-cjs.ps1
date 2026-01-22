# Convert TypeScript migrations to CommonJS
Write-Host "🔄 Converting TypeScript migrations to CommonJS..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "migrations\*.cjs" -File
$totalFiles = $files.Count
$current = 0

foreach ($file in $files) {
    $current++
    Write-Host "[$current/$totalFiles] Converting $($file.Name)..." -ForegroundColor Yellow
    
    $content = Get-Content $file.FullName -Raw
    
    # Remove TypeScript imports
    $content = $content -replace "import \{ Knex \} from 'knex';`r?`n", ""
    $content = $content -replace "import type \{ Knex \} from 'knex';`r?`n", ""
    
    # Convert export async function up to exports.up
    $content = $content -replace "export async function up\(knex: Knex\): Promise<void> \{", "exports.up = async function(knex) {"
    
    # Convert export async function down to exports.down
    $content = $content -replace "export async function down\(knex: Knex\): Promise<void> \{", "exports.down = async function(knex) {"
    
    # Fix closing braces
    $content = $content -replace "`r?`n\}`r?`n`r?`nexport async function down", "};`r`n`r`nexports.down = async function(knex) {"
    $content = $content -replace "`r?`n\}`r?`n$", "};`r`n"
    
    # Write back
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

# Convert seed file
Write-Host "`n🌱 Converting seed file..." -ForegroundColor Cyan
$seedFile = "seeds\demo-data.cjs"
if (Test-Path $seedFile) {
    $content = Get-Content $seedFile -Raw
    
    # Remove imports
    $content = $content -replace "import \{ Knex \} from 'knex';`r?`n", ""
    $content = $content -replace "import bcrypt from 'bcryptjs';`r?`n", ""
    $content = $content -replace "import type \{ Knex \} from 'knex';`r?`n", ""
    
    # Add requires at top
    $requires = "const bcrypt = require('bcryptjs');`r`n`r`n"
    $content = $content -replace "^(// .*`r?`n)+", "`$0$requires"
    
    # Convert export async function seed
    $content = $content -replace "export async function seed\(knex: Knex\): Promise<void> \{", "exports.seed = async function(knex) {"
    
    # Fix closing brace
    $content = $content -replace "`r?`n\}`r?`n$", "};`r`n"
    
    Set-Content -Path $seedFile -Value $content -NoNewline
    Write-Host "✅ Seed file converted" -ForegroundColor Green
}

Write-Host "`n✅ All files converted to CommonJS!" -ForegroundColor Green
Write-Host "📊 Run: npm run migrate:latest" -ForegroundColor Cyan
