# Big Simulation Online: keys

**Private. Do not make this repository public.**

This is the companion to the `big-simulation` code repo. It holds everything that states an expected student answer, so that the code repo can become public with a clean history.

## What lives here

| Path | What |
| --- | --- |
| `KEYS.md` | The Test fixtures and Source errata sections of the development plan |
| `source/instructor-manual.md` | The instructor manual and solutions from the source project |
| `golden/` | Tests that run the engine against the keys, on a checkout of the code repo. Phase 0 checks the altered column of Exhibit 4; the ratio and coverage fixtures arrive in phase 2 |
| `scenarios/` (when needed) | Exhibit 4 variants written for a section, with their keys |
| `seed/` (from phase 3) | The script that loads keys into the app's `scenario_keys` table |

## Rules

- Nothing here is copied into `big-simulation`.
- The deployed app never reads this repo. Keys reach it only through the seed script, into the database.
- Rosters, `.env` files, the pepper and database dumps do not belong in either repo.

## Running the golden tests

Check out `big-simulation` in a folder next to this one, or set `CODE_REPO` to its path. Install the code repo's dependencies first, since the engine is loaded from its source.

```sh
pnpm install
pnpm test
```

There is no CI here yet. A workflow in this repo would need a token that can read the code repo while that repo is private.
