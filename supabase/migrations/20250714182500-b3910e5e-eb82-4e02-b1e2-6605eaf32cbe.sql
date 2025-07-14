-- Enable RLS on blog_posts table if not already enabled
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read published blog posts
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published');

-- Insert some sample blog posts
INSERT INTO public.blog_posts (
  title, excerpt, content, author, category, status, slug, read_time, image
) VALUES 
(
  'Wann sollten Sie Ihren Rasen im Frühling düngen?',
  'Erfahren Sie den optimalen Zeitpunkt für die Frühjahrsdüngung, um Ihren Rasen auf die Wachstumssaison vorzubereiten.',
  'Der Frühling ist die wichtigste Zeit für die Rasenpflege. Eine ordnungsgemäße Düngung im Frühling kann den Unterschied zwischen einem gesunden, grünen Rasen und einem schwachen, anfälligen Rasen ausmachen.',
  'Rasenexperte',
  'Rasenpflege',
  'published',
  'fruehjahr-duengung-timing',
  5,
  '/placeholder.svg'
),
(
  'Häufige Rasenkrankheiten erkennen und behandeln',
  'Frühe Anzeichen häufiger Rasenkrankheiten erkennen und lernen, wie Sie diese effektiv behandeln können.',
  'Rasenkrankheiten können schnell einen schönen Rasen ruinieren. In diesem Artikel lernen Sie, wie Sie die häufigsten Rasenkrankheiten erkennen und behandeln.',
  'Dr. Pflanzenpathologie',
  'Krankheiten',
  'published',
  'haeufige-rasenkrankheiten',
  7,
  '/placeholder.svg'
),
(
  'Der komplette Leitfaden zur Nachsaat',
  'Verwandeln Sie dünnen, lückenhaften Rasen in eine dichte, üppige Rasenfläche mit unserem umfassenden Nachsaat-Leitfaden.',
  'Nachsaat ist eine der effektivsten Methoden, um einen dichten, gesunden Rasen zu erhalten. Hier erfahren Sie alles, was Sie wissen müssen.',
  'Rasen-Spezialist',
  'Aussaat',
  'published',
  'nachsaat-leitfaden',
  10,
  '/placeholder.svg'
),
(
  'Rasenmähen: Die besten Techniken für perfekte Ergebnisse',
  'Lernen Sie die richtigen Mähtechniken, um Ihren Rasen gesund zu halten und ein professionelles Aussehen zu erzielen.',
  'Das richtige Mähen ist fundamental für einen gesunden Rasen. Erfahren Sie die besten Techniken und häufige Fehler, die Sie vermeiden sollten.',
  'Gartenexperte',
  'Mähen',
  'published',
  'rasenmähen-techniken',
  6,
  '/placeholder.svg'
),
(
  'Unkraut im Rasen: Identifikation und Bekämpfung',
  'Identifizieren Sie häufige Unkräuter in Ihrem Rasen und lernen Sie effektive Methoden zu deren Bekämpfung.',
  'Unkraut kann jeden Rasen befallen. Mit den richtigen Kenntnissen können Sie Unkraut effektiv identifizieren und bekämpfen.',
  'Unkraut-Spezialist',
  'Unkrautbekämpfung',
  'published',
  'unkraut-bekaempfung',
  8,
  '/placeholder.svg'
),
(
  'Bewässerung: Wann und wie viel Wasser braucht Ihr Rasen?',
  'Optimale Bewässerungsstrategien für verschiedene Jahreszeiten und Rasentypen.',
  'Die richtige Bewässerung ist entscheidend für einen gesunden Rasen. Lernen Sie, wann und wie viel Sie bewässern sollten.',
  'Bewässerungsexperte',
  'Bewässerung',
  'published',
  'rasen-bewaesserung',
  5,
  '/placeholder.svg'
);