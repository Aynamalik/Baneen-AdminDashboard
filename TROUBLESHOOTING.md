# Troubleshooting Blank Page Issue

## Common Causes and Solutions

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab for errors. Common errors:

- **Module not found**: Run `npm install` again
- **Network errors**: Check if backend is running
- **CORS errors**: Backend needs to allow requests from `http://localhost:5173`

### 2. Backend Not Running
The app tries to verify authentication on load. If the backend isn't running:

**Solution**: Start the backend server:
```bash
cd baneen-backend
npm run dev
```

### 3. Port Conflicts
If port 5173 is already in use, Vite will use a different port. Check the terminal output for the actual port.

### 4. Environment Variables
Make sure `.env.local` exists with:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
VITE_APP_NAME=Baneen Admin
```

### 5. Clear Browser Cache
Sometimes cached files cause issues:
- **Chrome/Edge**: Ctrl+Shift+Delete → Clear cached images and files
- Or use Incognito/Private mode

### 6. Check Network Tab
In Developer Tools → Network tab:
- Look for failed requests (red)
- Check if `/api/v1/auth/me` is being called
- Verify the request URL is correct

### 7. React DevTools
Install React DevTools browser extension to see if React is rendering.

### 8. Check Terminal Output
Look at the terminal where `npm run dev` is running for any build errors.

## Quick Fixes

### Restart Dev Server
```bash
# Stop the server (Ctrl+C)
# Then restart
cd baneen-admin
npm run dev
```

### Reinstall Dependencies
```bash
cd baneen-admin
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Windows PowerShell:**
```powershell
cd baneen-admin
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npm run dev
```

### Verify Files
Make sure these files exist:
- `baneen-admin/src/main.jsx`
- `baneen-admin/src/App.jsx`
- `baneen-admin/src/routes/AppRoutes.jsx`
- `baneen-admin/index.html`

## Expected Behavior

1. **First Visit (No Auth)**: Should show login page at `/login`
2. **After Login**: Redirects to `/dashboard`
3. **Refresh Page**: Should maintain session if token is valid

## Still Not Working?

1. Check if you can access: `http://localhost:5173/login` directly
2. Check browser console for specific error messages
3. Verify backend is running and accessible at `http://localhost:3000/api/v1`
4. Try a different browser
5. Check if antivirus/firewall is blocking the connection

