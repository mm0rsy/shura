import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const MAP_PATH = join(__dirname, '../../skills/add-repo/skill-map.json');

const EXPECTED_STACKS = [
  'frontend', 'backend', 'fullstack', 'mobile',
  'devops', 'data-ml', 'python', 'cpp', 'claude-code-plugin'
];

// Known external skill repo namespaces (from CLAUDE.md + stack-detector.js)
const KNOWN_NAMESPACES = ['everything-claude-code', 'claude-skills'];

describe('skill-map.json schema', () => {
  let skillMap;

  before(async () => {
    const raw = await readFile(MAP_PATH, 'utf8');
    skillMap = JSON.parse(raw);
  });

  test('file loads and parses as valid JSON', () => {
    assert.equal(typeof skillMap, 'object');
    assert.ok(skillMap !== null);
  });

  test('all 9 stacks are present', () => {
    for (const stack of EXPECTED_STACKS) {
      assert.ok(stack in skillMap, `missing stack: ${stack}`);
    }
  });

  test('each stack has must_use, recommended, specialist_roles with correct types', () => {
    for (const [stack, entry] of Object.entries(skillMap)) {
      assert.ok(Array.isArray(entry.must_use), `${stack}.must_use not array`);
      assert.ok(Array.isArray(entry.recommended), `${stack}.recommended not array`);
      assert.ok(
        entry.specialist_roles !== null &&
        !Array.isArray(entry.specialist_roles) &&
        typeof entry.specialist_roles === 'object',
        `${stack}.specialist_roles must be a plain object`
      );
    }
  });

  test('Developer is builtin in every stack', () => {
    for (const [stack, entry] of Object.entries(skillMap)) {
      const dev = entry.specialist_roles?.Developer;
      assert.ok(dev, `${stack} missing Developer`);
      assert.equal(dev.source, 'builtin', `${stack}.Developer.source !== 'builtin'`);
      assert.equal(dev.file, 'agents/dev.md', `${stack}.Developer.file wrong`);
    }
  });

  test('all skill namespaces in must_use and recommended are known', () => {
    for (const [stack, entry] of Object.entries(skillMap)) {
      for (const skill of [...entry.must_use, ...entry.recommended]) {
        const ns = skill.split(':')[0];
        assert.ok(KNOWN_NAMESPACES.includes(ns),
          `${stack}: unknown namespace "${ns}" in skill "${skill}"`);
      }
    }
  });

  test('all skill-source roles have a name field with known namespace; builtin roles have file field', () => {
    for (const [stack, entry] of Object.entries(skillMap)) {
      for (const [role, cfg] of Object.entries(entry.specialist_roles)) {
        if (cfg.source === 'skill') {
          assert.ok(cfg.name, `${stack}.${role} has source:skill but no name`);
          const ns = cfg.name.split(':')[0];
          assert.ok(KNOWN_NAMESPACES.includes(ns),
            `${stack}.${role}: unknown namespace "${ns}" in name "${cfg.name}"`);
        }
        if (cfg.source === 'builtin') {
          assert.ok(cfg.file, `${stack}.${role} has source:builtin but no file`);
        }
      }
    }
  });

  test('devops has empty must_use (it is the only stack with no required skills)', () => {
    assert.deepEqual(skillMap.devops.must_use, []);
  });
});
