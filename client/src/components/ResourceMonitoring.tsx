import type { SystemMetrics } from "@shared/schema";

interface ResourceMonitoringProps {
  systemMetrics: SystemMetrics | null;
}

const generateProgressBar = (percentage: number, maxWidth: number = 50) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const filledBars = Math.round((clampedPercentage / 100) * maxWidth);
  return '█'.repeat(filledBars) + '░'.repeat(maxWidth - filledBars);
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default function ResourceMonitoring({ systemMetrics }: ResourceMonitoringProps) {
  if (!systemMetrics) {
    return (
      <section className="terminal-card" data-testid="resource-monitoring">
        <h2 className="text-lg font-bold text-primary mb-4">
          ╭─┐²resources┌──────────────────────────────────────────────────────╮
        </h2>
        <div className="text-center text-muted-foreground py-8">
          Connecting to system monitoring...
        </div>
        <div className="text-right text-xs text-muted-foreground mt-4">
          ╰──────────────────────────────────────────────────────────────────╯
        </div>
      </section>
    );
  }

  const coreUsages = Array.isArray(systemMetrics.coreUsages) ? systemMetrics.coreUsages as number[] : [];
  const loadAverage = Array.isArray(systemMetrics.loadAverage) ? systemMetrics.loadAverage as number[] : [];

  return (
    <section className="terminal-card" data-testid="resource-monitoring">
      <h2 className="text-lg font-bold text-primary mb-4">
        ╭─┐²resources┌──────────────────────────────────────────────────────╮
      </h2>
      
      {/* CPU Monitoring */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-foreground">CPU Usage</span>
          <span className="text-xs text-primary" data-testid="cpu-frequency">
            {systemMetrics.cpuFrequency.toFixed(1)} GHz
          </span>
        </div>
        <div className="text-xs text-primary mb-3" data-testid="cpu-usage-bar">
          <div className="flex items-center overflow-hidden">
            <span className="w-8 text-muted-foreground">CPU</span>
            <span className="ascii-progress flex-1 mx-2">{generateProgressBar(systemMetrics.cpuUsage, 35)}</span>
            <span className="w-12 text-right">{systemMetrics.cpuUsage.toFixed(1)}%</span>
          </div>
        </div>
        <div className="space-y-1 text-xs">
          {coreUsages.map((usage, index) => (
            <div key={index} className="flex items-center overflow-hidden">
              <span className="w-8 text-muted-foreground">C{index}</span>
              <span className="ascii-progress text-primary flex-1 mx-2">
                {generateProgressBar(usage, 35)}
              </span>
              <span className="w-12 text-right text-primary">{usage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
        {loadAverage.length > 0 && (
          <div className="text-xs text-muted-foreground mt-2">
            LAV: {loadAverage.map(l => l.toFixed(2)).join(' ')}
          </div>
        )}
      </div>
      
      {/* Memory Monitoring */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-foreground">Memory</span>
          <span className="text-xs text-primary" data-testid="memory-total">
            {formatBytes(systemMetrics.memoryTotal * 1024 * 1024 * 1024)}
          </span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center overflow-hidden">
            <span className="text-muted-foreground w-12">Used</span>
            <span className="ascii-progress text-primary flex-1 mx-2" data-testid="memory-used">
              {generateProgressBar((systemMetrics.memoryUsed / systemMetrics.memoryTotal) * 100, 25)}
            </span>
            <span className="text-right w-16">{formatBytes(systemMetrics.memoryUsed * 1024 * 1024 * 1024)}</span>
          </div>
          <div className="flex items-center overflow-hidden">
            <span className="text-muted-foreground w-12">Cache</span>
            <span className="ascii-progress text-secondary flex-1 mx-2" data-testid="memory-cache">
              {generateProgressBar((systemMetrics.memoryCache / systemMetrics.memoryTotal) * 100, 25)}
            </span>
            <span className="text-right w-16">{formatBytes(systemMetrics.memoryCache * 1024 * 1024 * 1024)}</span>
          </div>
          <div className="flex items-center overflow-hidden">
            <span className="text-muted-foreground w-12">Free</span>
            <span className="ascii-progress text-muted-foreground flex-1 mx-2" data-testid="memory-free">
              {generateProgressBar((systemMetrics.memoryFree / systemMetrics.memoryTotal) * 100, 25)}
            </span>
            <span className="text-right w-16">{formatBytes(systemMetrics.memoryFree * 1024 * 1024 * 1024)}</span>
          </div>
        </div>
      </div>
      
      {/* Network Monitoring */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-foreground">Network ({systemMetrics.networkInterface})</span>
          <span className="text-xs text-accent" data-testid="network-interface">Active</span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center overflow-hidden">
            <span className="text-muted-foreground w-16">▼ Down</span>
            <span className="ascii-progress text-primary flex-1 mx-2">
              {generateProgressBar(Math.min(systemMetrics.networkDownload / 1000000, 1) * 100, 25)}
            </span>
            <span className="text-primary text-right w-20" data-testid="network-download">
              {formatBytes(systemMetrics.networkDownload)}/s
            </span>
          </div>
          <div className="flex items-center overflow-hidden">
            <span className="text-muted-foreground w-16">▲ Up</span>
            <span className="ascii-progress text-secondary flex-1 mx-2">
              {generateProgressBar(Math.min(systemMetrics.networkUpload / 1000000, 1) * 100, 25)}
            </span>
            <span className="text-secondary text-right w-20" data-testid="network-upload">
              {formatBytes(systemMetrics.networkUpload)}/s
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-right text-xs text-muted-foreground mt-4">
        ╰──────────────────────────────────────────────────────────────────╯
      </div>
    </section>
  );
}
