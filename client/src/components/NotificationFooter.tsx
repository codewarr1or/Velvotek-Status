export default function NotificationFooter() {
  const handleSubscribeEmail = () => {
    // TODO: Implement email subscription
    console.log('Email subscription requested');
  };

  const handleViewApiDocs = () => {
    // TODO: Open API documentation
    console.log('API documentation requested');
  };

  const handleViewFeeds = () => {
    // TODO: Show RSS/social feeds
    console.log('Feeds requested');
  };

  return (
    <section className="terminal-card" data-testid="notification-footer">
      <h2 className="text-lg font-bold text-primary mb-4">
        ╭─┐⁵notifications┌─────────────────────────────────────────────────────────────────────────────────────────────────╮
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Email Alerts</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Incident creation and updates</div>
            <div>• Service outage notifications</div>
            <div>• Maintenance announcements</div>
          </div>
          <button 
            onClick={handleSubscribeEmail}
            className="w-full bg-primary text-primary-foreground px-3 py-2 rounded text-xs font-medium hover:bg-primary/80 transition-colors"
            data-testid="button-subscribe-email"
          >
            Subscribe to Updates
          </button>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">API Integration</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Webhook notifications</div>
            <div>• Real-time status API</div>
            <div>• JSON feed access</div>
          </div>
          <button 
            onClick={handleViewApiDocs}
            className="w-full bg-secondary text-secondary-foreground px-3 py-2 rounded text-xs font-medium hover:bg-secondary/80 transition-colors"
            data-testid="button-view-api"
          >
            View API Documentation
          </button>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">RSS & Social</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• RSS/Atom feeds</div>
            <div>• Twitter updates</div>
            <div>• Discord notifications</div>
          </div>
          <button 
            onClick={handleViewFeeds}
            className="w-full bg-accent text-accent-foreground px-3 py-2 rounded text-xs font-medium hover:bg-accent/80 transition-colors"
            data-testid="button-view-feeds"
          >
            Access Feeds
          </button>
        </div>
      </div>
      
      <div className="text-right text-xs text-muted-foreground mt-4">
        ╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
      </div>
    </section>
  );
}
