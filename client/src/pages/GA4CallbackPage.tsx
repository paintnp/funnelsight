import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  accountId: string;
}

interface OAuthState {
  userId: number;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  properties: Property[];
}

export default function GA4CallbackPage() {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [state, setState] = useState<OAuthState | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse state from URL query params
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get('state');

    if (stateParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(stateParam));
        setState(parsed);
        if (parsed.properties.length === 1) {
          setSelectedProperty(parsed.properties[0]);
        }
      } catch (err) {
        setError('Invalid OAuth state. Please try connecting again.');
      }
    } else {
      setError('Missing OAuth state. Please try connecting again.');
    }
  }, [location]);

  const handleConnect = async () => {
    if (!selectedProperty || !state) return;

    setIsConnecting(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5013';
      const response = await fetch(`${apiUrl}/api/ga4/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          propertyName: selectedProperty.name,
          accountId: selectedProperty.accountId,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          expiresAt: state.expiresAt,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create connection');
      }

      // Success! Redirect to connections page
      navigate('/ga4');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect property');
    } finally {
      setIsConnecting(false);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto mt-12">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => navigate('/ga4')}>
            Back to Connections
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (!state) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Processing OAuth callback...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Select GA4 Property</h1>
          <p className="text-muted-foreground mt-2">
            Choose which Google Analytics 4 property to connect to FunnelSight
          </p>
        </div>

        <div className="space-y-3">
          {state.properties.map((property) => (
            <Card
              key={property.id}
              className={`cursor-pointer transition-all ${
                selectedProperty?.id === property.id
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedProperty(property)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{property.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Property ID: {property.id} • Account: {property.accountId}
                    </CardDescription>
                  </div>
                  {selectedProperty?.id === property.id && (
                    <Badge variant="default">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Selected
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={() => navigate('/ga4')} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={!selectedProperty || isConnecting}
            className="flex-1"
          >
            {isConnecting ? 'Connecting...' : 'Connect Property'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
