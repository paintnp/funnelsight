import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import UploadDataPage from './pages/UploadDataPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import DataSourcesPage from './pages/DataSourcesPage';
import InsightsPage from './pages/InsightsPage';
import GA4ConnectionsPage from './pages/GA4ConnectionsPage';
import GA4CallbackPage from './pages/GA4CallbackPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          {/* Public routes */}
          <Route path="/" component={HomePage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />

          {/* Protected routes */}
          <Route path="/dashboard">
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          </Route>

          <Route path="/upload">
            <ProtectedRoute>
              <UploadDataPage />
            </ProtectedRoute>
          </Route>

          <Route path="/ga4">
            <ProtectedRoute>
              <GA4ConnectionsPage />
            </ProtectedRoute>
          </Route>

          <Route path="/ga4/connect">
            <ProtectedRoute>
              <GA4CallbackPage />
            </ProtectedRoute>
          </Route>

          <Route path="/events">
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          </Route>

          <Route path="/events/:id">
            {(params) => (
              <ProtectedRoute>
                <EventDetailPage id={params.id} />
              </ProtectedRoute>
            )}
          </Route>

          <Route path="/campaigns">
            <ProtectedRoute>
              <CampaignsPage />
            </ProtectedRoute>
          </Route>

          <Route path="/campaigns/:id">
            {(params) => (
              <ProtectedRoute>
                <CampaignDetailPage id={params.id} />
              </ProtectedRoute>
            )}
          </Route>

          <Route path="/data-sources">
            <ProtectedRoute>
              <DataSourcesPage />
            </ProtectedRoute>
          </Route>

          <Route path="/insights">
            <ProtectedRoute>
              <InsightsPage />
            </ProtectedRoute>
          </Route>

          {/* 404 */}
          <Route>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
                <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
              </div>
            </div>
          </Route>
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}
