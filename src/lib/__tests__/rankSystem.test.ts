import { describe, it, expect } from 'vitest';
import {
  RANKS,
  getRank,
  getNextRank,
  getPointsToNextRank,
  getMotivation,
  getMilestone,
  getAchievementBadges,
} from '../rankSystem';

describe('RANKS constant', () => {
  it('has 8 rank levels', () => {
    expect(RANKS).toHaveLength(8);
  });

  it('has contiguous score ranges with no gaps', () => {
    for (let i = 1; i < RANKS.length; i++) {
      expect(RANKS[i].minScore).toBe(RANKS[i - 1].maxScore + 1);
    }
  });

  it('starts at score 0 and ends at score 100', () => {
    expect(RANKS[0].minScore).toBe(0);
    expect(RANKS[RANKS.length - 1].maxScore).toBe(100);
  });
});

describe('getRank', () => {
  it('returns level 1 for score 0', () => {
    expect(getRank(0).level).toBe(1);
    expect(getRank(0).name).toBe('Rasen-Neuling');
  });

  it('returns level 1 for score 19 (upper boundary of level 1)', () => {
    expect(getRank(19).level).toBe(1);
  });

  it('returns level 2 for score 20 (lower boundary of level 2)', () => {
    expect(getRank(20).level).toBe(2);
  });

  it('returns the correct rank at each level boundary', () => {
    const expectations: [number, number][] = [
      [0, 1], [19, 1],
      [20, 2], [34, 2],
      [35, 3], [49, 3],
      [50, 4], [64, 4],
      [65, 5], [74, 5],
      [75, 6], [84, 6],
      [85, 7], [89, 7],
      [90, 8], [100, 8],
    ];
    expectations.forEach(([score, level]) => {
      expect(getRank(score).level).toBe(level);
    });
  });

  it('returns level 8 for score 100 (max score)', () => {
    expect(getRank(100).level).toBe(8);
    expect(getRank(100).name).toBe('Legendärer Gärtner');
  });

  it('falls back to level 1 for scores outside any defined range', () => {
    expect(getRank(-1).level).toBe(1);
    expect(getRank(101).level).toBe(1);
  });
});

describe('getNextRank', () => {
  it('returns the next rank (level 2) when at score 0', () => {
    const next = getNextRank(0);
    expect(next).not.toBeNull();
    expect(next!.level).toBe(2);
  });

  it('returns null when already at the max rank', () => {
    expect(getNextRank(90)).toBeNull();
    expect(getNextRank(100)).toBeNull();
  });

  it('returns the correct next rank at each level transition', () => {
    const transitions: [number, number][] = [
      [19, 2],
      [20, 3],
      [34, 3],
      [35, 4],
      [84, 7],
      [85, 8],
    ];
    transitions.forEach(([score, expectedNextLevel]) => {
      expect(getNextRank(score)!.level).toBe(expectedNextLevel);
    });
  });
});

describe('getPointsToNextRank', () => {
  it('returns 0 when already at the max rank', () => {
    expect(getPointsToNextRank(90)).toBe(0);
    expect(getPointsToNextRank(100)).toBe(0);
  });

  it('returns the correct points needed from score 0', () => {
    // Level 1 ends at 19; level 2 starts at 20 → 20 points needed
    expect(getPointsToNextRank(0)).toBe(20);
  });

  it('returns the correct points needed from mid-level', () => {
    // Score 10 → level 2 starts at 20 → 10 points needed
    expect(getPointsToNextRank(10)).toBe(10);
  });

  it('returns 1 point needed when one point from the next level', () => {
    // Score 19 → level 2 starts at 20 → 1 point needed
    expect(getPointsToNextRank(19)).toBe(1);
  });

  it('returns correct points from the start of a level', () => {
    // Score 20 (level 2) → level 3 starts at 35 → 15 points needed
    expect(getPointsToNextRank(20)).toBe(15);
  });
});

describe('getMotivation', () => {
  it('returns the energy-boost message for score < 40', () => {
    const msg = getMotivation(0);
    expect(msg).toContain('⚡');
    expect(msg).toContain('Analyse');
  });

  it('returns the goal message for score 40–64', () => {
    expect(getMotivation(40)).toContain('🎯');
    expect(getMotivation(64)).toContain('🎯');
  });

  it('returns the top-performer message for score 65–84', () => {
    expect(getMotivation(65)).toContain('🏆');
    expect(getMotivation(84)).toContain('🏆');
  });

  it('returns the elite message for score >= 85', () => {
    expect(getMotivation(85)).toContain('👑');
    expect(getMotivation(100)).toContain('👑');
  });
});

describe('getMilestone', () => {
  it('returns null for 0 analyses', () => {
    expect(getMilestone(0)).toBeNull();
  });

  it('returns the first-analysis milestone for exactly 1 analysis', () => {
    const milestone = getMilestone(1);
    expect(milestone).not.toBeNull();
    expect(milestone!.emoji).toBe('🌱');
  });

  it('returns the streak milestone for 3 analyses', () => {
    expect(getMilestone(3)!.emoji).toBe('🔥');
  });

  it('returns the halfway milestone for 5 analyses', () => {
    expect(getMilestone(5)!.emoji).toBe('⚡');
  });

  it('returns the diamond milestone for 10 analyses', () => {
    expect(getMilestone(10)!.emoji).toBe('💎');
  });

  it('returns the crown milestone for 25 analyses', () => {
    expect(getMilestone(25)!.emoji).toBe('👑');
  });

  it('returns the highest applicable milestone for counts in between', () => {
    // 15 analyses → highest threshold met is 10 → diamond
    expect(getMilestone(15)!.emoji).toBe('💎');
    // 30 analyses → highest threshold met is 25 → crown
    expect(getMilestone(30)!.emoji).toBe('👑');
  });
});

describe('getAchievementBadges', () => {
  it('returns exactly 8 badges', () => {
    expect(getAchievementBadges(0, 0)).toHaveLength(8);
  });

  it('marks "Erste Analyse" as earned when totalAnalyses >= 1', () => {
    const badge = getAchievementBadges(1, 0).find(b => b.label === 'Erste Analyse')!;
    expect(badge.earned).toBe(true);
  });

  it('marks "Erste Analyse" as not earned when totalAnalyses === 0', () => {
    const badge = getAchievementBadges(0, 0).find(b => b.label === 'Erste Analyse')!;
    expect(badge.earned).toBe(false);
  });

  it('marks all analysis-count badges as earned for 25+ analyses', () => {
    const badges = getAchievementBadges(25, 0);
    const analysisBadges = badges.filter(b => !b.label.startsWith('Score'));
    analysisBadges.forEach(b => expect(b.earned).toBe(true));
  });

  it('marks "Score 65+" as earned when bestScore >= 65', () => {
    const badge = getAchievementBadges(0, 65).find(b => b.label === 'Score 65+')!;
    expect(badge.earned).toBe(true);
  });

  it('marks "Score 65+" as not earned when bestScore < 65', () => {
    const badge = getAchievementBadges(0, 64).find(b => b.label === 'Score 65+')!;
    expect(badge.earned).toBe(false);
  });

  it('marks "Score 75+" as earned when bestScore >= 75', () => {
    const badge = getAchievementBadges(0, 75).find(b => b.label === 'Score 75+')!;
    expect(badge.earned).toBe(true);
  });

  it('marks "Score 85+" as not earned when bestScore < 85', () => {
    const badge = getAchievementBadges(0, 80).find(b => b.label === 'Score 85+')!;
    expect(badge.earned).toBe(false);
  });

  it('marks "Score 85+" as earned when bestScore >= 85', () => {
    const badge = getAchievementBadges(0, 85).find(b => b.label === 'Score 85+')!;
    expect(badge.earned).toBe(true);
  });
});
