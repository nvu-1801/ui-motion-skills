# Requires PowerShell 7+. Export is separate from skill installation; existing files are never overwritten.
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)][string]$Target,
    [ValidateSet('web','python')][string]$Profile = 'web',
    [ValidateSet('Core','CI','Sonar','CodeRabbit','Reviewdog','Semgrep','UI','UIRegistry','Secrets','Deploy')][string[]]$Feature = @('Core')
)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot/package-helpers.ps1"
$targetRoot = Get-Item -LiteralPath $Target -Force
if (-not $targetRoot.PSIsContainer) { throw 'Target must be a directory.' }
$source = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../.agents/skills'))
$mapping = @{
    Core = @{ Source="quality-workflow/assets/templates/quality-$Profile.json"; Destination='quality.config.json' }
    CI = @{ Source="github-actions/assets/templates/ci-$Profile.yml"; Destination='.github/workflows/quality.yml' }
    Sonar = @{ Source='static-analysis/assets/templates/sonar.yml'; Destination='.github/workflows/sonar.yml' }
    CodeRabbit = @{ Source='static-analysis/assets/templates/coderabbit.yaml'; Destination='.coderabbit.yaml' }
    Reviewdog = @{ Source='static-analysis/assets/templates/reviewdog.yaml'; Destination='.reviewdog.yml' }
    Semgrep = @{ Source='static-analysis/assets/templates/semgrep.yml'; Destination='.quality/semgrep.yml' }
    UI = @{ Source='ui-visual-qa/assets/templates/quality.spec.ts'; Destination='tests/quality.spec.ts' }
    UIRegistry = @{ Source='ui-system-reuse/assets/templates/sources.json'; Destination='docs/ui-system/sources.json' }
    Secrets = @{ Source='static-analysis/assets/templates/quality-secrets.json'; Destination='quality.secrets.config.json' }
    Deploy = @{ Source='release-deploy/assets/templates/deploy.yml'; Destination='.github/workflows/deploy.yml' }
}
$changes = @(
    foreach ($name in ($Feature | Select-Object -Unique)) {
        foreach ($pair in $mapping[$name]) {
            $inputFile = Join-Path $source $pair.Source
            $outputFile = Assert-SafePath $targetRoot.FullName (Join-Path $targetRoot.FullName $pair.Destination)
            if (-not (Test-Path -LiteralPath $inputFile -PathType Leaf)) { throw "Missing template: $inputFile" }
            $parent = [IO.Path]::GetDirectoryName($outputFile)
            while ($parent -and $parent -ne $targetRoot.FullName) {
                if (Test-Path -LiteralPath $parent -PathType Leaf) { throw "Parent is a file: $parent" }
                $parent = [IO.Path]::GetDirectoryName($parent)
            }
            if (Test-Path -LiteralPath $outputFile) {
                if ((Test-Path -LiteralPath $outputFile -PathType Leaf) -and
                    (Get-FileHash -LiteralPath $inputFile).Hash -eq (Get-FileHash -LiteralPath $outputFile).Hash) { continue }
                throw "Existing file differs; merge manually: $outputFile"
            }
            [pscustomobject]@{ Source=$inputFile; Destination=$outputFile }
        }
    }
)
foreach ($change in $changes) {
    if ($PSCmdlet.ShouldProcess($change.Destination, 'Export starter template (review before use)')) {
        [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($change.Destination)) | Out-Null
        Copy-Item -LiteralPath $change.Source -Destination $change.Destination
        Write-Output "Exported $($change.Destination)"
    }
}
