Add-Type -AssemblyName System.Drawing

$testPath = "d:\Hack_Project\test_visual.png"
if (-not (Test-Path $testPath)) {
    $bmp = New-Object System.Drawing.Bitmap 1080, 1080
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(99, 102, 241))
    $graphics.FillRectangle($brush, 0, 0, 1080, 1080)
    $bmp.Save($testPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bmp.Dispose()
}

$login = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"creator@novahome.com","password":"Creator@123"}'
$token = $login.token

$form = @{
    file = Get-Item $testPath
    marketingChannel = 'INSTAGRAM'
    primaryColorHex = '#6366F1'
    secondaryColorHex = '#8B5CF6'
}

$res = Invoke-RestMethod -Uri "http://localhost:8080/api/content/analyze-visual" -Method POST -Headers @{ Authorization = "Bearer $token" } -Form $form
Write-Host "Visual Brand Analysis Result from Spring Boot Backend:"
$res | ConvertTo-Json -Depth 5
