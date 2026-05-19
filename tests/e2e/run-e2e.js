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
    assert.ok('Architect' in result.specialist_roles);
    assert.ok('Security Reviewer' in result.specialist_roles);
  });

  test('frontend fixture: Tester and Architect present with both repos', async () => {
    const repoPath = join(FIXTURES, 'frontend');
    const result = await detectStack(repoPath, BOTH_REPOS);
    assert.equal(result.stack, 'frontend');
    assert.ok('Tester' in result.specialist_roles, 'Tester missing');
    assert.ok('Architect' in result.specialist_roles, 'Architect missing');
  });

  test('claude-code-plugin fixture: Technical Writer present with both repos', async () => {
    const repoPath = join(FIXTURES, 'claude-code-plugin');
    const result = await detectStack(repoPath, BOTH_REPOS);
    assert.equal(result.stack, 'claude-code-plugin');
    assert.ok('Technical Writer' in result.specialist_roles, 'Technical Writer missing');
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
});

describe('E2E: config-writing simulation', () => {
  test('config object has all required fields after detectStack', async () => {
    const repoPath = join(FIXTURES, 'python');
    const skillRepos = BOTH_REPOS;
    const result = await detectStack(repoPath, skillRepos);

    const config = {
      slug: 'my-repo',
      name: 'My Repo',
      type: 'local',
      source: repoPath,
      path: repoPath,
      branch: 'my-project',
      status: 'ready',
      epic: '',
      stack: result.stack,
      must_use_skills: result.must_use_skills,
      recommended_skills: result.recommended_skills,
      specialist_roles: result.specialist_roles,
      graph_report: '',
    };

    // All required fields present
    const required = [
      'slug', 'name', 'type', 'source', 'path', 'branch',
      'status', 'epic', 'stack', 'must_use_skills',
      'recommended_skills', 'specialist_roles', 'graph_report'
    ];
    for (const field of required) {
      assert.ok(field in config, `config missing field: ${field}`);
    }

    // Stack is a non-empty string
    assert.ok(config.stack.length > 0, 'stack is empty');

    // specialist_roles is serializable to JSON (no circular refs, no undefined)
    const serialized = JSON.stringify(config.specialist_roles);
    assert.ok(serialized.length > 2, 'specialist_roles serializes to empty object');

    // must_use_skills and recommended_skills are JSON arrays
    const muStr = JSON.stringify(config.must_use_skills);
    assert.ok(muStr.startsWith('['), 'must_use_skills not a JSON array');
  });
});
