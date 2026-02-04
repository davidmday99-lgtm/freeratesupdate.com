# Secret scan (lightweight) — intended to be run before commits.
# Exits 1 if it finds anything that looks like a secret.

$ErrorActionPreference = 'SilentlyContinue'

$root = Split-Path -Parent $PSScriptRoot

$exclude = '(\\node_modules\\|\\.next\\|\\.git\\)'
$files = Get-ChildItem -Path $root -Recurse -File | Where-Object { $_.FullName -notmatch $exclude -and $_.Length -lt 3000000 }

$patterns = @(
  'sk-[A-Za-z0-9_-]{20,}',
  'AIzaSy[0-9A-Za-z_-]{20,}',
  'ghp_[A-Za-z0-9]{20,}',
  'github_pat_[A-Za-z0-9_]{20,}',
  'xoxb-[0-9A-Za-z-]{20,}'
)

$hits = @()
foreach ($p in $patterns) {
  $hits += ($files | Select-String -Pattern $p -AllMatches)
}

if ($hits.Count -gt 0) {
  Write-Host "Potential secrets found:" -ForegroundColor Red
  $hits | Select-Object -First 50 | ForEach-Object {
    $line = $_.Line
    $line = $line -replace 'sk-[A-Za-z0-9_-]{20,}', 'sk-REDACTED'
    $line = $line -replace 'AIzaSy[0-9A-Za-z_-]{20,}', 'AIzaSyREDACTED'
    $line = $line -replace 'ghp_[A-Za-z0-9]{20,}', 'ghp_REDACTED'
    $line = $line -replace 'github_pat_[A-Za-z0-9_]{20,}', 'github_pat_REDACTED'
    Write-Host ("{0}:{1}  {2}" -f $_.Path, $_.LineNumber, $line)
  }
  exit 1
}

Write-Host "No obvious secrets found." -ForegroundColor Green
exit 0
