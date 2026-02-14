# Simple and effective backend import path fix
Write-Host "Fixing all backend import paths..."

# Fix controllers - simple double-slash removal
Get-ChildItem -Path "src\controllers" -Recurse -Filter "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    # Replace ../..// with ../../services/
    $content = $content -replace "from '\.\./(\.\.)?//", "from '../../services/"
    # Replace ../../config files
    $content = $content -replace "from '\.\./(\.\.)?//(database|redis|logger|env|socket)\.js'", "from '../../config/`$2.js'"
    
    Set-Content $_.FullName -Value $content -NoNewline
}

# Fix routes - ensure correct paths
Get-ChildItem -Path "src\routes" -Recurse -Filter "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    # Replace ../..// with ../../
    $content = $content -replace "from '\.\./(\.\.)?//", "from '../../"
    
    Set-Content $_.FullName -Value $content -NoNewline
}

Write-Host "Fixed all imports!"
