# Environment Switch Guide - Admin Panel

## How to Switch Between Development and Production

### Method 1: Using .env Files (Recommended)

#### Development Mode
Create `.env.development` file in `pawsome_admin/`:
```env
NEXT_PUBLIC_ENV=development
NODE_ENV=development
```

#### Production Mode
Create `.env.production` file in `pawsome_admin/`:
```env
NEXT_PUBLIC_ENV=production
NODE_ENV=production
```

**Note**: Next.js automatically loads `.env.development` when running `npm run dev` and `.env.production` when running `npm run build`.

### Method 2: Using .env File (Always Active)

Create `.env.local` file in `pawsome_admin/`:

**For Development:**
```env
NEXT_PUBLIC_ENV=development
NODE_ENV=development
```

**For Production:**
```env
NEXT_PUBLIC_ENV=production
NODE_ENV=production
```

### Method 3: Command Line (Temporary)

**Development:**
```powershell
$env:NEXT_PUBLIC_ENV="development"
npm run dev
```

**Production:**
```powershell
$env:NEXT_PUBLIC_ENV="production"
npm run dev
```

### Method 4: Package.json Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "dev:local": "NEXT_PUBLIC_ENV=development npm run dev",
    "dev:prod": "NEXT_PUBLIC_ENV=production npm run dev",
    "build:local": "NEXT_PUBLIC_ENV=development npm run build",
    "build:prod": "NEXT_PUBLIC_ENV=production npm run build"
  }
}
```

Then run:
```powershell
npm run dev:local    # Development mode
npm run dev:prod     # Production mode
```

## Current Mode Detection

To check which mode is active, add this to any component:
```javascript
// Check API config
import API_CONFIG from '@/utils/apiConfig'
console.log('Is Development:', API_CONFIG.IS_DEVELOPMENT)
console.log('Base URL:', API_CONFIG.BASE_URL)
```

Or check Network tab in DevTools - you'll see:
- **Development**: `http://localhost:XXXX/...`
- **Production**: `https://api.pawsomeindia.com/...`

## Default Behavior

- **If no .env file exists**: Defaults to **DEVELOPMENT** mode (uses localhost)
- **If NEXT_PUBLIC_ENV is not set**: Defaults to **DEVELOPMENT** mode
- **When building for production**: Use `npm run build` with production env

## Important Notes

- **Restart required**: After changing .env files, restart the Next.js dev server
- **.env.local takes precedence**: If both `.env.development` and `.env.local` exist, `.env.local` is used
- **Build-time variables**: `NEXT_PUBLIC_*` variables are embedded at build time

## Quick Switch Script

See `switch-env.ps1` for automated switching.
