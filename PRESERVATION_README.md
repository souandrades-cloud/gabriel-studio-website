# LAB Preservation Snapshot — Pre-V2

Branch: `archive/labs-pre-v2-2026-09-09`
Base commit (release, main): `71dfe7129074af65e749ad2cf0bb71b06b2021a1`
Created: 2026-09-09
Operation: V2 PRE-FLIGHT 001 — LAB Preservation

## What this is

A byte-for-byte snapshot of every LAB/discovery file present in the
working directory at `C:\Users\Gabriel\Desktop\Gabriel Studio Sites`
immediately before Website V2 work began, taken so that historical
X02/X03 discovery-gate material is not lost when that working
directory's untracked LAB files are eventually cleared or overwritten.

This branch is preservation-only. It is not intended to build, deploy,
or merge into `main`.

## Contents

- 72 previously-tracked X03-LAB files (routes, components, 8 public
  frame assets), copied from the working directory as it stood at
  preservation time — including `components/showcase/x03-lab/x03-lab.css`
  in its modified (uncommitted, 679-line-larger) state, not the clean
  committed version.
- 84 previously-untracked LAB files:
  - 30 under `x02-lab` (app routes + components)
  - 54 under `x03-lab` (field, field-action, final, opening, return —
    app routes + components)
- `PRESERVATION_MANIFEST.csv` — relative path, tracked/untracked status,
  size in bytes, and SHA-256 for every one of the 156 files above, as
  hashed in the archive worktree immediately after copy. Verified
  byte-identical (100% SHA-256 match) against the source working
  directory before this commit was created.

## What this is not

No non-LAB file, no `node_modules`, no `.next`, no secrets/env files,
and no production X03 code were included. Production `showcase/x03`
remains exactly as released at `71dfe71` and is untouched by this
branch.
