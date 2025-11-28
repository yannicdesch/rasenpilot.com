import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Webhook, CheckCircle, AlertCircle, Copy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const StripeWebhookManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [webhookInfo, setWebhookInfo] = useState<any>(null);
  const [webhookSecret, setWebhookSecret] = useState("");
  const { toast } = useToast();

  const webhookUrl = `https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/stripe-webhook`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "URL kopiert",
      description: "Webhook URL wurde in die Zwischenablage kopiert",
    });
  };

  const handleCreateWebhook = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-stripe-webhook");

      if (error) throw error;

      setWebhookInfo(data);
      toast({
        title: "Webhook erstellt",
        description: "Stripe Webhook wurde erfolgreich eingerichtet",
      });
    } catch (error: any) {
      console.error("[StripeWebhookManager] Error:", error);
      toast({
        title: "Fehler",
        description: error.message || "Webhook konnte nicht erstellt werden",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveSecret = async () => {
    if (!webhookSecret) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie das Webhook Secret ein",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke("save-webhook-secret", {
        body: { secret: webhookSecret }
      });

      if (error) throw error;

      toast({
        title: "Secret gespeichert",
        description: "Webhook Secret wurde erfolgreich gespeichert",
      });
      setWebhookSecret("");
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Secret konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Stripe Webhook Manager
        </CardTitle>
        <CardDescription>
          Automatische Einrichtung des Stripe Webhooks für Subscription-Updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Webhook URL:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-2 py-1 rounded text-sm">
                  {webhookUrl}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUrl}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Diese Funktion erstellt automatisch einen Webhook-Endpoint in Ihrem Stripe-Konto mit den erforderlichen Events.
          </p>
          <Button
            onClick={handleCreateWebhook}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              "Erstelle Webhook..."
            ) : (
              <>
                <Webhook className="mr-2 h-4 w-4" />
                Webhook automatisch einrichten
              </>
            )}
          </Button>
        </div>

        {webhookInfo && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Webhook erfolgreich erstellt!</p>
                <div className="text-sm space-y-1">
                  <p>Webhook ID: <code className="bg-muted px-1">{webhookInfo.id}</code></p>
                  <p>Status: <code className="bg-muted px-1">{webhookInfo.status}</code></p>
                  {webhookInfo.secret && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="font-medium text-yellow-800">Webhook Signing Secret:</p>
                      <code className="text-xs break-all">{webhookInfo.secret}</code>
                      <p className="text-xs text-yellow-700 mt-1">
                        Kopieren Sie dieses Secret und speichern Sie es unten für zusätzliche Sicherheit.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="webhookSecret">Webhook Signing Secret (Optional aber empfohlen)</Label>
          <p className="text-xs text-muted-foreground">
            Das Signing Secret erhöht die Sicherheit, indem es verifiziert, dass Anfragen wirklich von Stripe kommen.
          </p>
          <div className="flex gap-2">
            <Input
              id="webhookSecret"
              type="password"
              placeholder="whsec_..."
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
            />
            <Button onClick={handleSaveSecret} variant="outline">
              Speichern
            </Button>
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <p className="font-medium mb-1">Registrierte Events:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>checkout.session.completed</li>
              <li>customer.subscription.created</li>
              <li>customer.subscription.updated</li>
              <li>customer.subscription.deleted</li>
              <li>product.created / updated / deleted</li>
              <li>price.created / updated</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
