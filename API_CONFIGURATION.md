# Admin Panel API Configuration Guide

## Development Mode (Default)

The admin panel is configured to use **localhost** APIs by default for development.

### Service Ports

| Service | Port | Local URL |
|---------|------|-----------|
| document | 2000 | http://localhost:2000/document/api/v1 |
| authentication | 2001 | http://localhost:2001/authentication/api/v1 |
| profile | 2002 | http://localhost:2002/profile/api/v1 |
| veterinary | 2003 | http://localhost:2003/veterinary/api/v1 |
| payment | 2004 | http://localhost:2004/payment/api/v1 |
| community | 2005 | http://localhost:2005/community/api/v1 |
| shop | 2006 | http://localhost:2006/shop/api/v1 |
| match | 2007 | http://localhost:2007/match/api/v1 |
| subscription | 2008 | http://localhost:2008/subscription/api/v1 |
| settings | 2009 | http://localhost:2009/settings/api/v1 |
| notification | 2010 | http://localhost:2010/notification/api/v1 |
| **grooming** | **4001** | **http://localhost:4001/grooming/api/v1** |

## Switching Between Development and Production

### Development Mode (Default)
The admin panel automatically uses localhost when:
- `NODE_ENV=development` OR
- `NEXT_PUBLIC_ENV=development` OR
- No environment variable is set (defaults to development)

### Production Mode
To use production APIs, set:
```bash
NEXT_PUBLIC_ENV=production
```

Or create `.env.production` file:
```env
NEXT_PUBLIC_ENV=production
```

## Configuration Files

- `src/utils/apiConfig.js` - Service port mapping and URL configuration
- `src/utils/axios.js` - Axios instance (uses apiConfig)
- `src/app/api/index.js` - API function definitions (uses axios)
- `.env.development` - Development environment variables
- `.env.production` - Production environment variables

## How It Works

The `axios.js` utility function receives a `port` parameter which is used to construct the localhost URL:

```javascript
// Example: grooming service
axios('4001', 'grooming', 'admin/store', 'GET')
// Results in: http://localhost:4001/grooming/api/v1/admin/store
```

## Testing Local APIs

Make sure all backend services are running:

```powershell
# Start all services
cd C:\FlutterPawsome\pawsome_backend
.\run_all_servers.ps1
```

Then test in browser console (on admin panel):
```javascript
// Test grooming service
fetch('http://localhost:4001/grooming/api/v1/store')
  .then(r => r.json())
  .then(console.log)
```

## Troubleshooting

### CORS Errors
- Backend services should have CORS enabled for localhost
- Check service terminal for CORS-related errors

### Connection Refused
- Verify service is running: `netstat -ano | findstr :4001`
- Check service terminal for startup errors
- Verify port in service's `.env` file matches the port in `api/index.js`

### Wrong API URL
- Check `src/utils/apiConfig.js` for correct configuration
- Verify environment variables in `.env.development` or `.env.production`
- Restart Next.js dev server after changing environment variables

### Port Mismatch
If a service uses a different port, update:
1. Service's `.env` file (PORT=XXXX)
2. `src/app/api/index.js` (port parameter in axios calls)
3. `src/utils/apiConfig.js` (SERVICE_PORTS mapping)
