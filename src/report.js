const chalk = require('chalk');
const Table = require('cli-table3');
const { formatDuration, formatDate } = require('./utils');

function printReport(stats, format) {
  if (format === 'json') {
    printJsonReport(stats);
    return;
  }

  printSummary(stats);
  printAuthorTable(stats);
  printMonthTable(stats);
  printSessionTable(stats);
}

function printSummary(stats) {
  console.log();
  console.log(chalk.bold.cyan('  Git Activity Report'));
  console.log(chalk.cyan('  ' + '─'.repeat(40)));
  console.log(`  Total estimated time:  ${chalk.bold.white(formatDuration(stats.totalMinutes))}`);
  console.log(`  Total sessions:        ${chalk.white(stats.totalSessions)}`);
  console.log(`  Total commits:         ${chalk.white(stats.totalCommits)}`);
  console.log();
}

function printAuthorTable(stats) {
  console.log(chalk.bold.yellow('  Time per Author'));
  const table = new Table({
    head: ['Author', 'Time', 'Sessions', 'Commits', 'Avg Session'].map(h => chalk.gray(h)),
    style: { 'padding-left': 2 },
  });

  const sorted = [...stats.byAuthor.entries()].sort((a, b) => b[1].totalMinutes - a[1].totalMinutes);
  for (const [author, data] of sorted) {
    table.push([
      author,
      formatDuration(data.totalMinutes),
      data.sessionCount,
      data.commitCount,
      formatDuration(data.averageSessionMinutes),
    ]);
  }

  console.log(table.toString());
  console.log();
}

function printMonthTable(stats) {
  console.log(chalk.bold.yellow('  Time per Month'));
  const table = new Table({
    head: ['Month', 'Time', 'Sessions', 'Commits', 'Authors'].map(h => chalk.gray(h)),
    style: { 'padding-left': 2 },
  });

  const sorted = [...stats.byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [month, data] of sorted) {
    table.push([
      month,
      formatDuration(data.totalMinutes),
      data.sessionCount,
      data.commitCount,
      data.authors.size,
    ]);
  }

  console.log(table.toString());
  console.log();
}

function printSessionTable(stats) {
  const recent = stats.sessions.slice(-20);

  console.log(chalk.bold.yellow(`  Recent Sessions (last ${recent.length} of ${stats.totalSessions})`));
  const table = new Table({
    head: ['Author', 'Start', 'End', 'Duration', 'Commits'].map(h => chalk.gray(h)),
    style: { 'padding-left': 2 },
  });

  for (const session of recent) {
    table.push([
      session.author,
      formatDate(session.start),
      formatDate(session.end),
      formatDuration(session.durationMinutes),
      session.commits.length,
    ]);
  }

  console.log(table.toString());
  console.log();
}

function printJsonReport(stats) {
  const output = {
    totalMinutes: stats.totalMinutes,
    totalFormatted: formatDuration(stats.totalMinutes),
    totalSessions: stats.totalSessions,
    totalCommits: stats.totalCommits,
    byAuthor: Object.fromEntries(
      [...stats.byAuthor.entries()].map(([k, v]) => [k, {
        ...v,
        totalFormatted: formatDuration(v.totalMinutes),
        averageSessionFormatted: formatDuration(v.averageSessionMinutes),
      }])
    ),
    byMonth: Object.fromEntries(
      [...stats.byMonth.entries()].map(([k, v]) => [k, {
        ...v,
        totalFormatted: formatDuration(v.totalMinutes),
        authors: [...v.authors],
      }])
    ),
    sessions: stats.sessions.map(s => ({
      author: s.author,
      start: s.start.toISOString(),
      end: s.end.toISOString(),
      durationMinutes: s.durationMinutes,
      durationFormatted: formatDuration(s.durationMinutes),
      commitCount: s.commits.length,
    })),
  };
  console.log(JSON.stringify(output, null, 2));
}

module.exports = { printReport };
