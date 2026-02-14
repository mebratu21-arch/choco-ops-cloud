# PowerShell script to fix all import paths in backend routes

$routesPath = "src\routes"

# Fix admin routes (controller is in root controllers folder)
$adminRoutesFile = "$routesPath\system\admin.routes.ts"
if (Test-Path $adminRoutesFile) {
    (Get-Content $adminRoutesFile -Raw) `
        -replace "from '\.\./.*/admin\.controller\.js'", "from '../../controllers/admin.controller.js'" `
        | Set-Content $adminRoutesFile -NoNewline
    Write-Host "Fixed: admin.routes.ts"
}

# Fix audit routes (controller is in root controllers folder)  
$auditRoutesFile = "$routesPath\system\audit.routes.ts"
if (Test-Path $auditRoutesFile) {
    (Get-Content $auditRoutesFile -Raw) `
        -replace "from '\.\./.*/audit\.controller\.js'", "from '../../controllers/audit.controller.js'" `
        | Set-Content $auditRoutesFile -NoNewline
    Write-Host "Fixed: audit.routes.ts"
}

Write-Host "All import paths fixed!"
