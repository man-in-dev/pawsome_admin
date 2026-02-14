# Verify Admin Panel Environment Configuration
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Admin Panel Environment Verification" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$envFile = ".env.local"
$envDevFile = ".env.development"
$envProdFile = ".env.production"

# Check which file exists
$foundFile = $null
$fileContent = $null

if (Test-Path $envFile) {
    $foundFile = $envFile
    $fileContent = Get-Content $envFile -Raw
} elseif (Test-Path $envDevFile) {
    $foundFile = $envDevFile
    $fileContent = Get-Content $envDevFile -Raw
} elseif (Test-Path $envProdFile) {
    $foundFile = $envProdFile
    $fileContent = Get-Content $envProdFile -Raw
}

if ($foundFile) {
    Write-Host "Found environment file: $foundFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "File contents:" -ForegroundColor Yellow
    Write-Host $fileContent -ForegroundColor White
    Write-Host ""
    
    # Check for correct format
    $hasDev = $fileContent -match "NEXT_PUBLIC_ENV=development"
    $hasProd = $fileContent -match "NEXT_PUBLIC_ENV=production"
    $hasNodeDev = $fileContent -match "NODE_ENV=development"
    $hasNodeProd = $fileContent -match "NODE_ENV=production"
    
    if ($hasDev) {
        Write-Host "Status: DEVELOPMENT mode configured" -ForegroundColor Green
        Write-Host "API calls will use: http://localhost:PORT" -ForegroundColor Gray
    } elseif ($hasProd) {
        Write-Host "Status: PRODUCTION mode configured" -ForegroundColor Red
        Write-Host "API calls will use: https://api.pawsomeindia.com" -ForegroundColor Gray
    } else {
        Write-Host "Status: WARNING - NEXT_PUBLIC_ENV not found or invalid" -ForegroundColor Yellow
        Write-Host "Expected: NEXT_PUBLIC_ENV=development or NEXT_PUBLIC_ENV=production" -ForegroundColor Yellow
    }
    
    # Check for formatting issues
    if ($fileContent -match "NEXT_PUBLIC_ENV=developmentNODE_ENV" -or 
        $fileContent -match "NEXT_PUBLIC_ENV=productionNODE_ENV") {
        Write-Host ""
        Write-Host "ERROR: Variables are on the same line!" -ForegroundColor Red
        Write-Host "Each variable must be on a separate line." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Correct format:" -ForegroundColor Cyan
        Write-Host "NEXT_PUBLIC_ENV=development" -ForegroundColor White
        Write-Host "NODE_ENV=development" -ForegroundColor White
    } elseif (-not $fileContent -match "`n") {
        Write-Host ""
        Write-Host "WARNING: Only one line found. Make sure variables are on separate lines." -ForegroundColor Yellow
    }
} else {
    Write-Host "No .env file found" -ForegroundColor Yellow
    Write-Host "Default mode: DEVELOPMENT (localhost)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To create .env.local file:" -ForegroundColor Cyan
    Write-Host "  For Development:" -ForegroundColor White
    Write-Host "    NEXT_PUBLIC_ENV=development" -ForegroundColor Gray
    Write-Host "    NODE_ENV=development" -ForegroundColor Gray
    Write-Host "  For Production:" -ForegroundColor White
    Write-Host "    NEXT_PUBLIC_ENV=production" -ForegroundColor Gray
    Write-Host "    NODE_ENV=production" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
