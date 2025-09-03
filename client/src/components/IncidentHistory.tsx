import type { Incident } from "@shared/schema";

interface IncidentHistoryProps {
  incidents: Incident[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'resolved': return 'status-operational';
    case 'investigating': return 'status-degraded';
    case 'identified': return 'status-degraded';
    case 'monitoring': return 'status-degraded';
    default: return 'text-muted-foreground';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical': return '🔴';
    case 'major': return '⚠️';
    case 'minor': return '🟡';
    default: return '●';
  }
};

const formatTimeAgo = (date: Date | string) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};

export default function IncidentHistory({ incidents }: IncidentHistoryProps) {
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const recentIncidents = incidents.filter(i => i.status === 'resolved').slice(0, 5);

  return (
    <section className="terminal-card" data-testid="incident-history">
      <h2 className="text-lg font-bold text-primary mb-4 overflow-hidden">
        <div className="w-full overflow-hidden">
          <span className="hidden lg:inline-block">╭─┐³incidents┌─────────────────────────────────────────────────────╮</span>
          <span className="hidden md:inline-block lg:hidden">╭─┐³incidents┌──────────────────╮</span>
          <span className="md:hidden">╭─┐³incidents┌────╮</span>
        </div>
      </h2>
      
      {/* Current Incidents */}
      {activeIncidents.map((incident) => (
        <div key={incident.id} className="bg-muted border border-warning rounded p-4 mb-4" data-testid={`active-incident-${incident.id}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-warning font-semibold text-sm flex items-center gap-2">
              {getSeverityIcon(incident.severity)} {incident.status.toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground" data-testid={`incident-time-${incident.id}`}>
              {incident.createdAt ? formatTimeAgo(incident.createdAt) : 'Unknown'}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-2" data-testid={`incident-title-${incident.id}`}>
            {incident.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2" data-testid={`incident-description-${incident.id}`}>
            {incident.description}
          </p>
          <div className="text-xs text-warning">
            Affected: {Array.isArray(incident.affectedServices) ? 
              (incident.affectedServices as string[]).join(', ') : 
              'Multiple Services'} • Status: {incident.status}
          </div>
        </div>
      ))}
      
      {/* Recent Incidents */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">Recent Incidents</h3>
        
        {recentIncidents.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">
            No recent incidents to display
          </div>
        ) : (
          recentIncidents.map((incident) => (
            <div key={incident.id} className="flex items-start space-x-3 text-xs" data-testid={`recent-incident-${incident.id}`}>
              <span className={`${getStatusColor(incident.status)} mt-1`}>●</span>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-foreground font-medium" data-testid={`recent-incident-title-${incident.id}`}>
                    {incident.title}
                  </span>
                  <span className="text-muted-foreground" data-testid={`recent-incident-date-${incident.id}`}>
                    {incident.createdAt ? new Date(incident.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown'}
                  </span>
                </div>
                <div className="text-muted-foreground mt-1" data-testid={`recent-incident-summary-${incident.id}`}>
                  {incident.description.length > 60 ? 
                    incident.description.substring(0, 60) + '...' : 
                    incident.description}
                </div>
                <div className="text-primary mt-1">
                  Duration: <span data-testid={`recent-incident-duration-${incident.id}`}>
                    {incident.resolvedAt && incident.createdAt ? 
                      Math.round((new Date(incident.resolvedAt).getTime() - new Date(incident.createdAt).getTime()) / 60000) + ' minutes' :
                      'Ongoing'
                    }
                  </span> • 
                  Impact: <span data-testid={`recent-incident-impact-${incident.id}`}>
                    {incident.severity}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="text-right text-xs text-muted-foreground mt-4 overflow-hidden">
        <div className="w-full overflow-hidden">
          <span className="hidden lg:inline-block">╰─────────────────────────────────────────────────────────────────╯</span>
          <span className="hidden md:inline-block lg:hidden">╰────────────────────────────╯</span>
          <span className="md:hidden">╰──────────╯</span>
        </div>
      </div>
    </section>
  );
}
