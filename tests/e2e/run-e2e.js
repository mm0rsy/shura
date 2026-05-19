import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectStack } from '../../skills/add-repo/stack-detector.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const FIXTURES = join(__dirname, 'fixtures');

// skillRepos scenarios
const NO_REPOS = [];
const BOTH_REPOS = ['affaan-m/everything-claude-code', 'alirezarezvani/claude-skills'];

// Expected stack for each fixture directory
const CASES = [
  { dir: 'claude-code-plugin', stack: 'claude-code-plugin' },
  { dir: 'data-ml-reqs',       stack: 'data-ml' },
  { dir: 'data-ml-notebook',   stack: 'data-ml' },
  { dir: 'mobile-flutter',     stack: 'mobile' },
  { dir: 'cpp',                stack: 'cpp' },
  { dir: 'fullstack',          stack: 'fullstack' },
  { dir: 'frontend',           stack: 'frontend' },
  { dir: 'devops',             stack: 'devops' },
  { dir: 'python',             stack: 'python' },
];

describe('E2E: detectStack on fixture repos (no skill repos)', () => {
  for (const { dir, stack } of CASES) {
    test(`${dir} → stack="${stack}"`, async () => {
      const repoPath = join(FIXTURES, dir);
      const result = await detectStack(repoPath, NO_REPOS);
      assert.equal(result.stack, stack, `Expected ${stack}, got ${result.stack}`);
    });
  }

  test('all fixtures: Developer always present with empty skillRepos', async () => {
    for (const { dir } of CASES) {
      const repoPath = join(FIXTURES, dir);
      const result = await detectStack(repoPath, NO_REPOS);
      assert.ok('Developer' in result.specialist_roles,
        `${dir}: Developer missing in specialist_roles`);
      assert.equal(result.specialist_roles.Developer.source, 'builtin');
    }
  });

  test('all fixtures: no skill entries survive with empty skillRepos', async () => {
    for (const { dir } of CASES) {
      const repoPath = join(FIXTURES, dir);
      const result = await detectStack(repoPath, NO_REPOS);
      const skillRoles = Object.values(result.specialist_roles).filter(v => v.source === 'skill');
      assert.deepEqual(skillRoles, [],
        `${dir}: skill-source roles survived with empty skillRepos: ${JSON.stringify(skillRoles)}`);
    }
  });

  test('all fixtures: must_use_skills is [] with empty skillRepos', async () => {
    for (const { dir } of CASES) {
      const repoPath = join(FIXTURES, dir);
      const result = await detectStack(repoPath, NO_REPOS);
      assert.deepEqual(result.must_use_skills, [],
        `${dir}: non-empty must_use_skills with empty skillRepos`);
    }
  });
});

describe('E2E: detectStack on fixture repos (both skill repos installed)', () => {
  test('python fixture: Developer, Tester, Architect, Security Reviewer present', async () => {
    const repoPath = join(FIXTURES, 'python');
    const result = await detectStack(repoPath, BOTH_REPOS);
    assert.equal(result.stack, 'python');
    assert.ok('Developer' in result.specialist_roles);
    assert.ok('Tester' in result.specialist_roles);
    assert.equal(result.specialist_roles.Tester.source, 'skill', 'Tester.source not skill');
    assert.ok('Architect' in result.specialist_roles);
    assert.ok('Security Reviewer' in result.specialist_roles);
  });

  test('frontend fixture: Tester and Architect present with both repos', async () => {
    const repoPath = join(FIXTURES, 'frontend');
    const result = await detectStack(repoPath, BOTH_REPOS);
    assert.equal(result.stack, 'frontend');
    assert.ok('Tester' in result.specialist_roles, 'Tester missing');
    assert.equal(result.specialist_roles.Tester.source, 'skill', 'Tester.source not skill');
    assert.ok('Architect' in result.specialist_roles, 'Architect missing');
    assert.equal(result.specialist_roles.Architect.source, 'skill', 'Architect.source not skill');
  });

  test('claude-code-plugin fixture: Technical Writer present with both repos', async () => {
    const repoPath = join(FIXTURES, 'claude-code-plugin');
    const result = await detectStack(repoPath, BOTH_REPOS);
    assert.equal(result.stack, 'claude-code-plugin');
    assert.ok('Technical Writer' in result.specialist_roles, 'Technical Writer missing');
    assert.equal(result.specialist_roles['Technical Writer'].source, 'skill', 'Technical Writer.source not skill');
  });

  test('devops fixture: no must_use_skills even with both repos', async () => {
    const repoPath = join(FIXTURES, 'devops');
    const result = await detectStack(repoPath, BOTH_REPOS);
    assert.equal(result.stack, 'devops');
    assert.deepEqual(result.must_use_skills, [],
      'devops should always have empty must_use_skills');
  });

  test('fullstack fixture: must_use_skills contains everything-claude-code:tdd', async () => {
    const repoPath = join(FIXTURES, 'fullstack');
    const result = await detectStack(repoPath, BOTH_REPOS);
    assert.equal(result.stack, 'fullstack');
    assert.ok(result.must_use_skills.includes('everything-claude-code:tdd'),
      `must_use_skills: ${JSON.stringify(result.must_use_skills)}`);
  });

  test('data-ml-reqs fixture: ML Engineer and Tester present with both repos', async () => {
    const repoPath = join(FIXTURES, 'data-ml-reqs');
    const result = await detectStack(repoPath, BOTH_REPOS);
    assert.equal(result.stack, 'data-ml');
    assert.ok('ML Engineer' in result.specialist_roles, 'ML Engineer missing');
    assert.equal(result.specialist_roles['ML Engineer'].source, 'skill', 'ML Engineer.source not skill');
    assert.ok('Tester' in result.specialist_roles, 'Tester missing');
  });

  test('mobile-flutter fixture: Tester present with both repos', async () => {
    const repoPath = join(FIXTURES, 'mobile-flutter');
    const result = await detectStack(repoPath, BOTH_REPOS);
    assert.equal(result.stack, 'mobile');
    assert.ok('Tester' in result.specialist_roles, 'Tester missing');
    assert.equal(result.specialist_roles.Tester.source, 'skill', 'Tester.source not skill');
  });

  test('cpp fixture: Tester present with both repos', async () => {
    const repoPath = join(FIXTURES, 'cpp');
    const result = await detectStack(repoPath, BOTH_REPOS);
    assert.equal(result.stack, 'cpp');
    assert.ok('Tester' in result.specialist_roles, 'Tester missing');
    assert.equal(result.specialist_roles.Tester.source, 'skill', 'Tester.source not skill');
  });
});

describe('E2E: config-writing simulation', () => {
  test('config object has all required fields after detectStack', async () => {
    const repoPath = join(FIXTURES, 'python');
    const result = await detectStack(repoPath, BOTH_REPOS);

    // Assert on the detectStack result directly (not on a constructed literal)
    assert.ok(typeof result.stack === 'string' && result.stack.length > 0, 'stack is missing or empty');
    assert.ok(Array.isArray(result.must_use_skills), 'must_use_skills is not an array');
    assert.ok(Array.isArray(result.recommended_skills), 'recommended_skills is not an array');
    assert.ok(
      result.specialist_roles !== null &&
      !Array.isArray(result.specialist_roles) &&
      typeof result.specialist_roles === 'object',
      'specialist_roles is not a plain object'
    );
    assert.ok(Object.keys(result.specialist_roles).length > 0, 'specialist_roles is empty');

    // Verify the result is JSON-serializable (no circular refs, no undefined values)
    const serialized = JSON.stringify(result);
    assert.ok(serialized.length > 10, 'detectStack result does not serialize to meaningful JSON');

    // Verify all arrays serialize correctly
    assert.ok(JSON.stringify(result.must_use_skills).startsWith('['), 'must_use_skills not a JSON array');
    assert.ok(JSON.stringify(result.recommended_skills).startsWith('['), 'recommended_skills not a JSON array');
  });
});
