# Marketing reports

Deliverables from the `/market` AI marketing team (`.claude/skills/market/SKILL.md`) are saved here.

Each run gets a **run ID**: `<YYYY-MM-DD-HHMM>-<command>-<slug>` (UTC). The slug is a filesystem-safe version of the
target (lowercase, letters and digits joined by `-`, at most 50 characters; `all` for business-wide runs). If two runs
would share an ID, the later one gets `-2`, `-3`, … appended.

- `<run-id>.md` is the merged deliverable.
- `<run-id>-<agent>.md` holds each specialist's detail (e.g. `…-market-seo-specialist.md`).

Example: `2026-10-07-2015-audit-dog-urine-lawn-repair.md` and `2026-10-07-2015-audit-dog-urine-lawn-repair-market-copywriter.md`.
