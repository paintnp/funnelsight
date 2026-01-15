import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { Calendar, Users, TrendingUp, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function EventDetailPage({ id }: { id: string }) {
  const { data: eventData, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => apiClient.events.getEvent({ params: { id } }),
  });

  const { } = useQuery({
    queryKey: ['event-metrics', id],
    queryFn: () => apiClient.events.getEventMetrics({ params: { id } }),
  });

  const event = eventData?.status === 200 ? eventData.body : null;
  

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">Event not found</h2>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/events">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <p className="text-muted-foreground capitalize">{event.type.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{event.actualRegistrations}</div>
              {event.targetRegistrations && (
                <p className="text-sm text-muted-foreground">
                  Target: {event.targetRegistrations}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{event.attendanceCount}</div>
              <p className="text-sm text-muted-foreground">
                {event.actualRegistrations > 0
                  ? `${Math.round((event.attendanceCount / event.actualRegistrations) * 100)}% rate`
                  : 'No registrations yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {new Date(event.startDate).toLocaleDateString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(event.startDate).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {event.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{event.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
