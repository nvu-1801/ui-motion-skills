# Requires PowerShell 7+.
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)][string]$Target,
    [string[]]$Skill
)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot/package-helpers.ps1"
$source = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../.agents/skills'))
$targetRoot = Get-Item -LiteralPath $Target -Force
if (-not $targetRoot.PSIsContainer) { throw 'Target must be a directory.' }
$destination = Join-Path $targetRoot.FullName '.agents/skills'
$null = Assert-SafePath $targetRoot.FullName $destination
$available = @(Get-ChildItem -LiteralPath $source -Directory -Force)
if (-not $Skill) { $Skill = $available.Name }
$updates = @(
    foreach ($name in ($Skill | Select-Object -Unique)) {
        if ($name -cnotin $available.Name) { throw "Unknown skill: $name" }
        $inputFolder = Join-Path $source $name
        $folder = Join-Path $destination $name
        $null = Assert-SafePath $targetRoot.FullName $folder
        if (Test-Path -LiteralPath $folder -PathType Leaf) { throw "Skill is not a directory: $folder" }
        $files = [ordered]@{}
        foreach ($file in Get-PackageFiles $inputFolder) {
            $relative = [IO.Path]::GetRelativePath($inputFolder, $file.FullName).Replace('\', '/')
            Assert-RelativeFile $relative
            $files[$relative] = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
        }
        if (-not $files.Contains('SKILL.md')) { throw "Missing SKILL.md: $name" }
        $manifest = Join-Path $folder '.ui-motion-skills.manifest.json'
        $legacy = Join-Path $folder '.ui-motion-skills.sha256'
        $old = @{}
        if (Test-Path -LiteralPath $folder) {
            # Walk without following links; extra user files remain untouched.
            $null = @(Get-PackageFiles $folder)
            if (Test-Path -LiteralPath $manifest -PathType Leaf) {
                $data = Get-Content -LiteralPath $manifest -Raw | ConvertFrom-Json -AsHashtable
                if ($data.version -ne 2 -or $data.skill -cne $name -or $data.files -isnot [System.Collections.IDictionary]) {
                    throw "Invalid package manifest: $manifest"
                }
                $old = $data.files
                if (-not $old.Contains('SKILL.md')) { throw "Manifest lacks SKILL.md: $manifest" }
            } elseif (Test-Path -LiteralPath $legacy -PathType Leaf) {
                $old = @{ 'SKILL.md' = (Get-Content -LiteralPath $legacy -Raw).Trim() }
            } else { throw "Unmanaged skill folder: $folder" }
            foreach ($key in $old.Keys) {
                Assert-RelativeFile $key
                if ($old[$key] -notmatch '^[a-fA-F0-9]{64}$') { throw "Invalid hash in $manifest" }
                $path = Assert-SafePath $targetRoot.FullName (Join-Path $folder $key)
                if (-not (Test-Path -LiteralPath $path -PathType Leaf) -or
                    (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash -ne $old[$key]) {
                    throw "Installed file is modified or missing: $path"
                }
            }
        }
        foreach ($key in $files.Keys) {
            $path = Assert-SafePath $targetRoot.FullName (Join-Path $folder $key)
            if (Test-Path -LiteralPath $path -PathType Container) { throw "File conflicts with directory: $path" }
            if ((Test-Path -LiteralPath $path) -and -not $old.Contains($key)) { throw "Unmanaged file conflict: $path" }
            # Parent may be an ordinary file rather than a directory.
            $parent = [IO.Path]::GetDirectoryName($path)
            while ($parent -and $parent -ne $folder) {
                if (Test-Path -LiteralPath $parent -PathType Leaf) { throw "Parent is a file: $parent" }
                $parent = [IO.Path]::GetDirectoryName($parent)
            }
        }
        $changed = -not (Test-Path -LiteralPath $manifest -PathType Leaf) -or $old.Count -ne $files.Count
        foreach ($key in $files.Keys) { if (-not $old.Contains($key) -or $old[$key] -ne $files[$key]) { $changed = $true } }
        if (-not $changed) { continue }
        [pscustomobject]@{ Name=$name; Folder=$folder; Source=$inputFolder; Files=$files; Old=$old; Manifest=$manifest }
    }
)
# All packages are preflighted before the first write. I/O errors can still leave a partial update.
foreach ($update in $updates) {
    if ($PSCmdlet.ShouldProcess($update.Folder, 'Install or update full skill package')) {
        [IO.Directory]::CreateDirectory($update.Folder) | Out-Null
        foreach ($key in $update.Old.Keys) {
            if (-not $update.Files.Contains($key)) {
                $obsolete = Assert-SafePath $targetRoot.FullName (Join-Path $update.Folder $key)
                Remove-Item -LiteralPath $obsolete
            }
        }
        foreach ($key in $update.Files.Keys) {
            if ($update.Old.Contains($key) -and $update.Old[$key] -eq $update.Files[$key]) { continue }
            $path = Assert-SafePath $targetRoot.FullName (Join-Path $update.Folder $key)
            [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($path)) | Out-Null
            Copy-Item -LiteralPath (Join-Path $update.Source $key) -Destination $path
        }
        $record = [ordered]@{ version=2; skill=$update.Name; files=$update.Files }
        Set-Content -LiteralPath $update.Manifest -Value ($record | ConvertTo-Json -Depth 8) -Encoding utf8
        Write-Output "Installed $($update.Name) ($($update.Files.Count) files)"
    }
}
