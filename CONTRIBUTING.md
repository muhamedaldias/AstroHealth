# Contributing

Read `docs/team/TEAM_CONTRACT.md` (team rules), `docs/team/IO_MATRIX.md` (who gives what to whom)
and `docs/team/CODING_STANDARDS.md`. Short version:

1. Branch: `ai/`, `be/`, `fe/` or `contract/` + task name.
2. Touch only files you own (`OWNERSHIP.yaml`).
3. Shape of data changes only in `contracts/openapi.yaml` -> `make gen`.
4. `make check` must pass before you push. CI runs the same command.
5. Squash-merge; contract PRs need both other members' approval.
