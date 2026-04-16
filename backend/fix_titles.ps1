$path = "C:\Users\USER\OneDrive\Desktop\Classified ads\backend\database\seeders\NigerianMarketplaceSeeder.php"
$content = Get-Content $path -Raw

# Fix the pattern: 'title' => 'Some Title - Subtitle,\n                'description'
# This captures titles that are unclosed (missing the closing quote before the comma)
$pattern = "'title' => '([^']+),`r?`n\s+'description'"
$fixed = $content -replace $pattern, "'title' => `$1',`r`n                'description'"

if ($content -eq $fixed) {
    Write-Host "No changes made - pattern not found"
} else {
    Set-Content -Path $path -Value $fixed -NoNewline
    Write-Host "Fixed titles with unclosed quotes"
}
