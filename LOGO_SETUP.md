# Logo Setup Guide

## Logo File Location

The logo file should be placed in: `frontend/public/logo.png`

## Current Status

✅ Logo file is located at: `frontend/public/logo.png`

## How Vite Serves Static Files

In Vite, files in the `public` directory are served from the root path `/`:
- File: `frontend/public/logo.png`
- URL: `/logo.png`

## Troubleshooting

### Logo Not Showing?

1. **Check if file exists:**
   ```powershell
   Test-Path "frontend\public\logo.png"
   ```

2. **Restart Vite Dev Server:**
   - Stop the current dev server (Ctrl+C)
   - Run `npm run dev` again in the frontend directory
   - Vite needs to be restarted to pick up new files in the public directory

3. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Check Console tab for any errors
   - Check Network tab to see if `/logo.png` request is failing

4. **Verify File Path:**
   - The logo should be at: `frontend/public/logo.png`
   - NOT at: `frontend/src/assets/logo.png` or any other location

5. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache

## Manual Setup

If the logo is not in the correct location:

1. Create the public directory (if it doesn't exist):
   ```powershell
   New-Item -ItemType Directory -Path "frontend\public" -Force
   ```

2. Copy your logo.png file to:
   ```
   frontend/public/logo.png
   ```

3. Restart the Vite dev server

## Logo Usage

The logo is used in:
- ✅ Navbar (top navigation)
- ✅ Footer
- ✅ Login page
- ✅ Register page
- ✅ Browser favicon (tab icon)

All components reference the logo as: `/logo.png`
