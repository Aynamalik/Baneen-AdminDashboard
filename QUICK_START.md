# Quick Start Guide - Baneen Admin Panel

## Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Comes with Node.js
- **Backend Server**: Make sure the backend is running (see backend README)

## Step-by-Step Setup

### 1. Navigate to Admin Panel Directory

```bash
cd baneen-admin
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including React, Material-UI, Redux, etc.

### 3. Create Environment File

Create a `.env.local` file in the `baneen-admin` directory:

**Windows (PowerShell):**
```powershell
New-Item -Path .env.local -ItemType File
```

**Windows (CMD):**
```cmd
type nul > .env.local
```

**Mac/Linux:**
```bash
touch .env.local
```

Then add the following content to `.env.local`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000

# App Configuration
VITE_APP_NAME=Baneen Admin

# Google Maps API Key (optional, for future use)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

**Note:** If your backend is running on a different port, update `VITE_API_BASE_URL` accordingly.

### 4. Start the Development Server

```bash
npm run dev
```

The application will start and you should see output like:

```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 5. Open in Browser

Open your browser and navigate to:
```
http://localhost:5173
```

**Note:** The frontend runs on port **5173** while the backend runs on port **3000**. This avoids port conflicts.

You should see the login page.

## Available Scripts

### Development
```bash
npm run dev
```
Starts the development server with hot-reload.

### Build for Production
```bash
npm run build
```
Creates an optimized production build in the `dist` directory.

### Preview Production Build
```bash
npm run preview
```
Previews the production build locally.

### Lint Code
```bash
npm run lint
```
Runs ESLint to check for code issues.

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port (5174, 5175, etc.). Check the terminal output for the actual port.

To use a specific port, modify `vite.config.js`:

```javascript
server: {
  port: 3001, // Change to your preferred port
}
```

**Note:** Make sure the frontend port is different from the backend port (3000).

### Backend Connection Issues

1. **Check Backend is Running**: Make sure your backend server is running on `http://localhost:3000`
2. **Check API URL**: Verify `VITE_API_BASE_URL` in `.env.local` matches your backend URL
3. **CORS Issues**: Make sure your backend has CORS enabled for `http://localhost:5173` (frontend port)

### Module Not Found Errors

If you get "module not found" errors:

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Windows:**
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### Environment Variables Not Loading

- Make sure the file is named `.env.local` (not `.env`)
- Restart the dev server after creating/modifying `.env.local`
- Environment variables must start with `VITE_` to be accessible in the app

## Testing the Application

### 1. Test Login

1. Navigate to `http://localhost:5173`
2. You should see the login page
3. Try logging in with:
   - **Email**: `admin@example.com` (or your admin email)
   - **Phone**: `03001234567` (or your admin phone)
   - **Password**: Your admin password

### 2. Test Protected Routes

1. Try accessing `http://localhost:5173/dashboard` directly
2. You should be redirected to `/login` if not authenticated
3. After login, you should see the dashboard

### 3. Test Session Persistence

1. Login successfully
2. Refresh the page (F5)
3. You should remain logged in and stay on the dashboard

## Development Tips

- **Hot Reload**: Changes to files will automatically reload in the browser
- **React DevTools**: Install React DevTools browser extension for debugging
- **Redux DevTools**: Install Redux DevTools extension to inspect Redux state
- **Console Logs**: Check browser console for any errors or warnings

## Next Steps

Once the app is running:

1. ✅ Verify login works with your backend
2. ✅ Test all authentication flows
3. ✅ Check UI components render correctly
4. ✅ Ready for Phase 2 development!

---

**Need Help?** Check the main README.md or PHASE1_COMPLETE.md for more details.

