# ✅ Railway Deployment Checklist

Print this page and check off each step as you complete it!

---

## 📦 **PHASE 1: PREPARATION** (5 minutes)

```
□ Downloaded all project files to a folder
□ Installed Git on my computer
□ Verified Git works: ran `git --version` in terminal
□ Have GitHub account (or created one)
□ Have Railway account (or created one)
```

---

## 🔧 **PHASE 2: LOCAL SETUP** (3 minutes)

```
□ Opened terminal/command prompt
□ Navigated to project folder: cd path/to/up-politics-monitor
□ Ran: git init
□ Ran: git add .
□ Ran: git commit -m "Initial commit"
□ Configured Git with my name and email
```

---

## 📤 **PHASE 3: GITHUB UPLOAD** (5 minutes)

```
□ Went to github.com
□ Created new repository named "up-politics-monitor"
□ Copied the repository URL
□ Ran: git remote add origin [MY_REPO_URL]
□ Ran: git branch -M main
□ Ran: git push -u origin main
□ Verified code appears on GitHub
```

---

## 🚂 **PHASE 4: RAILWAY DEPLOYMENT** (5 minutes)

```
□ Went to railway.app
□ Logged in with GitHub
□ Clicked "New Project"
□ Selected "Deploy from GitHub repo"
□ Authorized Railway to access my repository
□ Selected "up-politics-monitor" repo
□ Watched build process complete (2-3 min)
□ Build shows "✓ Deployment successful"
```

---

## 🌐 **PHASE 5: DOMAIN SETUP** (2 minutes)

```
□ Clicked on my Railway project
□ Went to "Settings" tab
□ Scrolled to "Networking" section
□ Clicked "Generate Domain"
□ Copied my Railway URL
□ Saved URL: ________________________________
```

---

## 🧪 **PHASE 6: TESTING** (5 minutes)

```
□ Opened: [MY_URL]/api/health
□ Got response with "status": "ok"
□ Opened: [MY_URL]/ (main dashboard)
□ Map loaded successfully
□ Saw UP constituencies on map
□ Saw event markers (colored dots)
□ Stats showing in sidebar (Total Events, etc.)
□ Clicked time filter (1D/7D/30D) - works
□ Toggled layer switches - works
□ Searched for "Lucknow" - works
□ Clicked on constituency - info panel appears
□ Clicked on marker - popup appears
□ Theme toggle works (dark/light mode)
□ Share button copies URL
```

---

## 🔄 **PHASE 7: VERIFY AUTO-SCRAPING** (2 minutes)

```
□ Checked Railway logs (Deployments tab)
□ Saw: "Initializing UP Politics Monitor Backend..."
□ Saw: "Backend initialized successfully"
□ Saw: "Total events stored: 250" (or similar)
□ Opened: [MY_URL]/api/events
□ Got JSON array with event data
```

---

## 🎯 **PHASE 8: TRIGGER MANUAL SCRAPE** (Optional - 2 minutes)

```
□ Used curl or Postman to POST to: [MY_URL]/api/refresh
□ Got success response
□ Refreshed dashboard
□ Saw updated event count
```

---

## 📱 **PHASE 9: MOBILE TEST** (Optional - 3 minutes)

```
□ Opened dashboard on phone/tablet
□ Map loads and is responsive
□ Can zoom/pan map
□ Sidebar accessible
□ All features work on mobile
```

---

## 🎉 **DEPLOYMENT COMPLETE!**

```
□ All checks above passed ✅
□ Dashboard is live and working
□ Bookmarked my Railway URL
□ Shared URL with team/stakeholders
□ Set reminder to monitor Railway credits
```

---

## 📊 **MY DEPLOYMENT INFO**

```
GitHub Repo:    https://github.com/_______________/up-politics-monitor
Railway URL:    https://________________________________.up.railway.app
Deployed Date:  ____________________
Railway Project: https://railway.app/project/__________________
```

---

## 🆘 **IF SOMETHING GOES WRONG**

### Check These First:
1. Railway deployment logs (look for red errors)
2. Browser console (F12 → Console tab)
3. API health endpoint: [MY_URL]/api/health

### Common Fixes:
- **Build failed:** Check package.json is correct
- **Map not loading:** Clear browser cache, try incognito
- **No events:** Manually trigger: POST to /api/refresh
- **CORS errors:** Check server.js has cors() configured

### Get Help:
- Railway Docs: https://docs.railway.app/
- Project README: See RAILWAY_DEPLOYMENT.md
- Railway Discord: https://discord.gg/railway

---

**✅ CHECKLIST COMPLETE = SUCCESSFUL DEPLOYMENT! 🎊**

Total Time: ~20-30 minutes
Status: Production-ready dashboard tracking 250+ daily political events!
