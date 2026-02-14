# Master Fix Script for Backend Imports
Write-Host "Applying Master Fix for Backend Imports..."

$files = Get-ChildItem -Path "src" -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # Fix Config Imports
    $content = $content -replace "from '\.\./\.\.//database\.js'", "from '../../config/database.js'"
    $content = $content -replace "from '\.\./\.\.//logger\.js'", "from '../../config/logger.js'"
    $content = $content -replace "from '\.\./\.\.//redis\.js'", "from '../../config/redis.js'"
    $content = $content -replace "from '\.\./\.\.//env\.js'", "from '../../config/env.js'"
    
    # Fix Utils Imports
    $content = $content -replace "from '\.\./\.\.//errors\.js'", "from '../../utils/errors.js'"
    $content = $content -replace "from '\.\./\.\.//audit\.js'", "from '../../utils/audit.js'"
    
    # Fix Types Imports
    $content = $content -replace "from '\.\./\.\.//domain\.types\.js'", "from '../../types/domain.types.js'"
    $content = $content -replace "from '\.\./\.\.//inventory\.types\.js'", "from '../../types/inventory.types.js'"
    $content = $content -replace "from '\.\./\.\.//mechanics\.types\.js'", "from '../../types/mechanics.types.js'"
    
    # Fix Repository Imports in Services (../..//MODULE/FILE.repository.js -> ../../repositories/MODULE/FILE.repository.js)
    $content = $content -replace "from '\.\./\.\.//([^/]+)/([^']+)\.repository\.js'", "from '../../repositories/`$1/`$2.repository.js'"
    
    if ($content -ne $original) {
        Set-Content $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "Master Fix Complete!"
