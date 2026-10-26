# BrandSutra End-to-End Workflow Verification Script
$ErrorActionPreference = "Stop"

Write-Host "================================================="
Write-Host "BrandSutra End-to-End Verification Starting..."
Write-Host "================================================="

# 1. Admin Login
$adminBody = '{"email":"admin@novahome.com","password":"Admin@123"}'
$adminLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $adminBody
Write-Host "[PASS] Admin Login successful: $($adminLogin.user.fullName) (Role: $($adminLogin.user.role))"
$adminToken = $adminLogin.token
$adminHeaders = @{ "Authorization" = "Bearer $adminToken" }

# 2. Check Organization & Brand DNA
$dna = Invoke-RestMethod -Uri "http://localhost:8080/api/brands/1/dna" -Method GET -Headers $adminHeaders
Write-Host "[PASS] Brand DNA Loaded: $($dna.brandName) - Mission: $($dna.brandMission)"

$facts = Invoke-RestMethod -Uri "http://localhost:8080/api/brands/1/facts" -Method GET -Headers $adminHeaders
Write-Host "[PASS] Approved Facts Loaded: $($facts.Count) facts in knowledge base"

$rules = Invoke-RestMethod -Uri "http://localhost:8080/api/brands/1/rules" -Method GET -Headers $adminHeaders
Write-Host "[PASS] Brand Rules Loaded: $($rules.Count) rules in knowledge base"

# 3. Creator Login
$creatorBody = '{"email":"creator@novahome.com","password":"Creator@123"}'
$creatorLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $creatorBody
Write-Host "[PASS] Creator Login successful: $($creatorLogin.user.fullName) (Role: $($creatorLogin.user.role))"
$creatorToken = $creatorLogin.token
$creatorHeaders = @{ "Authorization" = "Bearer $creatorToken" }

# 4. Creator submits non-compliant marketing post
$postPayload = @{
    organizationId = 1
    title = "Holiday Mega Festival 2026"
    contentType = "PROMOTIONAL_CAMPAIGN"
    marketingChannel = "INSTAGRAM"
    campaignName = "Mega Festive Blitz"
    description = "Social post for festive campaign"
    contentText = "Get 40% OFF on all NovaHome products! Enjoy a 5-year warranty on everything. Our products are 100% perfect!"
    publicationDate = "2026-11-20"
} | ConvertTo-Json

$createdSub = Invoke-RestMethod -Uri "http://localhost:8080/api/content" -Method POST -Headers $creatorHeaders -ContentType "application/json" -Body $postPayload
Write-Host "[PASS] Content Draft Created with ID: $($createdSub.id) (Status: $($createdSub.overallStatus), Version: $($createdSub.currentVersionNumber))"

# 5. Trigger AI Content Verification
Write-Host "Analyzing content against Brand DNA via FastAPI AI microservice..."
$analysisResult = Invoke-RestMethod -Uri "http://localhost:8080/api/content/$($createdSub.id)/analyze" -Method POST -Headers $creatorHeaders
Write-Host "[PASS] AI Analysis Complete!"
Write-Host "  - Risk Score: $($analysisResult.riskScore)/100 (Level: $($analysisResult.riskLevel))"
Write-Host "  - Detected Findings: $($analysisResult.findings.Count)"
foreach ($f in $analysisResult.findings) {
    Write-Host "    * [$($f.severity)] ($($f.category)) $($f.issue)"
    Write-Host "      Explanation: $($f.explanation)"
    Write-Host "      Correction:  $($f.suggestedCorrection)"
}

# 6. Creator creates a corrected Revision (Version 2)
$revisionPayload = @{
    contentText = "Get up to 25% off on selected NovaHome appliances! Standard 2-year warranty included on eligible models. Seasonal offers expire on 30 November 2026."
} | ConvertTo-Json

$revision = Invoke-RestMethod -Uri "http://localhost:8080/api/content/$($createdSub.id)/revisions" -Method POST -Headers $creatorHeaders -ContentType "application/json" -Body $revisionPayload
Write-Host "[PASS] Revision Created: Version $($revision.versionNumber) (Status: $($revision.analysisStatus))"

# 7. Analyze Revised Version
$revAnalysis = Invoke-RestMethod -Uri "http://localhost:8080/api/content/$($createdSub.id)/analyze" -Method POST -Headers $creatorHeaders
Write-Host "[PASS] Revised Content Re-Analyzed!"
Write-Host "  - Revised Risk Score: $($revAnalysis.riskScore)/100 (Level: $($revAnalysis.riskLevel))"
Write-Host "  - Revised Findings: $($revAnalysis.findings.Count)"

# 8. Creator submits for review
$submittedSub = Invoke-RestMethod -Uri "http://localhost:8080/api/approvals/$($createdSub.id)/submit" -Method POST -Headers $creatorHeaders
Write-Host "[PASS] Submitted for Review! Status: $($submittedSub.overallStatus)"

# 9. Reviewer Login
$revLoginBody = '{"email":"reviewer@novahome.com","password":"Reviewer@123"}'
$reviewerLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $revLoginBody
Write-Host "[PASS] Reviewer Login successful: $($reviewerLogin.user.fullName) (Role: $($reviewerLogin.user.role))"
$reviewerToken = $reviewerLogin.token
$reviewerHeaders = @{ "Authorization" = "Bearer $reviewerToken" }

# 10. Reviewer inspects pending queue
$pending = Invoke-RestMethod -Uri "http://localhost:8080/api/approvals/pending?orgId=1" -Method GET -Headers $reviewerHeaders
Write-Host "[PASS] Pending Approvals in Queue: $($pending.Count)"

# 11. Reviewer Approves Version 2
$approvalBody = @{
    decision = "APPROVED"
    comments = "Verified against NovaHome Brand DNA v1. Claims and warranties match approved policies. Approved for Instagram publication."
} | ConvertTo-Json

$approvalResult = Invoke-RestMethod -Uri "http://localhost:8080/api/approvals/$($createdSub.id)/approve" -Method POST -Headers $reviewerHeaders -ContentType "application/json" -Body $approvalBody
Write-Host "[PASS] Approval Decision Recorded!"
Write-Host "  - Submission Status: $($approvalResult.status)"
Write-Host "  - Reviewer: $($approvalResult.reviewerName)"
Write-Host "  - Comments: $($approvalResult.comments)"

# 12. Dashboard Analytics Summary
$summary = Invoke-RestMethod -Uri "http://localhost:8080/api/dashboard/summary?orgId=1" -Method GET -Headers $adminHeaders
Write-Host "================================================="
Write-Host "DASHBOARD REAL SQL METRICS:"
Write-Host "  - Total Submissions: $($summary.totalSubmissions)"
Write-Host "  - Approved Content:  $($summary.approvedContent)"
Write-Host "  - Pending Reviews:   $($summary.pendingReviews)"
Write-Host "  - Rejected Content:  $($summary.rejectedContent)"
Write-Host "  - High Risk Content: $($summary.highRiskContent)"
Write-Host "  - Average Risk Score: $($summary.averageRiskScore)"
Write-Host "================================================="
Write-Host "ALL 12 END-TO-END WORKFLOW STAGES VERIFIED SUCCESSFULLY!"
