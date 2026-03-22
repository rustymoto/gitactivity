const { describe, it } = require('node:test');
const assert = require('node:assert');
const { groupIntoSessions } = require('../src/sessions');

function makeCommit(author, dateStr) {
  return { hash: 'abc', author, email: '', date: new Date(dateStr), message: 'test' };
}

describe('groupIntoSessions', () => {
  it('returns empty array for no commits', () => {
    assert.deepStrictEqual(groupIntoSessions([]), []);
  });

  it('creates a single session for one commit', () => {
    const commits = [makeCommit('Alice', '2025-01-01T10:00:00Z')];
    const sessions = groupIntoSessions(commits, 120, 30);
    assert.strictEqual(sessions.length, 1);
    assert.strictEqual(sessions[0].durationMinutes, 30);
    assert.strictEqual(sessions[0].commits.length, 1);
  });

  it('groups close commits into one session', () => {
    const commits = [
      makeCommit('Alice', '2025-01-01T10:00:00Z'),
      makeCommit('Alice', '2025-01-01T10:30:00Z'),
      makeCommit('Alice', '2025-01-01T11:00:00Z'),
    ];
    const sessions = groupIntoSessions(commits, 120, 30);
    assert.strictEqual(sessions.length, 1);
    assert.strictEqual(sessions[0].durationMinutes, 90); // 30 initial + 60 span
    assert.strictEqual(sessions[0].commits.length, 3);
  });

  it('splits sessions on large gaps', () => {
    const commits = [
      makeCommit('Alice', '2025-01-01T10:00:00Z'),
      makeCommit('Alice', '2025-01-01T10:30:00Z'),
      makeCommit('Alice', '2025-01-01T15:00:00Z'), // 4.5h gap
    ];
    const sessions = groupIntoSessions(commits, 120, 30);
    assert.strictEqual(sessions.length, 2);
    assert.strictEqual(sessions[0].durationMinutes, 60); // 30 + 30
    assert.strictEqual(sessions[1].durationMinutes, 30); // single commit
  });

  it('separates authors into their own sessions', () => {
    const commits = [
      makeCommit('Alice', '2025-01-01T10:00:00Z'),
      makeCommit('Bob', '2025-01-01T10:15:00Z'),
      makeCommit('Alice', '2025-01-01T10:30:00Z'),
    ];
    const sessions = groupIntoSessions(commits, 120, 30);
    assert.strictEqual(sessions.length, 2);
    const aliceSession = sessions.find(s => s.author === 'Alice');
    const bobSession = sessions.find(s => s.author === 'Bob');
    assert.strictEqual(aliceSession.commits.length, 2);
    assert.strictEqual(bobSession.commits.length, 1);
  });
});
