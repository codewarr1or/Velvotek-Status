import { SSHClient, SSHConnectionConfig } from './sshClient';
import { storage } from '../storage';
import type { SystemMetrics, Process } from '@shared/schema';

export class VPSIntegration {
  private sshClient: SSHClient | null = null;
  private isConnected = false;
  private connectionConfig: SSHConnectionConfig | null = null;

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      // Get connection details from environment variables
      const host = process.env.VPS_HOST;
      const username = process.env.VPS_USERNAME;
      const password = process.env.VPS_PASSWORD;
      const port = parseInt(process.env.VPS_PORT || '22');

      if (!host || !username || !password) {
        console.log('VPS connection credentials not configured, using mock data');
        return;
      }

      this.connectionConfig = { host, username, password, port };
      
      // Create VPS connection record in storage if not exists
      const existingConnection = await storage.getActiveVpsConnection();
      if (!existingConnection) {
        await storage.createVpsConnection({
          name: 'Primary VPS',
          host,
          port,
          username,
          isActive: true,
        });
      }

      await this.connect();
    } catch (error) {
      console.error('Failed to initialize VPS connection:', error);
    }
  }

  async connect(): Promise<boolean> {
    if (!this.connectionConfig) {
      console.log('No VPS connection configuration available');
      return false;
    }

    try {
      this.sshClient = new SSHClient(this.connectionConfig);
      await this.sshClient.connect();
      this.isConnected = true;
      console.log('VPS connection established successfully');

      // Discover services on initial connection
      await this.discoverAndSyncServices();
      
      return true;
    } catch (error) {
      console.error('Failed to connect to VPS:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.sshClient) {
      this.sshClient.disconnect();
      this.sshClient = null;
      this.isConnected = false;
      console.log('VPS connection closed');
    }
  }

  async getRealTimeMetrics(): Promise<SystemMetrics | null> {
    if (!this.isConnected || !this.sshClient) {
      return null;
    }

    try {
      const metricsData = await this.sshClient.getSystemMetrics();
      if (Object.keys(metricsData).length === 0) {
        return null;
      }

      const metrics = await storage.createMetrics(metricsData as any);
      return metrics;
    } catch (error) {
      console.error('Error getting real-time metrics from VPS:', error);
      
      // Try to reconnect if connection seems broken
      if (error.message.includes('Channel open failure')) {
        console.log('SSH channel failure detected, attempting reconnection...');
        try {
          await this.reconnect();
        } catch (reconnectError) {
          console.error('Reconnection failed:', reconnectError);
        }
      }
      
      return null;
    }
  }

  async getRealTimeProcesses(): Promise<Process[]> {
    if (!this.isConnected || !this.sshClient) {
      return [];
    }

    try {
      const processData = await this.sshClient.getRunningProcesses();
      const processes = await storage.updateProcesses(processData);
      return processes;
    } catch (error) {
      console.error('Error getting real-time processes from VPS:', error);
      
      // Try to reconnect if connection seems broken
      if (error.message.includes('Channel open failure')) {
        console.log('SSH channel failure detected, attempting reconnection...');
        try {
          await this.reconnect();
        } catch (reconnectError) {
          console.error('Reconnection failed:', reconnectError);
        }
      }
      
      return [];
    }
  }

  private async reconnect(): Promise<void> {
    console.log('Attempting to reconnect to VPS...');
    await this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await this.connect();
  }

  async discoverAndSyncServices(): Promise<void> {
    if (!this.isConnected || !this.sshClient) {
      return;
    }

    try {
      const discoveredServices = await this.sshClient.discoverServices();
      console.log(`Discovered ${discoveredServices.length} services from VPS`);

      // Add discovered services to storage if they don't exist
      const existingServices = await storage.getAllServices();
      const existingServiceNames = new Set(existingServices.map(s => s.name));

      for (const service of discoveredServices) {
        if (!existingServiceNames.has(service.name)) {
          await storage.createService(service);
          console.log(`Added new service: ${service.name}`);
        }
      }
    } catch (error) {
      console.error('Error discovering services from VPS:', error);
    }
  }

  async manageService(serviceName: string, action: 'start' | 'stop' | 'restart'): Promise<boolean> {
    if (!this.isConnected || !this.sshClient) {
      throw new Error('VPS connection not available');
    }

    try {
      let result = false;
      
      switch (action) {
        case 'start':
          result = await this.sshClient.startService(serviceName);
          break;
        case 'stop':
          result = await this.sshClient.stopService(serviceName);
          break;
        case 'restart':
          result = await this.sshClient.restartService(serviceName);
          break;
      }

      if (result) {
        // Update service status in storage
        const services = await storage.getAllServices();
        const service = services.find(s => s.name.toLowerCase().includes(serviceName.toLowerCase()));
        
        if (service) {
          const newStatus = action === 'stop' ? 'outage' : 'operational';
          await storage.updateService(service.id, { status: newStatus });
        }
      }

      return result;
    } catch (error) {
      console.error(`Error managing service ${serviceName} (${action}):`, error);
      return false;
    }
  }

  isConnectionActive(): boolean {
    return this.isConnected && this.sshClient?.isConnectionActive() === true;
  }

  getConnectionStatus(): { connected: boolean; host?: string; port?: number } {
    return {
      connected: this.isConnected,
      host: this.connectionConfig?.host,
      port: this.connectionConfig?.port,
    };
  }
}

export const vpsIntegration = new VPSIntegration();