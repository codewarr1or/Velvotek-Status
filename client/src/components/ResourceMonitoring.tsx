import type { SystemMetrics } from "@shared/schema";

interface ResourceMonitoringProps {
  systemMetrics: SystemMetrics | null;
}

const generateProgressBar = (percentage: number, maxWidth: number = 50) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const filledBars = Math.round((clampedPercentage / 100) * maxWidth);
  return '█'.repeat(filledBars) + '░'.repeat(maxWidth - filledBars);
};

const generateResponsiveProgressBar = (percentage: number) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const maxWidth = 20; // Responsive width for smaller screens
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
          <span className="hidden sm:inline">╭─┐²resources┌──────────────────────────────────────────────────────╮</span>
          <span className="sm:hidden">╭─┐²resources┌──────────╮</span>
        </h2>
        <div className="text-center text-muted-foreground py-8">
          Connecting to system monitoring...
        </div>
        <div className="text-right text-xs text-muted-foreground mt-4">
          <span className="hidden sm:inline">╰──────────────────────────────────────────────────────────────────╯</span>
          <span className="sm:hidden">╰──────────────────╯</span>
        </div>
      </section>
    );
  }

  const coreUsages = Array.isArray(systemMetrics.coreUsages) ? systemMetrics.coreUsages as number[] : [];
  const loadAverage = Array.isArray(systemMetrics.loadAverage) ? systemMetrics.loadAverage as number[] : [];

  return (
    <section className="terminal-card" data-testid="resource-monitoring">
      <h2 className="text-lg font-bold text-primary mb-4">
        <span className="hidden sm:inline">╭─┐²resources┌──────────────────────────────────────────────────────╮</span>
        <span className="sm:hidden">╭─┐²resources┌──────────╮</span>
      </h2>
      
      {/* CPU Monitoring */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 overflow-hidden">
          <div className="text-sm font-semibold text-foreground min-w-0 flex-1">
            <div className="truncate">CPU Usage</div>
            <div className="text-[10px] text-muted-foreground truncate">{coreUsages.length} Cores @ {systemMetrics.cpuFrequency.toFixed(1)}GHz</div>
          </div>
          <div className="text-right text-xs flex-shrink-0 ml-2" data-testid="cpu-frequency">
            <div className="text-primary font-medium">{systemMetrics.cpuUsage.toFixed(1)}%</div>
            <div className="text-[10px] text-accent">Load</div>
          </div>
        </div>
        <div className="text-xs text-primary mb-3" data-testid="cpu-usage-bar">
          <div className="flex items-center overflow-hidden w-full">
            <span className="flex-shrink-0 text-muted-foreground mr-1 w-8">CPU</span>
            <div className="flex-1 mx-1 min-w-0 overflow-hidden">
              <span className="ascii-progress text-primary truncate">
                <span className="hidden sm:inline">{generateProgressBar(systemMetrics.cpuUsage, 18)}</span>
                <span className="sm:hidden">{generateResponsiveProgressBar(systemMetrics.cpuUsage)}</span>
              </span>
            </div>
            <span className="flex-shrink-0 text-right ml-1 w-12">{systemMetrics.cpuUsage.toFixed(1)}%</span>
          </div>
        </div>
        <div className="space-y-1 text-xs overflow-hidden">
          {coreUsages.map((usage, index) => {
            // Calculate individual core frequency based on load (simulated)
            const coreFreq = systemMetrics.cpuFrequency * (0.8 + (usage / 100) * 0.4);
            return (
              <div key={index} className="flex items-center overflow-hidden w-full">
                <div className="flex-shrink-0 text-muted-foreground mr-1 w-8">
                  <div className="text-xs font-medium">C{index}</div>
                  <div className="text-[9px] text-accent truncate">{coreFreq.toFixed(1)}</div>
                </div>
                <div className="flex-1 mx-1 min-w-0 overflow-hidden">
                  <div className="ascii-progress text-primary truncate">
                    <span className="hidden sm:inline">{generateProgressBar(usage, 18)}</span>
                    <span className="sm:hidden">{generateResponsiveProgressBar(usage)}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right ml-1 w-12">
                  <div className="text-primary font-medium text-xs">{usage.toFixed(0)}%</div>
                  <div className="text-[9px] text-muted-foreground">{(usage * 0.01 * coreFreq).toFixed(1)}</div>
                </div>
              </div>
            );
          })}
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
            <div className="text-muted-foreground min-w-0 flex-shrink-0 mr-2 w-16">
              <div className="text-xs">Used</div>
              <div className="text-[10px] text-destructive">{((systemMetrics.memoryUsed / systemMetrics.memoryTotal) * 100).toFixed(1)}%</div>
            </div>
            <span className="ascii-progress text-primary flex-1 mx-2 min-w-0" data-testid="memory-used">
              <span className="hidden sm:inline">{generateProgressBar((systemMetrics.memoryUsed / systemMetrics.memoryTotal) * 100, 18)}</span>
              <span className="sm:hidden">{generateResponsiveProgressBar((systemMetrics.memoryUsed / systemMetrics.memoryTotal) * 100)}</span>
            </span>
            <div className="text-right flex-shrink-0 ml-2 w-20">
              <div className="text-primary font-medium">{formatBytes(systemMetrics.memoryUsed * 1024 * 1024 * 1024)}</div>
              <div className="text-[10px] text-muted-foreground">Active</div>
            </div>
          </div>
          <div className="flex items-center overflow-hidden">
            <div className="text-muted-foreground min-w-0 flex-shrink-0 mr-2 w-16">
              <div className="text-xs">Cache</div>
              <div className="text-[10px] text-secondary">{((systemMetrics.memoryCache / systemMetrics.memoryTotal) * 100).toFixed(1)}%</div>
            </div>
            <span className="ascii-progress text-secondary flex-1 mx-2 min-w-0" data-testid="memory-cache">
              <span className="hidden sm:inline">{generateProgressBar((systemMetrics.memoryCache / systemMetrics.memoryTotal) * 100, 18)}</span>
              <span className="sm:hidden">{generateResponsiveProgressBar((systemMetrics.memoryCache / systemMetrics.memoryTotal) * 100)}</span>
            </span>
            <div className="text-right flex-shrink-0 ml-2 w-20">
              <div className="text-secondary font-medium">{formatBytes(systemMetrics.memoryCache * 1024 * 1024 * 1024)}</div>
              <div className="text-[10px] text-muted-foreground">Cached</div>
            </div>
          </div>
          <div className="flex items-center overflow-hidden">
            <div className="text-muted-foreground min-w-0 flex-shrink-0 mr-2 w-16">
              <div className="text-xs">Free</div>
              <div className="text-[10px] text-accent">{((systemMetrics.memoryFree / systemMetrics.memoryTotal) * 100).toFixed(1)}%</div>
            </div>
            <span className="ascii-progress text-muted-foreground flex-1 mx-2 min-w-0" data-testid="memory-free">
              <span className="hidden sm:inline">{generateProgressBar((systemMetrics.memoryFree / systemMetrics.memoryTotal) * 100, 18)}</span>
              <span className="sm:hidden">{generateResponsiveProgressBar((systemMetrics.memoryFree / systemMetrics.memoryTotal) * 100)}</span>
            </span>
            <div className="text-right flex-shrink-0 ml-2 w-20">
              <div className="text-accent font-medium">{formatBytes(systemMetrics.memoryFree * 1024 * 1024 * 1024)}</div>
              <div className="text-[10px] text-muted-foreground">Available</div>
            </div>
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
            <div className="text-muted-foreground min-w-0 flex-shrink-0 mr-2 w-16">
              <div className="text-xs">▼ RX</div>
              <div className="text-[10px] text-primary">{((systemMetrics.networkDownload / 1000000) * 100).toFixed(1)}%</div>
            </div>
            <span className="ascii-progress text-primary flex-1 mx-2 min-w-0">
              <span className="hidden sm:inline">{generateProgressBar(Math.min(systemMetrics.networkDownload / 1000000, 1) * 100, 18)}</span>
              <span className="sm:hidden">{generateResponsiveProgressBar(Math.min(systemMetrics.networkDownload / 1000000, 1) * 100)}</span>
            </span>
            <div className="text-primary text-right flex-shrink-0 ml-2 w-24" data-testid="network-download">
              <div className="font-medium">{formatBytes(systemMetrics.networkDownload)}/s</div>
              <div className="text-[10px] text-muted-foreground">Download</div>
            </div>
          </div>
          <div className="flex items-center overflow-hidden">
            <div className="text-muted-foreground min-w-0 flex-shrink-0 mr-2 w-16">
              <div className="text-xs">▲ TX</div>
              <div className="text-[10px] text-secondary">{((systemMetrics.networkUpload / 1000000) * 100).toFixed(1)}%</div>
            </div>
            <span className="ascii-progress text-secondary flex-1 mx-2 min-w-0">
              <span className="hidden sm:inline">{generateProgressBar(Math.min(systemMetrics.networkUpload / 1000000, 1) * 100, 18)}</span>
              <span className="sm:hidden">{generateResponsiveProgressBar(Math.min(systemMetrics.networkUpload / 1000000, 1) * 100)}</span>
            </span>
            <div className="text-secondary text-right flex-shrink-0 ml-2 w-24" data-testid="network-upload">
              <div className="font-medium">{formatBytes(systemMetrics.networkUpload)}/s</div>
              <div className="text-[10px] text-muted-foreground">Upload</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-right text-xs text-muted-foreground mt-4">
        <span className="hidden sm:inline">╰──────────────────────────────────────────────────────────────────╯</span>
        <span className="sm:hidden">╰──────────────────╯</span>
      </div>
    </section>
  );
}
