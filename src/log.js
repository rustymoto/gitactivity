const simpleGit = require('simple-git');

async function getCommitLog(repoDir, options = {}) {
  const git = simpleGit(repoDir);

  const logOptions = { '--all': null, maxCount: undefined };

  const result = await git.log(logOptions);

  let commits = result.all.map(entry => ({
    hash: entry.hash,
    author: entry.author_name,
    email: entry.author_email,
    date: new Date(entry.date),
    message: entry.message,
  }));

  if (options.author) {
    const filter = options.author.toLowerCase();
    commits = commits.filter(c => c.author.toLowerCase().includes(filter));
  }

  commits.sort((a, b) => a.date - b.date);

  return commits;
}

module.exports = { getCommitLog };
