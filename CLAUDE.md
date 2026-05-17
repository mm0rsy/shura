# Shura — AI Contributor Guidelines

Shura is a Claude Code plugin. Each skill in `skills/` is a SKILL.md file with YAML frontmatter.

## Skill Conventions
- `name`: letters, numbers, hyphens only
- `description`: starts with "Use when...", describes triggers only — NEVER summarizes the workflow
- Agent prompts in `agents/` are prompt templates with `{placeholder}` fields to be filled at runtime
- State lives in `.shura/` within the user's project directory (not the plugin directory)

## Modifying Skills
Follow the RED-GREEN-REFACTOR cycle from `superpowers:writing-skills`. Do not ship untested skill changes.

## Agent Prompts
Templates use `{snake_case_placeholders}`. When a skill says "load agent prompt from agents/X.md", read the file, replace all placeholders with real values from `.shura/` state, then dispatch the Agent.
