# Deployment Guide - Tacnique Quiz System

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│            Vercel (Frontend - React)                │
│  https://tacnique-frontend.vercel.app              │
└──────────────────────┬──────────────────────────────┘
                       │
                    API Calls
                       │
┌──────────────────────▼──────────────────────────────┐
│  Railway/Render (Backend - Django + PostgreSQL)    │
│  https://tacnique-backend.railway.app              │
│  Database: Neon PostgreSQL                         │
└─────────────────────────────────────────────────────┘
```

---

## Part 1: Push to GitHub

### 1.1 Initialize Git Repository

```powershell
cd C:\Users\Shubham\tacnique
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
git add .
git commit -m "Initial commit: Tacnique Quiz System with Django backend and React frontend"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `tacnique-quiz` (or your preferred name)
3. **Do NOT** initialize with README, .gitignore, or license
4. Copy the repository URL (e.g., `https://github.com/yourusername/tacnique-quiz.git`)

### 1.3 Push to GitHub

```powershell
git remote add origin https://github.com/yourusername/tacnique-quiz.git
git branch -M main
git push -u origin main
```

---

## Part 2: Deploy Backend on Railway or Render

### Option A: Deploy on Railway (Recommended - Easier)

#### 2A.1 Sign Up & Create Project

1. Go to https://railway.app
2. Sign up with GitHub (or email)
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your `tacnique-quiz` repository
5. Railway will auto-detect it's a Python project

#### 2A.2 Add PostgreSQL Database

1. In Railway dashboard, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Wait for PostgreSQL to be provisioned
3. Copy the database credentials (they'll be available as environment variables)

#### 2A.3 Configure Environment Variables

In Railway, go to **Variables** and add:

```
DEBUG=False
SECRET_KEY=your-secure-secret-key-here
ALLOWED_HOSTS=*.railway.app,yourdomain.com
DATABASE_URL=postgres://user:password@host:5432/dbname
CORS_ALLOWED_ORIGINS=https://tacnique-frontend.vercel.app,https://yourdomain.com

# Get DATABASE_URL from Railway PostgreSQL addon
```

#### 2A.4 Deploy

```bash
# Update settings.py to read DATABASE_URL from environment
# (See section 2C below for code changes)

# Then commit and push
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

Railway will automatically deploy on push.

#### 2A.5 Get Your Backend URL

After deployment, Railway will give you a URL like:
```
https://tacnique-backend.railway.app
```

---

### Option B: Deploy on Render.com

#### 2B.1 Sign Up & Connect GitHub

1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select your GitHub repository

#### 2B.2 Configure Web Service

**Name**: `tacnique-backend`

**Build Command**:
```bash
pip install -r requirements.txt && python manage.py migrate
```

**Start Command**:
```bash
gunicorn tacnique_backend.wsgi
```

#### 2B.3 Add PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Name: `tacnique-postgres`
3. Render will provide a `DATABASE_URL`

#### 2B.4 Set Environment Variables

Copy the `DATABASE_URL` from PostgreSQL and add to Web Service:

```
DEBUG=False
SECRET_KEY=your-secure-secret-key-here
ALLOWED_HOSTS=*.onrender.com,yourdomain.com
CORS_ALLOWED_ORIGINS=https://tacnique-frontend.vercel.app,https://yourdomain.com
```

#### 2B.5 Deploy

Click **"Create Web Service"** and Render will deploy.

Your backend URL:
```
https://tacnique-backend.onrender.com
```

---

## Part 2C: Update Django Settings for Production

Update `backend/tacnique_backend/settings.py`:

```python
import os
from decouple import config

# Security
DEBUG = config('DEBUG', default=False, cast=bool)
SECRET_KEY = config('SECRET_KEY', default='change-me-in-production')
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# CORS - Allow Vercel frontend
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000'
).split(',')

# Database - Use DATABASE_URL if provided (Railway/Render)
DATABASE_URL = config('DATABASE_URL', default='sqlite:///db.sqlite3')

if DATABASE_URL.startswith('postgres://'):
    # Convert postgres:// to postgresql://
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://')
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('POSTGRES_DB', ''),
            'USER': config('POSTGRES_USER', ''),
            'PASSWORD': config('POSTGRES_PASSWORD', ''),
            'HOST': config('POSTGRES_HOST', ''),
            'PORT': config('POSTGRES_PORT', '5432'),
            'OPTIONS': {'sslmode': 'require'},
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': 'db.sqlite3',
        }
    }

# HTTPS & Security
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

---

## Part 3: Deploy Frontend on Vercel

### 3.1 Create .env.production in frontend

Create `frontend/.env.production`:

```env
REACT_APP_API_URL=https://tacnique-backend.railway.app
# OR for Render:
# REACT_APP_API_URL=https://tacnique-backend.onrender.app
```

### 3.2 Update Frontend API Calls

In `frontend/src/components/QuizList.js` (and other API calls):

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'

const fetchQuizzes = async () => {
  try {
    setLoading(true)
    const response = await axios.get(`${API_URL}/api/quizzes/`)
    setQuizzes(response.data)
  } catch (err) {
    setError('Failed to load quizzes.')
    console.error(err)
  } finally {
    setLoading(false)
  }
}
```

Update all API calls in:
- `QuizList.js`
- `QuizTaker.js`

### 3.3 Deploy on Vercel

#### Option 1: Via GitHub (Easiest)

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository `tacnique-quiz`
4. Select **Root Directory**: `frontend`
5. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://tacnique-backend.railway.app
   ```
6. Click **"Deploy"**

Vercel will automatically deploy on every push to `main`.

#### Option 2: Via Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

### 3.4 Configure Production Settings

In Vercel dashboard:
- **Domains**: Add a custom domain if you have one
- **Environment Variables**: Ensure `REACT_APP_API_URL` is set to your backend
- **Build Settings**: Framework = React, Build Command = `npm run build`

---

## Part 4: Connect Frontend to Backend

After deployment, update backend CORS:

### On Railway Dashboard:

Go to **Variables** and update:
```
CORS_ALLOWED_ORIGINS=https://tacnique-frontend.vercel.app
```

Then trigger a redeploy.

---

## Verification Checklist

- [ ] GitHub repo contains both `backend/` and `frontend/`
- [ ] Backend deployed on Railway/Render with PostgreSQL
- [ ] Frontend deployed on Vercel
- [ ] Frontend `.env.production` points to backend URL
- [ ] Backend CORS allows frontend domain
- [ ] Can access `/api/quizzes/` from frontend
- [ ] Can create quiz in Django admin
- [ ] Can take quiz and view results on Vercel URL

---

## Environment Variables Summary

### Backend (Railway/Render)
```
DEBUG=False
SECRET_KEY=<generate-random-secure-key>
ALLOWED_HOSTS=*.railway.app,*.onrender.com,yourdomain.com
CORS_ALLOWED_ORIGINS=https://tacnique-frontend.vercel.app,https://yourdomain.com
DATABASE_URL=<auto-provided-by-railway-or-render>
SECURE_SSL_REDIRECT=True
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://tacnique-backend.railway.app
# OR
REACT_APP_API_URL=https://tacnique-backend.onrender.com
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "CORS error" | Check backend `CORS_ALLOWED_ORIGINS` matches frontend URL |
| "404 /api/quizzes" | Backend not running or API URL wrong in frontend `.env.production` |
| "Static files not loading" | Run `python manage.py collectstatic` before deployment |
| "Database connection error" | Verify `DATABASE_URL` in backend environment variables |
| "Vercel build fails" | Check `frontend/package.json` has all dependencies, run `npm install` locally first |

---

## Next Steps

1. Commit and push changes:
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. Monitor deployments:
   - Railway: https://railway.app → Project Dashboard
   - Vercel: https://vercel.com → Project Dashboard

3. Visit deployed URLs and test the full quiz flow

---

**Deployment Complete!** 🎉

Your quiz system is now live at:
- **Frontend**: https://tacnique-frontend.vercel.app
- **Backend**: https://tacnique-backend.railway.app (or .onrender.com)
- **Admin Panel**: https://tacnique-backend.railway.app/admin
