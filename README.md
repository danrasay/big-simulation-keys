# Big Simulation Online: keys

**Private. Do not make this repository public.**

This is the companion to the `big-simulation` code repo. It holds everything that states an expected student answer, so that the code repo can become public with a clean history.

## What lives here

| Path | What |
| --- | --- |
| `KEYS.md` | The Test fixtures and Source errata sections of the development plan |
| `source/instructor-manual.md` | The instructor manual and solutions from the source project |
| `golden/` (from phase 2) | Tests that run the engine against the fixtures, on a checkout of the code repo |
| `scenarios/` (when needed) | Exhibit 4 variants written for a section, with their keys |
| `seed/` (from phase 3) | The script that loads keys into the app's `scenario_keys` table |

## Rules

- Nothing here is copied into `big-simulation`.
- The deployed app never reads this repo. Keys reach it only through the seed script, into the database.
- Rosters, `.env` files, the pepper and database dumps do not belong in either repo.
