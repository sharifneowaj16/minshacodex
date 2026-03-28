/**
 * lib/elasticsearch/metrics.ts
 *
 * In-memory search metrics collector for monitoring search performance.
 * Tracks query duration, success rate, popular queries, slow queries.
 */

interface SearchMetric {
  query: string;
  duration: number;
  resultCount: number;
  filters: string[];
  timestamp: Date;
  success: boolean;
}

interface MetricsSummary {
  totalSearches: number;
  averageDuration: number;
  successRate: number;
  popularQueries: Array<{ query: string; count: number }>;
  slowQueries: Array<{ query: string; duration: number; timestamp: Date }>;
  averageResultCount: number;
  filtersUsage: Record<string, number>;
}

export class SearchMetricsCollector {
  private metrics: SearchMetric[] = [];
  private readonly maxMetrics: number;
  private readonly slowThresholdMs: number;

  constructor(maxMetrics = 10_000, slowThresholdMs = 2_000) {
    this.maxMetrics = maxMetrics;
    this.slowThresholdMs = slowThresholdMs;
  }

  add(metric: SearchMetric): void {
    this.metrics.push(metric);

    // Evict oldest when buffer full
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getSummary(sinceMinutes = 60): MetricsSummary {
    const since = new Date(Date.now() - sinceMinutes * 60_000);
    const recent = this.metrics.filter((m) => m.timestamp >= since);

    if (recent.length === 0) {
      return {
        totalSearches: 0,
        averageDuration: 0,
        successRate: 100,
        popularQueries: [],
        slowQueries: [],
        averageResultCount: 0,
        filtersUsage: {},
      };
    }

    // Popular queries
    const queryCounts = new Map<string, number>();
    for (const m of recent) {
      if (m.query.trim()) {
        const q = m.query.toLowerCase();
        queryCounts.set(q, (queryCounts.get(q) || 0) + 1);
      }
    }
    const popularQueries = [...queryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([query, count]) => ({ query, count }));

    // Slow queries
    const slowQueries = recent
      .filter((m) => m.duration >= this.slowThresholdMs)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(({ query, duration, timestamp }) => ({ query, duration, timestamp }));

    // Filters usage
    const filtersUsage: Record<string, number> = {};
    for (const m of recent) {
      for (const f of m.filters) {
        filtersUsage[f] = (filtersUsage[f] || 0) + 1;
      }
    }

    const totalDuration = recent.reduce((s, m) => s + m.duration, 0);
    const successCount = recent.filter((m) => m.success).length;
    const totalResults = recent.reduce((s, m) => s + m.resultCount, 0);

    return {
      totalSearches: recent.length,
      averageDuration: Math.round(totalDuration / recent.length),
      successRate: Math.round((successCount / recent.length) * 100 * 100) / 100,
      popularQueries,
      slowQueries,
      averageResultCount: Math.round(totalResults / recent.length),
      filtersUsage,
    };
  }

  /** Zero-result queries — potential synonym gaps or UX issues */
  getZeroResultQueries(sinceMinutes = 1440): Array<{ query: string; count: number }> {
    const since = new Date(Date.now() - sinceMinutes * 60_000);
    const zeroes = this.metrics.filter(
      (m) => m.timestamp >= since && m.resultCount === 0 && m.query.trim()
    );

    const counts = new Map<string, number>();
    for (const m of zeroes) {
      const q = m.query.toLowerCase();
      counts.set(q, (counts.get(q) || 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([query, count]) => ({ query, count }));
  }

  clear(): void {
    this.metrics = [];
  }
}

// Singleton
export const searchMetrics = new SearchMetricsCollector();
