# System Monitoring Dashboard - Local Setup

This is a real-time system monitoring dashboard with a terminal-style interface. It features live system metrics, service status monitoring, process information, and incident tracking.

## Technologies Used

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + WebSockets
- **Real-time**: WebSocket connections for live data updates
- **Styling**: Terminal-inspired dark theme with monospace fonts

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

## Local Installation & Setup

### 1. Download and Extract
Extract the project files to your desired directory.

### 2. Replace Configuration Files
To remove Replit dependencies, replace the following files:

**Replace `vite.config.ts` with the contents of `vite.config.local.ts`:**
```bash
# Delete the original file and rename the local version
rm vite.config.ts
mv vite.config.local.ts vite.config.ts
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### 5. Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Features

- **Real-time System Monitoring**: Live CPU, memory, and network metrics
- **Service Status Tracking**: Monitor multiple services with uptime statistics
- **Process Management**: View running processes with resource usage
- **Incident Tracking**: Log and track system incidents
- **WebSocket Integration**: Real-time updates without page refresh
- **Terminal Aesthetic**: Classic Unix system monitor appearance
- **Admin Panel**: Administrative interface for system management

## API Endpoints

- `GET /api/services` - Get all services
- `GET /api/incidents` - Get all incidents  
- `GET /api/metrics` - Get system metrics
- `GET /api/processes` - Get running processes
- `WebSocket /ws` - Real-time updates

## VPS Integration (Optional)

The application can connect to a real VPS via SSH to display actual system metrics. Set these environment variables:

```bash
VPS_HOST=your-server.com
VPS_USERNAME=your-username
VPS_PASSWORD=your-password
VPS_PORT=22
```

If not configured, the application will use simulated data for demonstration purposes.

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)
- `VPS_HOST` - VPS server hostname (optional)
- `VPS_USERNAME` - VPS SSH username (optional)
- `VPS_PASSWORD` - VPS SSH password (optional)
- `VPS_PORT` - VPS SSH port (optional, default: 22)

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility libraries
│   │   └── pages/       # Application pages
├── server/              # Express backend
│   ├── services/        # Business logic services
│   ├── routes.ts        # API routes & WebSocket handlers
│   └── storage.ts       # Data storage layer
├── shared/              # Shared types and schemas
└── README-LOCAL-SETUP.md # This file
```

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, set a different port:
```bash
PORT=3000 npm run dev
```

### WebSocket Connection Issues
Make sure both frontend and backend are running on the same host and port. The WebSocket automatically connects to the same host as the web application.

### Build Issues
If you encounter build issues, try:
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## License

MIT License - Feel free to use this project for your own monitoring needs.