param(
  [string]$BackupRoot = "C:\Backups\ClassifiedAds",
  [switch]$WithDatabase
)

$date = Get-Date -Format "yyyy-MM-dd-HHmm"
$projectRoot = Split-Path -Parent $PSScriptRoot
$backupDir = Join-Path $BackupRoot $date

Write-Host "=== iList Marketplace Backup ===" -ForegroundColor Cyan
Write-Host "Date: $date" -ForegroundColor Gray
Write-Host ""

# 1. Create backup directory
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# 2. Git commit & push
Write-Host "[1/4] Pushing to Git..." -ForegroundColor Yellow
Push-Location $projectRoot
git add -A
git commit --allow-empty -m "chore: auto-backup $date"
git push origin $(git branch --show-current)
Pop-Location
Write-Host "  ✓ Done" -ForegroundColor Green

# 3. Archive project (exclude node_modules, vendor, .next)
Write-Host "[2/4] Archiving project..." -ForegroundColor Yellow
$archivePath = Join-Path $backupDir "project.zip"
Compress-Archive -Path "$projectRoot\*" -DestinationPath $archivePath -Force `
  -Exclude "node_modules", ".next", "vendor", ".git"
Write-Host "  ✓ Saved to $archivePath" -ForegroundColor Green

# 4. Export environment configs
Write-Host "[3/4] Backing up environment configs..." -ForegroundColor Yellow
if (Test-Path "$projectRoot\.env.local") {
  Copy-Item "$projectRoot\.env.local" "$backupDir\.env.local.backup"
}
if (Test-Path "$projectRoot\backend\.env") {
  Copy-Item "$projectRoot\backend\.env" "$backupDir\backend.env.backup"
}
Write-Host "  ✓ Done" -ForegroundColor Green

# 5. Database dump (optional)
if ($WithDatabase) {
  Write-Host "[4/4] Exporting database..." -ForegroundColor Yellow
  $dbDump = Join-Path $backupDir "database.sql"
  # Update connection details from your .env
  # mysqldump -u root -p classified_ads > $dbDump
  Write-Host "  ⚠ Uncomment mysqldump command in script" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Backup Complete ===" -ForegroundColor Cyan
Write-Host "Location: $backupDir" -ForegroundColor Green
