# Step-by-Step Cloud Deployment Guide

This guide provides exact step-by-step instructions to deploy your Datastraw Support CRM live to the internet and get a public URL for your submission.

Because we built a **multi-stage production `Dockerfile`**, both your React frontend and FastAPI backend build into a single container that runs on port `8000`.

---

## 📌 Step 1: Push Your Code to GitHub (Prerequisite)

Before deploying to the cloud, your repository must be on GitHub.

1. Open PowerShell / Command Prompt in your project folder (`c:\Users\Devesh\OneDrive\Documents\crm`):
   ```bash
   git init
   git add .
   git commit -m "Complete Datastraw Support CRM with Docker and SLA features"
   ```

2. Create a new repository on [GitHub](https://github.com/new):
   - Repository name: `datastraw-crm`
   - Visibility: **Public**

3. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/datastraw-crm.git
   git branch -M main
   git push -u origin main
   ```

---

## 🚀 Step 2: Deploy to Railway.app (Recommended - 2 Minutes)

Railway automatically detects your `Dockerfile` and deploys your full-stack app with zero manual configuration.

1. Open [Railway.app](https://railway.app/) and sign in with your **GitHub account**.
2. Click **"New Project"** → Select **"Deploy from GitHub repo"**.
3. Search and select your repository **`datastraw-crm`**.
4. Railway will automatically detect the `Dockerfile` and begin building.
5. Once the build completes, click on your deployed service block → Go to **Settings** → Under **Networking**, click **"Generate Domain"**.
6. Railway will instantly assign you a live HTTPS public URL, such as:
   `https://datastraw-crm-production.up.railway.app`
7. Open the URL in an incognito window to verify:
   - Create a ticket
   - Test search & filter
   - Check ticket detail and add notes

---

## 🌐 Alternative Step 2: Deploy to Render.com (Free Web Service)

If you prefer using Render:

1. Open [Render.com](https://render.com/) and sign in with GitHub.
2. Click **"New +"** (top right) → Select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** → Select **`datastraw-crm`**.
4. Configure service settings:
   - **Name:** `datastraw-crm`
   - **Region:** Any (e.g. Singapore / Oregon)
   - **Language / Environment:** Select **Docker**
   - **Instance Type:** Free
5. Click **"Create Web Service"**.
6. Render will build your Dockerfile and issue a public URL:
   `https://datastraw-crm.onrender.com`

---

## 📋 What to Put in Your Submission Email

Once your app is live:

1. Copy your public live URL (e.g., `https://datastraw-crm-production.up.railway.app`).
2. Copy your GitHub repository link.
3. Record a quick 3-minute screen walkthrough using the script in [`docs/DEMO_SCRIPT.md`](file:///c:/Users/Devesh/OneDrive/Documents/crm/docs/DEMO_SCRIPT.md) and copy the YouTube/Loom link.
4. Copy the pre-formatted email from [`docs/SUBMISSION_EMAIL.md`](file:///c:/Users/Devesh/OneDrive/Documents/crm/docs/SUBMISSION_EMAIL.md), fill in your links, and send it to:
   - **To:** `ozair.shaikh@datastraw.in`, `aryan.jaiswal@datastraw.in`
   - **CC:** `talent@datastraw.in`
