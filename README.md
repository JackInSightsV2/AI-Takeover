# The Displacement Index

An interactive, benchmark-grounded reading of how much human knowledge work frontier AI can currently do.

Drag a single slider from **Human** to **Machine**. A robot fills. Thirty-six occupations move between a
*Ceded* column and a *Held* column, and each one opens to show which of its constituent tasks have already
crossed. Seventeen stops along the slider are dated model cohorts with their published benchmark figures
attached, and a roster of **43 releases from 11 labs** fills in beneath as you move the line.

Light theme by default, with a dark toggle in the header; the choice persists.

Evidence current to **July 2026** — Claude Opus 5, Claude Fable 5, GPT-5.6 Sol, Kimi K3, Grok 4.5, GLM-5.2.

---

## What's measured, and what isn't

The site is deliberately explicit about the boundary between the two.

**Measured, cited, checkable:**

| Signal | Latest | Source |
| --- | --- | --- |
| SWE-bench Verified | 97.0% — Claude Opus 5 (GPT-5.6 Sol 96.2%, Fable 5 95.0%, Kimi K3 93.4%) | swebench.com |
| GDPval-AA v2 | 1861 Elo — Opus 5 (human expert baseline = 1000) | Artificial Analysis |
| GDPval (original) | 47.6% win-or-tie — Opus 4.1, Sep 2025 | OpenAI |
| METR 50% time horizon | ~12 hr, May 2026; ~4-month doubling | METR |
| ARC-AGI-3 | 30.2% — Opus 5 | ARC Prize |
| ARC-AGI-2 | 77.1% — Gemini 3.1 Pro | Google DeepMind |
| AA Intelligence Index | 59.9% Fable 5 · 58.9% GPT-5.6 Sol · 57.1% Kimi K3 · 54 Grok 4.5 · 51 GLM-5.2 | Artificial Analysis |
| Best open weights | DeepSeek V4 Pro 80.6% SWE-bench V. (MIT); Kimi K3 93.4%; GLM-5.2 62.1% SWE-bench Pro | lab releases |
| Deployment reach | 49% of occupations with ≥¼ of tasks run through Claude | Anthropic Economic Index |

**Derived, and labelled as such:**

- The **Displacement Index** itself — an equally weighted composite of expert-parity rate, log-scaled
  autonomy horizon, and deployment reach.
- The **crossing point** assigned to each occupation. These read GDPval's occupational findings and each
  role's task mix, then place it on the same 0–100 scale. They are an argument, not a dataset.
- The **2027 and 2028 stops**, which are the four-month doubling continued and nothing more. Marked `†`.

Figures that are extrapolated rather than measured carry a `†` everywhere they appear.

---

## Running it

No build step, no dependencies, no framework. Open `index.html`, or:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploying to GitHub Pages

Deployment is automated by `.github/workflows/pages.yml` — it builds the model pages, verifies every
internal link, and publishes on each push to `main`.

One-time setup in the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions.**
After that the workflow does the rest; it can also be run by hand from the Actions tab
(`workflow_dispatch`).

`.nojekyll` is included so Jekyll leaves the `assets/` directory alone.

---

## Structure

```
index.html            the interactive index — slider, robot, ledger, roster
models.html           the evaluation matrix — 61 models across, 21 evals down
models/<slug>.html    one generated page per model (61 of them)
assets/data.js        MILESTONES, GATES, JOBS
assets/models.js      EVALS + MODELS — the roster and every published score
assets/styles.css     the design system; light tokens in :root, dark in [data-theme="dark"]
assets/app.js         index page: theme, slider → robot → ledger → roster
assets/matrix.js      matrix page: transposed table, filters, coverage
assets/theme.js       theme toggle for the generated model pages
tools/build.js        generates models/*.html from assets/models.js
tools/check-links.js  fails the build on a broken link or data/page drift
```

### The three page types

- **`index.html`** — the slider. Drag from Human to Machine and watch occupations move.
- **`models.html`** — the matrix. 61 models across the top, 24 evaluations down the side. Sticky
  header row and first column; opens scrolled to the present, scroll left for history. Best published
  figure per benchmark is highlighted. Filters:
  - **Company** — a chip per lab, with counts, generated from the data.
  - **Arrange** — chronological, top models first, or grouped by company.
  - **Show** — everything, scored only, or open weights.

  "Top models first" ranks by the mean share of the best published figure across the benchmarks each
  model actually reports, and requires two or more published scores to rank at all. It still rewards
  selective reporting, and the page says so in place rather than presenting it as a league table.
- **`models/<slug>.html`** — one page per model, all identical in format: specs, every published
  score with a bar relative to the field best, index position, and previous/next by release date.
  Generated, never hand-edited.

### Regenerating

```bash
node tools/build.js        # rewrites models/*.html from the data
node tools/check-links.js  # verifies links and data/page parity
```

`build.js` deletes stale pages first, so removing a model from the data removes its page. CI runs
both on every push, so the deployed site cannot drift from `assets/models.js`.

To change a figure, add a model or move an occupation, edit `assets/data.js` only.

- `MILESTONES` — 17 stops. Each carries its models and the raw benchmark values shown in the console.
  `major: true` gives a stop a printed label on the track; every stop still gets a mark and a tooltip.
- `MODELS` — 43 releases. `idx` places a model on the 0–100 scale, which is what makes the roster
  dim and highlight as the slider moves. `swe` / `aa` / `gdp` are `null` where the lab published nothing.
- `JOBS` — 36 occupations, each with a crossing point, the gate holding it, the evidence behind the
  placement, and constituent tasks with their own crossing points.

Adding a lab needs no code change — the filter chips are generated from whatever `lab` values exist.

---

## Corrections

The occupational placements are the part most worth arguing with, and the part most likely to be wrong.
Issues and pull requests welcome — particularly ones that replace a derived number with a measured one.

## Licence

MIT for the code. Benchmark figures belong to their respective maintainers and are quoted as published.
