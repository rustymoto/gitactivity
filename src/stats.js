const { monthKey } = require('./utils');

function computeStats(sessions) {
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalCommits = sessions.reduce((sum, s) => sum + s.commits.length, 0);

  // Per-author stats
  const byAuthor = new Map();
  for (const session of sessions) {
    if (!byAuthor.has(session.author)) {
      byAuthor.set(session.author, {
        totalMinutes: 0,
        sessionCount: 0,
        commitCount: 0,
      });
    }
    const a = byAuthor.get(session.author);
    a.totalMinutes += session.durationMinutes;
    a.sessionCount += 1;
    a.commitCount += session.commits.length;
  }

  // Compute averages
  for (const [, a] of byAuthor) {
    a.averageSessionMinutes = a.sessionCount > 0
      ? a.totalMinutes / a.sessionCount
      : 0;
  }

  // Per-month stats
  const byMonth = new Map();
  for (const session of sessions) {
    const key = monthKey(session.start);
    if (!byMonth.has(key)) {
      byMonth.set(key, {
        totalMinutes: 0,
        sessionCount: 0,
        commitCount: 0,
        authors: new Set(),
      });
    }
    const m = byMonth.get(key);
    m.totalMinutes += session.durationMinutes;
    m.sessionCount += 1;
    m.commitCount += session.commits.length;
    m.authors.add(session.author);
  }

  return {
    totalMinutes,
    totalSessions: sessions.length,
    totalCommits,
    byAuthor,
    byMonth,
    sessions,
  };
}

module.exports = { computeStats };
