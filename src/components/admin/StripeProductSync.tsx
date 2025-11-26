import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const StripeProductSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      console.log("[StripeProductSync] Starting product sync...");
      
      const { data, error } = await supabase.functions.invoke("sync-stripe-products", {
        body: {},
      });

      if (error) throw error;

      console.log("[StripeProductSync] Sync successful:", data);
      setSyncResult(data);
      
      toast({
        title: "Sync erfolgreich",
        description: `${data.synced?.length || 0} Produkte mit Stripe synchronisiert`,
      });
    } catch (error: any) {
      console.error("[StripeProductSync] Sync error:", error);
      toast({
        title: "Sync fehlgeschlagen",
        description: error.message || "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Stripe Produkt-Synchronisation
        </CardTitle>
        <CardDescription>
          Synchronisiere deine Subscription-Produkte mit Stripe. Dies erstellt Produkte und Preise in deinem Stripe-Konto.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Dieser Vorgang erstellt oder aktualisiert folgende Produkte in Stripe:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Rasenpilot Premium (Monatlich) - €9.99/Monat</li>
              <li>Rasenpilot Premium (Jährlich) - €99.00/Jahr</li>
            </ul>
          </AlertDescription>
        </Alert>

        {syncResult && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="font-medium mb-2">Erfolgreich synchronisiert:</div>
              <ul className="list-disc list-inside space-y-1">
                {syncResult.synced?.map((product: any) => (
                  <li key={product.product_id} className="text-sm">
                    {product.product_id}
                    <br />
                    <span className="text-muted-foreground text-xs">
                      Price ID: {product.stripe_price_id}
                    </span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Synchronisiere...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Produkte jetzt synchronisieren
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
