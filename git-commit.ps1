$ErrorActionPreference = 'Continue'
Set-Location $PSScriptRoot
$log = Join-Path $PSScriptRoot 'git-commit-result.txt'

function Log($msg) {
  $line = "$(Get-Date -Format 'HH:mm:ss') $msg"
  Add-Content -Path $log -Value $line
  Write-Output $line
}

Set-Content -Path $log -Value "=== git commit run ==="

Log "PWD: $(Get-Location)"
Log "GIT: $(git --version 2>&1 | Out-String).Trim()"

Log "--- status ---"
git status -sb 2>&1 | ForEach-Object { Log $_ }

Log "--- branch ---"
git branch -vv 2>&1 | ForEach-Object { Log $_ }

$branch = git branch --show-current 2>&1
Log "Current branch: $branch"

if (-not $branch -or $branch -match 'fatal') {
  Log "ERROR: could not determine branch"
  exit 1
}

git add -A 2>&1 | ForEach-Object { Log "add: $_" }
git reset HEAD -- node_modules 2>&1 | Out-Null
git reset HEAD -- dist 2>&1 | Out-Null
git reset HEAD -- git-commit-result.txt 2>&1 | Out-Null
git reset HEAD -- git-diagnosis.log 2>&1 | Out-Null
git reset HEAD -- git-commit.ps1 2>&1 | Out-Null
git reset HEAD -- push-branch.ps1 2>&1 | Out-Null
git reset HEAD -- shell-test.txt 2>&1 | Out-Null

Log "--- staged ---"
git diff --cached --stat 2>&1 | ForEach-Object { Log $_ }

$porcelain = git status --porcelain 2>&1
$toCommit = git diff --cached --name-only 2>&1
if (-not $toCommit) {
  Log "Nothing staged to commit."
  exit 0
}

$msg = @"
Update How It Works assets, logo, and product images

- Use layout PNGs for shirt, mirror, and earbuds on How It Works
- Replace CSS logo with logo.png and readable gym-style wordmark
- Improve mirror card sizing and logo contrast styling
"@

git commit -m $msg 2>&1 | ForEach-Object { Log $_ }
if ($LASTEXITCODE -ne 0) {
  Log "ERROR: commit failed with exit $LASTEXITCODE"
  exit $LASTEXITCODE
}

Log "--- after commit ---"
git log -1 --oneline 2>&1 | ForEach-Object { Log $_ }
git status -sb 2>&1 | ForEach-Object { Log $_ }

Log "--- push ---"
git push origin $branch 2>&1 | ForEach-Object { Log $_ }
Log "Push exit: $LASTEXITCODE"

Log "DONE"
