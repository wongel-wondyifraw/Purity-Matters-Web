Add-Type -AssemblyName System.Drawing

$iconsDir = Join-Path $PSScriptRoot "..\public\icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
}

function Create-AppIcon {
    param (
        [int]$size,
        [string]$outputPath,
        [bool]$isMaskable = $false
    )

    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background: #202328 Dark Charcoal
    $bgColor = [System.Drawing.Color]::FromArgb(32, 35, 40)
    $bgBrush = New-Object System.Drawing.SolidBrush $bgColor
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)

    # Gold Accent: #F6CE46
    $goldColor = [System.Drawing.Color]::FromArgb(246, 206, 70)
    $goldBrush = New-Object System.Drawing.SolidBrush $goldColor

    # Draw Center Golden Brand Shield/Circle
    $margin = [int]($size * 0.18)
    $diameter = $size - ($margin * 2)
    $g.FillEllipse($goldBrush, $margin, $margin, $diameter, $diameter)

    # Inner Dark Charcoal Monogram: "PM"
    $fontSize = [float]($size * 0.32)
    $font = [System.Drawing.Font]::new("Arial", [float]$fontSize, [System.Drawing.FontStyle]::Bold)

    $text = "PM"
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center

    $textRect = New-Object System.Drawing.RectangleF 0, 0, $size, $size
    $g.DrawString($text, $font, $bgBrush, $textRect, $stringFormat)

    # Save PNG
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $font.Dispose()
    $stringFormat.Dispose()
    $goldBrush.Dispose()
    $bgBrush.Dispose()
    $g.Dispose()
    $bmp.Dispose()
}

Create-AppIcon -size 192 -outputPath (Join-Path $iconsDir "icon-192x192.png")
Create-AppIcon -size 512 -outputPath (Join-Path $iconsDir "icon-512x512.png")
Create-AppIcon -size 512 -outputPath (Join-Path $iconsDir "icon-maskable-512x512.png") -isMaskable $true
Create-AppIcon -size 180 -outputPath (Join-Path $iconsDir "apple-touch-icon.png")

Write-Output "Generated PWA icons successfully in $iconsDir"
