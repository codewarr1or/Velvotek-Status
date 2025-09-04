import { useEffect, useState } from "react";
import TerminalHeader from "@/components/TerminalHeader";
import SystemOverview from "@/components/SystemOverview";
import ResourceMonitoring from "@/components/ResourceMonitoring";
import IncidentHistory from "@/components/IncidentHistory";
import ServiceDetails from "@/components/ServiceDetails";
import NotificationFooter from "@/components/NotificationFooter";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { SystemUpdate, Service, SystemMetrics, Process, Incident } from "@shared/schema";

export default function Dashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const { socket, isConnected } = useWebSocket("/ws");

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'system_update':
            const data: SystemUpdate = message.data;
            setSystemMetrics(data.metrics);
            setServices(data.services);
            setProcesses(data.processes);
            setLastUpdated(new Date().toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit' 
            }));
            break;
          case 'incident_update':
            setIncidents(message.data);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket]);

  const overallStatus = services.length > 0 ? 
    services.some(s => s.status === 'outage') ? 'outage' :
    services.some(s => s.status === 'degraded') ? 'degraded' : 'operational'
    : 'operational';

  const totalUptime = services.length > 0 ? 
    (services.reduce((acc, s) => acc + (s.uptime || 0), 0) / services.length).toFixed(2) + '%'
    : '100%';

  return (
    <div className="min-h-screen bg-background text-foreground font-mono leading-tight">
      <TerminalHeader 
        lastUpdated={lastUpdated}
        totalUptime={totalUptime}
        isConnected={isConnected}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <SystemOverview 
          services={services}
          overallStatus={overallStatus}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResourceMonitoring systemMetrics={systemMetrics} />
          <IncidentHistory incidents={incidents} />
        </div>

        <ServiceDetails 
          services={services}
          processes={processes}
        />

        <NotificationFooter />
      </main>

      {/* Terminal Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>System: <span className="text-primary">Velvotek Infrastructure</span></span>
                <span>|</span>
                <span>Region: <span className="text-accent">Global</span></span>
                <span>|</span>
                <span>Uptime: <span className="text-primary">{totalUptime}</span></span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex items-center space-x-4">
              <span>Powered by Terminal Monitoring</span>
              <span className="blink text-primary">█</span>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4">
            ╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
          </div>
        </div>
      </footer>
    </div>
  );
}
