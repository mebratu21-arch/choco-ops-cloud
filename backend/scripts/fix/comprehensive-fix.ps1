# Comprehensive Backend Import Path Fix Script
# This script fixes ALL import path issues systematically

Write-Host "=" * 60
Write-Host "COMPREHENSIVE BACKEND IMPORT PATH FIX"
Write-Host "=" * 60

$fixed = 0
$errors = 0

# Fix all files in controllers directory
Write-Host "`nFixing Controllers..."
Get-ChildItem -Path "src\controllers" -Recurse -Filter "*.ts" | ForEach-Object {
    try {
        $content = Get-Content $_.FullName -Raw
        $original = $content
        
        # Fix service imports: ../..//MODULE/FILE.service.js -> ../../services/MODULE/FILE.service.js
        $content = $content -replace "from '\.\./(\.\.)?/+([^']+)\.service\.js'", "from '../../services/`$2.service.js'"
        
        # Fix repository imports: ../..//MODULE/FILE.repository.js -> ../../repositories/MODULE/FILE.repository.js
        $content = $content -replace "from '\.\./(\.\.)?/+([^']+)\.repository\.js'", "from '../../repositories/`$2.repository.js'"
        
        # Fix config imports: ../..//FILE.js -> ../../config/FILE.js
        $content = $content -replace "from '\.\./(\.\.)?/+(database|redis|logger|env)\.js'", "from '../../config/`$1.js'"
        
        # Fix utils imports
        $content = $content -replace "from '\.\./(\.\.)?/+([^']+)\.js'", "from '../../utils/`$2.js'"
        
        if ($content -ne $original) {
            Set-Content $_.FullName -Value $content -NoNewline
            Write-Host "  ✓ Fixed: $($_.Name)" -ForegroundColor Green
            $fixed++
        }
    }
    catch {
        Write-Host "  ✗ Error fixing: $($_.Name)" -ForegroundColor Red
        $errors++
    }
}

# Fix all files in routes directory
Write-Host "`nFixing Routes..."
Get-ChildItem -Path "src\routes" -Recurse -Filter "*.ts" | ForEach-Object {
    try {
        $content = Get-Content $_.FullName -Raw
        $original = $content
        
        # Fix controller imports
        $content = $content -replace "from '\.\./(\.\.)?/+([^']+)\.controller\.js'", "from '../../controllers/`$2.controller.js'"
        
        # Fix middleware imports
        $content = $content -replace "from '\.\./(\.\.)?/+(auth|validate)\.middleware\.js'", "from '../../middleware/`$1.middleware.js'"
        
        # Fix schema imports
        $content = $content -replace "from '\.\./(\.\.)?/+[^']*schema[^']*\.js'", "from '../../schemas/index.js'"
        $content = $content -replace "from '\.\./(\.\.)?/+index\.js'", "from '../../schemas/index.js'"
        
        if ($content -ne $original) {
            Set-Content $_.FullName -Value $content -NoNewline
            Write-Host "  ✓ Fixed: $($_.Name)" -ForegroundColor Green
            $fixed++
        }
    }
    catch {
        Write-Host "  ✗ Error fixing: $($_.Name)" -ForegroundColor Red
        $errors++
    }
}

Write-Host "`n" + ("=" * 60)
Write-Host "SUMMARY: Fixed $fixed files, $errors errors" -ForegroundColor Cyan
Write-Host "=" * 60
