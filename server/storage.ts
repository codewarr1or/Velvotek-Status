import type { 
  Service, InsertService, 
  Incident, InsertIncident, 
  SystemMetrics, InsertSystemMetrics, 
  Process, InsertProcess,
  AdminUser, InsertAdminUser,
  VpsConnection, InsertVpsConnection 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Services
  getAllServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;

  // Incidents
  getAllIncidents(): Promise<Incident[]>;
  getActiveIncidents(): Promise<Incident[]>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: string, incident: Partial<InsertIncident>): Promise<Incident | undefined>;

  // System Metrics
  getLatestMetrics(): Promise<SystemMetrics | undefined>;
  createMetrics(metrics: InsertSystemMetrics): Promise<SystemMetrics>;

  // Processes
  getTopProcesses(limit: number): Promise<Process[]>;
  updateProcesses(processes: InsertProcess[]): Promise<Process[]>;

  // Admin Users
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser>;
  getAdminUser(id: number): Promise<AdminUser | undefined>;

  // VPS Connections
  getAllVpsConnections(): Promise<VpsConnection[]>;
  createVpsConnection(vpsConnection: InsertVpsConnection): Promise<VpsConnection>;
  getActiveVpsConnection(): Promise<VpsConnection | undefined>;
}

export class MemStorage implements IStorage {
  private services: Map<string, Service>;
  private incidents: Map<string, Incident>;
  private metrics: Map<string, SystemMetrics>;
  private processes: Map<string, Process>;
  private adminUsers: Map<number, AdminUser>;
  private vpsConnections: Map<number, VpsConnection>;

  constructor() {
    this.services = new Map();
    this.incidents = new Map();
    this.metrics = new Map();
    this.processes = new Map();
    this.adminUsers = new Map();
    this.vpsConnections = new Map();
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Initialize with only essential system service if no services are discovered
    // Real services will be discovered from VPS via SSH
    console.log('Storage initialized - waiting for VPS service discovery...');
  }

  // Services
  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = {
      ...insertService,
      id,
      status: insertService.status || 'operational',
      responseTime: insertService.responseTime || 0,
      uptime: insertService.uptime || 100,
      lastChecked: new Date(),
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: string, updateService: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;

    const updatedService: Service = {
      ...service,
      ...updateService,
      lastChecked: new Date(),
    };
    this.services.set(id, updatedService);
    return updatedService;
  }

  // Incidents
  async getAllIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values())
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getActiveIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values())
      .filter(incident => incident.status !== 'resolved')
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const id = randomUUID();
    const incident: Incident = {
      ...insertIncident,
      id,
      status: insertIncident.status || 'investigating',
      severity: insertIncident.severity || 'minor',
      affectedServices: insertIncident.affectedServices || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null,
    };
    this.incidents.set(id, incident);
    return incident;
  }

  async updateIncident(id: string, updateIncident: Partial<InsertIncident>): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    if (!incident) return undefined;

    const updatedIncident: Incident = {
      ...incident,
      ...updateIncident,
      updatedAt: new Date(),
    };

    if (updateIncident.status === 'resolved' && !incident.resolvedAt) {
      updatedIncident.resolvedAt = new Date();
    }

    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }

  // System Metrics
  async getLatestMetrics(): Promise<SystemMetrics | undefined> {
    const allMetrics = Array.from(this.metrics.values());
    return allMetrics.sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA;
    })[0];
  }

  async createMetrics(insertMetrics: InsertSystemMetrics): Promise<SystemMetrics> {
    const id = randomUUID();
    const metrics: SystemMetrics = {
      ...insertMetrics,
      id,
      coreUsages: insertMetrics.coreUsages || [],
      loadAverage: insertMetrics.loadAverage || [],
      networkInterface: insertMetrics.networkInterface || 'eth0',
      timestamp: new Date(),
    };
    this.metrics.set(id, metrics);

    // Keep only last 1000 metrics records
    if (this.metrics.size > 1000) {
      const allMetrics = Array.from(this.metrics.entries());
      allMetrics.sort((a, b) => {
        const dateA = a[1].timestamp ? new Date(a[1].timestamp).getTime() : 0;
        const dateB = b[1].timestamp ? new Date(b[1].timestamp).getTime() : 0;
        return dateB - dateA;
      });
      
      // Remove oldest entries
      for (let i = 1000; i < allMetrics.length; i++) {
        this.metrics.delete(allMetrics[i][0]);
      }
    }

    return metrics;
  }

  // Processes
  async getTopProcesses(limit: number): Promise<Process[]> {
    return Array.from(this.processes.values())
      .sort((a, b) => parseFloat(b.memory.replace(/[^0-9.]/g, '')) - parseFloat(a.memory.replace(/[^0-9.]/g, '')))
      .slice(0, limit);
  }

  async updateProcesses(insertProcesses: InsertProcess[]): Promise<Process[]> {
    // Clear existing processes
    this.processes.clear();

    // Add new processes
    const processes: Process[] = insertProcesses.map(insertProcess => {
      const id = randomUUID();
      const process: Process = {
        ...insertProcess,
        id,
        timestamp: new Date(),
      };
      this.processes.set(id, process);
      return process;
    });

    return processes;
  }

  // Admin Users
  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(user => user.username === username);
  }

  async createAdminUser(insertAdminUser: InsertAdminUser): Promise<AdminUser> {
    const id = this.adminUsers.size + 1;
    const adminUser: AdminUser = {
      ...insertAdminUser,
      id,
      isActive: insertAdminUser.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.adminUsers.set(id, adminUser);
    return adminUser;
  }

  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    return this.adminUsers.get(id);
  }

  // VPS Connections
  async getAllVpsConnections(): Promise<VpsConnection[]> {
    return Array.from(this.vpsConnections.values());
  }

  async createVpsConnection(insertVpsConnection: InsertVpsConnection): Promise<VpsConnection> {
    const id = this.vpsConnections.size + 1;
    const vpsConnection: VpsConnection = {
      ...insertVpsConnection,
      id,
      port: insertVpsConnection.port ?? 22,
      isActive: insertVpsConnection.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vpsConnections.set(id, vpsConnection);
    return vpsConnection;
  }

  async getActiveVpsConnection(): Promise<VpsConnection | undefined> {
    return Array.from(this.vpsConnections.values()).find(conn => conn.isActive);
  }
}

export const storage = new MemStorage();
