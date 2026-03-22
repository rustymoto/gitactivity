# gitactivity

A Node.js CLI that estimates development time from git history.

## Usage

```bash
node bin/gitactivity.js <repo-url> [options]
```

## Options

- `-g, --gap <minutes>` — session gap threshold (default: 120 min)
- `-i, --initial <minutes>` — initial work estimate per session (default: 30 min)
- `-a, --author <name>` — filter to a specific author
- `-f, --format <type>` — `table` (default) or `json`

## How it works

Clones the repo (bare), reads all commits, groups them into work sessions per author (new session if gap > 2 hours), and estimates time as `initial_chunk + span_between_commits`. Outputs a summary, per-author breakdown, monthly breakdown, and recent sessions table.
