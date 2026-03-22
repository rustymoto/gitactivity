const { describe, it } = require('node:test');
const assert = require('node:assert');
const { computeStats } = require('../src/stats');

function makeSession(author, startStr, durationMinutes, commitCount) {
  const start = new Date(startStr);
  const end = new Date(start.getTime() + (durationMinutes - 30) * 60000);
  const commits = Array.from({ length: commitCount }, (_, i) => ({
    hash: `hash${i}`, author, date: start, message: 'test',
  }));
  return { author, start, end, commits, durationMinutes };
}

describe('computeStats', () => {
  it('computes correct totals', () => {
    const sessions = [
      makeSession('Alice', '2025-01-01T10:00:00Z', 90, 3),
      makeSession('Bob', '2025-01-01T14:00:00Z', 30, 1),
    ];
    const stats = computeStats(sessions);
    assert.strictEqual(stats.totalMinutes, 120);
    assert.strictEqual(stats.totalSessions, 2);
    assert.strictEqual(stats.totalCommits, 4);
  });

  it('computes per-author stats', () => {
    const sessions = [
      makeSession('Alice', '2025-01-01T10:00:00Z', 60, 2),
      makeSession('Alice', '2025-01-02T10:00:00Z', 90, 3),
      makeSession('Bob', '2025-01-01T14:00:00Z', 30, 1),
    ];
    const stats = computeStats(sessions);
    const alice = stats.byAuthor.get('Alice');
    assert.strictEqual(alice.totalMinutes, 150);
    assert.strictEqual(alice.sessionCount, 2);
    assert.strictEqual(alice.commitCount, 5);
    assert.strictEqual(alice.averageSessionMinutes, 75);
  });

  it('computes per-month stats', () => {
    const sessions = [
      makeSession('Alice', '2025-01-15T10:00:00Z', 60, 2),
      makeSession('Alice', '2025-02-10T10:00:00Z', 30, 1),
    ];
    const stats = computeStats(sessions);
    assert.strictEqual(stats.byMonth.get('2025-01').totalMinutes, 60);
    assert.strictEqual(stats.byMonth.get('2025-02').totalMinutes, 30);
  });
});
