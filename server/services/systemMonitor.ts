import { storage } from "../storage";
import { vpsIntegration } from "./vpsIntegration";
import type { InsertSystemMetrics, InsertProcess, SystemMetrics } from "@shared/schema";

class SystemMonitor {
  private isMonitoring = false;
  
  async getCurrentMetrics(): Promise<SystemMetrics | undefined> {
    // Try to get real metrics from VPS first
    if (vpsIntegration.isConnectionActive()) {
      const realMetrics = await vpsIntegration.getRealTimeMetrics();
      if (realMetrics) {
        return realMetrics;
      }
    }
    
    // Fallback to stored metrics
    return storage.getLatestMetrics();
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('System monitoring started');
    
    // Generate initial system state
    this.generateSystemData();
    
    // Update system metrics every 5 seconds (reduced frequency for VPS calls)
    setInterval(() => {
      this.generateSystemData();
    }, 5000);

    // Update service status every 5 seconds
    setInterval(() => {
      this.updateServiceStatus();
    }, 5000);
  }

  private async generateSystemData() {
    // Try to get real data from VPS first
    if (vpsIntegration.isConnectionActive()) {
      try {
        // Get real metrics and processes from VPS
        await vpsIntegration.getRealTimeMetrics();
        await vpsIntegration.getRealTimeProcesses();
        return;
      } catch (error) {
        console.log('Failed to get real VPS data, using fallback simulation');
      }
    }
    
    // Fallback to simulation only if VPS is not available
    await this.generateSimulatedData();
  }

  private async generateSimulatedData() {
    const now = Date.now();
    const baseTime = Math.floor(now / 10000) * 10000;

    const cpuBase = 15 + Math.sin(baseTime / 100000) * 10;
    const cpuNoise = (Math.random() - 0.5) * 5;
    const cpuUsage = Math.max(5, Math.min(95, cpuBase + cpuNoise));

    const coreCount = 4; // More realistic for VPS
    const coreUsages = Array.from({ length: coreCount }, () => {
      const coreBase = cpuUsage + (Math.random() - 0.5) * 20;
      return Math.max(0, Math.min(100, coreBase));
    });

    const memoryTotal = 2.0; // 2 GB - more realistic for VPS
    const memoryUsedBase = 1.2 + Math.sin(baseTime / 200000) * 0.3;
    const memoryCacheBase = 0.5 + Math.sin(baseTime / 150000) * 0.1;
    const memoryUsed = Math.max(0.8, Math.min(1.8, memoryUsedBase));
    const memoryCache = Math.max(0.2, Math.min(0.8, memoryCacheBase));
    const memoryFree = memoryTotal - memoryUsed - memoryCache;

    const networkDownloadBase = 5 + Math.random() * 20;
    const networkUploadBase = 10 + Math.random() * 30;

    const loadAverage = [
      0.5 + Math.random() * 0.3,
      0.4 + Math.random() * 0.2,
      0.3 + Math.random() * 0.1
    ];

    const metrics: InsertSystemMetrics = {
      cpuUsage,
      cpuFrequency: 2.4 + Math.random() * 0.4,
      coreUsages,
      memoryTotal,
      memoryUsed,
      memoryCache,
      memoryFree,
      networkDownload: networkDownloadBase * 1024,
      networkUpload: networkUploadBase * 1024,
      networkInterface: 'eth0',
      loadAverage,
      uptime: Math.floor(now / 1000),
    };

    // Only simulate basic system processes if VPS not available
    const basicProcesses: InsertProcess[] = [
      {
        pid: 1,
        name: 'systemd',
        command: '/sbin/init',
        threads: 1,
        user: 'root',
        memory: '1.2%',
        cpuUsage: 0.0,
      },
      {
        pid: 123,
        name: 'sshd',
        command: '/usr/sbin/sshd -D',
        threads: 1,
        user: 'root',
        memory: '0.5%',
        cpuUsage: 0.1,
      },
    ];

    await storage.createMetrics(metrics);
    await storage.updateProcesses(basicProcesses);
  }

  private async updateServiceStatus() {
    // Try to discover real services from VPS
    if (vpsIntegration.isConnectionActive()) {
      try {
        await vpsIntegration.discoverAndSyncServices();
        return;
      } catch (error) {
        console.log('Failed to discover VPS services');
      }
    }

    // Update existing service response times
    const services = await storage.getAllServices();
    for (const service of services) {
      const variation = (Math.random() - 0.5) * 10;
      const currentResponseTime = service.responseTime || 50;
      const newResponseTime = Math.max(5, currentResponseTime + variation);
      
      await storage.updateService(service.id, {
        responseTime: Math.floor(newResponseTime),
      });
    }
  }
}

export const systemMonitor = new SystemMonitor();