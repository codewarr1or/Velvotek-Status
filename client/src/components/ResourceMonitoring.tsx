import type { SystemMetrics } from "@shared/schema";

interface ResourceMonitoringProps {
  systemMetrics: SystemMetrics | null;
}

const generateProgressBar = (percentage: number, maxWidth: number = 50) => {
  const filledBars = Math.round((percentage / 100) * maxWidth);
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
        <div className="ascii-progress text-xs text-primary mb-2" data-testid="cpu-usage-bar">
          CPU {generateProgressBar(systemMetrics.cpuUsage, 80)} {systemMetrics.cpuUsage.toFixed(1)}%
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {coreUsages.slice(0, 8).map((usage, index) => (
            <div key={index} className="text-muted-foreground">
              C{index} <span className="text-primary">▄▄▄▄▄▄▄▄▄▄</span> {usage.toFixed(0)}%
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
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Used</span>
            <span className="ascii-progress text-primary" data-testid="memory-used">
              {generateProgressBar((systemMetrics.memoryUsed / systemMetrics.memoryTotal) * 100, 40)} {formatBytes(systemMetrics.memoryUsed * 1024 * 1024 * 1024)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cache</span>
            <span className="ascii-progress text-secondary" data-testid="memory-cache">
              {generateProgressBar((systemMetrics.memoryCache / systemMetrics.memoryTotal) * 100, 40)} {formatBytes(systemMetrics.memoryCache * 1024 * 1024 * 1024)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Free</span>
            <span className="ascii-progress text-muted-foreground" data-testid="memory-free">
              {generateProgressBar((systemMetrics.memoryFree / systemMetrics.memoryTotal) * 100, 40)} {formatBytes(systemMetrics.memoryFree * 1024 * 1024 * 1024)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Network Monitoring */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-foreground">Network ({systemMetrics.networkInterface})</span>
          <span className="text-xs text-accent" data-testid="network-interface">Active</span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">▼ Download</span>
            <span className="text-primary" data-testid="network-download">
              {formatBytes(systemMetrics.networkDownload)}/s
            </span>
          </div>
          <div className="ascii-progress text-primary">
            {generateProgressBar(Math.min(systemMetrics.networkDownload / 1000000, 1) * 100, 60)}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">▲ Upload</span>
            <span className="text-secondary" data-testid="network-upload">
              {formatBytes(systemMetrics.networkUpload)}/s
            </span>
          </div>
          <div className="ascii-progress text-secondary">
            {generateProgressBar(Math.min(systemMetrics.networkUpload / 1000000, 1) * 100, 60)}
          </div>
        </div>
      </div>
      
      <div className="text-right text-xs text-muted-foreground mt-4">
        ╰──────────────────────────────────────────────────────────────────╯
      </div>
    </section>
  );
}
