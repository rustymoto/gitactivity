# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install              # install dependencies
npm test                 # run all unit tests
node --test test/sessions.test.js   # run a single test file
node bin/gitactivity.js <repo-url>  # run the CLI
```

## Architecture

Node.js CLI tool (CommonJS) that estimates development time from git commit history. It clones a repo, reads the commit log, groups commits into work sessions, and outputs a time report.

**Pipeline** (`bin/gitactivity.js` orchestrates):
1. `src/clone.js` — bare-clones repo to a temp directory, returns cleanup function
2. `src/log.js` — reads full git log via `simple-git`, returns sorted commit array
3. `src/sessions.js` — groups commits into work sessions per author (core algorithm)
4. `src/stats.js` — aggregates sessions into per-author and per-month statistics
5. `src/report.js` — formats output as colored tables (`chalk` + `cli-table3`) or JSON

**Session algorithm** (`src/sessions.js`): Commits are grouped per-author chronologically. A new session starts when the gap between consecutive commits exceeds a threshold (default 2h). Session duration = initial chunk (default 30m) + time span from first to last commit in the session.

## Key Dependencies

- `simple-git` for git operations (clone, log)
- `commander` for CLI parsing
- `chalk` v4 (CommonJS) for colored output
- `cli-table3` for table formatting
- Tests use Node.js built-in test runner (`node:test` + `node:assert`)
