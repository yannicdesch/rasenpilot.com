import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, CreditCard, CheckCircle2, AlertCircle, ExternalLink, Crown } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SubscriptionManagement = () => {
  const { 
    subscription, 
    loading, 
    isPremium, 
    isTrial,
    trialEnd,
    subscriptionEnd,
    subscriptionTier,
    openCustomerPortal,
    createCheckout
  } = useSubscription();

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Skeleton className="h-12 w-64 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return format(new Date(dateString), "d. MMMM yyyy", { locale: de });
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Abonnement-Verwaltung</h1>
        <p className="text-muted-foreground">Verwalten Sie Ihr Rasenpilot Premium-Abonnement</p>
      </div>

      <div className="space-y-6">
        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {isPremium && <Crown className="h-5 w-5 text-primary" />}
                  {isPremium ? "Premium Abonnement" : "Kostenloser Plan"}
                </CardTitle>
                <CardDescription>
                  {isPremium ? "Ihr aktuelles Premium-Abonnement" : "Upgraden Sie zu Premium für volle Funktionen"}
                </CardDescription>
              </div>
              <Badge variant={isPremium ? "default" : "secondary"} className="ml-2">
                {isPremium ? (isTrial ? "Testphase" : "Aktiv") : "Kostenlos"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPremium ? (
              <>
                {isTrial && trialEnd && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Ihre 7-tägige kostenlose Testphase endet am {formatDate(trialEnd)}. 
                      Danach wird Ihr Abonnement automatisch verlängert.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4">
                  <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Abonnement-Typ</p>
                      <p className="text-sm text-muted-foreground">{subscriptionTier}</p>
                    </div>
                  </div>

                  {subscriptionEnd && (
                    <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Nächste Verlängerung</p>
                        <p className="text-sm text-muted-foreground">{formatDate(subscriptionEnd)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Zahlungsmethode</p>
                      <p className="text-sm text-muted-foreground">
                        Über Stripe Customer Portal verwalten
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Premium-Funktionen</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      Unbegrenzte Rasenanalysen
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      KI-gestützte Pflegeempfehlungen
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      Wetterbasierte Tipps
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      Persönlicher Pflegekalender
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      Premium-Support
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-6">
                  Upgraden Sie jetzt zu Premium und erhalten Sie Zugriff auf alle Funktionen!
                </p>
                <Button onClick={() => createCheckout('monthly')} size="lg" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Jetzt Premium werden
                </Button>
              </div>
            )}
          </CardContent>
          {isPremium && (
            <CardFooter className="flex gap-3">
              <Button onClick={openCustomerPortal} className="flex-1 gap-2">
                <ExternalLink className="h-4 w-4" />
                Zahlungsdetails verwalten
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Billing Portal Info */}
        {isPremium && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Über das Stripe-Portal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Im Stripe Customer Portal können Sie:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  Rechnungen einsehen und herunterladen
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  Zahlungsmethoden aktualisieren
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  Abonnement kündigen
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  Abonnement-Plan ändern
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* FAQ Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Häufig gestellte Fragen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Wie kann ich mein Abonnement kündigen?</h4>
              <p className="text-sm text-muted-foreground">
                Klicken Sie auf "Zahlungsdetails verwalten" und folgen Sie den Anweisungen im Stripe-Portal. 
                Die Kündigung ist jederzeit möglich.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-1">Wird nach der Kündigung noch abgebucht?</h4>
              <p className="text-sm text-muted-foreground">
                Nein, nach der Kündigung wird Ihr Abonnement nicht mehr verlängert. 
                Sie können Premium-Funktionen bis zum Ende des bezahlten Zeitraums nutzen.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-1">Wie ändere ich meine Zahlungsmethode?</h4>
              <p className="text-sm text-muted-foreground">
                Im Stripe Customer Portal können Sie Ihre Kreditkarte oder andere Zahlungsmethoden sicher aktualisieren.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
