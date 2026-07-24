/* ------------------------------------------------------------------
   models.js — the roster and the evaluation matrix.

   A blank cell means the lab did not publish that number, not that the
   model scored zero. That sparsity is itself a finding: labs publish
   the benchmarks they win. Nothing here is interpolated or inferred.
------------------------------------------------------------------ */

const EVALS = [
  { id:'swe',      name:'SWE-bench Verified', short:'SWE-bench V.',  unit:'%',    group:'Coding',
    desc:'Real GitHub issues resolved in real repositories, validated by each project\'s own test suite.' },
  { id:'swepro',   name:'SWE-bench Pro',      short:'SWE-bench Pro', unit:'%',    group:'Coding',
    desc:'Harder, contamination-resistant engineering tasks. Built after Verified began saturating.' },
  { id:'deepswe',  name:'DeepSWE',            short:'DeepSWE',       unit:'%',    group:'Coding',
    desc:'Agentic software engineering across a longer tool-use trajectory.' },
  { id:'lcb',      name:'LiveCodeBench Pro',  short:'LiveCodeBench', unit:' Elo', group:'Coding',
    desc:'Competitive programming under contest conditions, scored as Elo.' },
  { id:'tb',       name:'Terminal-Bench 2.1', short:'Terminal-Bench',unit:'',     group:'Agentic',
    desc:'Command-line competence under real failure conditions.' },
  { id:'swemar',   name:'SWE Marathon',       short:'SWE Marathon',  unit:'',     group:'Agentic',
    desc:'Engineering tasks spanning days rather than minutes.' },
  { id:'frontier', name:'Frontier-Bench v0.1',short:'Frontier-Bench',unit:'%',    group:'Agentic',
    desc:'Long-running agentic work in a terminal, judged end to end.' },
  { id:'browse',   name:'BrowseComp',         short:'BrowseComp',    unit:'',     group:'Agentic',
    desc:'Multi-hop research across the live open web.' },
  { id:'tau2',     name:'τ²-bench Telecom',   short:'τ²-bench',      unit:'%',    group:'Agentic',
    desc:'Multi-turn tool use against a simulated customer-service backend.' },
  { id:'mcp',      name:'MCP Atlas',          short:'MCP Atlas',     unit:'%',    group:'Agentic',
    desc:'Tool orchestration across Model Context Protocol servers.' },
  { id:'osworld',  name:'OSWorld 2.0',        short:'OSWorld 2.0',   unit:'',     group:'Computer use', text:true,
    desc:'Operating a real desktop — the practical ceiling on digital, non-embodied work.' },
  { id:'m2w',      name:'Online-Mind2Web',    short:'Mind2Web',      unit:'%',    group:'Computer use',
    desc:'Completing real tasks on live websites.' },
  { id:'arc2',     name:'ARC-AGI-2',          short:'ARC-AGI-2',     unit:'%',    group:'Reasoning',
    desc:'Abstract reasoning over novel grids with no precedent in training.' },
  { id:'arc3',     name:'ARC-AGI-3',          short:'ARC-AGI-3',     unit:'%',    group:'Reasoning',
    desc:'The successor benchmark. The closest available proxy for genuine generalisation.' },
  { id:'gpqa',     name:'GPQA Diamond',       short:'GPQA Diamond',  unit:'%',    group:'Reasoning',
    desc:'Graduate-level science questions written to be un-Googleable.' },
  { id:'math500',  name:'MATH-500',           short:'MATH-500',      unit:'%',    group:'Reasoning',
    desc:'Competition mathematics. Effectively saturated since early 2025.' },
  { id:'mmmlu',    name:'MMMLU',              short:'MMMLU',         unit:'%',    group:'Knowledge',
    desc:'Multilingual general knowledge across 57 subjects.' },
  { id:'aa',       name:'AA Intelligence Index', short:'AA Index',   unit:'',     group:'Composite',
    desc:'Artificial Analysis aggregate across ten standardised benchmarks.' },
  { id:'gdp',      name:'GDPval-AA',          short:'GDPval-AA',     unit:' Elo', group:'Economic',
    desc:'Blinded expert preference on real work products. Human expert baseline fixed at 1000 Elo.' },
  { id:'gdpwin',   name:'GDPval win-or-tie',  short:'GDPval w/t',    unit:'%',    group:'Economic',
    desc:'Share of 1,320 real deliverables where blinded graders rated the model at or above a human expert.' },
  { id:'metr',     name:'METR 50% horizon',   short:'METR 50%',      unit:'',     group:'Autonomy', text:true,
    desc:'Length of task, in human expert time, the model completes unsupervised half the time.' }
];

/* ------------------------------------------------------------------
   idx — where the model sits on the Displacement Index (derived).
   scores — only what the lab or an independent evaluator published.
------------------------------------------------------------------ */

const MODELS = [
  { slug:'gpt-3-5-turbo', m:'GPT-3.5 Turbo', lab:'OpenAI', d:'Nov 2022', y:2022.87, open:false, idx:2,
    note:'The consumer launch. No tools, no memory, no agency.',
    scores:{ metr:'~30 sec' } },

  { slug:'gpt-4', m:'GPT-4', lab:'OpenAI', d:'Mar 2023', y:2023.20, open:false, idx:6,
    note:'Professional exams fall. Real engineering tickets do not.',
    scores:{ swe:1.7, metr:'~5 min' } },

  { slug:'claude-2', m:'Claude 2', lab:'Anthropic', d:'Jul 2023', y:2023.54, open:false, idx:6,
    ctx:'100K', note:'The first serious long-document model.',
    scores:{} },

  { slug:'gemini-1-0-ultra', m:'Gemini 1.0 Ultra', lab:'Google', d:'Dec 2023', y:2023.95, open:false, idx:7,
    note:'Google\'s first answer to GPT-4, announced alongside the Gemini family.',
    scores:{} },

  { slug:'gemini-1-5-pro', m:'Gemini 1.5 Pro', lab:'Google', d:'Feb 2024', y:2024.12, open:false, idx:9,
    ctx:'1M', note:'Million-token context arrives ahead of the reasoning to use it.',
    scores:{} },

  { slug:'gpt-4-turbo', m:'GPT-4 Turbo', lab:'OpenAI', d:'Nov 2023', y:2023.88, open:false, idx:8,
    ctx:'128K', note:'Cheaper and longer-context GPT-4. The first model priced for volume deployment.',
    scores:{} },

  { slug:'claude-3-opus', m:'Claude 3 Opus', lab:'Anthropic', d:'Mar 2024', y:2024.20, open:false, idx:9,
    note:'First model widely preferred to GPT-4 on open-ended work.',
    scores:{ swe:11.7 } },

  { slug:'claude-3-sonnet', m:'Claude 3 Sonnet', lab:'Anthropic', d:'Mar 2024', y:2024.20, open:false, idx:8,
    note:'The mid tier of the first three-model family. The shape every lab later copied.',
    scores:{} },

  { slug:'claude-3-haiku', m:'Claude 3 Haiku', lab:'Anthropic', d:'Mar 2024', y:2024.21, open:false, idx:7,
    note:'Frontier-family quality at a price that made classification work economic.',
    scores:{} },

  { slug:'llama-3-1-405b', m:'Llama 3.1 405B', lab:'Meta', d:'Jul 2024', y:2024.55, open:true, idx:11,
    params:'405B dense', note:'The first open-weight model credibly compared to the closed frontier.',
    scores:{} },

  { slug:'gpt-4o', m:'GPT-4o', lab:'OpenAI', d:'May 2024', y:2024.37, open:false, idx:12,
    note:'Natively multimodal, and fast enough to sit inside a product.',
    scores:{ swe:33.2 } },

  { slug:'claude-3-5-sonnet', m:'Claude 3.5 Sonnet', lab:'Anthropic', d:'Jun 2024', y:2024.45, open:false, idx:12,
    note:'33% at launch, 49% after the October refresh. Agentic coding begins here.',
    scores:{ swe:49.0, metr:'~18 min' } },

  { slug:'mistral-large-2', m:'Mistral Large 2', lab:'Mistral', d:'Jul 2024', y:2024.56, open:true, idx:11,
    params:'123B', note:'Europe\'s flagship, open for research use.',
    scores:{} },

  { slug:'o1', m:'o1', lab:'OpenAI', d:'Dec 2024', y:2024.95, open:false, idx:15,
    note:'Test-time compute becomes a scaling axis of its own.',
    scores:{ swe:48.9, metr:'~35 min' } },

  { slug:'o1-mini', m:'o1-mini', lab:'OpenAI', d:'Sep 2024', y:2024.72, open:false, idx:13,
    note:'Reasoning distilled to a price point, aimed squarely at code.',
    scores:{} },

  { slug:'gemini-2-0-flash', m:'Gemini 2.0 Flash', lab:'Google', d:'Dec 2024', y:2024.96, open:false, idx:15,
    note:'Native tool use and low latency — Google\'s first genuinely agentic tier.',
    scores:{} },

  { slug:'deepseek-v3', m:'DeepSeek V3', lab:'DeepSeek', d:'Dec 2024', y:2024.97, open:true, idx:15,
    params:'671B / 37B active', note:'Frontier-adjacent quality trained for a reported fraction of Western budgets.',
    scores:{} },

  { slug:'deepseek-r1', m:'DeepSeek R1', lab:'DeepSeek', d:'Jan 2025', y:2025.04, open:true, idx:17,
    licence:'MIT', note:'The moat becomes a lag. Open-weight reasoning within points of the closed frontier.',
    scores:{ swe:49.2, math500:97.3 } },

  { slug:'qwen-2-5-max', m:'Qwen 2.5 Max', lab:'Alibaba', d:'Jan 2025', y:2025.07, open:false, idx:17,
    note:'Alibaba joins the frontier conversation.',
    scores:{} },

  { slug:'claude-3-7-sonnet', m:'Claude 3.7 Sonnet', lab:'Anthropic', d:'Feb 2025', y:2025.14, open:false, idx:19,
    note:'The first model measured in hours-adjacent units.',
    scores:{ swe:62.3, metr:'~50 min' } },

  { slug:'grok-3', m:'Grok 3', lab:'xAI', d:'Feb 2025', y:2025.14, open:false, idx:19,
    note:'xAI reaches the frontier pack on raw scale.',
    scores:{} },

  { slug:'gemini-2-5-pro', m:'Gemini 2.5 Pro', lab:'Google', d:'Mar 2025', y:2025.21, open:false, idx:21,
    note:'Google\'s first genuinely competitive reasoning model.',
    scores:{ swe:63.8 } },

  { slug:'gpt-4-1', m:'GPT-4.1', lab:'OpenAI', d:'Apr 2025', y:2025.28, open:false, idx:21,
    ctx:'1M', note:'A long-context workhorse aimed at developers rather than benchmarks.',
    scores:{} },

  { slug:'o3', m:'o3', lab:'OpenAI', d:'Apr 2025', y:2025.29, open:false, idx:23,
    note:'Reasoning at the frontier, with a horizon measured in hours.',
    scores:{ swe:69.1, metr:'~1 hr 30 min' } },

  { slug:'o4-mini', m:'o4-mini', lab:'OpenAI', d:'Apr 2025', y:2025.29, open:false, idx:21,
    note:'Cheap reasoning that made agent loops affordable to run continuously.',
    scores:{} },

  { slug:'claude-opus-4', m:'Claude Opus 4', lab:'Anthropic', d:'May 2025', y:2025.37, open:false, idx:23,
    note:'Sustained multi-hour agentic coding stops being a demo.',
    scores:{ swe:72.5 } },

  { slug:'grok-4', m:'Grok 4', lab:'xAI', d:'Jul 2025', y:2025.54, open:false, idx:26,
    note:'Heavy test-time compute pushes reasoning benchmarks hard.',
    scores:{ swe:75.0 } },

  { slug:'kimi-k2', m:'Kimi K2', lab:'Moonshot', d:'Jul 2025', y:2025.54, open:true, idx:26,
    params:'1T MoE', note:'A second, unlicensable distribution channel for the frontier.',
    scores:{ swe:65.8 } },

  { slug:'gpt-5', m:'GPT-5', lab:'OpenAI', d:'Aug 2025', y:2025.62, open:false, idx:28,
    note:'Measured against real economic deliverables for the first time.',
    scores:{ swe:74.9, gdpwin:38.8, metr:'~2 hr' } },

  { slug:'claude-opus-4-1', m:'Claude Opus 4.1', lab:'Anthropic', d:'Aug 2025', y:2025.62, open:false, idx:28,
    note:'The first model measured near expert parity on real deliverables.',
    scores:{ swe:74.5, gdpwin:47.6 } },

  { slug:'claude-sonnet-4-5', m:'Claude Sonnet 4.5', lab:'Anthropic', d:'Sep 2025', y:2025.71, open:false, idx:29,
    note:'Frontier coding at a mid-tier price. The cost curve starts to bite.',
    scores:{ swe:77.2 } },

  { slug:'claude-haiku-4-5', m:'Claude Haiku 4.5', lab:'Anthropic', d:'Oct 2025', y:2025.79, open:false, idx:28,
    note:'Small-model tier good enough to run sub-agents at volume.',
    scores:{} },

  { slug:'gemini-3-pro', m:'Gemini 3 Pro', lab:'Google', d:'Nov 2025', y:2025.87, open:false, idx:34,
    note:'Google closes to within a few points across the board.',
    scores:{ swe:76.2 } },

  { slug:'claude-opus-4-5', m:'Claude Opus 4.5', lab:'Anthropic', d:'Nov 2025', y:2025.87, open:false, idx:34,
    note:'Half a working day, unsupervised, at even odds.',
    scores:{ swe:80.9, metr:'~4 hr 49 min' } },

  { slug:'gpt-5-1', m:'GPT-5.1', lab:'OpenAI', d:'Nov 2025', y:2025.88, open:false, idx:33,
    note:'A steadier, more steerable GPT-5 rather than a capability jump.',
    scores:{} },

  { slug:'deepseek-v3-2', m:'DeepSeek V3.2', lab:'DeepSeek', d:'Dec 2025', y:2025.95, open:true, idx:35,
    note:'Cheap enough to change what gets automated at all.',
    scores:{ swe:70.0, swepro:15.6 } },

  { slug:'qwen3-coder-480b', m:'Qwen3-Coder-480B-A35B', lab:'Alibaba', d:'Dec 2025', y:2025.95, open:true, idx:35,
    params:'480B / 35B active', ctx:'256K', licence:'Apache-2.0',
    note:'Best open result without test-time scaling.',
    scores:{ swe:69.6 } },

  { slug:'gpt-5-2', m:'GPT-5.2', lab:'OpenAI', d:'Jan 2026', y:2026.04, open:false, idx:38,
    note:'An incremental step between GPT-5.1 and the Codex-specialised 5.3.',
    scores:{} },

  { slug:'claude-opus-4-6', m:'Claude Opus 4.6', lab:'Anthropic', d:'Feb 2026', y:2026.12, open:false, idx:42,
    note:'The doubling time of the autonomous horizon compresses to roughly four months.',
    scores:{ swe:87.0, metr:'~12 hr' } },

  { slug:'gpt-5-3-codex', m:'GPT-5.3-Codex', lab:'OpenAI', d:'Feb 2026', y:2026.12, open:false, idx:42,
    note:'A coding-specialised frontier model rather than a generalist.',
    scores:{ swe:86.0 } },

  { slug:'claude-sonnet-4-6', m:'Claude Sonnet 4.6', lab:'Anthropic', d:'Feb 2026', y:2026.14, open:false, idx:41,
    note:'Within 1.2 points of Opus 4.6 at 40% less cost and 17% more speed.',
    scores:{ swe:79.6, gdp:1633 } },

  { slug:'gemini-3-1-pro', m:'Gemini 3.1 Pro', lab:'Google', d:'Feb 2026', y:2026.14, open:false, idx:42,
    note:'Leads most published benchmarks on release; Opus 4.6 still wins expert task preference.',
    scores:{ swe:80.6, arc2:77.1, gpqa:94.3, browse:85.9, lcb:2887, tau2:99.3, mcp:69.2, mmmlu:92.6 } },

  { slug:'gpt-5-4', m:'GPT-5.4', lab:'OpenAI', d:'Apr 2026', y:2026.27, open:false, idx:44,
    note:'Evaluated by METR in April 2026.',
    scores:{} },

  { slug:'kimi-k2-6', m:'Kimi K2.6', lab:'Moonshot', d:'Apr 2026', y:2026.30, open:true, idx:45,
    note:'First of five open-weight flagships that reset the ranking in nine weeks.',
    scores:{} },

  { slug:'gpt-5-5', m:'GPT-5.5', lab:'OpenAI', d:'Apr 2026', y:2026.31, open:false, idx:46,
    note:'Strong on terminal agents, behind Opus 4.8 on hard engineering.',
    scores:{ swepro:58.6, tb:78.2 } },

  { slug:'deepseek-v4-pro', m:'DeepSeek V4 Pro', lab:'DeepSeek', d:'Apr 2026', y:2026.31, open:true, idx:46,
    params:'1.6T / 49B active', ctx:'1M', licence:'MIT',
    note:'Frontier-grade coding, downloadable, with no permission required.',
    scores:{ swe:80.6 } },

  { slug:'claude-opus-4-8', m:'Claude Opus 4.8', lab:'Anthropic', d:'May 2026', y:2026.41, open:false, idx:49,
    note:'Tops the AA Intelligence Index on release, with standout computer-use gains.',
    scores:{ aa:61.4, swepro:69.2, tb:74.6, m2w:84, frontier:18.7 } },

  { slug:'kimi-k2-7-code', m:'Kimi K2.7 Code', lab:'Moonshot', d:'Jun 2026', y:2026.45, open:true, idx:48,
    note:'Long-horizon coding agent, open weights.',
    scores:{} },

  { slug:'glm-5-2', m:'GLM-5.2', lab:'Z.ai', d:'Jun 2026', y:2026.45, open:true, idx:49,
    params:'744B MoE', licence:'MIT', note:'The leading open-weight model on aggregate intelligence.',
    scores:{ aa:51.0, swepro:62.1, tb:81.0, gpqa:91.2 } },

  { slug:'minimax-m3', m:'MiniMax M3', lab:'MiniMax', d:'Jun 2026', y:2026.46, open:true, idx:49,
    ctx:'1M', note:'Natively multimodal open weights with a million-token window.',
    scores:{ swepro:59.0 } },

  { slug:'claude-fable-5', m:'Claude Fable 5', lab:'Anthropic', d:'Jun 2026', y:2026.48, open:false, idx:52,
    note:'Tops the Artificial Analysis Intelligence Index at 59.9%.',
    scores:{ swe:95.0, aa:59.9, gdp:1747, swepro:80.0, frontier:33.7 } },

  { slug:'grok-4-5', m:'Grok 4.5', lab:'xAI', d:'Jul 2026', y:2026.52, open:false, idx:52,
    params:'1.5T (V9 base)', price:'$2 / $6 per M tokens',
    note:'Radically token-efficient: ~16K output tokens per SWE-bench Pro task against ~67K for Opus 4.8.',
    scores:{ aa:54.0, tb:83.3 } },

  { slug:'gpt-5-6-sol', m:'GPT-5.6 Sol', lab:'OpenAI', d:'Jul 2026', y:2026.53, open:false, idx:53,
    note:'Near-saturation on SWE-bench Verified; strongest OpenAI coding agent to date.',
    scores:{ swe:96.2, aa:58.9, gdp:1735, swepro:64.6, deepswe:72.7 } },

  { slug:'kimi-k3', m:'Kimi K3', lab:'Moonshot', d:'Jul 2026', y:2026.55, open:true, idx:53,
    params:'2.8T MoE', note:'Open weights within a point of the closed frontier. Released 27 Jul 2026.',
    scores:{ swe:93.4, aa:57.1, tb:88.3, browse:91.2, swemar:42.0, deepswe:67.5 } },

  { slug:'claude-opus-5', m:'Claude Opus 5', lab:'Anthropic', d:'Jul 2026', y:2026.55, open:false, idx:53,
    note:'Leads SWE-bench Verified, GDPval-AA and ARC-AGI-3 simultaneously — the last at roughly four times the next model.',
    scores:{ swe:97.0, gdp:1861, arc3:30.2, frontier:43.3, osworld:'best-in-class', metr:'~17 hr †' } },

  { slug:'glm-5', m:'GLM-5', lab:'Z.ai', d:'Mar 2026', y:2026.21, open:true, idx:43,
    note:'The strongest open coding result at release, later superseded by GLM-5.2.',
    scores:{ swe:77.8 } },

  { slug:'qwen-3-235b', m:'Qwen 3 235B', lab:'Alibaba', d:'2025', y:2025.60, open:true, idx:27,
    params:'235B MoE', note:'Strongest open-weight model for reasoning and mathematics at its release.',
    scores:{ gpqa:77.2 } },

  { slug:'llama-4-maverick', m:'Llama 4 Maverick', lab:'Meta', d:'2025', y:2025.40, open:true, idx:24,
    params:'400B / 17B active', licence:'Meta custom (700M MAU clause)',
    note:'Meta\'s MoE turn, under a licence that stops short of genuinely open.',
    scores:{} },

  { slug:'qwen-3-5', m:'Qwen 3.5', lab:'Alibaba', d:'2026', y:2026.35, open:true, idx:45,
    params:'397B / 17B active', licence:'Apache-2.0',
    note:'Alibaba\'s sparse flagship, permissively licensed.',
    scores:{} },

  { slug:'mistral-large-3', m:'Mistral Large 3', lab:'Mistral', d:'2026', y:2026.35, open:true, idx:44,
    params:'675B / 41B active', licence:'Apache-2.0',
    note:'Europe\'s entry at the open frontier.',
    scores:{} },

  { slug:'gemma-3', m:'Gemma 3', lab:'Google', d:'2025', y:2025.25, open:true, idx:20,
    licence:'Gemma terms', note:'Google\'s small open family — the tier that runs on a laptop.',
    scores:{} }
];

/* sort once, oldest first — every view depends on this order */
MODELS.sort((a, b) => a.y - b.y);
