# Read the file
$content = Get-Content "C:\Users\USER\OneDrive\Desktop\Classified ads\backend\database\seeders\NigerianMarketplaceSeeder.php" -Raw

# Pattern: match title lines where the string isn't closed
# 'title' => 'Some title - subtitle,
# Should be: 'title' => 'Some title - subtitle',

# Find all occurrences where title => 'something, (unclosed string)
$pattern = "'title' => '([^']+),`r?`n\s+'description'"

# Replace with properly closed strings
$fixed = $content -replace $pattern, "'title' => `$1',`r`n                'description'"

# Also fix single occurrence without description on next line
$content | Out-Host

# Write back
Set-Content -Path "C:\Users\USER\OneDrive\Desktop\Classified ads\backend\database\seeders\NigerianMarketplaceSeeder.php" -Value $fixed -NoNewline

Write-Host "Done"
