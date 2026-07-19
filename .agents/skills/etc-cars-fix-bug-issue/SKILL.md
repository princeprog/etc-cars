---
name: etc-cars-fix-bug-issue
description: Fetch, investigate, fix, verify, commit, push, and update labels for assigned GitHub bug issues in the ETC Cars frontend repository. Use when the user asks to handle an assigned `bug` issue in `princeprog/etc-cars`, especially requests that start from GitHub issue triage and end with pushed fix commits and issue label updates.
---

# ETC Cars Fix Bug Issue

## Scope

Use this skill only for the ETC Cars frontend repository:

- Local repo: `etc-cars`
- GitHub repo: `princeprog/etc-cars`
- Default assignee: `princeprog`
- Required issue label to fetch: `bug`
- Preferred post-fix label: `fixed`

Do not use this skill for `etc-api` unless the user explicitly asks to adapt the workflow for the backend.

## Workflow

1. Confirm the local repo state before starting.
   - Run `git status --short --branch`.
   - Preserve unrelated user changes.
   - If the branch has unpushed commits, keep them and include them in the final push unless the user says otherwise.
2. Fetch the GitHub issue.
   - Find open issues in `princeprog/etc-cars` assigned to `princeprog` with label `bug`.
   - If multiple matching issues exist, choose the newest unless the user named an issue number.
   - Read the full issue body, labels, assignees, comments if available, and acceptance criteria.
3. Ground the issue locally.
   - Search the codebase for the affected pages, components, routes, services, hooks, and text strings.
   - Reproduce or reason from the exact implementation before editing.
   - If the issue is ambiguous, create an implementation plan and ask only for missing product intent that cannot be discovered.
4. Implement the fix.
   - Keep edits scoped to the affected UI, service, hook, or type surfaces.
   - Use existing project patterns, shadcn components, helpers, query hooks, and role gates.
   - Do not modify backend code unless the issue clearly requires it.
5. Verify before committing.
   - Run at minimum:
     - `pnpm typecheck`
     - `pnpm lint`
     - `git diff --check`
   - Treat new lint/typecheck errors as blockers.
   - Existing unrelated warnings may be reported without fixing.
6. Commit intentionally.
   - Make focused commits when the issue spans distinct areas.
   - Use conventional messages such as `fix(reports): hide expense reports from staff`.
   - Include only files changed for the issue and any already-intended local commits the user asked to push.
7. Push the branch.
   - Run `git push`.
   - If branch protection reports a bypass, include that in the final summary.
8. Update the GitHub issue labels after the fix is pushed.
   - Add the `fixed` label when it exists.
   - If `fixed` does not exist, add `ready for review` if it exists.
   - If neither label exists or the GitHub tool rejects the label, leave the issue open with its current labels and tell the user which label could not be applied.
   - Do not remove the `bug` label unless the user explicitly asks.
   - Do not close the issue unless the user explicitly asks.

## GitHub Access

Prefer the GitHub connector for issue fetch/update operations. If a list issues tool is unavailable, use a read-only GitHub REST search:

```text
repo:princeprog/etc-cars is:issue is:open label:bug assignee:princeprog
```

Use GitHub mutation tools only after the fix is committed and pushed.

## Final Response

Include:

- Issue number and title.
- Brief fix summary.
- Commit hashes and messages.
- Verification commands and outcomes.
- Push status.
- Label update status.
- Any issue state intentionally left unchanged.
