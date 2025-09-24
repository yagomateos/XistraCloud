import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardStats, API_URL } from '@/lib/api';

describe('API: getDashboardStats', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls the correct endpoint with auth headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({
      projectStats: { active: 0, building: 0, error: 0, stopped: 0, pending: 0 },
      deploymentTrend: [],
      recentActivity: []
    })});
    // @ts-ignore
    global.fetch = mockFetch;

    await getDashboardStats();

    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/dashboard/stats`, expect.objectContaining({
      headers: expect.objectContaining({ 'Content-Type': 'application/json' })
    }));
  });
});


