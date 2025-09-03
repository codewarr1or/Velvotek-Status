import type { Service } from "@shared/schema";

interface SystemOverviewProps {
  services: Service[];
  overallStatus: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational': return 'status-operational';
    case 'degraded': return 'status-degraded';
    case 'outage': return 'status-outage';
    default: return 'text-muted-foreground';
  }
};

const generateProgressBar = (percentage: number, status: string) => {
  const totalBars = 30;
  const filledBars = Math.round((percentage / 100) * totalBars);
  const emptyBars = totalBars - filledBars;
  
  const filled = '█'.repeat(filledBars);
  const empty = status === 'degraded' ? '▓'.repeat(emptyBars) : '░'.repeat(emptyBars);
  
  return filled + empty;
};

export default function SystemOverview({ services, overallStatus }: SystemOverviewProps) {
  const statusCounts = {
    operational: services.filter(s => s.status === 'operational').length,
    degraded: services.filter(s => s.status === 'degraded').length,
    outage: services.filter(s => s.status === 'outage').length,
  };

  return (
    <section className="terminal-card" data-testid="system-overview">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-primary">
          ╭─┐¹system┌──┐overview┌┐status┌─────────────────────────────────────────────────╮
        </h2>
        <div className="text-sm text-muted-foreground">
          Auto-refresh: <span className="text-secondary">ON</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {services.map((service) => (
          <div key={service.id} className="bg-muted rounded border border-border p-4" data-testid={`service-card-${service.id}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground" data-testid={`service-name-${service.id}`}>
                {service.name}
              </h3>
              <span className={`${getStatusColor(service.status)} text-xs`}>●</span>
            </div>
            <div className="ascii-progress text-xs text-primary mb-2">
              {generateProgressBar(service.uptime || 0, service.status)} {(service.uptime || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              <div>Response: <span className={`${getStatusColor(service.status)}`} data-testid={`service-response-${service.id}`}>
                {service.responseTime}ms
              </span></div>
              <div>Uptime: <span className={`${getStatusColor(service.status)}`} data-testid={`service-uptime-${service.id}`}>
                {(service.uptime || 0).toFixed(2)}%
              </span></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-border pt-4">
        <div className="text-sm text-primary font-semibold mb-2">Overall System Status:</div>
        <div className="flex items-center space-x-4 text-sm" data-testid="status-summary">
          <span className="status-operational">█ Operational ({statusCounts.operational} services)</span>
          <span className="status-degraded">█ Degraded ({statusCounts.degraded} services)</span>
          <span className="text-muted-foreground">█ Outage ({statusCounts.outage} services)</span>
        </div>
      </div>
      
      <div className="text-right text-xs text-muted-foreground mt-4">
        ╰─────────────────────────────────────────────────────────────────────────────╯
      </div>
    </section>
  );
}
