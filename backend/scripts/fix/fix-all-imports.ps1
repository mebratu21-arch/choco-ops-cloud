# PowerShell script to fix ALL remaining backend import paths

Write-Host "Fixing all backend import paths..."

# Fix controller imports - they should all be ../../controllers/MODULE/CONTROLLER.js
Get-ChildItem -Path "src\routes" -Recurse -Filter "*.routes.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $modified = $false
    
    # Fix system controller imports
    if ($content -match "from '\.\./\.\./\.\./system/") {
        $content = $content -replace "from '\.\./\.\./\.\./system/([\w-]+)\.controller\.js'", "from '../../controllers/system/`$1.controller.js'"
        $modified = $true
    }
    
    # Fix sales controller imports
    if ($content -match "from '\.\./\.\./\.\./sales/") {
        $content = $content -replace "from '\.\./\.\./\.\./sales/([\w-]+)\.controller\.js'", "from '../../controllers/sales/`$1.controller.js'"
        $modified = $true
    }
    
    # Fix quality controller imports
    if ($content -match "from '\.\./\.\./\.\./quality/") {
        $content = $content -replace "from '\.\./\.\./\.\./quality/([\w-]+)\.controller\.js'", "from '../../controllers/quality/`$1.controller.js'"
        $modified = $true
    }
    
    # Fix production controller imports
    if ($content -match "from '\.\./\.\./\.\./production/") {
        $content = $content -replace "from '\.\./\.\./\.\./production/([\w-]+)\.controller\.js'", "from '../../controllers/production/`$1.controller.js'"
        $modified = $true
    }
    
    # Fix inventory controller imports
    if ($content -match "from '\.\./\.\./\.\./inventory/") {
        $content = $content -replace "from '\.\./\.\./\.\./inventory/([\w-]+)\.controller\.js'", "from '../../controllers/inventory/`$1.controller.js'"
        $modified = $true
    }
    
    # Fix schema imports - they should all be ../../schemas/index.js
    if ($content -match "from '\.\./\.\./\.\./index\.js'") {
        $content = $content -replace "from '\.\./\.\./\.\./index\.js'", "from '../../schemas/index.js'"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content $_.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($_.Name)"
    }
}

Write-Host "All import paths fixed!"
