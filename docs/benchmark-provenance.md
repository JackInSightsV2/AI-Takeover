# Per-score provenance and comparison policy

Scores retain their existing numeric or textual values in `model.scores`. Each populated
cell has a corresponding `model.scoreEvidence[evalId]` record after data loading:

- `status`: `unaudited` (default), `documented` (prior research association), or `audited`.
- `source`: the exact score's HTTP(S) evidence URL, or `null` when missing.
- `locator`: table, row and exact model/variant column, or `null`.
- `checkedAt`: date the evidence and evaluation setup were audited, `YYYY-MM-DD`, or `null`.
- `version`: exact benchmark version/year/subset, or `null`.
- `settings`: a consistent evaluation-settings identifier, or `null`.

Record metadata inline next to a model's `scores` as `scoreEvidence`. Missing fields
are normalized to explicit unknowns. Never derive evidence from a model release link,
release year, numeric type, evaluation title or a sibling model's results.

The initial migration preserves all 154 figures. Nine Qwen source associations and the
explicit GPQA Diamond/original HLE labels are carried forward from the October research
record as `documented`, not freshly audited. Their evaluation settings remain unknown.
The other 145 figures are `unaudited`. No source pages were re-audited during this change.

To enable comparisons, audit each score against its source and record all fields. Settings
must distinguish tool access, harness/version, prompting/shots, sampling/aggregation,
reasoning budget and evaluated variant where relevant. Use identical identifiers only
when these settings are actually comparable. Unknown settings must remain `null`.

Then choose an explicit `comparison: { version, settings }` on the `EVALS` row. Only finite
numeric scores with `audited` status, a source, locator and audit date, and exact matches
for both fields qualify. No cohort is selected automatically. Different AIME years or
HLE tool modes cannot compete in the same selected cohort. Separate rows are appropriate
when multiple versions need simultaneous comparisons.

Leaders and relative bars require at least two eligible models in that row's cohort.
Aggregate rank requires at least two eligible scores with a positive cohort best; zero
scores remain valid, but an all-zero cohort cannot supply a ratio denominator. Selective
reporting still biases the aggregate. The comparison field is the whole catalogue, not
only the models visible after filtering.

No cohorts are enabled in this migration: every current model is unranked. Scores stay
visible, and each matrix cell links directly to its generated per-score evidence details.
This is a conservative provenance foundation, not a retrospective benchmark audit.

Checks: `node tools/check-provenance.js` (no dependencies), plus
`NODE_PATH=.test-deps/node_modules node tools/check-matrix.js` (requires `linkedom`).
Rebuild with `node tools/build.js` and check links with `node tools/check-links.js`.
