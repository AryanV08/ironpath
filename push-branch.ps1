$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$branch = 'feature/session-history-and-sensor-assets'

git checkout -b $branch 2>$null
if ($LASTEXITCODE -ne 0) { git checkout $branch }

git add -A
git reset HEAD -- node_modules 2>$null
Get-ChildItem -Recurse -Filter '.env' -ErrorAction SilentlyContinue | ForEach-Object {
  git reset HEAD -- $_.FullName.Substring($PWD.Path.Length + 1) 2>$null
}

$status = git status --short
if (-not $status) {
  Write-Host 'Nothing to commit.'
  exit 0
}

git commit -m @"
Add persistent demo session and workout history

- Keep sample previous session while saving last workout separately
- Persist last workout in localStorage with rep breakdown and tips
- Sensor clothing product image wiring and session UI updates
- Workout flow and form tracking improvements
"@

git push -u origin HEAD
git status -sb
git log -1 --oneline
