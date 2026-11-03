import { describe, expect, it, vi } from 'vitest';
import { ContentStrategyAgent } from '../src/agents/ContentStrategyAgent.js';
import { BrandConfig } from '../src/types/index.js';

const brandConfig: BrandConfig = {
  name: 'Test Brand',
  description: 'A test brand',
  tone: ['friendly'],
  targetAudience: 'Test audience',
  keywords: ['test'],
};

describe('ContentStrategyAgent calendar summary coercion', () => {
  it('normalizes string summary lists before returning a calendar', async () => {
    const agent = new ContentStrategyAgent(brandConfig);
    const testAgent = agent as unknown as {
      singleQuery: ReturnType<typeof vi.fn>;
    };

    testAgent.singleQuery = vi.fn().mockResolvedValue({
      success: true,
      data: JSON.stringify({
        entries: [
          {
            date: '2026-05-04',
            dayOfWeek: 'Monday',
            platform: 'instagram',
            contentType: 'post',
            category: 'educational',
            theme: 'Hydration',
            briefDescription: 'Talk about moisturizers',
            suggestedTime: '09:00 AM ET',
          },
        ],
        summary: {
          totalPosts: 1,
          postsByPlatform: { instagram: 1 },
          postsByCategory: { educational: 1 },
          keyThemes: 'Hydration Week',
          recommendations: 'Focus on barrier repair this week',
        },
      }),
    });

    const result = await agent.generateCalendar({
      startDate: new Date('2026-05-04T00:00:00.000Z'),
      endDate: new Date('2026-05-10T00:00:00.000Z'),
      platforms: ['instagram'],
      postsPerWeek: 1,
    });

    expect(result.success).toBe(true);
    expect(result.data?.summary.keyThemes).toEqual(['Hydration Week']);
    expect(result.data?.summary.recommendations).toEqual([
      'Focus on barrier repair this week',
    ]);
  });

  it('uses empty arrays when summary lists are omitted', async () => {
    const agent = new ContentStrategyAgent(brandConfig);
    const testAgent = agent as unknown as {
      singleQuery: ReturnType<typeof vi.fn>;
    };

    testAgent.singleQuery = vi.fn().mockResolvedValue({
      success: true,
      data: JSON.stringify({
        entries: [
          {
            date: '2026-05-04',
            dayOfWeek: 'Monday',
            platform: 'instagram',
            contentType: 'post',
            category: 'educational',
            theme: 'Hydration',
            briefDescription: 'Talk about moisturizers',
            suggestedTime: '09:00 AM ET',
          },
        ],
        summary: {
          totalPosts: 1,
          postsByPlatform: { instagram: 1 },
          postsByCategory: { educational: 1 },
        },
      }),
    });

    const result = await agent.generateCalendar({
      startDate: new Date('2026-05-04T00:00:00.000Z'),
      endDate: new Date('2026-05-10T00:00:00.000Z'),
      platforms: ['instagram'],
      postsPerWeek: 1,
    });

    expect(result.success).toBe(true);
    expect(result.data?.summary.keyThemes).toEqual([]);
    expect(result.data?.summary.recommendations).toEqual([]);
  });
});
