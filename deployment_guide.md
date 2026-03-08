# 🚀 BALEN Platform: Final Deployment (The Easy Way)

It looks like **Git** is not installed on your computer yet. Here is the easiest way to get your site online **without using the terminal**.

---

### Step 1: Upload to GitHub (Visual Way)
1. Download and install [GitHub Desktop](https://desktop.github.com/).
2. Open it and sign in.
3. Click **"File" -> "Add Local Repository"**.
4. Select your folder: `c:\flutprojects\Balen`.
5. Click **"Publish Repository"** to upload it to your GitHub account (make sure "Keep this code private" is **unchecked** if you want it to be public).

---

### Step 2: Host the Backend (API) on Render.com
1. Go to [Render.com](https://render.com) and click **"New" -> "Web Service"**.
2. Connect your GitHub account and select your `Balen` repository.
3. **Important Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
4. Click **"Advanced" -> "Add Environment Variable"**:
   - Key: `PORT` | Value: `10000`
   - Key: `FIREBASE_SERVICE_ACCOUNT`
   - Value: (Paste the **entire content** of your `backend/firebase-service-account.json` file here)
5. Click **"Create Web Service"**.
6. **Copy the URL** Render gives you (e.g., `https://balen-backend.onrender.com`).

---

### Step 3: Host the Frontend on Vercel.com
1. Go to [Vercel.com](https://vercel.com) and click **"Add New" -> "Project"**.
2. Import the same `Balen` GitHub repository.
3. **Settings**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
4. **Environment Variables** (VERY IMPORTANT):
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com/api` (Make sure to add **/api** at the end!)
5. Click **"Deploy"**.
---

### ✅ You are Live!
Once Vercel finishes, click the link it gives you to visit your world-class platform.

---

### 💡 Troubleshooting "Git Error"
If you really want to use the **terminal** commands from before, you must first install the Git tool from: [git-scm.com](https://git-scm.com/downloads). 

> [!WARNING]
> **Do not copy** the "```bash" or "```" lines themselves. Only copy the lines inside them!
