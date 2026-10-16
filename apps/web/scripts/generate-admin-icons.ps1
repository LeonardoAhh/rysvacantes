Add-Type -AssemblyName System.Drawing

$assetRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "../public"))
$variants = @(
  @{ Source = "icon-192.png"; Target = "admin-icon-192.png" },
  @{ Source = "icon-512.png"; Target = "admin-icon-512.png" },
  @{ Source = "icon-maskable-512.png"; Target = "admin-icon-maskable-512.png" },
  @{ Source = "apple-touch-icon.png"; Target = "admin-apple-touch-icon.png" }
)

foreach ($variant in $variants) {
  $sourcePath = Join-Path $assetRoot $variant.Source
  $targetPath = Join-Path $assetRoot $variant.Target
  $source = [System.Drawing.Image]::FromFile($sourcePath)
  $bitmap = New-Object System.Drawing.Bitmap($source.Width, $source.Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $ink = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, 20, 20))
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)

  try {
    $size = $bitmap.Width
    $badgeSize = [int][Math]::Round($size * 0.23)
    $badgeOffset = [int][Math]::Round($size * 0.66)
    $tileSize = [int][Math]::Round($size * 0.035)
    $tileGap = [int][Math]::Round($size * 0.016)
    $gridSize = 2 * $tileSize + $tileGap
    $gridOffset = $badgeOffset + [int][Math]::Round(($badgeSize - $gridSize) / 2)

    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.DrawImage($source, 0, 0, $size, $size)
    $graphics.FillEllipse($ink, $badgeOffset, $badgeOffset, $badgeSize, $badgeSize)

    for ($row = 0; $row -lt 2; $row++) {
      for ($column = 0; $column -lt 2; $column++) {
        $x = $gridOffset + $column * ($tileSize + $tileGap)
        $y = $gridOffset + $row * ($tileSize + $tileGap)
        $graphics.FillRectangle($white, $x, $y, $tileSize, $tileSize)
      }
    }

    $bitmap.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $white.Dispose()
    $ink.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
    $source.Dispose()
  }
}
