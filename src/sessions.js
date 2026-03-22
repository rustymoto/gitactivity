function groupIntoSessions(commits, gapMinutes = 120, initialMinutes = 30) {
  if (commits.length === 0) return [];

  // Group commits by author
  const byAuthor = new Map();
  for (const commit of commits) {
    if (!byAuthor.has(commit.author)) {
      byAuthor.set(commit.author, []);
    }
    byAuthor.get(commit.author).push(commit);
  }

  const allSessions = [];

  for (const [author, authorCommits] of byAuthor) {
    // Already sorted by date from log.js, but ensure it
    authorCommits.sort((a, b) => a.date - b.date);

    let session = {
      author,
      commits: [authorCommits[0]],
      start: authorCommits[0].date,
      end: authorCommits[0].date,
    };

    for (let i = 1; i < authorCommits.length; i++) {
      const commit = authorCommits[i];
      const prev = authorCommits[i - 1];
      const gapMs = commit.date - prev.date;
      const gapMins = gapMs / (1000 * 60);

      if (gapMins > gapMinutes) {
        // Finalize current session
        session.durationMinutes = computeDuration(session, initialMinutes);
        allSessions.push(session);

        // Start new session
        session = {
          author,
          commits: [commit],
          start: commit.date,
          end: commit.date,
        };
      } else {
        session.commits.push(commit);
        session.end = commit.date;
      }
    }

    // Finalize last session
    session.durationMinutes = computeDuration(session, initialMinutes);
    allSessions.push(session);
  }

  // Sort all sessions by start date
  allSessions.sort((a, b) => a.start - b.start);

  return allSessions;
}

function computeDuration(session, initialMinutes) {
  if (session.commits.length === 1) {
    return initialMinutes;
  }
  const spanMs = session.end - session.start;
  const spanMinutes = spanMs / (1000 * 60);
  return initialMinutes + spanMinutes;
}

module.exports = { groupIntoSessions };
