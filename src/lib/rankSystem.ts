// Gamification Rank System for Rasenpilot

export interface Rank {
  level: number;
  name: string;
  emoji: string;
  minScore: number;
  maxScore: number;
  color: string;
  bgColor: string;
  borderColor: string;
  roast: string;
}

export const RANKS: Rank[] = [
  {
    level: 1, name: 'Rasen-Neuling', emoji: '🌱', minScore: 0, maxScore: 19,
    color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-300',
    roast: 'Dein Rasen hat mehr braune Stellen als ein Herbstwald. Aber hey, jeder fängt mal an! 😅'
  },
  {
    level: 2, name: 'Hobby-Gärtner', emoji: '🌿', minScore: 20, maxScore: 34,
    color: 'text-lime-700', bgColor: 'bg-lime-100', borderColor: 'border-lime-300',
    roast: 'Dein Rasen lebt zumindest. Das ist schon mal was. 🤷'
  },
  {
    level: 3, name: 'Grünflächen-Lehrling', emoji: '☘️', minScore: 35, maxScore: 49,
    color: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-300',
    roast: 'Besser als der Nachbar mit dem Kiesgarten. Niedrige Latte, aber immerhin! 😄'
  },
  {
    level: 4, name: 'Durchschnitts-Gärtner', emoji: '🌱', minScore: 50, maxScore: 64,
    color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-300',
    roast: 'Nicht schlecht. Nicht gut. Irgendwas dazwischen. 😄'
  },
  {
    level: 5, name: 'Rasen-Experte', emoji: '🍀', minScore: 65, maxScore: 74,
    color: 'text-teal-700', bgColor: 'bg-teal-100', borderColor: 'border-teal-300',
    roast: 'Deine Nachbarn fangen an zu schauen. 👀'
  },
  {
    level: 6, name: 'Rasen-Meister', emoji: '🌳', minScore: 75, maxScore: 84,
    color: 'text-cyan-700', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-300',
    roast: 'Dein Rasen ist so gut, dass Hunde einen Umweg machen. Aus Respekt. 🐕'
  },
  {
    level: 7, name: 'Rasen-Champion', emoji: '🏆', minScore: 85, maxScore: 89,
    color: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-400',
    roast: 'Die Nachbarschaft flüstert über deinen Rasen. Im positiven Sinne. 🏅'
  },
  {
    level: 8, name: 'Legendärer Gärtner', emoji: '👑', minScore: 90, maxScore: 100,
    color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-400',
    roast: 'Dieser Mensch hat kein Hobby außer Rasen. Respekt. 👑'
  },
];

export const getRank = (score: number): Rank => {
  return RANKS.find(r => score >= r.minScore && score <= r.maxScore) || RANKS[0];
};

export const getNextRank = (score: number): Rank | null => {
  const current = getRank(score);
  return RANKS.find(r => r.level === current.level + 1) || null;
};

export const getPointsToNextRank = (score: number): number => {
  const next = getNextRank(score);
  if (!next) return 0;
  return next.minScore - score;
};

export const getMotivation = (score: number): string => {
  if (score < 40) return '⚡ Mit einer Analyse pro Woche bist du in 30 Tagen 2 Ränge höher!';
  if (score < 65) return '🎯 Nur noch wenige Punkte bis zum nächsten Rang — analysiere heute!';
  if (score < 85) return '🏆 Du bist unter den Top 20% aller Rasenpilot-Nutzer!';
  return '👑 Du bist in der Elite-Liga. Bleib dran!';
};

export const getMilestone = (totalAnalyses: number): { emoji: string; text: string } | null => {
  if (totalAnalyses >= 25) return { emoji: '👑', text: '25 Analysen. Rasenpilot-Legende.' };
  if (totalAnalyses >= 10) return { emoji: '💎', text: '10 Analysen — du meinst es ernst.' };
  if (totalAnalyses >= 5) return { emoji: '⚡', text: 'Halbzeit bis Level 4!' };
  if (totalAnalyses >= 3) return { emoji: '🔥', text: 'Streak-Krieger! 3 Analysen gemacht.' };
  if (totalAnalyses >= 1) return { emoji: '🌱', text: 'Erste Analyse! Der Weg beginnt.' };
  return null;
};

export const getAchievementBadges = (totalAnalyses: number, bestScore: number): { emoji: string; label: string; earned: boolean }[] => {
  return [
    { emoji: '🌱', label: 'Erste Analyse', earned: totalAnalyses >= 1 },
    { emoji: '🔥', label: '3 Analysen', earned: totalAnalyses >= 3 },
    { emoji: '⚡', label: '5 Analysen', earned: totalAnalyses >= 5 },
    { emoji: '💎', label: '10 Analysen', earned: totalAnalyses >= 10 },
    { emoji: '👑', label: '25 Analysen', earned: totalAnalyses >= 25 },
    { emoji: '🍀', label: 'Score 65+', earned: bestScore >= 65 },
    { emoji: '🏆', label: 'Score 85+', earned: bestScore >= 85 },
    { emoji: '🌳', label: 'Score 75+', earned: bestScore >= 75 },
  ];
};
