import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PO_PATH = join(__dirname, '../../agents/po.md');

// The regex /\{([a-z][a-z0-9_-]*)\}/ only matches tokens starting with a lowercase letter.
// Tokens like {ISO-8601-timestamp} (uppercase I) and {N} (uppercase) are intentionally skipped.

// All placeholders that must appear AND be documented in CLAUDE.md
const REQUIRED_PLACEHOLDERS = new Set([
  'repo_name', 'project_name', 'ticket_id', 'repo_path', 'branch',
  'stack', 'graph_report', 'goal', 'epic', 'decisions_log',
  'plugin_dir', 'specialist_roles_json', 'skill_repos',
  'must_use_skills', 'recommended_skills',
  // Dev spawning placeholders (used in the Spawning a Developer section)
  'task_description', 'files_list', 'acceptance_criteria',
  'definition_of_done', 'test_command',
  // Template/example placeholders used in code blocks
  'ISO-8601-timestamp',
  'why',
  // Task template example placeholders (documentation artifacts in task structure examples)
  'file1', 'file2',
  // Notification template placeholder: "Specialists used: {list}"
  'list',
  // Meta-reference in header: "Fill all {placeholders} before dispatching"
  'placeholders',
]);

// Placeholders that appear in example/template blocks (not real dispatch placeholders)
// These are acceptable as documentation artifacts
const EXAMPLE_ONLY = new Set([
  'ISO-8601-timestamp',
  'why',
  // Task structure example artifacts
  'file1', 'file2',
  // Notification template artifact
  'list',
  // Meta-reference to the concept of "placeholders" in the header instruction
  'placeholders',
  // NOTE: po.md also contains space-form tokens ({one-line summary}, {what triggered this}, {if any})
  // These are intentionally unmatched by the regex (spaces not in [a-z0-9_-]) — no entry needed.
]);

describe('po.md placeholder coverage', () => {
  let content;

  before(async () => {
    content = await readFile(PO_PATH, 'utf8').catch(e => {
      throw new Error(`Could not read po.md at ${PO_PATH}: ${e.message}`);
    });
  });

  test('all {placeholders} in po.md are in the known-required list', () => {
    // Extract all {placeholder} tokens, allow underscores and hyphens
    const found = [...content.matchAll(/\{([a-z][a-z0-9_-]*)\}/g)]
      .map(m => m[1]);
    const unknown = found.filter(p => !REQUIRED_PLACEHOLDERS.has(p));
    assert.deepEqual(unknown, [],
      `Unknown placeholders in po.md: ${unknown.join(', ')}\nAdd them to REQUIRED_PLACEHOLDERS or document them.`);
  });

  test('all REQUIRED_PLACEHOLDERS (non-example) appear at least once in po.md', () => {
    const missing = [];
    for (const p of REQUIRED_PLACEHOLDERS) {
      if (EXAMPLE_ONLY.has(p)) continue;
      if (!content.includes(`{${p}}`)) missing.push(p);
    }
    assert.deepEqual(missing, [],
      `Expected placeholders missing from po.md: ${missing.join(', ')}`);
  });
});
