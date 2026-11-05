Set-StrictMode -Version Latest

function Assert-SafePath([string]$Root, [string]$Path) {
    $base = [IO.Path]::GetFullPath($Root).TrimEnd([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar)
    $full = [IO.Path]::GetFullPath($Path)
    $comparison = if ($IsWindows) { [StringComparison]::OrdinalIgnoreCase } else { [StringComparison]::Ordinal }
    if ($full -ne $base -and -not $full.StartsWith($base + [IO.Path]::DirectorySeparatorChar, $comparison)) {
        throw "Path escapes target: $full"
    }
    # Inspect ancestors too: a target nested below a junction can escape the intended workspace.
    $item = $full
    while ($item) {
        if (Test-Path -LiteralPath $item) {
            if ((Get-Item -LiteralPath $item -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) {
                throw "Symlink or junction is not supported: $item"
            }
        }
        $parent = [IO.Path]::GetDirectoryName($item)
        if ($parent -eq $item) { break }
        $item = $parent
    }
    return $full
}

function Get-PackageFiles([string]$Root) {
    $null = Assert-SafePath $Root $Root
    foreach ($item in Get-ChildItem -LiteralPath $Root -Force) {
        if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Linked package entry: $($item.FullName)" }
        if ($item.PSIsContainer) {
            if ($item.Name -notin @('__pycache__', '.git', '.cache')) { Get-PackageFiles $item.FullName }
        }
        elseif ($item.Extension -notin @('.pyc', '.pyo')) { $item }
    }
}

function Assert-RelativeFile([string]$Path) {
    if ([string]::IsNullOrWhiteSpace($Path) -or $Path -match '(^[\\/]|[:\\]|(^|/)\.\.?(/|$)|//)' -or
        $Path -match '(^|/)(\.ui-motion-skills\.manifest\.json|\.ui-motion-skills\.sha256)$') {
        throw "Unsafe manifest path: $Path"
    }
}
