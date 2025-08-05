import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainNavigation from '@/components/MainNavigation';
import CookieSettings from '@/components/CookieSettings';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cookie-Richtlinie</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none space-y-6">
              <p>
                Diese Cookie-Richtlinie erklärt, was Cookies sind und wie wir sie verwenden, welche Arten von Cookies wir verwenden und wie Sie Ihre Cookie-Präferenzen kontrollieren können.
              </p>

              <div>
                <h2 className="text-xl font-semibold mb-3">Was sind Cookies?</h2>
                <p>
                  Cookies sind kleine Textdateien, die auf Ihrem Computer oder mobilen Gerät gespeichert werden, wenn Sie eine Website besuchen. Sie ermöglichen es der Website, Ihre Aktionen und Präferenzen zu speichern.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Wie verwenden wir Cookies?</h2>
                <p>
                  Wir verwenden Cookies für verschiedene Zwecke:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Um sicherzustellen, dass unsere Website ordnungsgemäß funktioniert</li>
                  <li>Um Ihre Präferenzen und Einstellungen zu speichern</li>
                  <li>Um die Leistung unserer Website zu analysieren und zu verbessern</li>
                  <li>Um Ihnen relevante Inhalte und Werbung zu zeigen</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Arten von Cookies</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Notwendige Cookies</h3>
                    <p>
                      Diese Cookies sind für das Funktionieren der Website unerlässlich. Sie können nicht deaktiviert werden, da sie grundlegende Funktionen wie Sicherheit und Barrierefreiheit ermöglichen.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Analyse-Cookies</h3>
                    <p>
                      Diese Cookies sammeln anonyme Informationen über die Nutzung unserer Website. Sie helfen uns zu verstehen, wie Besucher mit der Website interagieren, damit wir sie verbessern können.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Marketing-Cookies</h3>
                    <p>
                      Diese Cookies werden verwendet, um Ihnen relevante Werbung zu zeigen. Sie können auch dazu verwendet werden, die Wirksamkeit unserer Werbekampagnen zu messen.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Präferenz-Cookies</h3>
                    <p>
                      Diese Cookies speichern Ihre Einstellungen und Präferenzen, wie z.B. Ihre Sprachauswahl oder Region, um Ihre Benutzererfahrung zu personalisieren.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Ihre Wahlmöglichkeiten</h2>
                <p>
                  Sie können Ihre Cookie-Präferenzen jederzeit verwalten und ändern. Sie haben folgende Optionen:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Verwenden Sie unsere Cookie-Einstellungen unten auf dieser Seite</li>
                  <li>Ändern Sie Ihre Browser-Einstellungen, um Cookies zu blockieren oder zu löschen</li>
                  <li>Verwenden Sie Browser-Add-ons oder -Erweiterungen zur Cookie-Verwaltung</li>
                </ul>
                <p className="mt-2">
                  Bitte beachten Sie, dass das Deaktivieren bestimmter Cookies die Funktionalität unserer Website beeinträchtigen kann.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
                <p>
                  Wenn Sie Fragen zu dieser Cookie-Richtlinie haben, kontaktieren Sie uns unter:{' '}
                  <a href="mailto:info@rasenpilot.com" className="text-green-600 hover:text-green-800">
                    info@rasenpilot.com
                  </a>
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Aktualisierungen</h2>
                <p>
                  Wir können diese Cookie-Richtlinie von Zeit zu Zeit aktualisieren. Änderungen werden auf dieser Seite veröffentlicht. Die letzte Aktualisierung erfolgte am {new Date().toLocaleDateString('de-DE')}.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <CookieSettings />
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;