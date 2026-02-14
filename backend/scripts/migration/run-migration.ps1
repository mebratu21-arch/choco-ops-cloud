$env:FORCE_COLOR = "1"
Write-Host "Running migrations..."
npx tsx node_modules/knex/bin/cli.js migrate:latest --knexfile .config/knexfile.ts 2>&1 | Tee-Object -FilePath "migration.log"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Migration Successful!"
}
else {
    Write-Host "Migration Failed with exit code $LASTEXITCODE"
    Get-Content migration.log -Tail 50
}
