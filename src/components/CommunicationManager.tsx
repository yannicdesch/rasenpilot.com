import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageSquare, Phone, BarChart3, TestTube, RefreshCw } from 'lucide-react';
import { useCommunicationTracking } from '@/hooks/useCommunicationTracking';

const CommunicationManager: React.FC = () => {
  const {
    preferences,
    stats,
    loading,
    error,
    updatePreferences,
    fetchStats,
    sendTestSMS,
    sendTestWhatsApp,
    refetch
  } = useCommunicationTracking();

  const [testMessage, setTestMessage] = useState('Hallo! Dies ist eine Testnachricht von Rasenpilot. 🌱');
  const [sending, setSending] = useState(false);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');

  const handlePreferenceUpdate = async (field: string, value: any) => {
    await updatePreferences({ [field]: value });
  };

  const handleTestSMS = async () => {
    if (!preferences.phoneNumber) {
      return;
    }
    setSending(true);
    await sendTestSMS(testMessage);
    setSending(false);
  };

  const handleTestWhatsApp = async () => {
    if (!preferences.phoneNumber) {
      return;
    }
    setSending(true);
    await sendTestWhatsApp(testMessage);
    setSending(false);
  };

  const handleTimeframeChange = (newTimeframe: 'day' | 'week' | 'month') => {
    setTimeframe(newTimeframe);
    fetchStats(newTimeframe);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading communication settings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS & WhatsApp Tracking
          </CardTitle>
          <CardDescription>
            Manage your communication preferences and track engagement across SMS and WhatsApp channels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Select
                      value={preferences.countryCode}
                      onValueChange={(value) => handlePreferenceUpdate('countryCode', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+49">🇩🇪 +49</SelectItem>
                        <SelectItem value="+43">🇦🇹 +43</SelectItem>
                        <SelectItem value="+41">🇨🇭 +41</SelectItem>
                        <SelectItem value="+1">🇺🇸 +1</SelectItem>
                        <SelectItem value="+44">🇬🇧 +44</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      placeholder="1234567890"
                      value={preferences.phoneNumber}
                      onChange={(e) => handlePreferenceUpdate('phoneNumber', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive lawn care reminders via SMS
                    </p>
                  </div>
                  <Switch
                    checked={preferences.smsOptIn}
                    onCheckedChange={(checked) => handlePreferenceUpdate('smsOptIn', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>WhatsApp Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive lawn care reminders via WhatsApp
                    </p>
                  </div>
                  <Switch
                    checked={preferences.whatsappOptIn}
                    onCheckedChange={(checked) => handlePreferenceUpdate('whatsappOptIn', checked)}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Communication Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track performance across communication channels
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={timeframe} onValueChange={handleTimeframeChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Last Day</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={refetch}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        SMS Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Sent:</span>
                        <Badge variant="secondary">{stats.sms.sent}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Delivered:</span>
                        <Badge variant="secondary">{stats.sms.delivered}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Read:</span>
                        <Badge variant="secondary">{stats.sms.read}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Delivery Rate:</span>
                        <Badge>{stats.sms.deliveryRate}%</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        WhatsApp Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Sent:</span>
                        <Badge variant="secondary">{stats.whatsapp.sent}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Delivered:</span>
                        <Badge variant="secondary">{stats.whatsapp.delivered}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Read:</span>
                        <Badge variant="secondary">{stats.whatsapp.read}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Delivery Rate:</span>
                        <Badge>{stats.whatsapp.deliveryRate}%</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Combined Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Sent:</span>
                        <Badge variant="secondary">{stats.combined.totalSent}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Delivered:</span>
                        <Badge variant="secondary">{stats.combined.totalDelivered}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Read:</span>
                        <Badge variant="secondary">{stats.combined.totalRead}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Replied:</span>
                        <Badge variant="secondary">{stats.combined.totalReplied}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No communication data available yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="testing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Test Communications
                  </CardTitle>
                  <CardDescription>
                    Send test messages to verify your communication setup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="testMessage">Test Message</Label>
                    <Input
                      id="testMessage"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Enter your test message..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleTestSMS}
                      disabled={!preferences.phoneNumber || sending || !preferences.smsOptIn}
                      className="flex-1"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Phone className="h-4 w-4 mr-2" />
                      )}
                      Send Test SMS
                    </Button>

                    <Button
                      onClick={handleTestWhatsApp}
                      disabled={!preferences.phoneNumber || sending || !preferences.whatsappOptIn}
                      variant="outline"
                      className="flex-1"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <MessageSquare className="h-4 w-4 mr-2" />
                      )}
                      Send Test WhatsApp
                    </Button>
                  </div>

                  {(!preferences.phoneNumber || (!preferences.smsOptIn && !preferences.whatsappOptIn)) && (
                    <Alert>
                      <AlertDescription>
                        Please set your phone number and enable at least one communication channel to send test messages.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationManager;