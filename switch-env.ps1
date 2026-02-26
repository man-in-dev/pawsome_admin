# Admin Panel Environment Switch Script
# Usage: .\switch-env.ps1 [dev|prod]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "prod", "check")]
    [string]$Mode = "check"
)

$envFile = ".env.local"
$envDevFile = ".env.development"
$envProdFile = ".env.production"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Admin Panel Environment Switcher" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if ($Mode -eq "check") {
    Write-Host "Current Environment Status:" -ForegroundColor Yellow
    Write-Host ""
    
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw
        if ($content -match "NEXT_PUBLIC_ENV=development") {
            Write-Host "  Mode: DEVELOPMENT (localhost)" -ForegroundColor Green
        } elseif ($content -match "NEXT_PUBLIC_ENV=production") {
            Write-Host "  Mode: PRODUCTION (api.pawsomeindia.com)" -ForegroundColor Red
        } else {
            Write-Host "  Mode: DEFAULT (development - localhost)" -ForegroundColor Gray
        }
        Write-Host "  File: .env.local exists" -ForegroundColor Gray
    } elseif (Test-Path $envDevFile) {
        Write-Host "  Mode: DEVELOPMENT (localhost)" -ForegroundColor Green
        Write-Host "  File: .env.development exists" -ForegroundColor Gray
    } elseif (Test-Path $envProdFile) {
        Write-Host "  Mode: PRODUCTION (api.pawsomeindia.com)" -ForegroundColor Red
        Write-Host "  File: .env.production exists" -ForegroundColor Gray
    } else {
        Write-Host "  Mode: DEFAULT (development - localhost)" -ForegroundColor Gray
        Write-Host "  File: No .env file found" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\switch-env.ps1 dev   - Switch to development mode" -ForegroundColor White
    Write-Host "  .\switch-env.ps1 prod  - Switch to production mode" -ForegroundColor White
    Write-Host "  .\switch-env.ps1 check - Check current mode (default)" -ForegroundColor White
    exit
}

if ($Mode -eq "dev") {
    Write-Host "Switching to DEVELOPMENT mode..." -ForegroundColor Green
    Write-Host ""
    
    # Create .env.local file for development
    @"
NEXT_PUBLIC_ENV=development
NODE_ENV=development
"@ | Out-File -FilePath $envFile -Encoding UTF8 -Force
    
    Write-Host "Created .env.local file with:" -ForegroundColor Gray
    Write-Host "  NEXT_PUBLIC_ENV=development" -ForegroundColor White
    Write-Host "  NODE_ENV=development" -ForegroundColor White
    Write-Host ""
    Write-Host "API calls will now use: http://localhost:PORT" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Restart your Next.js dev server (npm run dev) for changes to take effect!" -ForegroundColor Yellow
    
} elseif ($Mode -eq "prod") {
    Write-Host "Switching to PRODUCTION mode..." -ForegroundColor Red
    Write-Host ""
    
    # Create .env.local file for production
    @"
NEXT_PUBLIC_ENV=production
NODE_ENV=production
"@ | Out-File -FilePath $envFile -Encoding UTF8 -Force
    
    Write-Host "Created .env.local file with:" -ForegroundColor Gray
    Write-Host "  NEXT_PUBLIC_ENV=production" -ForegroundColor White
    Write-Host "  NODE_ENV=production" -ForegroundColor White
    Write-Host ""
    Write-Host "API calls will now use: https://api.pawsomeindia.com" -ForegroundColor Red
    Write-Host ""
    Write-Host "IMPORTANT: Restart your Next.js dev server (npm run dev) for changes to take effect!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
