const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function cloneRepo(repoUrl) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitactivity-'));

  const git = simpleGit();
  await git.clone(repoUrl, dir, ['--bare']);

  const cleanup = async () => {
    await fs.promises.rm(dir, { recursive: true, force: true });
  };

  return { dir, cleanup };
}

module.exports = { cloneRepo };
