import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { Database, Plus, CheckCircle, AlertCircle, RefreshCw, BarChart3 } from 'lucide-react';

export default function DataSourcesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'spreadsheet' as any,
    connectionConfig: '{}',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['dataSources'],
    queryFn: () => apiClient.dataSources.getDataSources({ query: {} }),
  });

  const createMutation = useMutation({
    mutationFn: (dataSource: any) => apiClient.dataSources.createDataSource({ body: dataSource }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
      setIsDialogOpen(false);
      setFormData({ name: '', type: 'spreadsheet', connectionConfig: '{}' });
    },
  });

  const syncMutation = useMutation({
    mutationFn: (id: number) => apiClient.dataSources.syncDataSource({ params: { id: String(id) }, body: {} }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      userId: user!.id,
      connectionConfig: JSON.parse(formData.connectionConfig || '{}'),
    });
  };

  const dataSources = data?.status === 200 ? data.body.data : [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Data Sources</h1>
            <p className="text-muted-foreground mt-2">Connect and manage your data sources</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Connect Source
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect Data Source</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Source Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Source Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                      <SelectItem value="google_analytics">Google Analytics</SelectItem>
                      <SelectItem value="crm">CRM</SelectItem>
                      <SelectItem value="ad_platform">Ad Platform</SelectItem>
                      <SelectItem value="event_tool">Event Tool</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Connecting...' : 'Connect Source'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Native Integrations Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Native Integrations</h2>
            <p className="text-muted-foreground mt-1">Connect popular platforms directly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>Google Analytics 4</CardTitle>
                    <CardDescription>Import session and conversion data</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your GA4 properties to automatically sync marketing performance data
                </p>
                <Link href="/ga4">
                  <a>
                    <Button variant="outline" className="w-full">
                      Manage Connections
                    </Button>
                  </a>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Manual Data Sources Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Manual Data Sources</h2>
            <p className="text-muted-foreground mt-1">Custom data source connections</p>
          </div>

          {dataSources.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Database className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Data Sources Connected</h3>
              <p className="text-muted-foreground text-center mb-6">Connect your first data source to start analyzing performance</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Connect Source
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataSources.map((source) => (
              <Card key={source.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize mt-1">{source.type.replace('_', ' ')}</p>
                    </div>
                    {source.status === 'connected' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : source.status === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="capitalize">{source.status}</span>
                    </div>
                    {source.lastSyncAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Sync</span>
                        <span>{new Date(source.lastSyncAt).toLocaleString()}</span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => syncMutation.mutate(source.id)}
                      disabled={syncMutation.isPending}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </AppLayout>
  );
}
