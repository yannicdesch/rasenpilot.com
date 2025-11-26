import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Webhook, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const StripeWebhookSetup = () => {
  const { toast } = useToast();
  const webhookUrl = `${window.location.origin}/functions/v1/stripe-webhook`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Kopiert!",
      description: "Webhook URL wurde in die Zwischenablage kopiert",
    });
  };

  const relevantEvents = [
    { event: "product.created", description: "Neues Produkt erstellt" },
    { event: "product.updated", description: "Produkt aktualisiert" },
    { event: "product.deleted", description: "Produkt gelöscht" },
    { event: "price.created", description: "Neuer Preis erstellt" },
    { event: "price.updated", description: "Preis aktualisiert" },
    { event: "customer.subscription.created", description: "Neues Abo erstellt" },
    { event: "customer.subscription.updated", description: "Abo aktualisiert" },
    { event: "customer.subscription.deleted", description: "Abo gekündigt" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Stripe Webhook Konfiguration
        </CardTitle>
        <CardDescription>
          Automatische Synchronisation bei Änderungen in Stripe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Webhook ist bereit für die Konfiguration</p>
              <p className="text-sm">
                Konfiguriere diesen Webhook in deinem Stripe Dashboard, um automatische Updates zu aktivieren.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Schritt 1: Webhook URL kopieren</h3>
            <div className="flex gap-2">
              <code className="flex-1 p-3 bg-muted rounded-md text-sm overflow-x-auto">
                {webhookUrl}
              </code>
              <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Schritt 2: Webhook in Stripe erstellen</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-2">
              <li>Gehe zu deinem Stripe Dashboard → Developers → Webhooks</li>
              <li>Klicke auf "Add endpoint"</li>
              <li>Füge die Webhook URL ein</li>
              <li>Wähle "Select events to listen to"</li>
              <li>Wähle die unten aufgelisteten Events aus</li>
              <li>Klicke auf "Add endpoint"</li>
            </ol>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => window.open("https://dashboard.stripe.com/webhooks", "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Stripe Dashboard öffnen
            </Button>
          </div>

          <div>
            <h3 className="font-medium mb-3">Schritt 3: Diese Events auswählen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {relevantEvents.map(({ event, description }) => (
                <div key={event} className="flex items-start gap-2 p-2 border rounded-md">
                  <Badge variant="secondary" className="mt-0.5 text-xs">
                    {event}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{description}</span>
                </div>
              ))}
            </div>
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              <p className="font-medium mb-1">Optional: Webhook Secret (empfohlen)</p>
              <p>
                Nach der Erstellung des Webhooks in Stripe, kopiere das "Signing secret" und füge es als 
                <code className="mx-1 px-1.5 py-0.5 bg-muted rounded">STRIPE_WEBHOOK_SECRET</code> 
                zu deinen Supabase Secrets hinzu. Dies erhöht die Sicherheit durch Signaturverifizierung.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-medium mb-2">Was wird synchronisiert?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Produktänderungen (Name, Beschreibung, Status)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Preisänderungen (Betrag, Währung, Interval)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Subscription Status (aktiv, gekündigt, erneuert)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Kundendaten (E-Mail, Subscription-Ende)</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
