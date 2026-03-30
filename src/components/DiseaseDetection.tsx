import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bug, ShieldCheck, AlertTriangle } from 'lucide-react';

interface DiseaseDetectionProps {
  analysisResult: any;
}

interface DetectedIssue {
  name: string;
  severity: 'hoch' | 'mittel' | 'niedrig';
  description: string;
}

const DISEASE_KEYWORDS: { keywords: string[]; name: string; severity: 'hoch' | 'mittel' | 'niedrig'; description: string }[] = [
  { keywords: ['rostpilz', 'rost', 'rust'], name: 'Rostpilz', severity: 'hoch', description: 'Orangefarbene Flecken auf den Halmen. Befallene Stellen tiefer mähen und Stickstoff düngen.' },
  { keywords: ['moos', 'moss', 'vermoost'], name: 'Moosbefall', severity: 'mittel', description: 'Moos verdrängt den Rasen in schattigen, feuchten Bereichen. Vertikutieren und Kalkung empfohlen.' },
  { keywords: ['schneeschimmel', 'schimmel', 'fusarium'], name: 'Schneeschimmel', severity: 'hoch', description: 'Grau-weiße Flecken, typisch im Frühling. Befallene Stellen belüften und nicht betreten.' },
  { keywords: ['rotspitzigkeit', 'rotspitz', 'red thread'], name: 'Rotspitzigkeit', severity: 'mittel', description: 'Rötliche Fadenstrukturen an den Halmen. Stickstoffdüngung hilft zur Vorbeugung.' },
  { keywords: ['hexenring', 'pilzring', 'fairy ring'], name: 'Hexenringe', severity: 'mittel', description: 'Kreisförmige Pilzbereiche im Rasen. Tiefes Aerifizieren und Wässern der betroffenen Zone.' },
  { keywords: ['unkraut', 'löwenzahn', 'klee', 'wildkraut', 'weed'], name: 'Unkrautbefall', severity: 'mittel', description: 'Unkräuter konkurrieren mit dem Rasen um Nährstoffe. Selektiver Unkrautvernichter oder manuell entfernen.' },
  { keywords: ['engerlinge', 'larven', 'käfer', 'grub', 'schädling'], name: 'Engerlinge / Schädlinge', severity: 'hoch', description: 'Larven fressen Graswurzeln und verursachen braune Stellen. Nematoden als biologische Bekämpfung.' },
  { keywords: ['trockenstress', 'vertrocknet', 'braun', 'dürre', 'drought'], name: 'Trockenstress', severity: 'mittel', description: 'Rasen braucht regelmäßige Bewässerung, am besten morgens.' },
  { keywords: ['stickstoffmangel', 'gelb', 'blass', 'chlorose', 'nitrogen'], name: 'Stickstoffmangel', severity: 'mittel', description: 'Gelbliche Verfärbung deutet auf Nährstoffmangel hin. Rasendünger mit hohem N-Anteil aufbringen.' },
  { keywords: ['pilz', 'fungus', 'pilzbefall', 'flecken'], name: 'Pilzbefall', severity: 'hoch', description: 'Pilzkrankheiten breiten sich bei Feuchtigkeit schnell aus. Fungizid und bessere Belüftung empfohlen.' },
  { keywords: ['filz', 'verfilzt', 'thatch'], name: 'Rasenfilz', severity: 'niedrig', description: 'Abgestorbenes Material bildet eine Filzschicht. Regelmäßiges Vertikutieren schafft Abhilfe.' },
];

const detectDiseases = (result: any): DetectedIssue[] => {
  if (!result) return [];

  // Build a searchable text from all analysis fields
  const searchText = [
    result.grass_condition,
    result.summary_short,
    result.density_note,
    result.moisture_note,
    result.soil_note,
    result.sunlight_note,
    result.step_1,
    result.step_2,
    result.step_3,
    result.timeline,
    ...(result.recommendations || []),
    ...(result.issues || []).map((i: any) => `${i.type} ${i.description}`),
    ...(result.identified_problems || []).map((p: any) => typeof p === 'string' ? p : `${p.type} ${p.description}`),
    ...(result.problems || []).map((p: any) => typeof p === 'string' ? p : `${p.type} ${p.description}`),
  ].filter(Boolean).join(' ').toLowerCase();

  const detected: DetectedIssue[] = [];

  for (const disease of DISEASE_KEYWORDS) {
    if (disease.keywords.some(kw => searchText.includes(kw))) {
      detected.push({
        name: disease.name,
        severity: disease.severity,
        description: disease.description,
      });
    }
  }

  return detected;
};

const DiseaseDetection: React.FC<DiseaseDetectionProps> = ({ analysisResult }) => {
  const detectedIssues = detectDiseases(analysisResult);

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bug className="h-5 w-5 text-red-600" />
          Krankheiten & Schädlinge
        </CardTitle>
      </CardHeader>
      <CardContent>
        {detectedIssues.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <ShieldCheck className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Keine Probleme erkannt</p>
              <p className="text-sm text-green-700">Dein Rasen zeigt keine Anzeichen von Krankheiten oder Schädlingsbefall. Weiter so!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {detectedIssues.map((issue, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  issue.severity === 'hoch'
                    ? 'bg-red-50 border-red-200'
                    : issue.severity === 'mittel'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  issue.severity === 'hoch' ? 'text-red-500' :
                  issue.severity === 'mittel' ? 'text-yellow-500' : 'text-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800">{issue.name}</span>
                    <Badge variant={issue.severity === 'hoch' ? 'destructive' : 'secondary'} className="text-xs">
                      {issue.severity === 'hoch' ? '⚠️ Hoch' : issue.severity === 'mittel' ? '⚡ Mittel' : 'ℹ️ Niedrig'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{issue.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiseaseDetection;
