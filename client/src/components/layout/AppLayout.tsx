import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/UserMenu';
import { BarChart3, Database, Calendar, TrendingUp, LayoutDashboard, Lightbulb, Upload, Activity } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <a className="flex items-center gap-2 text-2xl font-bold text-primary">
                <BarChart3 className="h-8 w-8" />
                FunnelSight
              </a>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <a className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location === '/dashboard' ? 'text-primary' : 'text-foreground'}`}>
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/upload">
                    <a className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location === '/upload' ? 'text-primary' : 'text-foreground'}`}>
                      <Upload className="h-4 w-4" />
                      Import Data
                    </a>
                  </Link>
                  <Link href="/ga4">
                    <a className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location === '/ga4' || location.startsWith('/ga4/') ? 'text-primary' : 'text-foreground'}`}>
                      <Activity className="h-4 w-4" />
                      GA4
                    </a>
                  </Link>
                  <Link href="/events">
                    <a className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location === '/events' ? 'text-primary' : 'text-foreground'}`}>
                      <Calendar className="h-4 w-4" />
                      Events
                    </a>
                  </Link>
                  <Link href="/campaigns">
                    <a className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location === '/campaigns' ? 'text-primary' : 'text-foreground'}`}>
                      <TrendingUp className="h-4 w-4" />
                      Campaigns
                    </a>
                  </Link>
                  <Link href="/data-sources">
                    <a className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location === '/data-sources' ? 'text-primary' : 'text-foreground'}`}>
                      <Database className="h-4 w-4" />
                      Data Sources
                    </a>
                  </Link>
                  <Link href="/insights">
                    <a className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location === '/insights' ? 'text-primary' : 'text-foreground'}`}>
                      <Lightbulb className="h-4 w-4" />
                      Insights
                    </a>
                  </Link>
                  <UserMenu />
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 FunnelSight. Unified intelligence for marketing performance.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary">Documentation</a>
              <a href="#" className="hover:text-primary">Support</a>
              <a href="#" className="hover:text-primary">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
