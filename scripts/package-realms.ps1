# PIXENS Realms — packaging for launcher-managed install/update.
# Takes the verified "Pixens Realms" bundle, emits a versioned zip + a
# manifest the launcher reads (realms.state / installOrUpdate).
# Local + deterministic — produces artifacts in staging/, deploys NOTHING.
#
#   powershell -File scripts/package-realms.ps1
#       [-BundleDir "C:\pixens-build\out\Pixens Realms"]
#       [-OutDir   "D:\PixensLauncher\staging"]
#       [-BaseUrl  "https://pixens.io/launcher/realms"]

param(
  [string]$BundleDir = "C:\pixens-build\out\Pixens Realms",
  [string]$OutDir    = "D:\PixensLauncher\staging",
  [string]$BaseUrl   = "https://pixens.io/launcher/realms"
)
$ErrorActionPreference = 'Stop'

$exe = Join-Path $BundleDir "bin\PixensRealms.exe"
if (-not (Test-Path $exe)) { throw "PixensRealms.exe not found at $exe" }
$ver = (Get-Item $exe).VersionInfo.FileVersion
if ([string]::IsNullOrWhiteSpace($ver)) { $ver = "5.16.1" }

New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
$zip = Join-Path $OutDir ("realms-{0}.zip" -f $ver)
if (Test-Path $zip) { Remove-Item -LiteralPath $zip -Force }

Write-Output "packaging Realms $ver ..."
Compress-Archive -Path (Join-Path $BundleDir '*') -DestinationPath $zip -CompressionLevel Optimal

$hash = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLower()
$size = (Get-Item $zip).Length
$manifest = [ordered]@{
  version  = $ver
  file     = [System.IO.Path]::GetFileName($zip)
  url      = "$BaseUrl/" + [System.IO.Path]::GetFileName($zip)
  sha256   = $hash
  size     = $size
  released = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
}
$mfPath = Join-Path $OutDir "realms-latest.json"
($manifest | ConvertTo-Json) | Out-File -LiteralPath $mfPath -Encoding utf8

Write-Output ("zip      : {0} ({1:N1} MB)" -f $zip, ($size/1MB))
Write-Output ("sha256   : {0}" -f $hash)
Write-Output ("manifest : {0}" -f $mfPath)
Write-Output "--- realms-latest.json ---"
Get-Content -LiteralPath $mfPath -Raw
Write-Output "NOTE: upload both files to $BaseUrl/ (Cloudflare) when going live. Nothing deployed."
