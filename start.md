# 🚀 How to Run Khentit's 3D Virtual Workspace

## ⚠️ IMPORTANT: You have TWO different projects in this folder!

### 📁 **Project Structure:**
```
3dportfolio/
├── 🎨 FRONTEND (3D Workspace)
│   ├── index.html          # Entry point for 3D workspace
│   ├── main.js             # Three.js 3D workspace code
│   ├── vite.config.js      # Vite configuration
│   └── package.json        # Frontend dependencies
│
└── 🔧 BACKEND (API Server)
    ├── index.js            # Express.js server
    ├── routes/             # API routes
    ├── models/             # Database models
    └── middlewares/        # Server middlewares
```

## 🎯 **How to Run Each Project:**

### **🎨 Frontend - 3D Virtual Workspace**
```bash
# ✅ CORRECT way to run the 3D workspace
npm run dev

# Opens at: http://localhost:3000
# This shows your personalized 3D workspace with TotTrust, Chatty, JobScout
```

### **🔧 Backend - API Server (Optional)**
```bash
# ✅ CORRECT way to run the backend server
npm run backend
# or
node index.js

# Runs at: http://localhost:4000
# This is your Express.js API server
```

## ❌ **STOP Doing This:**

```bash
# ❌ WRONG - Don't run main.js directly with Node.js
node main.js
nodemon main.js

# These commands cause the "window is not defined" error
# because main.js is meant to run in a BROWSER, not Node.js
```

## 🎮 **What You Should See:**

When you run `npm run dev`, you should see:
- ✅ Vite dev server starting
- ✅ Browser opening automatically
- ✅ Your 3D workspace loading with:
  - 🏠 TotTrust project (sky blue)
  - 💬 Chatty project (purple) 
  - 🔍 JobScout project (dark purple)
  - 📚 Floating books (NestJS, Angular, Docker, etc.)
  - 🏆 Skill trophies (PostgreSQL, MongoDB, etc.)
  - ✨ Flying info cards with your profile

## 🐛 **If You Still Get Errors:**

1. **Kill any running processes:**
   ```bash
   pkill -f nodemon
   pkill -f "node.*main"
   ```

2. **Clean install:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Run correctly:**
   ```bash
   npm run dev
   ```

## 🌟 **Remember:**
- **main.js** = Browser code (Three.js) → Use `npm run dev`
- **index.js** = Server code (Node.js) → Use `node index.js`

---
*Your 3D workspace is ready to showcase your amazing projects! 🚀*