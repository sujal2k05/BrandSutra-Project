$body = @{
    fullName = 'Sujal Bhoi'
    email = 'sujal100@gmail.com'
    password = 'Password@123'
    organizationName = 'Nexus Dynamics'
    industry = 'Consumer Products & Appliances'
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/register' -Method POST -ContentType 'application/json' -Body $body
    Write-Host "Registration Successful!"
    Write-Host "User ID: $($res.user.id) | Org ID: $($res.user.organizationId) | Role: $($res.user.role)"
    $token = $res.token
    $headers = @{ 'Authorization' = "Bearer $token" }
    
    # 1. Add approved facts for Nexus Dynamics
    $fact1 = @{
        category = 'WARRANTY'
        factTitle = 'Nexus Standard Appliance Warranty'
        approvedStatement = 'Standard warranty on all Nexus Dynamics smart home devices is 2 years.'
        sourceReference = 'Nexus Warranty Manual 2026'
        effectiveDate = '2026-01-01'
        expirationDate = '2027-12-31'
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8080/api/brands/$($res.user.organizationId)/facts" -Method POST -Headers $headers -ContentType 'application/json' -Body $fact1 | Out-Null

    $fact2 = @{
        category = 'DISCOUNTS'
        factTitle = 'Maximum Promotional Discount Limit'
        approvedStatement = 'Promotional discounts must never exceed 30% without executive board approval.'
        sourceReference = 'Nexus Pricing Policy v1.4'
        effectiveDate = '2026-01-01'
        expirationDate = '2027-12-31'
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8080/api/brands/$($res.user.organizationId)/facts" -Method POST -Headers $headers -ContentType 'application/json' -Body $fact2 | Out-Null

    # 2. Add banned rule
    $rule1 = @{
        ruleType = 'BANNED_TERM'
        pattern = '100% unbreakable'
        preferredReplacement = 'military-grade durability'
        explanation = 'Absolute claims of indestructibility violate consumer protection standards.'
        severity = 'CRITICAL'
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8080/api/brands/$($res.user.organizationId)/rules" -Method POST -Headers $headers -ContentType 'application/json' -Body $rule1 | Out-Null

    Write-Host "Approved Facts and Brand Rules successfully configured for Nexus Dynamics!"
} catch {
    Write-Host "Account creation status: $($_.Exception.Message)"
}
