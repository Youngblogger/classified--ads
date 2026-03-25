# DEBUGGING GUIDE - Classified Ads Application

## Quick Diagnostics Checklist

Run these commands to diagnose issues:

### 1. Check if Backend is Running
```bash
curl http://localhost:8000/api/categories
```
Expected: JSON response
If fails: Backend not running - start with `cd backend && php artisan serve --port=8000`

### 2. Check if Frontend is Running
```bash
curl http://localhost:3000
```
Expected: HTML page
If fails: Start with `npm run dev`

### 3. Check API Connection
```bash
curl -I http://localhost:8000/api
```
Expected: HTTP 200 or JSON response
If fails with "Connection refused": Backend port 8000 not accessible

### 4. Check Database Connection
```bash
cd backend
php artisan tinker
DB::connection()->ping();
```
Expected: true
If fails: Check .env database settings

---

## Common Issues & Solutions

### Issue: ERR_CONNECTION_REFUSED
**Cause:** Backend server not running or wrong port

**Fix:**
1. Open terminal in `backend` folder
2. Run: `php artisan serve --port=8000`
3. Ensure no other process uses port 8000

### Issue: Failed to fetch
**Cause:** 
- Network error
- CORS blocking
- Backend not responding

**Fix:**
1. Check backend is running on port 8000
2. Verify CORS config in `backend/config/cors.php`
3. Check frontend API URL in `.env.local`

### Issue: 401 Unauthorized / Auto-logout
**Cause:**
- Token expired or not stored
- Auth middleware rejecting requests
- Cookie not sent with requests

**Fix:**
1. Check token storage in browser DevTools > Application > Cookies
2. Verify `withCredentials: true` in axios config
3. Check Laravel session config

### Issue: CORS Errors
**Cause:** Frontend and backend on different origins

**Fix:**
In `backend/config/cors.php`:
```php
'allowed_origins' => ['http://localhost:3000'],
'supports_credentials' => true,
```

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```
APP_URL=http://localhost:8000
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

---

## Logs Location
- Backend: `backend/storage/logs/laravel.log`
- Frontend: Browser console (F12)
- Network: Browser DevTools > Network tab

---

## Testing API Endpoints

```bash
# Categories (public)
curl http://localhost:8000/api/categories

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"test@test.com","password":"password"}'

# Authenticated request
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```