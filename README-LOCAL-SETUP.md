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

## Custom Domain Setup (status.velvotek.xyz)

To set up a custom subdomain like `status.velvotek.xyz` for your Velvotek Status dashboard, we recommend using Cloudflare for the best experience.

### Prerequisites for Custom Domain
- A registered domain name (e.g., velvotek.xyz)
- A server with a public IP address
- SSH access to your server
- Basic Linux/server administration knowledge

## Option A: Cloudflare Setup (Recommended)

Cloudflare provides free SSL, DDoS protection, CDN, and easy DNS management.

### 1. Cloudflare Domain Setup

1. **Register your domain** through Cloudflare or transfer an existing domain:
   - Go to [Cloudflare](https://cloudflare.com)
   - Create an account and add your domain
   - If domain is registered elsewhere, change nameservers to Cloudflare's

2. **Configure DNS records** in Cloudflare dashboard:
   ```
   # A record for status subdomain pointing to your server's public IP
   Type: A
   Name: status
   IPv4 address: YOUR_SERVER_IP
   Proxy status: Proxied (orange cloud) ✅
   TTL: Auto

   # Optional: Root domain redirect (if you want velvotek.xyz to redirect to status.velvotek.xyz)
   Type: A
   Name: @ (or velvotek.xyz)
   IPv4 address: YOUR_SERVER_IP
   Proxy status: Proxied (orange cloud) ✅
   TTL: Auto
   ```

3. **SSL/TLS Configuration**:
   - Go to SSL/TLS → Overview
   - Set encryption mode to **"Full (strict)"** for maximum security
   - Go to SSL/TLS → Edge Certificates
   - Enable **"Always Use HTTPS"**
   - Enable **"HTTP Strict Transport Security (HSTS)"**

### 2. Cloudflare-Optimized Server Setup

Since Cloudflare handles SSL termination, your server configuration is simpler:

#### Install Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install epel-release
sudo yum install nginx
```

#### Configure Nginx for Cloudflare
Create configuration file:
```bash
sudo nano /etc/nginx/sites-available/status.velvotek.xyz
```

Add this Cloudflare-optimized configuration:
```nginx
server {
    listen 80;
    server_name status.velvotek.xyz;

    # Cloudflare real IP restoration
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    real_ip_header CF-Connecting-IP;

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
        
        # Cloudflare headers
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        proxy_set_header CF-Ray $http_cf_ray;
        proxy_set_header CF-Visitor $http_cf_visitor;
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
        
        # Cloudflare headers for WebSockets
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
    }
}
```

#### Enable the site
```bash
sudo ln -s /etc/nginx/sites-available/status.velvotek.xyz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 3. Cloudflare Security & Performance

#### Page Rules (Optional but recommended)
In Cloudflare dashboard → Page Rules, add:
```
URL: status.velvotek.xyz/api/*
Settings: Cache Level = Bypass
```

#### Firewall Rules (Optional)
- Go to Security → WAF
- Enable "OWASP Core Ruleset"
- Add custom rules if needed

#### Speed Optimization
- Go to Speed → Optimization
- Enable "Auto Minify" for CSS, HTML, JS
- Enable "Rocket Loader" for faster JavaScript loading

### 4. Testing Cloudflare Setup

1. **Check DNS**: Visit `https://status.velvotek.xyz` (should load with SSL)
2. **Verify Cloudflare**: Check response headers for `cf-ray` header
3. **WebSocket Test**: Ensure real-time updates work at `wss://status.velvotek.xyz/ws`
4. **SSL Test**: Use [SSL Labs](https://www.ssllabs.com/ssltest/) to verify A+ rating
5. **Admin Panel**: Test admin access at `https://status.velvotek.xyz/admin`

## Option B: Generic DNS Provider Setup

If you prefer not to use Cloudflare:

### 1. Domain Registration & DNS Configuration

1. **Register your domain** through any domain registrar (Namecheap, GoDaddy, etc.)

2. **Configure DNS records** in your domain's DNS settings:
   ```
   # A record for status subdomain pointing to your server's public IP
   Type: A
   Name: status
   Value: YOUR_SERVER_IP
   TTL: 300 (or default)

   # Optional: Root domain (if you want velvotek.xyz to redirect)
   Type: A
   Name: @ (or leave blank for root domain)
   Value: YOUR_SERVER_IP
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
sudo nano /etc/nginx/sites-available/status.velvotek.xyz
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name status.velvotek.xyz;

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
sudo ln -s /etc/nginx/sites-available/status.velvotek.xyz /etc/nginx/sites-enabled/

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
sudo certbot --nginx -d status.velvotek.xyz
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
   nslookup status.velvotek.xyz
   dig status.velvotek.xyz
   ```

2. **HTTP Access**: Visit `http://status.velvotek.xyz` (should redirect to HTTPS)

3. **HTTPS Access**: Visit `https://status.velvotek.xyz`

4. **WebSocket Connection**: Check browser console for WebSocket connection to `wss://status.velvotek.xyz/ws`

5. **Admin Panel**: Test admin access at `https://status.velvotek.xyz/admin`

### 7. Optional: Root Domain Redirect

You can set up the root domain `velvotek.xyz` to redirect to `status.velvotek.xyz`:

1. **Add Nginx redirect configuration**:
   ```nginx
   server {
       listen 80;
       server_name velvotek.xyz www.velvotek.xyz;
       return 301 https://status.velvotek.xyz$request_uri;
   }
   ```

2. **Update SSL certificate** to include root domain:
   ```bash
   sudo certbot --nginx -d status.velvotek.xyz -d velvotek.xyz -d www.velvotek.xyz
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

Your Velvotek Status dashboard should now be accessible at `https://status.velvotek.xyz` with full SSL encryption and WebSocket support! The admin panel is available at `https://status.velvotek.xyz/admin`.

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