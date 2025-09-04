# Velvotek Status - Local Setup

This is Velvotek Status, a real-time system monitoring dashboard with a terminal-style interface. It features live system metrics, service status monitoring, process information, and incident tracking.

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

## Custom Domain Setup (velvotek.xyz)

To set up a custom domain like `velvotek.xyz` for your Velvotek Status dashboard, follow these steps:

### Prerequisites for Custom Domain
- A registered domain name (e.g., velvotek.xyz)
- A server with a public IP address
- SSH access to your server
- Basic Linux/server administration knowledge

### 1. Domain Registration & DNS Configuration

1. **Register your domain** through any domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)

2. **Configure DNS records** in your domain's DNS settings:
   ```
   # A record pointing to your server's public IP
   Type: A
   Name: @ (or leave blank for root domain)
   Value: YOUR_SERVER_IP
   TTL: 300 (or default)

   # Optional: WWW subdomain
   Type: CNAME  
   Name: www
   Value: velvotek.xyz
   TTL: 300
   ```

3. **Wait for DNS propagation** (can take up to 48 hours, usually much faster)

### 2. Server Setup & Reverse Proxy

#### Install Nginx (recommended reverse proxy)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install epel-release
sudo yum install nginx
```

#### Configure Nginx for Velvotek Status
Create a new Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/velvotek.xyz
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name velvotek.xyz www.velvotek.xyz;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for real-time updates
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Enable the site
```bash
# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/velvotek.xyz /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 3. SSL Certificate Setup (HTTPS)

#### Install Certbot for Let's Encrypt
```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### Obtain SSL certificate
```bash
sudo certbot --nginx -d velvotek.xyz -d www.velvotek.xyz
```

Follow the prompts to:
- Enter your email address
- Agree to terms of service
- Choose redirect option (recommended: redirect HTTP to HTTPS)

#### Auto-renewal setup
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Certbot usually sets up auto-renewal automatically
# Verify with: sudo systemctl status certbot.timer
```

### 4. Firewall Configuration

#### Configure firewall to allow web traffic
```bash
# Ubuntu (UFW)
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

### 5. Application Configuration

#### Update your application for production
```bash
# Set production environment
export NODE_ENV=production
export PORT=5000

# Build and start the application
npm run build
npm start
```

#### Setup Process Manager (PM2 - recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start your application with PM2
pm2 start "npm start" --name "velvotek-status"

# Save PM2 configuration and setup startup
pm2 save
pm2 startup
```

### 6. Testing Your Custom Domain

1. **DNS Propagation**: Check if DNS is working
   ```bash
   nslookup velvotek.xyz
   dig velvotek.xyz
   ```

2. **HTTP Access**: Visit `http://velvotek.xyz` (should redirect to HTTPS)

3. **HTTPS Access**: Visit `https://velvotek.xyz`

4. **WebSocket Connection**: Check browser console for WebSocket connection to `wss://velvotek.xyz/ws`

### 7. Optional: Subdomain Setup

You can also set up subdomains like `status.velvotek.xyz`:

1. **Add DNS record**:
   ```
   Type: CNAME
   Name: status
   Value: velvotek.xyz
   ```

2. **Update Nginx configuration**:
   ```nginx
   server_name status.velvotek.xyz;
   ```

3. **Update SSL certificate**:
   ```bash
   sudo certbot --nginx -d status.velvotek.xyz
   ```

### Common Issues & Solutions

**Domain not resolving**: 
- Check DNS propagation with online tools
- Verify A record points to correct IP
- Wait up to 48 hours for full propagation

**502 Bad Gateway**: 
- Ensure your application is running on port 5000
- Check Nginx configuration syntax
- Verify firewall allows traffic

**WebSocket connection fails**:
- Ensure `/ws` location block is configured in Nginx
- Check that WebSocket upgrade headers are set
- Verify no firewall blocking WebSocket connections

**SSL certificate issues**:
- Ensure domain points to your server before running Certbot
- Check that ports 80 and 443 are open
- Verify domain ownership

Your Velvotek Status dashboard should now be accessible at `https://velvotek.xyz` with full SSL encryption and WebSocket support!

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