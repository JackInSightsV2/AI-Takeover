---
name: refresh-models
description: Research and update the AI model dataset behind The Displacement Index — find models released since the last refresh, fill in benchmark scores that labs have published for models already listed, rebuild the generated model pages, verify, and optionally commit and deploy. Use when the user asks to refresh/update the models, check for new AI releases, look for new benchmark scores, or runs /refresh-models. Also use when they ask whether the site is out of date.
user-invocable: true
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
  - WebSearch
  - WebFetch
  - AskUserQuestion
---

# /refresh-models — research and update the model dataset

Keeps `assets/models.js` current: new releases, and newly-published scores for models already
listed. Everything downstream — the roster on `index.html`, the matrix on `models.html`, and all
61+ generated pages under `models/` — is derived from that one file.

**Never hand-edit anything in `models/`.** Those files are generated. Edit the data, then rebuild.

---

## The rule that matters more than coverage

This dataset's value is that a blank cell means *"nobody published this"* and a filled cell means
*"here is a figure someone published"*. A single invented, averaged or misattributed number destroys
that, and it is not recoverable by a later pass because nothing marks it as suspect.

So, without exception:

- **Never infer, interpolate, average, or estimate a score.** Not from a sibling model, not from a
  trend line, not from "it's obviously at least X". If you did not see it published, leave it out.
- **Never record a figure measured on a different variant** than the model in the row. A number for
  Qwen 3.5 27B does not go on the Qwen 3.5 397B flagship. A Heavy/Pro/Ultra tier score does not go on
  the base model's row.
- **Qualified figures go in the `note`, not silently in the cell.** With-tools runs, Pro/Heavy tiers,
  vendor numbers independent evaluators dispute, scores revised after launch — record the headline
  comparable figure in `scores` and explain the qualifier in `note`. If there is no comparable
  figure, record nothing and put the qualified one in `note` only.
- **Every number you add must trace to a source you actually opened this session.** If you cannot
  point at where it came from, it does not go in.
- If a source conflicts with another, prefer the lab's own publication or a named independent
  evaluator, and say in `note` that the figures diverge.

Coverage going up is good. Coverage going up because you guessed is a regression.

---

## Step 1 — audit before searching

```bash
node tools/audit.js
```

This prints exactly what to go looking for: the newest model on file, models with no scores, models
with only one or two, the sparsest evaluations, every valid `scores` key, and every slug already
taken. Read it before opening a browser. `--json` if you want it structured.

## Step 2 — research

Two distinct jobs. Do both; they need different searches.

**(a) New releases since the newest model on file.** Search per lab — the audit lists them. Also
sweep for labs not yet represented at all (a first release from a new lab is exactly the kind of
thing this dataset should catch). Useful queries:

- `<lab> new model release <month> <year> benchmarks`
- `AI model releases <month> <year>` / `LLM leaderboard <month> <year>`
- `Artificial Analysis intelligence index leaderboard <month> <year>`
- `best open weight models <month> <year>`

**(b) Newly-published scores for models already listed.** Work the audit's target lists. Labs
routinely publish figures weeks after launch, and third-party evaluators (Artificial Analysis, Epoch,
METR, ARC Prize, vals.ai) backfill older models continuously. Useful queries:

- `<model name> <benchmark> score` for the benchmarks the audit flags as sparse
- `<model name> benchmarks GPQA MMLU AIME SWE-bench`
- `METR time horizon <model>` · `GDPval <model>` · `ARC-AGI <model>`

Run searches in parallel where they are independent. Prefer primary sources: the lab's own release
post, the benchmark maintainer's leaderboard, a named independent evaluator.

**Also consider whether an evaluation row is missing.** If several labs are all publishing a
benchmark that has no row in `EVALS`, that gap suppresses coverage for everyone — adding the row may
be worth more than any individual score. (This is how GPQA, MMLU, AIME and HLE were added.)

## Step 3 — apply to `assets/models.js`

**New model** — append an entry; the file re-sorts by `y` on load, so position in the array does not
matter. Copy the shape of a neighbouring entry:

```js
{ slug:'kebab-case-unique', m:'Display Name', lab:'Lab', d:'Mon YYYY', y:2026.55,
  open:false, idx:53,
  params:'…', ctx:'…', licence:'…', price:'…',   // only when known
  note:'One or two sentences: what it changed, plus any qualifier on the figures below.',
  scores:{ swe:97.0, gpqa:90.5 } },              // only published figures
```

- `y` is a decimal year used purely for ordering — `2026.55` ≈ mid-July 2026. Keep it consistent
  with neighbours.
- `idx` is the Displacement Index position (0–100) and is **derived, not measured**. Place a new
  frontier model at or just above the current `now` milestone's `v` in `assets/data.js`; place a
  trailing or small model below it, in line with comparable entries. It only drives dimming and
  ordering in the UI — do not agonise, but do not invent precision either.
- Omit any key you have no value for. Do not write `null`, `0`, `'—'` or `'n/a'`.
- `scores` keys must come from the audit's eval id list. A typo silently creates a cell nothing
  renders.

**New score for an existing model** — add the key to that model's `scores`, and extend `note` if the
figure carries a qualifier.

**New evaluation row** — add to `EVALS` with `id`, `name`, `short`, `unit`, `group`, `desc`. Use an
existing `group` unless the benchmark genuinely measures a new axis. Set `text:true` only for
non-numeric values (as `metr` does) — text values are excluded from best-in-column highlighting.

## Step 4 — update the narrative layer when the frontier actually moves

`assets/data.js` holds `MILESTONES`, the slider's dated stops. This only needs touching when a
release genuinely shifts the frontier, not for every model added.

If it has:

- Add the new models to the `now` stop's `models` array, or add a new stop and move `now: true` onto
  it (exactly one milestone may carry `now`).
- Update that stop's `head`, `metr`, `swe`, `gdpval`, `frontier`, `reach` fields.
- `major: true` gives a stop a printed label on the track. Keep majors sparse — roughly 7% apart, or
  the labels collide.
- Keep `v` values strictly ascending.
- If the `now` stop's `v` changes, `TODAY` in `assets/app.js` follows it automatically.

Also check whether headline figures quoted in prose have gone stale: the hero paragraph and the
evidence table in `index.html`, and the counts in `models.html` ("Sixty-one releases…", "twenty-four
published evaluations"). `node tools/audit.js` gives you the true numbers.

## Step 5 — rebuild and verify

```bash
node tools/build.js        # regenerates every models/*.html from the data
node tools/check-links.js  # broken links, and data ↔ page parity
node tools/audit.js        # confirm coverage moved the way you expected
```

`build.js` deletes stale pages first, so a removed model loses its page automatically.

Then look at it. Serve and check the three page types actually render:

```bash
python3 -m http.server 8747
# / , /models.html , /models/<new-slug>.html
```

If a browser tool is available, load `models.html` and confirm the new column appears, its scores sit
in the right rows, and the company filter chip for its lab still returns results.

## Step 6 — report, then commit only if asked

Summarise plainly:

- models added, with lab and date
- scores added, per model and benchmark
- any evaluation row added
- coverage before → after, from the two audit runs
- **what you deliberately left blank, and why** — this matters as much as what you filled

Then stop. Committing and pushing is the user's call unless they already said to go ahead. If they
do want it:

```bash
git add -A
git commit -m "…"    # what changed and what was left blank, not just "update models"
git push origin main
```

The GitHub Actions workflow rebuilds the pages, runs the link check, and deploys to
`https://jackinsightsv2.github.io/AI-Takeover/`. Confirm with `gh run list --limit 1`.

---

## Failure modes worth naming

- **Search returns a plausible number with no clear owner.** Leave it out. Sparse and trustworthy
  beats dense and doubtful.
- **A model is announced but not released.** Do not add it. This dataset tracks releases.
- **A benchmark gets revised** (v1 → v2, Verified → Pro). Do not overwrite the old column; they are
  different measurements. Add a row if the new version is being widely reported.
- **Coverage drops after your pass.** That is fine and sometimes correct — if you removed a figure
  you discovered was misattributed, say so in the report.
- **A lab renames a model.** Keep the slug stable if the page already exists; changing it breaks any
  URL people have shared. Update `m` (the display name) and explain in `note`.
