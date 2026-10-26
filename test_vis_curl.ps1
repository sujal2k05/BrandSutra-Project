$login = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"creator@novahome.com","password":"Creator@123"}'
$token = $login.token
Write-Host "Token acquired."

$res = & curl.exe -s -F "file=@d:\Hack_Project\test_visual.png" -F "marketingChannel=INSTAGRAM" -F "primaryColorHex=#6366F1" -F "secondaryColorHex=#8B5CF6" -H "Authorization: Bearer $token" http://localhost:8080/api/content/analyze-visual
Write-Host "Response:"
Write-Host $res
