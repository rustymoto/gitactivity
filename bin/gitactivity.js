#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { cloneRepo } = require('../src/clone');
const { getCommitLog } = require('../src/log');
const { groupIntoSessions } = require('../src/sessions');
const { computeStats } = require('../src/stats');
const { printReport } = require('../src/report');

program
  .name('gitactivity')
  .description('Estimate development time from git commit history')
  .argument('<repo-url>', 'Git repository URL to analyze')
  .option('-g, --gap <minutes>', 'Session gap threshold in minutes', parseInt, 120)
  .option('-i, --initial <minutes>', 'Initial work estimate per session in minutes', parseInt, 30)
  .option('-a, --author <name>', 'Filter to a specific author')
  .option('-f, --format <type>', 'Output format: table or json', 'table')
  .action(async (repoUrl, options) => {
    let cleanup = null;

    try {
      console.log(chalk.gray(`Cloning ${repoUrl}...`));
      const repo = await cloneRepo(repoUrl);
      cleanup = repo.cleanup;

      console.log(chalk.gray('Reading commit history...'));
      const commits = await getCommitLog(repo.dir, { author: options.author });

      if (commits.length === 0) {
        console.log(chalk.yellow('No commits found.'));
        return;
      }

      console.log(chalk.gray(`Analyzing ${commits.length} commits...`));
      const sessions = groupIntoSessions(commits, options.gap, options.initial);
      const stats = computeStats(sessions);
      printReport(stats, options.format);

    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    } finally {
      if (cleanup) await cleanup();
    }
  });

program.parse();
