import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { detectStack } from '../../skills/add-repo/stack-detector.js';

async function makeFixture(files) {
  const dir = await mkdtemp(join(tmpdir(), 'shura-test-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = join(dir, rel);
    await mkdir(join(full, '..'), { recursive: true });
    if (content === null) await mkdir(full, { recursive: true });
    else await writeFile(full, content);
  }
  return dir;
}

async function cleanup(dir) {
  await rm(dir, { recursive: true, force: true });
}

// ── Stack fingerprint tests ───────────────────────────────────────────────────

describe('stack detection — fingerprints', () => {
  test('claude-code-plugin: detects .claude-plugin/ directory', async () => {
    const dir = await makeFixture({ '.claude-plugin/.keep': '' });
    try {
      const r = await detectStack(dir, []);
      assert.equal(r.stack, 'claude-code-plugin');
    } finally { await cleanup(dir); }
  });

  test('data-ml: detects requirements.txt with ML keyword (torch)', async () => {
    const dir = await makeFixture({ 'requirements.txt': 'torch==2.0.0\nnumpy' });
    try {
      const r = await detectStack(dir, []);
      assert.equal(r.stack, 'data-ml');
    } finally { await cleanup(dir); }
  });

  test('data-ml: detects .ipynb file at root', async () => {
    const dir = await makeFixture({ 'notebook.ipynb': '{}' });
    try {
      const r = await detectStack(dir, []);
      assert.equal(r.stack, 'data-ml');
    } finally { await cleanup(dir); }
  });

  test('mobile: detects pubspec.yaml (Flutter)', async () => {
    const dir = await makeFixture({ 'pubspec.yaml': 'name: my_app' });
    try {
      const r = await detectStack(dir, []);
      assert.equal(r.stack, 'mobile');
    } finally { await cleanup(dir); }
  });

  test('mobile: detects ios/ + android/ directories (React Native)', async () => {
    const dir = await makeFixture({ 'ios/.keep': '', 'android/.keep': '' });
    try {
      const r = await detectStack(dir, []);
      assert.equal(r.stack, 'mobile');
    } finally { await cleanup(dir); }
  });

  test('cpp: detects CMakeLists.txt', async () => {
    const dir = await makeFixture({ 'CMakeLists.txt': 'cmake_minimum_required(VERSION 3.10)' });
    try {
      const r = await detectStack(dir, []);
      assert.equal(r.stack, 'cpp');
    } finally { await cleanup(dir); }
  });

  test('fullstack: detects package.json with react dep + api/ dir', async () => {
    const pkg = JSON.stringify({ dependencies: { react: '^18.0.0' } });
    const dir = await makeFixture({ 'package.json': pkg, 'api/.keep': '' });
    try {
      const r = await detectStack(dir, []);
      assert.equal(r.stack, 'fullstack');
    } finally { await cleanup(dir); }
  });

  test('frontend: detects package.json with react dep (no api/ dir)', async () => {
    const pkg = JSON.stringify({ dependencies: { react: '^18.0.0' } });
    const dir = await makeFixture({ 'package.json': pkg });
    try {
      const r = await detectStack(dir, []);
      assert.equal(r.stack, 'frontend');
    } finally { await cleanup(dir); }
  });

  test('devops: detects Dockerfile without package.json', async () => {
    const dir = await makeFixture({ 'Dockerfile': 'FROM node:18' });
    try {
      const r = await detectStack(dir, []);
      assert.equal(r.stack, 'devops');
    } finally { await cleanup(dir); }
  });

  test('python: detects pyproject.toml', async () => {
    const dir = await makeFixture({ 'pyproject.toml': '[tool.poetry]' });
    try {
      const r = await detectStack(dir, []);
      assert.equal(r.stack, 'python');
    } finally { await cleanup(dir); }
  });

  test('backend: fallback when no fingerprint matches', async () => {
    const dir = await makeFixture({ 'main.go': 'package main' });
    try {
      const r = await detectStack(dir, []);
      assert.equal(r.stack, 'backend');
    } finally { await cleanup(dir); }
  });
});

// ── Return-shape tests ────────────────────────────────────────────────────────

describe('detectStack return shape', () => {
  test('always returns {stack, must_use_skills, recommended_skills, specialist_roles}', async () => {
    const dir = await makeFixture({ 'main.go': '' });
    try {
      const r = await detectStack(dir, []);
      assert.ok('stack' in r, 'missing stack');
      assert.ok(Array.isArray(r.must_use_skills), 'must_use_skills not array');
      assert.ok(Array.isArray(r.recommended_skills), 'recommended_skills not array');
      assert.equal(typeof r.specialist_roles, 'object', 'specialist_roles not object');
    } finally { await cleanup(dir); }
  });

  test('Developer is always present in specialist_roles regardless of skillRepos', async () => {
    const dir = await makeFixture({ 'main.go': '' });
    try {
      const r = await detectStack(dir, []);
      assert.ok('Developer' in r.specialist_roles, 'Developer missing');
      assert.equal(r.specialist_roles.Developer.source, 'builtin');
      assert.equal(r.specialist_roles.Developer.file, 'agents/dev.md');
    } finally { await cleanup(dir); }
  });
});

// ── Filtering tests ───────────────────────────────────────────────────────────

describe('filtering by skillRepos', () => {
  test('empty skillRepos: only builtin entries survive in specialist_roles', async () => {
    const dir = await makeFixture({ 'pyproject.toml': '[tool.poetry]\nname = "app"' }); // python stack
    try {
      const r = await detectStack(dir, []);
      const sources = Object.values(r.specialist_roles).map(v => v.source);
      assert.ok(sources.every(s => s === 'builtin'), 'non-builtin role survived with empty skillRepos');
    } finally { await cleanup(dir); }
  });

  test('empty skillRepos: must_use_skills is empty array', async () => {
    const dir = await makeFixture({ 'pyproject.toml': '[tool.poetry]\nname = "app"' });
    try {
      const r = await detectStack(dir, []);
      assert.deepEqual(r.must_use_skills, []);
    } finally { await cleanup(dir); }
  });

  test('empty skillRepos: recommended_skills is empty array', async () => {
    const dir = await makeFixture({ 'pyproject.toml': '[tool.poetry]\nname = "app"' });
    try {
      const r = await detectStack(dir, []);
      assert.deepEqual(r.recommended_skills, []);
    } finally { await cleanup(dir); }
  });

  test('with everything-claude-code: tdd appears in must_use_skills for python', async () => {
    const dir = await makeFixture({ 'pyproject.toml': '' });
    try {
      const r = await detectStack(dir, ['affaan-m/everything-claude-code']);
      assert.ok(r.must_use_skills.some(s => s.startsWith('everything-claude-code:')),
        'expected everything-claude-code skill in must_use_skills');
    } finally { await cleanup(dir); }
  });

  test('with everything-claude-code: Architect role appears in specialist_roles for backend', async () => {
    const dir = await makeFixture({ 'main.go': '' }); // backend
    try {
      const r = await detectStack(dir, ['affaan-m/everything-claude-code']);
      assert.ok('Architect' in r.specialist_roles, 'Architect role missing');
      assert.equal(r.specialist_roles.Architect.source, 'skill');
    } finally { await cleanup(dir); }
  });

  test('with claude-skills only: Tester role appears for backend', async () => {
    const dir = await makeFixture({ 'main.go': '' }); // backend
    try {
      const r = await detectStack(dir, ['alirezarezvani/claude-skills']);
      assert.ok('Tester' in r.specialist_roles, 'Tester role missing');
    } finally { await cleanup(dir); }
  });

  test('with both repos: all catalogue roles present for backend', async () => {
    const dir = await makeFixture({ 'main.go': '' }); // backend
    try {
      const r = await detectStack(dir, [
        'affaan-m/everything-claude-code',
        'alirezarezvani/claude-skills'
      ]);
      // backend catalogue: Developer, Tester, Architect, Database Engineer, Security Reviewer
      const roles = Object.keys(r.specialist_roles);
      assert.ok(roles.includes('Developer'), 'Developer missing');
      assert.ok(roles.includes('Tester'), 'Tester missing');
      assert.ok(roles.includes('Architect'), 'Architect missing');
      assert.ok(roles.includes('Database Engineer'), 'Database Engineer missing');
      assert.ok(roles.includes('Security Reviewer'), 'Security Reviewer missing');
    } finally { await cleanup(dir); }
  });

  test('namespace derivation: affaan-m/everything-claude-code → everything-claude-code', async () => {
    // If namespace derivation breaks, skills from that repo won't appear
    const dir = await makeFixture({ 'main.go': '' });
    try {
      const r = await detectStack(dir, ['affaan-m/everything-claude-code']);
      const allNames = [
        ...r.must_use_skills,
        ...r.recommended_skills,
        ...Object.values(r.specialist_roles)
          .filter(v => v.source === 'skill')
          .map(v => v.name)
      ];
      assert.ok(allNames.some(n => n.startsWith('everything-claude-code:')),
        'namespace derivation failed: no everything-claude-code entries');
    } finally { await cleanup(dir); }
  });
});
