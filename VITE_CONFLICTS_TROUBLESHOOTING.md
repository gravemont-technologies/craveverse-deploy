# 🚨 Vite Conflicts Troubleshooting Guide

## Problem
You're experiencing Vite import errors from a conflicting project at `C:/Users/muzam/crave-quest-conquer/` that keeps auto-starting and interfering with your CraveVerse application.

## Error Messages
```
Failed to resolve import "@/components/ui/toaster" from "src/App.tsx"
Failed to resolve import "@/components/ui/button" from "src/pages/Landing.tsx"
```

## Quick Solutions

### 🚀 Immediate Fix (Recommended)
```bash
npm run stop-all
npm run dev
```

### 🔧 Alternative Methods

#### Method 1: PowerShell Script
```bash
npm run stop-all
```

#### Method 2: Batch Script
```bash
npm run stop-all-bat
```

#### Method 3: Manual PowerShell
```powershell
Get-Process -Name "node" | Stop-Process -Force
npm run dev
```

#### Method 4: Manual Command Prompt
```cmd
taskkill /F /IM node.exe
npm run dev
```

## Prevention

### 🛡️ Before Starting Development
Always run the cleanup script before starting your development server:
```bash
npm run stop-all
npm run dev
```

### 📋 Daily Workflow
1. Run `npm run stop-all` to clear any conflicting processes
2. Run `npm run dev` to start your CraveVerse application
3. Access your app at `http://localhost:5173`

## Root Cause
There's another Vite React project on your system that has an auto-restart mechanism. This project keeps starting Vite servers that conflict with your Next.js development server.

## Permanent Solution
The cleanup scripts provided will:
- ✅ Kill all Node.js processes (including conflicting Vite servers)
- ✅ Allow you to start your Next.js server cleanly
- ✅ Prevent import resolution errors
- ✅ Ensure your application runs on the correct port (5173)

## Verification
After running the cleanup and starting your server:
1. Check that `http://localhost:5173` loads without errors
2. Verify no Vite import errors in the terminal
3. Confirm your application is fully functional

## Need Help?
If you continue to experience issues:
1. Run `npm run stop-all`
2. Wait 5 seconds
3. Run `npm run dev`
4. Check that only one Node.js process is running on port 5173

---
*This guide ensures your CraveVerse application runs without conflicts from other projects on your system.*
