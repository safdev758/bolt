# 🚀 Khentit's 3D Virtual Workspace - Setup Guide

## 📋 Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git (optional)

## 🛠️ Installation Steps

### 1. Clone or Download the Project
```bash
# Option A: Clone from GitHub (if repository exists)
git clone https://github.com/yourusername/khentit-3d-workspace.git
cd khentit-3d-workspace

# Option B: Create new project directory
mkdir khentit-3d-workspace
cd khentit-3d-workspace
```

### 2. Create Project Files
You need to create these files in your project directory:

#### `package.json`
```json
{
  "name": "3d-virtual-workspace",
  "version": "1.0.0",
  "description": "Khentit Safouane Amine's 3D Virtual Developer Workspace",
  "main": "index.html",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "three": "^0.160.0",
    "gsap": "^3.12.2"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

#### `vite.config.js`
```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

#### `index.html`
Copy the complete HTML file from the workspace

#### `main.js`
Copy the complete JavaScript file from the workspace

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

### 5. Build for Production
```bash
npm run build
```

## 🌐 Deployment Options

### GitHub Pages
1. Build the project: `npm run build`
2. Push the `dist` folder to a `gh-pages` branch
3. Enable GitHub Pages in repository settings

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### Vercel
1. Import your GitHub repository to Vercel
2. Vercel will automatically detect Vite configuration
3. Deploy with one click

## 🎮 Controls
- **Mouse + Drag**: Rotate camera around workspace
- **Scroll Wheel**: Zoom in/out
- **🎯 Reset View**: Return to optimal camera position
- **⏯️ Animation**: Toggle animations on/off
- **🎨 Theme**: Switch between cyberpunk and clean themes
- **🖼️ Gallery**: Focus camera on project gallery
- **✨ Reset Cards**: Re-trigger flying animation for info cards

## 🎨 Customization
The workspace is fully customizable. You can modify:
- Project information in `projectsData` array
- Personal information in `personalInfo` array
- Tech stack books in `bookTitles` array
- Skills trophies in `trophyData` array
- Screen content in `drawScreenContent` function

## 📱 Browser Support
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Mobile browsers (limited performance)

## 🐛 Troubleshooting

### Common Issues:
1. **White screen**: Check browser console for errors
2. **Slow performance**: Try disabling animations or reducing particle count
3. **Missing textures**: Ensure all files are properly served by Vite

### Performance Tips:
- Use Chrome for best WebGL performance
- Close other browser tabs to free up GPU resources
- Reduce particle count in `createParticles()` function if needed

## 📄 License
MIT License - Feel free to use and modify for your portfolio!

---
*Created by Khentit Safouane Amine - Full Stack Developer*
*Higher National School of Computer Science, Sidi-Bel-Abbès*