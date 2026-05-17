import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---- Mocks ----

// vi.hoisted ensures mockInvoke is initialized before the vi.mock factory runs
const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke,
    },
  },
}));

vi.mock('browser-image-compression', () => ({
  default: vi.fn((file: File) => Promise.resolve(file)),
}));

// Stub FileReader — the real code reads `reader.result` (the instance property),
// so we must set it before invoking onload.
vi.stubGlobal('FileReader', class {
  result: string | null = null;
  onload: (() => void) | null = null;
  onerror: ((e: any) => void) | null = null;

  readAsDataURL(_file: Blob) {
    this.result = 'data:image/jpeg;base64,FAKEB64DATA';
    // Use queueMicrotask to keep the call asynchronous without needing fake timers
    queueMicrotask(() => this.onload?.());
  }
});

// ---- Subject under test ----
import { analyzeImageWithAI, analyzeLawnProblem, getMockAnalysis } from '../aiAnalysisService';

const makeFile = (name = 'lawn.jpg', type = 'image/jpeg') =>
  new File(['fake-content'], name, { type });

describe('getMockAnalysis', () => {
  it('returns a valid AIAnalysisResult structure', () => {
    const result = getMockAnalysis();
    expect(result).toHaveProperty('overallHealth');
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('generalRecommendations');
    expect(result).toHaveProperty('seasonalAdvice');
    expect(result).toHaveProperty('preventionTips');
    expect(result).toHaveProperty('monthlyPlan');
  });

  it('returns an overallHealth value in the range 60–90', () => {
    // Run multiple times since it uses Math.random()
    for (let i = 0; i < 20; i++) {
      const { overallHealth } = getMockAnalysis();
      expect(overallHealth).toBeGreaterThanOrEqual(60);
      expect(overallHealth).toBeLessThanOrEqual(90);
    }
  });

  it('returns issues with the required fields', () => {
    const { issues } = getMockAnalysis();
    expect(issues.length).toBeGreaterThanOrEqual(1);
    issues.forEach(issue => {
      expect(issue).toHaveProperty('issue');
      expect(issue).toHaveProperty('confidence');
      expect(issue).toHaveProperty('severity');
      expect(['low', 'medium', 'high']).toContain(issue.severity);
      expect(issue.confidence).toBeGreaterThanOrEqual(0.7);
      expect(issue.confidence).toBeLessThanOrEqual(1.0);
      expect(issue).toHaveProperty('recommendations');
      expect(issue).toHaveProperty('timeline');
      expect(issue).toHaveProperty('cost');
      expect(issue).toHaveProperty('products');
    });
  });

  it('returns a monthly plan with at least one entry, each having month and tasks', () => {
    const { monthlyPlan } = getMockAnalysis();
    expect(monthlyPlan.length).toBeGreaterThan(0);
    monthlyPlan.forEach(entry => {
      expect(entry).toHaveProperty('month');
      expect(entry).toHaveProperty('tasks');
      expect(Array.isArray(entry.tasks)).toBe(true);
    });
  });
});

describe('analyzeLawnProblem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success and the analysis text on a valid API response', async () => {
    mockInvoke.mockResolvedValue({
      data: { analysis: 'Your lawn has iron deficiency.' },
      error: null,
    });

    const result = await analyzeLawnProblem('Yellowing lawn');

    expect(result.success).toBe(true);
    expect(result.analysis).toBe('Your lawn has iron deficiency.');
  });

  it('passes the problem text and hasImage flag to the edge function', async () => {
    mockInvoke.mockResolvedValue({
      data: { analysis: 'Some analysis' },
      error: null,
    });

    await analyzeLawnProblem('Brown patches', true);

    expect(mockInvoke).toHaveBeenCalledWith('analyze-lawn-problem', {
      body: { problem: 'Brown patches', hasImage: true },
    });
  });

  it('defaults hasImage to false', async () => {
    mockInvoke.mockResolvedValue({ data: { analysis: 'ok' }, error: null });

    await analyzeLawnProblem('Some issue');

    expect(mockInvoke).toHaveBeenCalledWith('analyze-lawn-problem', {
      body: { problem: 'Some issue', hasImage: false },
    });
  });

  it('returns an error when the edge function call fails', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Function not found' },
    });

    const result = await analyzeLawnProblem('Yellowing lawn');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Analysis failed');
  });

  it('returns an error when the response contains no analysis field', async () => {
    mockInvoke.mockResolvedValue({ data: {}, error: null });

    const result = await analyzeLawnProblem('Yellowing lawn');

    expect(result.success).toBe(false);
    expect(result.error).toContain('No analysis data');
  });

  it('returns an error when the invocation throws', async () => {
    mockInvoke.mockRejectedValue(new Error('Connection timeout'));

    const result = await analyzeLawnProblem('Yellowing lawn');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Connection timeout');
  });
});

describe('analyzeImageWithAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a successful analysis when the edge function responds correctly', async () => {
    const expectedAnalysis = getMockAnalysis();
    mockInvoke.mockResolvedValue({
      data: { success: true, analysis: expectedAnalysis },
      error: null,
    });

    const result = await analyzeImageWithAI(makeFile(), 'Deutsches Weidelgras', 'Ziergarten');

    expect(result.success).toBe(true);
    expect(result.analysis).toEqual(expectedAnalysis);
  });

  it('falls back to mock analysis when the edge function returns an error', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Edge function failed' },
    });

    const result = await analyzeImageWithAI(makeFile());

    expect(result.success).toBe(true);
    expect(result.analysis).toBeDefined();
    expect(result.analysis!.overallHealth).toBeGreaterThanOrEqual(60);
  });

  it('falls back to mock analysis when the edge function returns no valid data', async () => {
    mockInvoke.mockResolvedValue({ data: { success: false }, error: null });

    const result = await analyzeImageWithAI(makeFile());

    expect(result.success).toBe(true);
    expect(result.analysis).toBeDefined();
  });

  it('passes grassType and lawnGoal to the edge function', async () => {
    mockInvoke.mockResolvedValue({
      data: { success: true, analysis: getMockAnalysis() },
      error: null,
    });

    await analyzeImageWithAI(makeFile(), 'Festuca', 'Sportplatz');

    expect(mockInvoke).toHaveBeenCalledWith(
      'analyze-lawn-image',
      expect.objectContaining({
        body: expect.objectContaining({
          grassType: 'Festuca',
          lawnGoal: 'Sportplatz',
        }),
      })
    );
  });

  it('falls back to mock analysis when the function throws (e.g. timeout)', async () => {
    // Simulate the race condition timeout by rejecting immediately
    mockInvoke.mockRejectedValue(new Error('Edge function timeout after 45 seconds'));

    const result = await analyzeImageWithAI(makeFile());

    expect(result.success).toBe(true);
    expect(result.analysis).toBeDefined();
  });
});
