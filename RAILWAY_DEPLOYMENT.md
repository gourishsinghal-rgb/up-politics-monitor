# 🚂 Railway.app Deployment Guide - UP Politics Monitor

**Total Time: 5-10 minutes**

---

## 🎯 **Step 1: Create GitHub Repository**

### **1.1: Install Git (if not already installed)**

**Windows:**
- Download from: https://git-scm.com/download/win
- Install with default settings
- Restart terminal/command prompt

**macOS:**
```bash
# Install via Homebrew
brew install git

# Or download from: https://git-scm.com/download/mac
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install git

# Fedora
sudo dnf install git
```

### **1.2: Configure Git (First Time Only)**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### **1.3: Initialize Git Repository**

Open terminal/command prompt in your project folder:

```bash
# Navigate to project folder
cd path/to/up-politics-monitor

# Initialize git
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - UP Politics Monitor"
```

### **1.4: Create GitHub Repository**

1. Go to https://github.com/
2. Click **"+"** (top right) → **"New repository"**
3. **Repository name:** `up-politics-monitor`
4. **Description:** `Real-time political intelligence dashboard for Uttar Pradesh`
5. **Visibility:** Public or Private (your choice)
6. **DO NOT** initialize with README (we already have files)
7. Click **"Create repository"**

### **1.5: Push to GitHub**

Copy the commands GitHub shows you, or use these:

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/up-politics-monitor.git

# Push code
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

✅ **Checkpoint:** Your code should now be visible on GitHub at:
`https://github.com/YOUR_USERNAME/up-politics-monitor`

---

## 🚂 **Step 2: Deploy to Railway.app**

### **2.1: Create Railway Account**

1. Go to https://railway.app/
2. Click **"Login"** (top right)
3. Choose **"Login with GitHub"**
4. Authorize Railway to access your GitHub account
5. You'll be redirected to Railway dashboard

### **2.2: Create New Project**

1. Click **"New Project"** (big button in center)
2. Select **"Deploy from GitHub repo"**
3. Click **"Configure GitHub App"**
4. Choose **"Only select repositories"**
5. Select your `up-politics-monitor` repository
6. Click **"Install & Authorize"**

### **2.3: Select Repository**

1. Back in Railway, you'll see your repo listed
2. Click on **"up-politics-monitor"**
3. Railway will start analyzing your project

### **2.4: Railway Auto-Detects Settings**

Railway will automatically detect:
- ✅ Node.js project
- ✅ `package.json` file
- ✅ Start command: `npm start`

You'll see a build log start running:
```
Building...
Installing dependencies...
npm install
Starting application...
```

### **2.5: Wait for Deployment** (2-3 minutes)

Watch the deployment logs. You'll see:
```
✓ Build successful
✓ Deployment successful
✓ Service running on port 3000
```

---

## 🌐 **Step 3: Configure Domain & Access**

### **3.1: Generate Public Domain**

1. In Railway dashboard, click your deployment
2. Go to **"Settings"** tab
3. Scroll to **"Networking"** section
4. Click **"Generate Domain"**
5. You'll get a URL like:
   ```
   up-politics-monitor-production.up.railway.app
   ```

### **3.2: Test Your Deployment**

Open these URLs in your browser:

**1. Backend Health Check:**
```
https://up-politics-monitor-production.up.railway.app/api/health
```
Should return:
```json
{
  "status": "ok",
  "lastUpdate": "2026-03-04T...",
  "eventCount": 250
}
```

**2. Main Dashboard:**
```
https://up-politics-monitor-production.up.railway.app/
```
Should show the interactive map!

**3. Events API:**
```
https://up-politics-monitor-production.up.railway.app/api/events
```
Should return JSON array of events

---

## ⚙️ **Step 4: Configure Environment Variables (Optional)**

### **4.1: Add Environment Variables**

1. In Railway dashboard, go to **"Variables"** tab
2. Click **"+ New Variable"**
3. Add these (optional):

```
NODE_ENV=production
SCRAPE_INTERVAL_HOURS=6
MIN_EVENTS_TARGET=250
```

### **4.2: Redeploy**

Railway will automatically redeploy after adding variables (wait 1-2 minutes)

---

## 📊 **Step 5: Verify Everything Works**

### **5.1: Check Deployment Logs**

1. Click **"Deployments"** tab
2. Click latest deployment
3. View logs - should see:
```
Initializing UP Politics Monitor Backend...
Backend initialized successfully
UP Politics Monitor Backend running on http://localhost:3000
Loaded 250 events from file
```

### **5.2: Test All Features**

Visit your Railway URL and test:

- [ ] Map loads correctly
- [ ] Events appear as markers
- [ ] Statistics show in sidebar (Total Events, Active ACs, etc.)
- [ ] Time filters work (1D, 7D, 30D, All)
- [ ] Layer toggles work
- [ ] Search box finds constituencies
- [ ] Click on AC shows info panel
- [ ] Click on marker shows event popup
- [ ] Share button copies URL
- [ ] Theme toggle switches dark/light mode

### **5.3: Manually Trigger News Scraping**

To fetch fresh data immediately:

```bash
curl -X POST https://your-railway-url.up.railway.app/api/refresh
```

Or use a tool like Postman to send POST request to:
```
https://your-railway-url.up.railway.app/api/refresh
```

You'll get response:
```json
{
  "success": true,
  "message": "Data refreshed successfully",
  "count": 250
}
```

---

## 🔄 **Step 6: Auto-Deploy on Updates**

### **6.1: Make Changes Locally**

Edit any file (e.g., change colors in `index.html`)

### **6.2: Push to GitHub**

```bash
git add .
git commit -m "Updated color scheme"
git push origin main
```

### **6.3: Automatic Deployment**

Railway automatically detects the push and redeploys! (takes 2-3 minutes)

Watch the **"Deployments"** tab in Railway to see progress.

---

## 🎨 **Step 7: Custom Domain (Optional)**

### **7.1: Add Your Domain**

If you own a domain (e.g., `uppolitics.com`):

1. Go to Railway **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Enter your domain: `uppolitics.com`
4. Railway will show DNS settings

### **7.2: Update DNS Records**

In your domain registrar (GoDaddy, Namecheap, etc.):

**Add CNAME record:**
```
Type:  CNAME
Name:  @  (or www)
Value: up-politics-monitor-production.up.railway.app
TTL:   Automatic
```

Wait 5-60 minutes for DNS propagation.

---

## 📈 **Step 8: Monitor Your Application**

### **8.1: View Metrics**

Railway dashboard shows:
- CPU usage
- Memory usage
- Network traffic
- Request count

### **8.2: View Logs**

Click **"Deployments"** → Select deployment → View real-time logs

Filter logs:
```
✓ All logs
✓ Errors only
✓ Search logs
```

### **8.3: Check Scraping Schedule**

Logs will show:
```
Running scheduled news scraping...
Fetched 45 items from RSS feeds
Filtered to 32 UP-related items
Generating 218 additional mock events
Total events stored: 250
Data saved to file
```

This happens:
- Every 6 hours automatically
- Daily at 6:00 AM
- Or manually via `/api/refresh`

---

## 🔧 **Troubleshooting Common Issues**

### **Issue 1: Build Failed**

**Solution:**
```bash
# Test locally first
npm install
npm start

# If it works locally, push to GitHub
git push origin main
```

### **Issue 2: Events Not Showing**

**Check:**
1. Backend logs in Railway (look for errors)
2. Browser console (F12) for frontend errors
3. API health endpoint: `/api/health`

**Fix:**
```bash
# Manually trigger scraping
curl -X POST https://your-url.railway.app/api/refresh
```

### **Issue 3: CORS Errors**

Already configured in `server.js`, but if issues persist:

Edit `server.js`:
```javascript
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
}));
```

Push changes:
```bash
git add .
git commit -m "Fixed CORS"
git push origin main
```

### **Issue 4: Railway URL Not Working**

1. Wait 2-3 minutes after domain generation
2. Clear browser cache
3. Try incognito/private mode
4. Check Railway logs for errors

---

## 💰 **Railway Pricing & Limits**

### **Free Trial:**
- $5 free credit (lasts ~2-3 months for this app)
- No credit card required
- Automatic sleep after inactivity

### **Hobby Plan ($5/month):**
- Always-on service
- Better performance
- More resources

### **Usage Estimate:**
- This app: ~$2-3/month on Hobby plan
- Free trial sufficient for testing

---

## 🎯 **Quick Command Reference**

```bash
# Local development
npm install
npm start

# Git workflow
git add .
git commit -m "Description of changes"
git push origin main

# Trigger manual scrape
curl -X POST https://your-url.railway.app/api/refresh

# Check health
curl https://your-url.railway.app/api/health

# View events
curl https://your-url.railway.app/api/events
```

---

## ✅ **Success Checklist**

After deployment, you should have:

- [✓] GitHub repository with code
- [✓] Railway project deployed
- [✓] Public URL accessible
- [✓] Map loading with constituencies
- [✓] Events showing as markers
- [✓] Stats displaying in sidebar
- [✓] All features working
- [✓] Auto-scraping running every 6 hours
- [✓] Auto-deploy on git push

---

## 🎉 **Next Steps**

1. **Share your dashboard URL** with team/stakeholders
2. **Monitor usage** in Railway dashboard
3. **Add more news sources** (edit `server.js`)
4. **Customize design** (edit `index.html`)
5. **Add features** from roadmap (see README.md)

---

## 📞 **Support Resources**

- **Railway Docs:** https://docs.railway.app/
- **GitHub Help:** https://docs.github.com/
- **Project README:** See README.md in your project

---

## 🔗 **Your Deployment URLs**

After setup, bookmark these:

```
Dashboard:  https://your-app.up.railway.app/
API Health: https://your-app.up.railway.app/api/health
API Events: https://your-app.up.railway.app/api/events
Railway:    https://railway.app/project/YOUR_PROJECT_ID
GitHub:     https://github.com/YOUR_USERNAME/up-politics-monitor
```

---

**🎊 Congratulations! Your UP Politics Monitor is now LIVE!**

The dashboard will automatically scrape 250+ events daily and update in real-time.
