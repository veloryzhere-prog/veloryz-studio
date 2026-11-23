# VELORYZ Studio — repository boundaries and QC policy

This is the **active production development repository**:
`veloryzhere-prog/veloryz-studio`.

## Non-negotiable repository boundary

- Make all future code, design, content, security, test and deployment changes **only in `veloryzhere-prog/veloryz-studio`** through its normal main/PR workflow.
- The frozen safety branch `archive/pre-qc-2026-11-23` points to commit `920b7069d0a4c23d963e722487d5052013760c5a`. **Never commit to, reset, delete, rebase or force-push that branch.**
- Any separately created `veloryz-studio-backup-*` repository is an **independent archival repository**: do not open pull requests, push commits, deploy, enable CI/CD, or alter its files or branches. Keep it private and archived after verifying the complete copy.
- Do **not** use a backup as the worktree or deploy source. Backup access is for read-only disaster recovery.
- Do not change the original official 3D V model or original scarf without explicit user direction.
- Do not claim a change is live until the actual `https://veloryz.online` host has been checked; a successful GitHub commit is not a deployment.
- Do not call a screenshot a production screenshot unless it was captured from the public HTTPS host (or user authenticated site with permission). A local mock or cached reference is not production evidence.
- Preserve consent, keyboard accessibility and reduced-motion preferences in all UI changes.

## Visual QC

The source-backed browser audit is `VELORYZ-Studio/tools/qc-capture-live.mjs` and GitHub workflow
`.github/workflows/veloryz-public-visual-qc.yml`. Screenshots and a defect report are uploaded as a GitHub Actions artifact; the workflow never submits forms or modifies project/account data.

The source guardrails live at `VELORYZ-Studio/public/reference-qc-layout-r7.css`; the public page is rendered by `VELORYZ-Studio/lib/claude-reference-shell.ts`, not by the legacy `?classic=1` route.
