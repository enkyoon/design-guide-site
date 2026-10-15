param(
  # 처리할 목록: "slug=원본파일=가로위치=위쪽여백" (가로위치 0=왼쪽 기준, 0.5=가운데, 1=오른쪽 기준 / 위쪽여백: 광고 띠 등을 건너뛸 원본 픽셀 수, 생략하면 0)
  [Parameter(Mandatory = $true)][string[]]$Items,
  [string]$InDir = "captures",
  [string]$OutDir = "site/assets/previews",
  [int]$Quality = 82
)
# 사용자가 찍은 첫 화면 캡처를 16:10으로 잘라(위쪽 기준) 960x600 JPG로 저장한다.
# 예) powershell -ExecutionPolicy Bypass -File tools\make-previews.ps1 -Items "chanel=chanel.png=0.5","fritz=스크린샷 1.png=0"
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq "image/jpeg"
$prm = New-Object System.Drawing.Imaging.EncoderParameters 1
$prm.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)

foreach ($item in $Items) {
  $slug, $file, $pos, $top = $item -split "=", 4
  if (-not $pos) { $pos = "0.5" }
  $top = if ($top) { [int]$top } else { 0 }
  $src = [System.Drawing.Image]::FromFile((Join-Path (Join-Path $root $InDir) $file))
  try {
    # 16:10 영역 계산: 가로가 넓으면 가로를 자르고, 세로가 길면 위쪽부터 쓴다
    $cw = [Math]::Min($src.Width, [int][Math]::Round(($src.Height - $top) * 16 / 10))
    $ch = [int][Math]::Round($cw * 10 / 16)
    $cx = [int][Math]::Round(($src.Width - $cw) * [double]$pos)
    $bmp = New-Object System.Drawing.Bitmap 960, 600
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = "HighQualityBicubic"
    $g.PixelOffsetMode = "HighQuality"
    $g.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, 960, 600), (New-Object System.Drawing.Rectangle $cx, $top, $cw, $ch), "Pixel")
    $out = Join-Path (Join-Path $root $OutDir) "$slug.jpg"
    $bmp.Save($out, $enc, $prm)
    "{0}.jpg  ({1}KB)" -f $slug, [int]((Get-Item $out).Length / 1KB)
    $g.Dispose(); $bmp.Dispose()
  } finally { $src.Dispose() }
}
