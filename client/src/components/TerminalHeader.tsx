interface TerminalHeaderProps {
  lastUpdated: string;
  totalUptime: string;
  isConnected: boolean;
}

export default function TerminalHeader({ lastUpdated, totalUptime, isConnected }: TerminalHeaderProps) {
  return (
    <header className="border-b border-border bg-card" data-testid="terminal-header">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-primary font-bold text-lg">╭─</span>
            <h1 className="text-xl font-bold text-primary terminal-glow" data-testid="header-title">
              Velvotek Status
            </h1>
            <span className="text-primary font-bold text-lg">─╮</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-muted-foreground">
              <span className={isConnected ? "text-accent" : "text-destructive"}>•</span> 
              Last Updated: <span data-testid="last-updated">{lastUpdated || "Connecting..."}</span>
            </span>
            <span className="text-muted-foreground">
              <span className="text-primary">•</span> 
              Uptime: <span data-testid="total-uptime">{totalUptime}</span>
            </span>
            <span className="blink text-primary">█</span>
          </div>
        </div>
      </div>
    </header>
  );
}
