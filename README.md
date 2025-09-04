# Velvotek Status

A real-time system monitoring dashboard with a terminal-style interface. Features live system metrics, service status monitoring, process information, and incident tracking.

![Terminal Style Dashboard](https://via.placeholder.com/800x400/1a1a1a/00ff00?text=Terminal+Style+Dashboard)

## ✨ Features

- **Real-time System Monitoring**: Live CPU, memory, and network metrics
- **Service Status Tracking**: Monitor multiple services with uptime statistics  
- **Process Management**: View running processes with resource usage
- **Incident Tracking**: Log and track system incidents
- **Terminal Aesthetic**: Dark theme with monospace fonts and retro styling
- **WebSocket Updates**: Real-time data streaming with auto-reconnection

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + WebSockets
- **Real-time**: WebSocket connections for live data updates
- **Database**: PostgreSQL with Drizzle ORM (optional)
- **Styling**: Terminal-inspired dark theme with monospace fonts

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/velvotek-status.git
   cd velvotek-status
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
velvotek-status/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   └── pages/          # Application pages
├── server/                 # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage layer
│   └── monitoring.ts      # System monitoring service
├── shared/                 # Shared types and schemas
└── attached_assets/       # Static assets
```

## 🔧 Configuration

The application uses environment variables for configuration:

- `NODE_ENV`: Environment (development/production)
- `DATABASE_URL`: PostgreSQL connection string (optional)
- `PORT`: Server port (defaults to 5000)

## 📊 Features Overview

### System Monitoring
- Real-time CPU usage and frequency monitoring
- Memory usage tracking (total, used, cached, free)
- Network activity monitoring (upload/download speeds)
- System load averages and uptime

### Service Management
- Service status tracking (operational, degraded, outage)
- Response time monitoring
- Uptime percentage calculations
- Historical incident tracking

### Process Monitoring
- Running process overview
- CPU and memory usage per process
- Process thread counts
- User and command information

## 🎨 Terminal Styling

The interface mimics classic Unix system monitors with:
- Dark color schemes with green/amber accents
- Monospace fonts (JetBrains Mono, Fira Code)
- ASCII borders and terminal-style progress bars
- Blinking cursor effects
- Unicode block characters for visual elements

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏗 Development

### Local Setup
For detailed local setup instructions, see [README-LOCAL-SETUP.md](README-LOCAL-SETUP.md)

### Database Setup
The application can run with in-memory storage or PostgreSQL:

```bash
# Push database schema (if using PostgreSQL)
npm run db:push
```

### WebSocket Communication
Real-time updates are handled through WebSocket connections:
- System metrics broadcast every 2 seconds
- Service status updates every 30 seconds
- Automatic reconnection with exponential backoff

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check existing documentation in the `README-LOCAL-SETUP.md`
- Review the project architecture in `replit.md`

---

Built with ❤️ for system monitoring enthusiasts