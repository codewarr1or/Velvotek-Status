import type { Service, Process } from "@shared/schema";

interface ServiceDetailsProps {
  services: Service[];
  processes: Process[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational': return 'status-operational';
    case 'degraded': return 'status-degraded';
    case 'outage': return 'status-outage';
    default: return 'text-muted-foreground';
  }
};

const generateProgressBar = (percentage: number, maxWidth: number = 50) => {
  const filledBars = Math.round((percentage / 100) * maxWidth);
  const emptyBars = maxWidth - filledBars;
  
  if (percentage < 95) {
    return '█'.repeat(filledBars) + '▓'.repeat(emptyBars);
  }
  return '█'.repeat(filledBars) + '░'.repeat(emptyBars);
};

const formatTimeAgo = (date: Date | string) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  
  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  return `${diffMinutes}m ago`;
};

export default function ServiceDetails({ services, processes }: ServiceDetailsProps) {
  return (
    <section className="terminal-card" data-testid="service-details">
      <h2 className="text-lg font-bold text-primary mb-4">
        <span className="hidden md:inline">╭─┐⁴services┌┐detailed┌────────────────────────────────────────────────────────────────────────────────────────────────╮</span>
        <span className="md:hidden">╭─┐⁴services┌────────────────╮</span>
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs" data-testid="services-table">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground">Service</th>
              <th className="text-left py-2 px-3 text-muted-foreground">Status</th>
              <th className="text-left py-2 px-3 text-muted-foreground">Response Time</th>
              <th className="text-left py-2 px-3 text-muted-foreground">Uptime (24h)</th>
              <th className="text-left py-2 px-3 text-muted-foreground">Error Rate</th>
              <th className="text-left py-2 px-3 text-muted-foreground">Last Check</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  No services data available. Connecting to monitoring...
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr 
                  key={service.id} 
                  className="border-b border-border hover:bg-muted transition-colors" 
                  data-testid={`service-row-${service.id}`}
                >
                  <td className="py-2 px-3 font-medium text-foreground" data-testid={`service-detail-name-${service.id}`}>
                    {service.name}
                  </td>
                  <td className="py-2 px-3">
                    <span className={getStatusColor(service.status)} data-testid={`service-detail-status-${service.id}`}>
                      ● {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </td>
                  <td className={`py-2 px-3 ${getStatusColor(service.status)}`} data-testid={`service-detail-response-${service.id}`}>
                    {service.responseTime}ms
                  </td>
                  <td className="py-2 px-3">
                    <div className={`ascii-progress ${getStatusColor(service.status)}`} data-testid={`service-detail-uptime-${service.id}`}>
                      {generateProgressBar(service.uptime || 0, 40)} {(service.uptime || 0).toFixed(2)}%
                    </div>
                  </td>
                  <td className={`py-2 px-3 ${getStatusColor(service.status)}`} data-testid={`service-detail-errors-${service.id}`}>
                    {service.status === 'operational' ? '0.00%' : 
                     service.status === 'degraded' ? '2.1%' : '15.2%'}
                  </td>
                  <td className="py-2 px-3 text-muted-foreground" data-testid={`service-detail-check-${service.id}`}>
                    {service.lastChecked ? formatTimeAgo(service.lastChecked) : 'Never'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Process List */}
      {processes.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 mb-4">
            Top Processes
          </h3>
          <div className="space-y-2">
            {processes.slice(0, 10).map((process) => (
              <div 
                key={process.id} 
                className="flex items-center justify-between text-xs bg-muted/50 rounded px-3 py-2" 
                data-testid={`process-${process.pid}`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-muted-foreground w-16" data-testid={`process-pid-${process.pid}`}>
                    {process.pid}
                  </span>
                  <span className="text-foreground font-medium w-32 truncate" data-testid={`process-name-${process.pid}`}>
                    {process.name}
                  </span>
                  <span className="text-muted-foreground w-24" data-testid={`process-user-${process.pid}`}>
                    {process.user}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-primary w-16" data-testid={`process-memory-${process.pid}`}>
                    {process.memory}
                  </span>
                  <span className="text-accent w-12" data-testid={`process-cpu-${process.pid}`}>
                    {process.cpuUsage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-right text-xs text-muted-foreground mt-4">
        ╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
      </div>
    </section>
  );
}
