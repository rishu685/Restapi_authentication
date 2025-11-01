# 🚀 Deployment Guide

This guide will help you deploy the Task Manager App to production using Netlify (frontend) and Render (backend).

## 📋 Prerequisites

- GitHub account
- Netlify account (free)
- Render account (free) or Railway account
- MongoDB Atlas account (free)

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Choose free tier (M0)
   - Select your preferred region
   - Create cluster

3. **Setup Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Create username/password (save these!)
   - Set role to "Atlas Admin" or "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0)
   - Or add specific IPs for better security

5. **Get Connection String**
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Save this for backend deployment

## 🖥️ Step 2: Deploy Backend to Render

1. **Create Render Account**
   - Go to [Render](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Choose the root directory as build source

3. **Configure Service**
   - **Name**: `scalable-rest-api-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
   JWT_SECRET=YOUR_ACTUAL_SECRET_MINIMUM_32_CHARACTERS_LONG
   JWT_EXPIRE=7d
   BCRYPT_SALT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ALLOWED_ORIGINS=https://YOUR_APP_NAME.netlify.app
   API_VERSION=v1
   API_PREFIX=/api
   LOG_LEVEL=info
   ```

   ⚠️ **IMPORTANT**: Replace the placeholder values above with your actual values:
   - `USERNAME` → Your MongoDB Atlas username
   - `PASSWORD` → Your MongoDB Atlas password  
   - `CLUSTER` → Your MongoDB Atlas cluster name
   - `DATABASE_NAME` → Your database name (e.g., taskmanager)
   - `YOUR_ACTUAL_SECRET_MINIMUM_32_CHARACTERS_LONG` → Generate a secure JWT secret
   - `YOUR_APP_NAME` → Your actual Netlify app name

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://your-app.onrender.com`)

## 🌐 Step 3: Deploy Frontend to Netlify

1. **Create Netlify Account**
   - Go to [Netlify](https://netlify.com)
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Click "New site from Git"
   - Choose GitHub and authorize
   - Select your repository
   - Choose the `frontend` folder as base directory

3. **Configure Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL=https://your-backend-app.onrender.com/api/v1`

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your app will be available at `https://random-name.netlify.app`

## 🔧 Step 4: Update CORS Configuration

1. **Update Backend Environment Variables**
   - Go back to Render dashboard
   - Add your Netlify URL to `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://your-app-name.netlify.app,https://localhost:3000
   ```

2. **Redeploy Backend**
   - Trigger a new deployment on Render
   - Wait for deployment to complete

## ✅ Step 5: Verification

1. **Test Backend**
   - Visit `https://your-backend.onrender.com/health`
   - Should return: `{"success":true,"message":"Server is running"}`

2. **Test API Documentation**
   - Visit `https://your-backend.onrender.com/api/v1/docs`
   - Should show Swagger UI

3. **Test Frontend**
   - Visit your Netlify URL
   - Try logging in with demo accounts:
     - Admin: `admin@example.com` / `Admin123!`
     - User: `user@example.com` / `User123!`

## 🔐 Step 6: Create Demo Accounts (Production)

Use the API documentation or curl to create demo accounts:

```bash
# Create Admin Account
curl -X POST https://your-backend.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com", 
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
  }'

# Create User Account  
curl -X POST https://your-backend.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user",
    "email": "user@example.com",
    "password": "User123!", 
    "firstName": "Demo",
    "lastName": "User"
  }'
```

## 🚀 Step 7: Custom Domain (Optional)

### Netlify Custom Domain
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records as instructed

### Render Custom Domain
1. Go to Service settings → Custom domains
2. Add your domain
3. Update DNS records

## 📊 Monitoring & Maintenance

### Render Monitoring
- Check service logs in Render dashboard
- Monitor uptime and performance
- Set up health check alerts

### Netlify Analytics
- Enable Netlify Analytics for usage stats
- Monitor build logs for issues
- Set up deploy notifications

## 🔧 Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=https://your-app.netlify.app
API_VERSION=v1
API_PREFIX=/api
LOG_LEVEL=info
```

### Frontend (Netlify)
```
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

## 🎯 Alternative Deployment Options

### Backend Alternatives
- **Railway**: Similar to Render, auto-deploys from GitHub
- **Vercel**: Good for serverless functions
- **Heroku**: Classic PaaS (not free anymore)
- **AWS/GCP/Azure**: More complex but scalable

### Frontend Alternatives
- **Vercel**: Great for React apps
- **GitHub Pages**: Free but limited
- **Firebase Hosting**: Google's hosting service

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check ALLOWED_ORIGINS in backend
   - Ensure Netlify URL is added
   - Check browser console for exact origin

2. **API Connection Failed**
   - Verify VITE_API_URL in Netlify
   - Check backend is running on Render
   - Test API endpoints directly

3. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has correct permissions

4. **Build Failures**
   - Check build logs in Netlify/Render
   - Verify all dependencies are in package.json
   - Check Node.js version compatibility

5. **Demo Accounts Not Working**
   - Create accounts using API documentation
   - Verify MongoDB connection
   - Check backend logs for errors

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

🎉 **Congratulations!** Your Task Manager App is now live in production!

**Live URLs:**
- Frontend: `https://your-app.netlify.app`
- Backend API: `https://your-backend.onrender.com/api/v1`
- API Docs: `https://your-backend.onrender.com/api/v1/docs`