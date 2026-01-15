import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Plus, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface GA4Connection {
  id: number;
  propertyId: string;
  propertyName: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSyncAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export default function GA4ConnectionsPage() {
  const queryClient = useQueryClient();
  const [syncingId, setSyncingId] = useState<number | null>(null);

  // Fetch connections
  const { data: connectionsData, isLoading, error } = useQuery({
    queryKey: ['ga4-connections'],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5013';
      const response = await fetch(`${apiUrl}/api/ga4/connections`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch connections');
      return response.json();
    },
  });

  const connections: GA4Connection[] = connectionsData?.data || [];

  // Connect new property
  const handleConnect = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5013';
      const response = await fetch(`${apiUrl}/api/ga4/oauth/url`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to get OAuth URL');

      const data = await response.json();

      // Redirect to Google OAuth
      window.location.href = data.url;
    } catch (error) {
      console.error('Failed to initiate OAuth:', error);
      alert('Failed to connect. Please try again.');
    }
  };

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async ({ connectionId }: { connectionId: number }) => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5013';
      const response = await fetch(
        `${apiUrl}/api/ga4/connections/${connectionId}/sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            startDate: '30daysAgo',
            endDate: 'today',
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ga4-connections'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-insights'] });
      setSyncingId(null);
      alert(`Successfully synced ${data.rowsSynced} rows`);
    },
    onError: (error) => {
      setSyncingId(null);
      alert(`Sync failed: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5013';
      const response = await fetch(
        `${apiUrl}/api/ga4/connections/${connectionId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete connection');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ga4-connections'] });
    },
  });

  const handleSync = (connectionId: number) => {
    setSyncingId(connectionId);
    syncMutation.mutate({ connectionId });
  };

  const handleDelete = async (connectionId: number, propertyName: string) => {
    if (confirm(`Are you sure you want to disconnect "${propertyName}"?`)) {
      deleteMutation.mutate(connectionId);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Google Analytics 4 Connections</h1>
            <p className="text-muted-foreground mt-2">
              Connect your GA4 properties to import marketing data automatically
            </p>
          </div>
          <Button onClick={handleConnect}>
            <Plus className="mr-2 h-4 w-4" />
            Connect Property
          </Button>
        </div>

        <Separator />

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>About GA4 Integration</AlertTitle>
          <AlertDescription>
            FunnelSight will import session data, campaign information, and conversion events from
            your Google Analytics 4 properties. Data is synced on-demand and stored securely.
          </AlertDescription>
        </Alert>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load connections. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading connections...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && connections.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No GA4 Properties Connected</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Connect your Google Analytics 4 properties to start importing marketing data
                automatically.
              </p>
              <Button onClick={handleConnect}>
                <Plus className="mr-2 h-4 w-4" />
                Connect Your First Property
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Connections List */}
        {!isLoading && !error && connections.length > 0 && (
          <div className="space-y-4">
            {connections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle>{connection.propertyName}</CardTitle>
                        <Badge
                          variant={
                            connection.status === 'connected'
                              ? 'default'
                              : connection.status === 'error'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {connection.status === 'connected' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {connection.status === 'error' && <AlertCircle className="mr-1 h-3 w-3" />}
                          {connection.status}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2">
                        Property ID: {connection.propertyId}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(connection.id)}
                        disabled={syncingId === connection.id}
                      >
                        <RefreshCw
                          className={`mr-2 h-4 w-4 ${
                            syncingId === connection.id ? 'animate-spin' : ''
                          }`}
                        />
                        {syncingId === connection.id ? 'Syncing...' : 'Sync Now'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(connection.id, connection.propertyName)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm">
                    {connection.lastSyncAt ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Last synced {formatDistanceToNow(new Date(connection.lastSyncAt))} ago
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Never synced</span>
                      </div>
                    )}
                  </div>

                  {connection.errorMessage && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Sync Error</AlertTitle>
                      <AlertDescription>{connection.errorMessage}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
