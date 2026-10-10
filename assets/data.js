/* ------------------------------------------------------------------
   data.js — every number on this page lives here.
   Values marked  †  are extrapolations, not measurements.
   Sources are listed in index.html and README.md.
------------------------------------------------------------------ */

/* The Displacement Index (0–100) is a composite of three measured
   signals. See the Method section. Each stop carries its raw evidence.
   major: true  → this stop gets a printed label on the slider track. */

const MILESTONES = [
  {
    v: 2, date: 'Nov 2022', era: 'The demo', major: true,
    models: ['GPT-3.5 Turbo'],
    head: 'Fluent text arrives as a consumer product. It has no memory, no tools and no way to finish anything that resembles a day of work.',
    metr: '~30 sec', swe: '<2%', gdpval: 'not yet built', frontier: '—', reach: '—'
  },
  {
    v: 6, date: 'Mar 2023', era: 'Exam-passing',
    models: ['GPT-4', 'Claude 2', 'PaLM 2'],
    head: 'Passes the bar, the USMLE and the SATs. Still fails almost every real ticket in a real repository.',
    metr: '~5 min', swe: '1.7%', gdpval: 'not yet built', frontier: '—', reach: '—'
  },
  {
    v: 9, date: 'Mar 2024', era: 'The field fills in', major: true,
    models: ['Claude 3 Opus', 'Gemini 1.5 Pro', 'GPT-4 Turbo'],
    head: 'Three labs ship comparable frontier models within weeks of each other. Long context arrives; reliability does not.',
    metr: '~10 min', swe: '~12%', gdpval: 'not yet built', frontier: '—', reach: '—'
  },
  {
    v: 12, date: 'Jun 2024', era: 'Scaffolding',
    models: ['Claude 3.5 Sonnet', 'GPT-4o'],
    head: 'Tool use and agent loops turn a chatbot into something that can act. The first tasks measured in tens of minutes fall.',
    metr: '~18 min', swe: '33% → 49%', gdpval: 'not yet built', frontier: '—', reach: '—'
  },
  {
    v: 15, date: 'Dec 2024', era: 'Test-time compute',
    models: ['o1', 'Gemini 2.0 Flash'],
    head: 'Thinking longer starts buying accuracy. Compute moves from training to inference, and the scaling story gets a second axis.',
    metr: '~35 min', swe: '48.9%', gdpval: 'not yet built', frontier: '—', reach: '—'
  },
  {
    v: 17, date: 'Jan 2025', era: 'Open weights arrive',
    models: ['DeepSeek R1', 'Qwen 2.5 Max'],
    head: 'An open-weight reasoning model lands within a few points of the closed frontier, at a fraction of the training cost. The gap becomes a lag rather than a moat.',
    metr: '~40 min', swe: '49.2%', gdpval: 'not yet built', frontier: '—', reach: '—'
  },
  {
    v: 19, date: 'Feb 2025', era: 'Reasoning', major: true,
    models: ['Claude 3.7 Sonnet', 'o3-mini', 'Grok 3'],
    head: 'Test-time compute becomes a dial the user controls. The autonomous time horizon crosses one hour for the first time.',
    metr: '~50 min', swe: '62.3%', gdpval: 'not yet built', frontier: '—', reach: '—'
  },
  {
    v: 23, date: 'May 2025', era: 'Agentic coding',
    models: ['Claude Opus 4', 'o3', 'Gemini 2.5 Pro'],
    head: 'Coding agents stop being demos. Models hold a repository in mind across hours and dozens of tool calls.',
    metr: '~1 hr 30 min', swe: '69–72%', gdpval: 'not yet built', frontier: '—', reach: '—'
  },
  {
    v: 26, date: 'Jul 2025', era: 'The open frontier',
    models: ['Grok 4', 'Kimi K2'],
    head: 'A trillion-parameter open-weight MoE ships from Moonshot. Frontier capability now has a second, unlicensable distribution channel.',
    metr: '~1 hr 45 min', swe: '65–75%', gdpval: 'not yet built', frontier: '—', reach: '—'
  },
  {
    v: 28, date: 'Sep 2025', era: 'First measurement', major: true,
    models: ['GPT-5', 'Claude Opus 4.1', 'Claude Sonnet 4.5'],
    head: 'GDPval lands: 1,320 real deliverables across 44 occupations, each authored by a professional with 14+ years in the field, each averaging seven hours of expert time. Blinded graders rate Opus 4.1 at or above the human expert on nearly half of them.',
    metr: '~2 hr', swe: '74.9%', gdpval: '47.6% win-or-tie', frontier: '—', reach: '—'
  },
  {
    v: 34, date: 'Nov 2025', era: 'Half a shift',
    models: ['Claude Opus 4.5', 'Gemini 3 Pro', 'GPT-5.1'],
    head: 'A 50%-reliability horizon of nearly five hours. An unsupervised agent can now plausibly own half a working day.',
    metr: '~4 hr 49 min', swe: '80.9%', gdpval: '—', frontier: '—', reach: '45% of usage automative'
  },
  {
    v: 42, date: 'Feb 2026', era: 'The compression', major: true,
    models: ['Claude Opus 4.6', 'GPT-5.3-Codex', 'Gemini 3.1 Pro', 'Claude Sonnet 4.6'],
    head: 'The doubling time of the autonomous horizon compresses from roughly seven months to roughly four. Gemini 3.1 Pro takes ARC-AGI-2 to 77.1%. API traffic tips from assistance toward delegation.',
    metr: '~12 hr', swe: '80.6–87%', gdpval: '1633 Elo', frontier: '—', reach: 'API automation doubles'
  },
  {
    v: 46, date: 'Apr 2026', era: 'Parity, unlicensed',
    models: ['DeepSeek V4 Pro', 'GPT-5.5', 'Kimi K2.6', 'GPT-5.4'],
    head: 'DeepSeek V4 Pro ships MIT-licensed at 80.6% on SWE-bench Verified — a frontier-grade coding model anyone can download, run and fine-tune without permission.',
    metr: '~14 hr', swe: '80.6%', gdpval: '—', frontier: '—', reach: '—'
  },
  {
    v: 49, date: 'Jun 2026', era: 'Commoditisation',
    models: ['Claude Opus 4.8', 'GLM-5.2', 'MiniMax M3', 'Kimi K2.7 Code'],
    head: 'Four flagship releases in five weeks, three of them open-weight. GLM-5.2 hits 62.1% on SWE-bench Pro under an MIT licence. Price per unit of capability falls faster than capability rises.',
    metr: '~15 hr', swe: '—', gdpval: '—', frontier: '18.7%', reach: '—'
  },
  {
    v: 53, date: 'Jul 2026', era: 'July snapshot', now: true, major: true,
    models: ['Claude Opus 5', 'Claude Fable 5', 'GPT-5.6 Sol', 'Kimi K3', 'Grok 4.5'],
    head: 'SWE-bench Verified is effectively saturated at 97%. Opus 5 sits 861 Elo above the human-expert baseline on GDPval-AA v2. A 2.8-trillion-parameter open-weight model lands within a point of the closed frontier — capability now leaks in weeks, not years.',
    metr: '~17 hr †', swe: '97.0%', gdpval: '1861 Elo', frontier: '43.3%', reach: '49% of occupations'
  },
  {
    v: 68, date: 'Jul 2027', era: 'Projected', projected: true, major: true,
    models: ['extrapolated'],
    head: 'If the four-month doubling holds, a frontier agent completes at even odds what takes an expert most of a working week. Nothing about this is measured. It is a line on a chart, continued.',
    metr: '~6 days †', swe: 'retired', gdpval: '—', frontier: '—', reach: '—'
  },
  {
    v: 79, date: 'Jul 2028', era: 'Projected', projected: true, major: true,
    models: ['extrapolated'],
    head: 'Month-long autonomous projects. At this point the binding constraint on the index stops being capability and starts being liability, regulation and the physical world.',
    metr: '~6 weeks †', swe: 'retired', gdpval: '—', frontier: '—', reach: '—'
  }
];

/* ------------------------------------------------------------------
   Occupations.
   cross  — index value at which the majority of the role's measured
            task-hours are matched or beaten by frontier AI.
   gate   — what actually holds the line, once capability is assumed.
   ev     — the measurement the placement leans on.
   tasks  — constituent tasks with their own crossing points.
------------------------------------------------------------------ */

const GATES = {
  none:    { k: 'none',    label: 'Ungated' },
  digital: { k: 'digital', label: 'Digital deliverable' },
  legal:   { k: 'legal',   label: 'Liability & licence' },
  trust:   { k: 'trust',   label: 'Relational trust' },
  context: { k: 'context', label: 'Accumulated context' },
  body:    { k: 'body',    label: 'Embodiment' }
};

const JOBS = [
  { t: 'Transcription & captioning', s: 'Media', cross: 7, gate: 'none',
    ev: 'Word error rate below the human transcriptionist on clean audio since 2023.',
    tasks: [['Verbatim transcription', 4], ['Speaker diarisation', 9], ['Broadcast-compliant caption timing', 14]] },

  { t: 'Content & SEO copywriting', s: 'Marketing', cross: 11, gate: 'none',
    ev: 'Volume writing was the first commercially displaced category; no benchmark was needed.',
    tasks: [['Product descriptions at volume', 5], ['Landing page variants', 10], ['Brand voice over a long campaign', 26]] },

  { t: 'Translation & localisation', s: 'Media', cross: 14, gate: 'none',
    ev: 'Frontier models exceed non-specialist human translators on all major language pairs.',
    tasks: [['Document translation', 8], ['UI string localisation', 12], ['Literary register & idiom', 38]] },

  { t: 'Stock photography & illustration', s: 'Creative', cross: 16, gate: 'none',
    ev: 'Generative image models displaced the licensing market before any evaluation existed.',
    tasks: [['Generic editorial imagery', 9], ['Spot illustration', 15], ['Art direction with a client', 44]] },

  { t: 'Tier-1 customer support', s: 'Service', cross: 19, gate: 'none',
    ev: 'Support is the most heavily automated deployment category in the Anthropic Economic Index. τ²-bench Telecom now sits at 99.3%.',
    tasks: [['FAQ and order status', 8], ['Refunds and policy exceptions', 20], ['De-escalating an angry account', 41]] },

  { t: 'Data entry & order clerks', s: 'Admin', cross: 21, gate: 'none',
    ev: 'Structured extraction is at ceiling; OmniDocBench leadership now changes hands on rounding.',
    tasks: [['Form and invoice extraction', 7], ['Reconciling against a system of record', 22], ['Chasing a supplier for a missing PO', 47]] },

  { t: 'Junior software engineer', s: 'Technology', cross: 25, gate: 'digital',
    ev: 'SWE-bench Verified moved 74.9% → 97.0% in ten months. US junior tech postings fell sharply over the same window.',
    tasks: [['Bug fix from a written ticket', 14], ['Test coverage and refactors', 22], ['Working out what the ticket actually meant', 49]] },

  { t: 'Graphic designer (production)', s: 'Creative', cross: 29, gate: 'digital',
    ev: 'Frontend Code Arena at 1,679 Elo; layout and asset production are template-shaped work.',
    tasks: [['Resizing and format adaptation', 12], ['Template-driven layout', 26], ['Original identity work', 61]] },

  { t: 'Paralegal & document review', s: 'Legal', cross: 30, gate: 'digital',
    ev: 'Long-context retrieval over discovery sets exceeds first-pass human review on recall.',
    tasks: [['Privilege and relevance tagging', 18], ['Deposition summarisation', 28], ['Building a case theory', 64]] },

  { t: 'Bookkeeping', s: 'Finance', cross: 31, gate: 'digital',
    ev: 'Ledger work is fully specified and fully digital — the shape GDPval shows models handle best.',
    tasks: [['Categorisation and reconciliation', 15], ['Month-end close', 33], ['Judgement calls on treatment', 55]] },

  { t: 'Grants management specialist', s: 'Government', cross: 32, gate: 'digital',
    ev: 'Named in GDPval among the occupations where model output most often beat the human expert.',
    tasks: [['Eligibility screening', 17], ['Drafting the award package', 30], ['Negotiating scope with a recipient', 63]] },

  { t: 'Editor & proofreader', s: 'Media', cross: 33, gate: 'digital',
    ev: 'Editing is one of GDPval\'s strongest model categories — a bounded deliverable with a clear rubric.',
    tasks: [['Line and copy editing', 16], ['Structural edit', 34], ['Developing a writer over years', 74]] },

  { t: 'Recruiting & candidate screening', s: 'HR', cross: 35, gate: 'legal',
    ev: 'Screening is classification; the gate is discrimination liability, not capability.',
    tasks: [['CV screening and ranking', 18], ['Structured first interview', 37], ['Selling the role to a reluctant hire', 66]] },

  { t: 'Financial analyst (junior)', s: 'Finance', cross: 36, gate: 'digital',
    ev: 'Model building and comparables analysis are one-shot tasks with all context in the prompt.',
    tasks: [['Comparables and screens', 20], ['Three-statement modelling', 36], ['Reading the room in a live deal', 69]] },

  { t: 'Market research analyst', s: 'Marketing', cross: 38, gate: 'digital',
    ev: 'BrowseComp at 91.2 — open-web research at multi-hop depth is now routine.',
    tasks: [['Desk research and synthesis', 19], ['Survey design and analysis', 39], ['Qualitative interviewing', 65]] },

  { t: 'Video editor (short-form)', s: 'Creative', cross: 40, gate: 'digital',
    ev: 'Generative and assembly editing converged; the remaining human premium is taste under a brief.',
    tasks: [['Cutdowns and reformatting', 21], ['Assembly to a brief', 41], ['Narrative editorial judgement', 70]] },

  { t: 'Actuary & underwriting analyst', s: 'Insurance', cross: 43, gate: 'legal',
    ev: 'Quantitative and well-specified; the gate is regulatory sign-off on the model, not the model.',
    tasks: [['Pricing and reserving runs', 24], ['Risk memo drafting', 42], ['Signing the regulatory opinion', 84]] },

  { t: 'Mid-level software engineer', s: 'Technology', cross: 47, gate: 'digital',
    ev: 'SWE Marathon 42.0 and Frontier-Bench 43.3 — multi-day agentic engineering is real but unreliable.',
    tasks: [['Feature delivery end to end', 33], ['Production incident triage', 50], ['Arguing the architecture', 72]] },

  { t: 'Accountant & auditor', s: 'Finance', cross: 50, gate: 'legal',
    ev: 'Preparation automates cleanly; attestation requires a licensed human signature.',
    tasks: [['Statement preparation', 30], ['Substantive testing', 51], ['Signing the audit opinion', 88]] },

  { t: 'Journalist & reporter', s: 'Media', cross: 51, gate: 'trust',
    ev: 'Drafting and research automate; sourcing depends on people who will only talk to people.',
    tasks: [['Wire rewrites and briefs', 20], ['Data-led investigation', 48], ['Cultivating a source', 83]] },

  { t: 'Compliance officer', s: 'Legal', cross: 53, gate: 'legal',
    ev: 'Rule-mapping is mechanical; the named accountable person is a statutory requirement.',
    tasks: [['Policy gap analysis', 31], ['Monitoring and alerting', 46], ['Being the accountable person', 90]] },

  { t: 'Diagnostic radiologist', s: 'Healthcare', cross: 56, gate: 'legal',
    ev: 'Superhuman on narrow reads for years. Held by clinical liability and device regulation, not accuracy.',
    tasks: [['Screening reads', 30], ['Complex multi-modal reads', 57], ['Owning the clinical decision', 87]] },

  { t: 'Management consultant', s: 'Professional', cross: 58, gate: 'context',
    ev: 'GDPval shows models fail where the work is built slowly from relationships rather than briefs.',
    tasks: [['Analysis and deck production', 32], ['Diagnostic framing', 59], ['Getting a board to actually move', 81]] },

  { t: 'Senior engineer & architect', s: 'Technology', cross: 63, gate: 'context',
    ev: 'ARC-AGI-3 at 30.2% — genuinely novel problem-solving remains the weakest frontier axis.',
    tasks: [['System design from spec', 45], ['Cross-team technical strategy', 66], ['Deciding what not to build', 78]] },

  { t: 'Lawyer (advisory)', s: 'Legal', cross: 66, gate: 'legal',
    ev: 'Research and drafting are solved. Advice carries personal professional liability.',
    tasks: [['Research memos and drafting', 34], ['Negotiating terms', 67], ['Advising under privilege', 89]] },

  { t: 'Mechanical engineer', s: 'Engineering', cross: 68, gate: 'body',
    ev: 'Design converges quickly; physical validation, tolerancing and site work do not.',
    tasks: [['CAD and simulation', 44], ['Design for manufacture', 69], ['Commissioning on site', 92]] },

  { t: 'Sales manager', s: 'Commercial', cross: 71, gate: 'trust',
    ev: 'Among GDPval\'s weakest categories: work that accumulates across months of human contact.',
    tasks: [['Pipeline analysis and forecasting', 38], ['Territory and quota design', 68], ['Closing a relationship sale', 88]] },

  { t: 'Physician (primary care)', s: 'Healthcare', cross: 76, gate: 'legal',
    ev: 'Diagnostic reasoning is at or above expert level; examination, consent and liability are not delegable.',
    tasks: [['Differential diagnosis', 42], ['Care planning', 72], ['Physical examination', 94]] },

  { t: 'Founder & chief executive', s: 'Commercial', cross: 81, gate: 'trust',
    ev: 'The role is mandate, capital and accountability — categories with no benchmark.',
    tasks: [['Strategy and analysis', 47], ['Capital raising', 80], ['Carrying the accountability', 96]] },

  { t: 'Construction supervisor', s: 'Trades', cross: 85, gate: 'body',
    ev: 'OSWorld measures screens. There is no comparable benchmark for a site in the rain.',
    tasks: [['Scheduling and procurement', 50], ['Quality and safety inspection', 88], ['Crew management', 91]] },

  { t: 'Physical therapist', s: 'Healthcare', cross: 88, gate: 'body',
    ev: 'Assessment protocols digitise; manual therapy and adherence coaching do not.',
    tasks: [['Programme design', 52], ['Progress assessment', 84], ['Hands-on treatment', 97]] },

  { t: 'Chef', s: 'Hospitality', cross: 89, gate: 'body',
    ev: 'Recipe development is text. Service is dexterity under time pressure.',
    tasks: [['Menu and costing', 48], ['Recipe development', 79], ['Running a service', 97]] },

  { t: 'Registered nurse', s: 'Healthcare', cross: 90, gate: 'body',
    ev: 'GDPval includes nursing; the automatable fraction is documentation, not care.',
    tasks: [['Charting and handover notes', 45], ['Triage protocols', 76], ['Bedside care', 98]] },

  { t: 'Electrician', s: 'Trades', cross: 93, gate: 'body',
    ev: 'Diagnosis can be advised remotely; certification requires a licensed body in the building.',
    tasks: [['Load calculation and design', 55], ['Fault diagnosis by description', 82], ['First-fix installation', 98]] },

  { t: 'Early years educator', s: 'Education', cross: 95, gate: 'trust',
    ev: 'Attachment and supervision are the job. Content delivery is a rounding error within it.',
    tasks: [['Curriculum planning', 55], ['Progress reporting', 78], ['Care and supervision', 99]] },

  { t: 'Elected representative', s: 'Government', cross: 98, gate: 'trust',
    ev: 'Legitimacy is conferred by a vote, which is definitionally not a capability question.',
    tasks: [['Policy research and drafting', 40], ['Constituency casework', 74], ['Holding a democratic mandate', 100]] }
];
