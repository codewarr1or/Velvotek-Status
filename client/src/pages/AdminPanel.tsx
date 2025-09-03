import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Terminal, 
  Server, 
  Activity, 
  AlertTriangle, 
  Play, 
  Square, 
  RotateCcw,
  LogOut,
  Wifi,
  WifiOff,
  Cog
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Service } from '@shared/schema';

interface AdminUser {
  id: number;
  username: string;
}

interface VPSStatus {
  connected: boolean;
  host?: string;
  port?: number;
}

export default function AdminPanel() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [vpsProcesses, setVpsProcesses] = useState<any>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');

    if (!token || !userStr) {
      navigate('/admin/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setAdminUser(user);
    } catch (error) {
      console.error('Error parsing admin user:', error);
      navigate('/admin/login');
    }
  }, [navigate]);

  // Query VPS status
  const { data: vpsStatus } = useQuery<VPSStatus>({
    queryKey: ['/api/admin/vps/status'],
    enabled: !!adminUser,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Query services
  const { data: services = [], refetch: refetchServices } = useQuery<Service[]>({
    queryKey: ['/api/services'],
    enabled: !!adminUser,
  });

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out',
    });
    navigate('/');
  };

  const handleServiceAction = async (serviceName: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/services/${serviceName}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} service`);
      }

      const result = await response.json();

      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });

      if (result.success) {
        // Refresh services data
        setTimeout(() => refetchServices(), 1000);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${action} service`,
        variant: 'destructive',
      });
    }
  };

  // Fetch VPS status and processes
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const fetchVpsStatus = async () => {
      try {
        const response = await fetch('/api/admin/vps/status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const status = await response.json();
          // Ensure status is of type VPSStatus
          setVpsStatus(status as VPSStatus); 
        } else {
          setVpsStatus({ connected: false }); // Set to disconnected if fetch fails
        }
      } catch (error) {
        console.error('Failed to fetch VPS status:', error);
        setVpsStatus({ connected: false }); // Set to disconnected on error
      }
    };

    const fetchVpsProcesses = async () => {
      try {
        const response = await fetch('/api/admin/vps/processes?limit=50', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setVpsProcesses(data);
        } else {
          setVpsProcesses({ connectionActive: false }); // Indicate connection is not active
        }
      } catch (error) {
        console.error('Failed to fetch VPS processes:', error);
        setVpsProcesses({ connectionActive: false }); // Indicate connection is not active on error
      }
    };

    fetchVpsStatus();
    fetchVpsProcesses();
    const vpsInterval = setInterval(() => {
      fetchVpsStatus();
      fetchVpsProcesses();
    }, 5000);

    return () => clearInterval(vpsInterval);
  }, []);


  if (!adminUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Terminal className="h-8 w-8 text-primary" />
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-mono">Admin Panel</h1>
                <p className="text-muted-foreground">Dozzie Develop Status Administration</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm font-mono">
                Welcome, <span className="text-primary">{adminUser.username}</span>
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')}
                data-testid="button-view-status"
              >
                <Activity className="h-4 w-4 mr-2" />
                View Status Page
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* VPS Connection Status */}
          <Card className="terminal-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 font-mono">
                <Server className="h-5 w-5" />
                <span>VPS Connection</span>
              </CardTitle>
              <CardDescription>
                Real-time server connection status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">Status</span>
                  <Badge 
                    variant={vpsStatus?.connected ? 'default' : 'destructive'}
                    className="font-mono"
                  >
                    {vpsStatus?.connected ? (
                      <>
                        <Wifi className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 mr-1" />
                        Disconnected
                      </>
                    )}
                  </Badge>
                </div>

                {vpsStatus?.host && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono">Host</span>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {vpsStatus.host}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono">Port</span>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {vpsStatus.port}
                      </code>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Overview */}
          <Card className="terminal-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 font-mono">
                <Activity className="h-5 w-5" />
                <span>System Overview</span>
              </CardTitle>
              <CardDescription>
                Current system status summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">Total Services</span>
                  <Badge variant="secondary" className="font-mono">
                    {services.length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">Operational</span>
                  <Badge variant="default" className="font-mono">
                    {services.filter(s => s.status === 'operational').length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">Issues</span>
                  <Badge variant="destructive" className="font-mono">
                    {services.filter(s => s.status !== 'operational').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="terminal-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 font-mono">
                <AlertTriangle className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>
                Emergency system controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full font-mono justify-start"
                  onClick={() => toast({
                    title: 'Feature Coming Soon',
                    description: 'Service discovery will be implemented next',
                  })}
                  data-testid="button-discover-services"
                >
                  <Server className="h-4 w-4 mr-2" />
                  Discover Services
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full font-mono justify-start"
                  onClick={() => refetchServices()}
                  data-testid="button-refresh-status"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* VPS Processes */}
        <Card className="terminal-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 font-mono">
              <Activity className="h-5 w-5" />
              <span>VPS Processes</span>
              {vpsProcesses && (
                <Badge variant="outline" className="ml-2">
                  {vpsProcesses.totalProcesses} total
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time processes running on the VPS
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vpsProcesses?.connectionActive ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center">
                      <Cog className="h-4 w-4 mr-2" />
                      Active Services ({vpsProcesses.services?.length || 0})
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {vpsProcesses.services?.slice(0, 8).map((service: any) => (
                        <div key={service.id} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1">
                          <span className="font-mono">{service.name}</span>
                          <Badge 
                            variant={service.status === 'operational' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {service.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Top Processes by CPU
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {vpsProcesses.processes?.slice(0, 8).map((process: any) => (
                        <div key={process.pid} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground w-12">{process.pid}</span>
                            <span className="font-mono truncate w-20">{process.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">{process.memory}</span>
                            <span className="text-xs font-medium">{process.cpuUsage.toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <WifiOff className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">VPS connection not active</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Management */}
        <Card className="terminal-border mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 font-mono">
              <Server className="h-5 w-5" />
              <span>Service Management</span>
            </CardTitle>
            <CardDescription>
              Monitor and control system services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <Card key={service.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-mono font-semibold">{service.name}</h3>
                        <Badge 
                          variant={
                            service.status === 'operational' ? 'default' : 
                            service.status === 'degraded' ? 'secondary' : 'destructive'
                          }
                          className="font-mono text-xs"
                        >
                          {service.status}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Response: {service.responseTime}ms</div>
                        <div>Uptime: {service.uptime}%</div>
                      </div>

                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs font-mono"
                          onClick={() => handleServiceAction(service.name, 'start')}
                          data-testid={`button-start-${service.name}`}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs font-mono"
                          onClick={() => handleServiceAction(service.name, 'stop')}
                          data-testid={`button-stop-${service.name}`}
                        >
                          <Square className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs font-mono"
                          onClick={() => handleServiceAction(service.name, 'restart')}
                          data-testid={`button-restart-${service.name}`}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}