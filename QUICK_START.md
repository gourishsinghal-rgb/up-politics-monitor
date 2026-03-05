# 🚀 Railway Quick Start - Copy & Paste Commands

**Follow this guide step-by-step. Just copy and paste each command!**

---

## ⚡ **PART 1: Setup Git Repository (5 minutes)**

### **Step 1: Open Terminal/Command Prompt**

**Windows:** Press `Win + R`, type `cmd`, press Enter  
**Mac:** Press `Cmd + Space`, type `terminal`, press Enter  
**Linux:** Press `Ctrl + Alt + T`

### **Step 2: Navigate to Project Folder**

```bash
# Replace this path with where you saved the files
cd /path/to/up-politics-monitor

# Example Windows:
# cd C:\Users\YourName\Downloads\up-politics-monitor

# Example Mac/Linux:
# cd ~/Downloads/up-politics-monitor
```

### **Step 3: Verify Files Are There**

```bash
# List files
ls

# You should see:
# index.html  server.js  package.json  README.md  etc.
```

### **Step 4: Configure Git (First Time Only)**

```bash
# Set your name
git config --global user.name "Your Full Name"

# Set your email
git config --global user.email "your.email@gmail.com"
```

### **Step 5: Initialize Git**

```bash
# Initialize repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - UP Politics Monitor"
```

**Expected output:**
```
[main (root-commit) abc1234] Initial commit - UP Politics Monitor
 8 files changed, 1500 insertions(+)
```

---

## 📤 **PART 2: Push to GitHub (5 minutes)**

### **Step 6: Create GitHub Repository**

1. Open browser → https://github.com/
2. Click **"+"** (top right) → **"New repository"**
3. **Name:** `up-politics-monitor`
4. **Description:** `Real-time UP political intelligence dashboard`
5. Keep **Public** selected
6. **DO NOT** check "Initialize with README"
7. Click **"Create repository"**

### **Step 7: Connect to GitHub**

GitHub will show you commands. Copy your repository URL, then:

```bash
# Add GitHub as remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/up-politics-monitor.git

# Example:
# git remote add origin https://github.com/johnsmith/up-politics-monitor.git
```

### **Step 8: Push Code to GitHub**

```bash
# Rename branch to main
git branch -M main

# Push code
git push -u origin main
```

**If asked for credentials:**
- Username: Your GitHub username
- Password: Your GitHub **Personal Access Token** (NOT your GitHub password)

**Don't have a token?** Create one:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Select "repo" scope → Generate
3. Copy token immediately (you won't see it again)

**Expected output:**
```
Enumerating objects: 12, done.
Counting objects: 100% (12/12), done.
Writing objects: 100% (12/12), 45.23 KiB | 2.26 MiB/s, done.
To https://github.com/YOUR_USERNAME/up-politics-monitor.git
 * [new branch]      main -> main
```

### **Step 9: Verify on GitHub**

Open in browser:
```
https://github.com/YOUR_USERNAME/up-politics-monitor
```

You should see all your files listed!

---

## 🚂 **PART 3: Deploy to Railway (5 minutes)**

### **Step 10: Create Railway Account**

1. Open browser → https://railway.app/
2. Click **"Login"**
3. Click **"Login with GitHub"**
4. Click **"Authorize Railway"**
5. You're now in Railway dashboard!

### **Step 11: Create New Project**

1. Click **"New Project"** (big purple button)
2. Select **"Deploy from GitHub repo"**
3. Click **"Configure GitHub App"**
4. Select **"Only select repositories"**
5. Choose **"up-politics-monitor"**
6. Click **"Install & Authorize"**

### **Step 12: Select Your Repository**

1. You'll see a list of repositories
2. Click on **"up-politics-monitor"**
3. Railway starts building automatically!

**You'll see a build log:**
```
Building...
Detected Node.js project
Installing dependencies (npm install)
Starting application (npm start)
✓ Build successful
✓ Deployment live
```

This takes **2-3 minutes**. Wait for it to complete!

### **Step 13: Generate Public URL**

1. Click on your deployment (in Railway dashboard)
2. Go to **"Settings"** tab (left sidebar)
3. Scroll down to **"Networking"** section
4. Click **"Generate Domain"**
5. Copy the URL (looks like):
   ```
   up-politics-monitor-production-abc123.up.railway.app
   ```

---

## ✅ **PART 4: Test Your Deployment (3 minutes)**

### **Step 14: Test API Health**

Open in browser:
```
https://your-railway-url.up.railway.app/api/health
```

Replace `your-railway-url` with the actual URL Railway gave you.

**You should see:**
```json
{
  "status": "ok",
  "lastUpdate": "2026-03-04T12:34:56.789Z",
  "eventCount": 250
}
```

### **Step 15: Open Main Dashboard**

Open in browser:
```
https://your-railway-url.up.railway.app/
```

**You should see:**
- ✅ Interactive map of India
- ✅ Uttar Pradesh highlighted
- ✅ Colored markers (events)
- ✅ Sidebar with filters
- ✅ Statistics showing

### **Step 16: Test Features**

Click around:
- [ ] Click time filters (1D, 7D, 30D)
- [ ] Toggle layer switches
- [ ] Search for "Lucknow"
- [ ] Click on a constituency
- [ ] Click on a marker
- [ ] Toggle dark/light mode
- [ ] Click share button

**Everything should work!**

---

## 🔄 **PART 5: Update Your App (Future)**

### **When You Make Changes:**

```bash
# 1. Edit files (e.g., change colors in index.html)

# 2. Save changes

# 3. Commit changes
git add .
git commit -m "Updated dashboard colors"

# 4. Push to GitHub
git push origin main

# 5. Railway automatically redeploys (wait 2-3 minutes)
```

---

## 🎯 **Quick Reference Commands**

### **Check Status**
```bash
git status
```

### **View Commit History**
```bash
git log --oneline
```

### **Test Locally Before Deploying**
```bash
npm install
npm start
# Open http://localhost:3000 in browser
```

### **Manually Trigger News Scraping**
```bash
curl -X POST https://your-railway-url.up.railway.app/api/refresh
```

### **View All Events**
```bash
curl https://your-railway-url.up.railway.app/api/events
```

---

## 🆘 **Troubleshooting**

### **Error: "fatal: not a git repository"**
```bash
# You're not in the project folder
# Navigate to the correct folder:
cd /path/to/up-politics-monitor
```

### **Error: "Permission denied (publickey)"**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/up-politics-monitor.git
```

### **Railway Build Failed**
```bash
# Test locally first:
npm install
npm start

# If it works locally, check Railway logs for specific error
```

### **No Events Showing**
```bash
# Manually trigger scraping:
curl -X POST https://your-railway-url.up.railway.app/api/refresh

# Wait 1 minute, then refresh browser
```

---

## 📋 **Your Deployment Info (Fill This In!)**

```
GitHub Repository:
https://github.com/_________________/up-politics-monitor

Railway URL:
https://________________________________________________.up.railway.app

Deployment Date:
_______________________

Railway Project:
https://railway.app/project/____________________
```

---

## 🎉 **SUCCESS!**

If all tests passed, congratulations! Your dashboard is:

✅ **Live on the internet**  
✅ **Scraping 250+ events daily**  
✅ **Auto-updating every 6 hours**  
✅ **Accessible from anywhere**  
✅ **Auto-deploying on code changes**

**Share your URL with others and start monitoring UP politics in real-time!**

---

## 📞 **Need Help?**

- Check Railway logs: Dashboard → Deployments → Click deployment → View logs
- Check browser console: F12 → Console tab
- Review RAILWAY_DEPLOYMENT.md for detailed guide
- Railway Discord: https://discord.gg/railway

**Total Setup Time: ~15-20 minutes** ⏱️
