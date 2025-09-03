import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { systemMonitor } from "./services/systemMonitor";
import { adminAuthService } from "./services/adminAuth";
import { vpsIntegration } from "./services/vpsIntegration";
import type { WebSocketMessage, SystemUpdate } from "@shared/schema";
import { insertAdminUserSchema, insertServiceSchema, insertIncidentSchema } from "@shared/schema";
import { z } from 'zod';
import jwt from 'jsonwebtoken';

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store connected clients
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    clients.add(ws);

    // Send initial data
    sendSystemUpdate(ws);

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast updates to all connected clients
  const broadcast = (message: WebSocketMessage) => {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  };

  // Send system update to a specific client or broadcast
  const sendSystemUpdate = async (targetClient?: WebSocket) => {
    try {
      const metrics = await systemMonitor.getCurrentMetrics();
      const services = await storage.getAllServices();
      const processes = await storage.getTopProcesses(20);

      if (!metrics) {
        console.log('No metrics available yet');
        return;
      }

      const systemUpdate: SystemUpdate = {
        metrics,
        services,
        processes,
      };

      const message: WebSocketMessage = {
        type: 'system_update',
        data: systemUpdate,
      };

      if (targetClient) {
        targetClient.send(JSON.stringify(message));
      } else {
        broadcast(message);
      }
    } catch (error) {
      console.error('Error sending system update:', error);
    }
  };

  // Send incident updates
  const sendIncidentUpdate = async () => {
    try {
      const incidents = await storage.getActiveIncidents();
      const message: WebSocketMessage = {
        type: 'incident_update',
        data: incidents,
      };
      broadcast(message);
    } catch (error) {
      console.error('Error sending incident update:', error);
    }
  };

  // REST API endpoints
  app.get('/api/services', async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  app.get('/api/incidents', async (req, res) => {
    try {
      const incidents = await storage.getAllIncidents();
      res.json(incidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      res.status(500).json({ error: 'Failed to fetch incidents' });
    }
  });

  app.get('/api/metrics', async (req, res) => {
    try {
      const metrics = await systemMonitor.getCurrentMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  app.get('/api/processes', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const processes = await storage.getTopProcesses(limit);
      res.json(processes);
    } catch (error) {
      console.error('Error fetching processes:', error);
      res.status(500).json({ error: 'Failed to fetch processes' });
    }
  });

  // Start system monitoring and periodic updates
  const startMonitoring = () => {
    // Update system metrics every 2 seconds
    setInterval(async () => {
      await sendSystemUpdate();
    }, 2000);

    // Update incidents every 30 seconds
    setInterval(async () => {
      await sendIncidentUpdate();
    }, 30000);

    // Initialize system monitoring
    systemMonitor.startMonitoring();
  };

  // Start monitoring when server starts
  setTimeout(startMonitoring, 1000);

  // Admin authentication middleware
  const requireAuth = async (req: Request, res: Response, next: Function) => {
    try {
      const token = adminAuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = adminAuthService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const adminUser = await storage.getAdminUser(decoded.id);
      if (!adminUser || !adminUser.isActive) {
        return res.status(401).json({ error: 'Admin user not found or inactive' });
      }

      (req as any).admin = adminUser;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  };

  // Admin login endpoint
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const adminUser = await storage.getAdminUserByUsername(username);
      if (!adminUser) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await adminAuthService.verifyPassword(password, adminUser.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!adminUser.isActive) {
        return res.status(401).json({ error: 'Account is inactive' });
      }

      const token = adminAuthService.generateToken(adminUser);
      res.json({ 
        token, 
        admin: { 
          id: adminUser.id, 
          username: adminUser.username 
        } 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Admin endpoints (protected)
  app.get('/api/admin/me', requireAuth, (req, res) => {
    const admin = (req as any).admin;
    res.json({ 
      id: admin.id, 
      username: admin.username 
    });
  });

  // VPS connection status
  app.get('/api/admin/vps/status', requireAuth, (req, res) => {
    const status = vpsIntegration.getConnectionStatus();
    res.json(status);
  });

  // Service management
  app.post('/api/admin/services/:serviceName/:action', requireAuth, async (req, res) => {
    try {
      const { serviceName, action } = req.params;
      
      if (!['start', 'stop', 'restart'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }

      const result = await vpsIntegration.manageService(serviceName, action as any);
      
      res.json({ 
        success: result, 
        message: result ? 
          `Service ${serviceName} ${action}ed successfully` : 
          `Failed to ${action} service ${serviceName}`
      });
    } catch (error) {
      console.error('Service management error:', error);
      res.status(500).json({ error: 'Service management failed' });
    }
  });

  // Create service manually
  app.post('/api/admin/services', requireAuth, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid service data', details: error.errors });
      }
      console.error('Create service error:', error);
      res.status(500).json({ error: 'Failed to create service' });
    }
  });

  // Create incident
  app.post('/api/admin/incidents', requireAuth, async (req, res) => {
    try {
      const incidentData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(incidentData);
      
      // Send incident update via WebSocket
      await sendIncidentUpdate();
      
      res.json(incident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid incident data', details: error.errors });
      }
      console.error('Create incident error:', error);
      res.status(500).json({ error: 'Failed to create incident' });
    }
  });

  // Update incident
  app.patch('/api/admin/incidents/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const incident = await storage.updateIncident(id, updates);
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found' });
      }
      
      // Send incident update via WebSocket
      await sendIncidentUpdate();
      
      res.json(incident);
    } catch (error) {
      console.error('Update incident error:', error);
      res.status(500).json({ error: 'Failed to update incident' });
    }
  });

  // Initialize default admin user
  async function initializeDefaultAdmin() {
    try {
      const existingAdmin = await storage.getAdminUserByUsername(process.env.ADMIN_USERNAME || 'admin');
      if (!existingAdmin) {
        const adminData = await adminAuthService.createDefaultAdmin();
        await storage.createAdminUser(adminData);
        console.log('Default admin user created');
      }
    } catch (error) {
      console.error('Failed to initialize default admin:', error);
    }
  }

  // Initialize admin user on startup
  await initializeDefaultAdmin();
  
  // Initialize VPS connection and discover services
  setTimeout(async () => {
    try {
      console.log('Attempting to connect to VPS and discover services...');
      if (await vpsIntegration.connect()) {
        await vpsIntegration.discoverAndSyncServices();
        console.log('VPS connection established and services discovered');
      } else {
        console.log('VPS connection failed - using simulated data');
      }
    } catch (error) {
      console.error('VPS initialization failed:', error);
    }
  }, 2000); // Give the server time to start

  return httpServer;
}
