# Test trying to register duplicate Admin
$adminBody = @{
    fullName = 'Sneaky Admin'
    email = 'sneaky.admin@nexus.com'
    password = 'Password@123'
    role = 'ADMIN'
    organizationId = 3
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/register' -Method POST -ContentType 'application/json' -Body $adminBody
    Write-Host "Admin registration succeeded (unexpected)"
} catch {
    Write-Host "Protection Working as Expected! Error message:"
    Write-Host $_.Exception.Message
}
