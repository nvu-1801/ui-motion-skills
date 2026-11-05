$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$work = Join-Path $root ('.cache/tests/installer-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $work -Force | Out-Null
$install = Join-Path $root 'scripts/install.ps1'
$export = Join-Path $root 'scripts/export-quality-config.ps1'
$count = 0
function Assert([bool]$Condition, [string]$Message) { if (-not $Condition) { throw $Message } }
function Expect-Failure([scriptblock]$Action, [string]$Pattern) {
    try { & $Action; throw 'Expected a failure but operation succeeded' }
    catch { if ($_.Exception.Message -notmatch $Pattern) { throw } }
}
function New-Target([string]$Name) { $p = Join-Path $work $Name; New-Item -ItemType Directory -Path $p -Force | Out-Null; return $p }

$target = New-Target 'selected'
& $install -Target $target -Skill quality-workflow,ui-visual-qa -WhatIf
Assert (-not (Test-Path (Join-Path $target '.agents'))) 'WhatIf wrote files'
$count++
& $install -Target $target -Skill quality-workflow,ui-visual-qa
$folder = Join-Path $target '.agents/skills/quality-workflow'
Assert (Test-Path (Join-Path $folder 'scripts/check.py')) 'Nested runner not installed'
Assert (-not (Test-Path (Join-Path $folder 'scripts/__pycache__'))) 'Runtime cache was packaged'
Assert (Test-Path (Join-Path $folder 'assets/schemas/finding.schema.json')) 'Nested schema not installed'
Assert (-not (Test-Path (Join-Path $target '.agents/skills/release-deploy'))) 'Unselected skill installed'
$manifest = Join-Path $folder '.ui-motion-skills.manifest.json'
$before = (Get-Item $manifest).LastWriteTimeUtc
& $install -Target $target -Skill quality-workflow,ui-visual-qa
Assert ((Get-Item $manifest).LastWriteTimeUtc -eq $before) 'Idempotent install rewrote manifest'
$count++
Set-Content (Join-Path $folder 'personal.txt') 'user-owned'
& $install -Target $target -Skill quality-workflow
Assert ((Get-Content (Join-Path $folder 'personal.txt')) -eq 'user-owned') 'User file was changed'
Add-Content (Join-Path $folder 'scripts/check.py') '# local edit'
Expect-Failure { & $install -Target $target -Skill bug-reproduction,quality-workflow } 'modified or missing'
Assert (-not (Test-Path (Join-Path $target '.agents/skills/bug-reproduction'))) 'Preflight wrote a different skill before detecting conflict'
$count++

$legacyTarget = New-Target 'legacy'
$legacyFolder = Join-Path $legacyTarget '.agents/skills/bug-reproduction'
New-Item -ItemType Directory -Path $legacyFolder -Force | Out-Null
Set-Content (Join-Path $legacyFolder 'SKILL.md') 'previous managed entrypoint'
(Get-FileHash (Join-Path $legacyFolder 'SKILL.md')).Hash | Set-Content (Join-Path $legacyFolder '.ui-motion-skills.sha256')
& $install -Target $legacyTarget -Skill bug-reproduction
Assert (Test-Path (Join-Path $legacyFolder '.ui-motion-skills.manifest.json')) 'Legacy manifest not migrated'
$count++

$badTarget = New-Target 'unmanaged'
New-Item -ItemType Directory -Path (Join-Path $badTarget '.agents/skills/bug-reproduction') -Force | Out-Null
Expect-Failure { & $install -Target $badTarget -Skill bug-reproduction } 'Unmanaged'
Expect-Failure { & $install -Target $badTarget -Skill '../outside' } 'Unknown skill'
$count++

$exportTarget = New-Target 'export'
& $export -Target $exportTarget -Profile python -Feature Core,CI,Sonar,CodeRabbit,Reviewdog,Semgrep,UI,UIRegistry,Secrets,Deploy -WhatIf
Assert (@(Get-ChildItem $exportTarget -Force).Count -eq 0) 'Export WhatIf wrote files'
& $export -Target $exportTarget -Profile python -Feature Core,CI,Sonar,CodeRabbit,Reviewdog,Semgrep,UI,UIRegistry,Secrets,Deploy
Assert (Test-Path (Join-Path $exportTarget 'quality.config.json')) 'Config missing'
Assert (Test-Path (Join-Path $exportTarget '.github/workflows/quality.yml')) 'CI missing'
& $export -Target $exportTarget -Profile python -Feature Core,CI
Add-Content (Join-Path $exportTarget 'quality.config.json') 'local'
Expect-Failure { & $export -Target $exportTarget -Profile python -Feature Core } 'Existing file differs'
$count++

# A poisoned manifest cannot delete a file outside the package.
$escapeTarget = New-Target 'escape'
& $install -Target $escapeTarget -Skill bug-reproduction
$escapeFolder = Join-Path $escapeTarget '.agents/skills/bug-reproduction'
$escapeManifest = Join-Path $escapeFolder '.ui-motion-skills.manifest.json'
$data = Get-Content $escapeManifest -Raw | ConvertFrom-Json -AsHashtable
$data.files['../../outside.txt'] = 'a' * 64
$data | ConvertTo-Json -Depth 8 | Set-Content $escapeManifest
Expect-Failure { & $install -Target $escapeTarget -Skill bug-reproduction } 'Unsafe manifest path'
$count++

# An obsolete owned file is removed; additional user files survive the update.
$updateTarget = New-Target 'obsolete'
& $install -Target $updateTarget -Skill bug-reproduction
$updateFolder = Join-Path $updateTarget '.agents/skills/bug-reproduction'
$updateManifest = Join-Path $updateFolder '.ui-motion-skills.manifest.json'
Set-Content (Join-Path $updateFolder 'obsolete.txt') 'managed old file'
Set-Content (Join-Path $updateFolder 'personal.txt') 'keep me'
$data = Get-Content $updateManifest -Raw | ConvertFrom-Json -AsHashtable
$data.files['obsolete.txt'] = (Get-FileHash (Join-Path $updateFolder 'obsolete.txt')).Hash
$data | ConvertTo-Json -Depth 8 | Set-Content $updateManifest
& $install -Target $updateTarget -Skill bug-reproduction
Assert (-not (Test-Path (Join-Path $updateFolder 'obsolete.txt'))) 'Obsolete managed file survived'
Assert (Test-Path (Join-Path $updateFolder 'personal.txt')) 'Personal file was removed'
$count++

# Junctions are available without developer-mode symbolic-link privileges on Windows.
if ($IsWindows) {
    $linkTarget = New-Target 'linked'
    $outside = New-Target 'outside'
    New-Item -ItemType Junction -Path (Join-Path $linkTarget '.agents') -Target $outside | Out-Null
    Expect-Failure { & $install -Target $linkTarget -Skill bug-reproduction } 'Symlink or junction'
    Expect-Failure { & $export -Target $linkTarget -Feature Core,UI -WhatIf; & $install -Target (Join-Path $linkTarget '.agents') -Skill bug-reproduction } 'Symlink or junction'
    $count++
} else {
    $linkTarget = New-Target 'linked'
    $outside = New-Target 'outside'
    New-Item -ItemType SymbolicLink -Path (Join-Path $linkTarget '.agents') -Target $outside | Out-Null
    Expect-Failure { & $install -Target $linkTarget -Skill bug-reproduction } 'Symlink or junction'
    $count++
}
$reuseTarget = New-Target 'ui-reuse-alone'
& $install -Target $reuseTarget -Skill ui-system-reuse
$reuseFolder = Join-Path $reuseTarget '.agents/skills/ui-system-reuse'
Assert (Test-Path (Join-Path $reuseFolder 'scripts/registry.py')) 'Standalone registry helper missing'
Assert (Test-Path (Join-Path $reuseFolder 'assets/schemas/sources.schema.json')) 'Standalone registry schema missing'
Assert (@(Get-ChildItem (Join-Path $reuseTarget '.agents/skills') -Directory).Count -eq 1) 'Standalone install pulled unrelated skills'
$count++
Write-Output "PASS: $count installer/export scenarios; artifacts: $work"
