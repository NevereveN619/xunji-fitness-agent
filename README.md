# Xunji Fitness Agent

A lightweight bridge that lets a ChatGPT-style assistant read, analyze, and log Xunji fitness data through Google Sheets and Apps Script.

## What it does

- syncs body-weight, body-fat, waist, diet totals, and training history from Xunji;
- builds a reusable Xunji food cache from history;
- logs measured ordinary foods with real gram amounts;
- logs restaurant/photo/mixed meals as one-serving quick entries;
- uses a write queue so the assistant can distinguish queued, completed, and failed writes;
- ships with a Skill that defines date handling, duplicate prevention, authorization, and analysis behavior.

## Install

See `docs/setup.md`.

## Privacy

The repository contains no deployment credentials or personal fitness records. See `docs/privacy.md`.

## License

MIT. See `LICENSE`.

## Status

Public V1 release candidate. The remaining gates are a fresh-deployment end-to-end test and the final GitHub release.
