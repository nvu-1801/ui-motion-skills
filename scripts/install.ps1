[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)]
    [string]$Target,
    [string[]]$Skill
)

$ErrorActionPreference = 'Stop'
$source = Join-Path $PSScriptRoot '../.agents/skills'
$targetRoot = Get-Item -LiteralPath $Target
if (-not $targetRoot.PSIsContainer) { throw 'Target must be a directory.' }

$destination = $targetRoot.FullName
foreach ($segment in '.agents', 'skills') {
    $destination = Join-Path $destination $segment
    if (Test-Path -LiteralPath $destination) {
        $directory = Get-Item -LiteralPath $destination -Force
        if (-not $directory.PSIsContainer -or ($directory.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
            throw "Unsafe destination directory: $destination"
        }
    }
}

$available = Get-ChildItem -LiteralPath $source -Directory
if (-not $Skill) { $Skill = $available.Name }

$updates = foreach ($name in ($Skill | Select-Object -Unique)) {
    if ($name -cnotin $available.Name) { throw "Unknown skill: $name" }
    $folder = Join-Path $destination $name
    $entry = Join-Path $folder 'SKILL.md'
    $marker = Join-Path $folder '.ui-motion-skills.sha256'
    $inputFile = Join-Path $source "$name/SKILL.md"
    $hash = (Get-FileHash -LiteralPath $inputFile).Hash
    if (Test-Path -LiteralPath $folder) {
        $existing = Get-Item -LiteralPath $folder -Force
        if (-not $existing.PSIsContainer -or ($existing.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
            throw "Unsafe skill path: $folder"
        }
        foreach ($path in $entry, $marker) {
            if (-not (Test-Path -LiteralPath $path -PathType Leaf) -or
                ((Get-Item -LiteralPath $path -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) {
                throw "Skill directory is unmanaged or incomplete: $folder"
            }
        }
        $installedHash = (Get-FileHash -LiteralPath $entry).Hash
        $managedHash = (Get-Content -LiteralPath $marker -Raw).Trim()
        if ($installedHash -ne $managedHash) { throw "Skill has local changes: $entry" }
        if ($installedHash -eq $hash) { continue }
    }
    [pscustomobject]@{ Folder = $folder; Entry = $entry; Marker = $marker; Source = $inputFile; Hash = $hash }
}

foreach ($update in $updates) {
    if ($PSCmdlet.ShouldProcess($update.Entry, 'Install or update skill')) {
        [IO.Directory]::CreateDirectory($update.Folder) | Out-Null
        Copy-Item -LiteralPath $update.Source -Destination $update.Entry -Force
        Set-Content -LiteralPath $update.Marker -Value $update.Hash -Encoding ascii
    }
}
