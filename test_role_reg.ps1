# Test Creator Registration
$creatorBody = @{
    fullName = 'David Creator'
    email = 'david.creator@nexus.com'
    password = 'Password@123'
    role = 'CONTENT_CREATOR'
    organizationId = 3
} | ConvertTo-Json

$res1 = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/register' -Method POST -ContentType 'application/json' -Body $creatorBody
Write-Host "Created Creator Account:"
Write-Host "  Name: $($res1.user.fullName) | Role: $($res1.user.role) | Org: $($res1.user.organizationName)"

# Test Reviewer Registration
$reviewerBody = @{
    fullName = 'Elena Reviewer'
    email = 'elena.reviewer@nexus.com'
    password = 'Password@123'
    role = 'REVIEWER'
    organizationId = 3
} | ConvertTo-Json

$res2 = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/register' -Method POST -ContentType 'application/json' -Body $reviewerBody
Write-Host "Created Reviewer Account:"
Write-Host "  Name: $($res2.user.fullName) | Role: $($res2.user.role) | Org: $($res2.user.organizationName)"
