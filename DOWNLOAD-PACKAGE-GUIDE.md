# Download & Package Guide - Velvotek Status

## For the Current User: How to Package This for Download

### Method 1: Direct Download (Recommended)
1. **Download the entire project folder** from your current workspace
2. **Share the zipped folder** with anyone who wants to host it locally
3. **Include these files** in the package:
   - All source code files (`client/`, `server/`, `shared/`)
   - `package.json` (dependencies already cleaned)
   - `vite.config.local.ts` (clean configuration)
   - `setup-local.sh` (automated setup script)
   - `README-LOCAL-SETUP.md` (detailed instructions)
   - `DOWNLOAD-PACKAGE-GUIDE.md` (this file)

### Method 2: Create a Clean Export
If you want to create a completely fresh package:

1. **Create a new folder** called `velvotek-status`
2. **Copy these directories and files**:
   ```
   client/                  # Complete React frontend
   server/                  # Complete Express backend  
   shared/                  # Shared types and schemas
   package.json            # Dependencies (Replit packages already removed)
   vite.config.local.ts    # Clean Vite configuration
   setup-local.sh          # Automated setup script
   README-LOCAL-SETUP.md   # Setup instructions
   tsconfig.json           # TypeScript configuration
   tailwind.config.ts      # Tailwind CSS configuration  
   postcss.config.js       # PostCSS configuration
   drizzle.config.ts       # Database configuration
   ```

3. **Do NOT copy these Replit-specific files**:
   - `.replit`
   - `replit.nix`
   - `replit.md`
   - Any `.env` files with Replit secrets

4. **Zip the folder** and it's ready for download!

## For Recipients: How to Set Up Locally

### Quick Setup (Using the automated script)
1. **Extract the downloaded files**
2. **Open terminal/command prompt** in the project directory
3. **Run the setup script**:
   ```bash
   # On macOS/Linux:
   chmod +x setup-local.sh
   ./setup-local.sh
   
   # On Windows (Git Bash):
   bash setup-local.sh
   ```
4. **Start the application**:
   ```bash
   npm run dev
   ```

### Manual Setup
If the automated script doesn't work:

1. **Extract files** and navigate to the directory
2. **Replace the Vite config**:
   ```bash
   mv vite.config.ts vite.config.ts.backup
   mv vite.config.local.ts vite.config.ts
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start development server**:
   ```bash
   npm run dev
   ```

## What's Included

✅ **Velvotek Status - Real-time System Monitoring**
- Live CPU, memory, network metrics
- Service status tracking with uptime
- Process monitoring and management
- Incident tracking and logging
- WebSocket-powered real-time updates
- Terminal-style dark theme interface

✅ **Complete Full-Stack Application**
- React frontend with TypeScript
- Express.js backend with API endpoints
- WebSocket server for real-time updates
- In-memory storage (easily expandable to database)
- Admin panel for system management

✅ **Production Ready**
- Development and production build scripts
- Proper error handling and logging
- TypeScript for type safety
- Modern UI with shadcn/ui components
- Responsive design

✅ **No External Dependencies**
- Runs completely locally
- No cloud services required
- Optional VPS integration via SSH
- Simulated data when no external connections

## System Requirements

- **Node.js**: Version 18 or higher
- **RAM**: 512MB minimum
- **Storage**: 100MB for source code + node_modules
- **Network**: Local network access (no internet required)

## Default Access

Once running, access the dashboard at:
- **Main Dashboard**: `http://localhost:5000`
- **Admin Panel**: `http://localhost:5000/admin`
- **Default Admin**: Username: `admin`, Password: `admin123`

## Customization

The dashboard is fully customizable:
- **Styling**: Edit CSS variables in `client/src/index.css`
- **Components**: Modify React components in `client/src/components/`
- **API**: Extend backend routes in `server/routes.ts`
- **Data**: Update storage implementation in `server/storage.ts`
- **Real VPS**: Add SSH credentials to connect to actual servers

## Support

For questions or issues:
1. Check `README-LOCAL-SETUP.md` for detailed setup instructions
2. Verify Node.js version is 18+
3. Ensure port 5000 is not in use by other applications
4. Try running `npm install` again if dependencies fail