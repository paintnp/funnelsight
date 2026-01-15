import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function CampaignDetailPage({ id }: { id: string }) {
  const { data: campaignData, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => apiClient.campaigns.getCampaign({ params: { id } }),
  });

  const campaign = campaignData?.status === 200 ? campaignData.body : null;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!campaign) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">Campaign not found</h2>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground capitalize">{campaign.channel}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader><CardTitle>Impressions</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{campaign.impressions.toLocaleString()}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Clicks</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{campaign.clicks.toLocaleString()}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Registrations</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{campaign.registrations}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Attendees</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{campaign.attendees}</div></CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
