/* ------------------------------------------------------------------
   models.js — the roster and the evaluation matrix.

   A blank cell means the lab did not publish that number, not that the
   model scored zero. Nothing here is interpolated, averaged or inferred.

   Where a figure carries a material qualifier — a Pro/Heavy variant, a
   tools-enabled run, a vendor number independent evaluators dispute —
   the model's `note` says so rather than the cell pretending otherwise.
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
  { id:'tb',       name:'Terminal-Bench 2.1', short:'Terminal-Bench',unit:'%',    group:'Agentic',
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
  { id:'osworld',  name:'OSWorld',            short:'OSWorld',       unit:'%',    group:'Computer use',
    desc:'Operating a real desktop — the practical ceiling on digital, non-embodied work.' },
  { id:'m2w',      name:'Online-Mind2Web',    short:'Mind2Web',      unit:'%',    group:'Computer use',
    desc:'Completing real tasks on live websites.' },
  { id:'hle',      name:'Humanity\'s Last Exam', short:'HLE',        unit:'%',    group:'Reasoning',
    desc:'2,500 expert-written questions designed to resist every earlier benchmark. No-tools figures unless noted.' },
  { id:'arc2',     name:'ARC-AGI-2',          short:'ARC-AGI-2',     unit:'%',    group:'Reasoning',
    desc:'Abstract reasoning over novel grids with no precedent in training.' },
  { id:'arc3',     name:'ARC-AGI-3',          short:'ARC-AGI-3',     unit:'%',    group:'Reasoning',
    desc:'The successor benchmark. The closest available proxy for genuine generalisation.' },
  { id:'gpqa',     name:'GPQA Diamond',       short:'GPQA Diamond',  unit:'%',    group:'Reasoning',
    desc:'Graduate-level science questions written to be Google-proof. PhD experts score roughly 65–70%.' },
  { id:'aime',     name:'AIME',               short:'AIME',          unit:'%',    group:'Reasoning',
    desc:'Competition mathematics. The contest year varies by release — each model\'s page names it.' },
  { id:'math500',  name:'MATH-500',           short:'MATH-500',      unit:'%',    group:'Reasoning',
    desc:'Competition mathematics. Effectively saturated since early 2025.' },
  { id:'mmlu',     name:'MMLU',               short:'MMLU',          unit:'%',    group:'Knowledge',
    desc:'General knowledge across 57 subjects. Saturated above ~88% and no longer separates the frontier.' },
  { id:'mmmlu',    name:'MMMLU',              short:'MMMLU',         unit:'%',    group:'Knowledge',
    desc:'The multilingual edition of MMLU.' },
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
    scores:{ mmlu:70.0, metr:'~30 sec' } },

  { slug:'gpt-4', m:'GPT-4', lab:'OpenAI', d:'Mar 2023', y:2023.20, open:false, idx:6,
    note:'Professional exams fall. Real engineering tickets do not. MMLU is the 5-shot figure from OpenAI\'s technical report.',
    scores:{ swe:1.7, gpqa:35.7, mmlu:86.4, metr:'~5 min' } },

  { slug:'claude-2', m:'Claude 2', lab:'Anthropic', d:'Jul 2023', y:2023.54, open:false, idx:6,
    ctx:'100K', note:'The first serious long-document model.',
    scores:{ mmlu:78.5 } },

  { slug:'gemini-1-0-ultra', m:'Gemini 1.0 Ultra', lab:'Google', d:'Dec 2023', y:2023.95, open:false, idx:7,
    note:'The first model claimed above 90% on MMLU — on a 32-shot chain-of-thought setup that drew immediate methodological criticism.',
    scores:{ mmlu:90.0 } },

  { slug:'gpt-4-turbo', m:'GPT-4 Turbo', lab:'OpenAI', d:'Nov 2023', y:2023.88, open:false, idx:8,
    ctx:'128K', note:'Cheaper, longer-context GPT-4. The first model priced for volume deployment.',
    scores:{} },

  { slug:'gemini-1-5-pro', m:'Gemini 1.5 Pro', lab:'Google', d:'Feb 2024', y:2024.12, open:false, idx:9,
    ctx:'1M', note:'Million-token context arrives ahead of the reasoning to use it.',
    scores:{ mmlu:85.9 } },

  { slug:'claude-3-opus', m:'Claude 3 Opus', lab:'Anthropic', d:'Mar 2024', y:2024.20, open:false, idx:9,
    note:'First model widely preferred to GPT-4 on open-ended work. GPQA is the 0-shot chain-of-thought figure.',
    scores:{ swe:11.7, gpqa:50.4, mmlu:86.8 } },

  { slug:'claude-3-sonnet', m:'Claude 3 Sonnet', lab:'Anthropic', d:'Mar 2024', y:2024.20, open:false, idx:8,
    note:'The mid tier of the first three-model family. The shape every lab later copied.',
    scores:{ gpqa:40.4, mmlu:79.0 } },

  { slug:'claude-3-haiku', m:'Claude 3 Haiku', lab:'Anthropic', d:'Mar 2024', y:2024.21, open:false, idx:7,
    note:'Frontier-family quality at a price that made classification work economic.',
    scores:{ gpqa:33.3, mmlu:75.2 } },

  { slug:'gpt-4o', m:'GPT-4o', lab:'OpenAI', d:'May 2024', y:2024.37, open:false, idx:12,
    note:'Natively multimodal, and fast enough to sit inside a product.',
    scores:{ swe:33.2, gpqa:53.6, mmlu:88.7 } },

  { slug:'claude-3-5-sonnet', m:'Claude 3.5 Sonnet', lab:'Anthropic', d:'Jun 2024', y:2024.45, open:false, idx:12,
    note:'33% on SWE-bench at launch, 49% after the October refresh. Agentic coding begins here.',
    scores:{ swe:49.0, gpqa:59.4, mmlu:88.7, metr:'~18 min' } },

  { slug:'llama-3-1-405b', m:'Llama 3.1 405B', lab:'Meta', d:'Jul 2024', y:2024.55, open:true, idx:11,
    params:'405B dense', note:'The first open-weight model credibly compared to the closed frontier. MMLU is Meta\'s published 0-shot CoT figure; quantised community runs score materially lower.',
    scores:{ mmlu:87.3 } },

  { slug:'mistral-large-2', m:'Mistral Large 2', lab:'Mistral', d:'Jul 2024', y:2024.56, open:true, idx:11,
    params:'123B', note:'Europe\'s flagship, open for research use.',
    scores:{ mmlu:78.1 } },

  { slug:'o1-mini', m:'o1-mini', lab:'OpenAI', d:'Sep 2024', y:2024.72, open:false, idx:13,
    note:'Reasoning distilled to a price point, aimed squarely at code.',
    scores:{} },

  { slug:'o1', m:'o1', lab:'OpenAI', d:'Dec 2024', y:2024.95, open:false, idx:15,
    note:'Test-time compute becomes a scaling axis of its own. AIME figure is the 2024 contest.',
    scores:{ swe:48.9, gpqa:78.0, aime:74.3, metr:'~35 min' } },

  { slug:'gemini-2-0-flash', m:'Gemini 2.0 Flash', lab:'Google', d:'Dec 2024', y:2024.96, open:false, idx:15,
    note:'Native tool use and low latency — Google\'s first genuinely agentic tier.',
    scores:{} },

  { slug:'deepseek-v3', m:'DeepSeek V3', lab:'DeepSeek', d:'Dec 2024', y:2024.97, open:true, idx:15,
    params:'671B / 37B active', note:'Frontier-adjacent quality trained for a reported fraction of Western budgets.',
    scores:{ gpqa:59.1, mmlu:88.5 } },

  { slug:'deepseek-r1', m:'DeepSeek R1', lab:'DeepSeek', d:'Jan 2025', y:2025.04, open:true, idx:17,
    licence:'MIT', note:'The moat becomes a lag. Open-weight reasoning within points of the closed frontier. AIME figure is the 2024 contest.',
    scores:{ swe:49.2, gpqa:71.5, aime:79.8, math500:97.3, mmlu:90.8 } },

  { slug:'qwen-2-5-max', m:'Qwen 2.5 Max', lab:'Alibaba', d:'Jan 2025', y:2025.07, open:false, idx:17,
    note:'Alibaba joins the frontier conversation.',
    scores:{ gpqa:58.7 } },

  { slug:'claude-3-7-sonnet', m:'Claude 3.7 Sonnet', lab:'Anthropic', d:'Feb 2025', y:2025.14, open:false, idx:19,
    note:'The first model measured in hours-adjacent units. GPQA is the extended-thinking figure.',
    scores:{ swe:62.3, gpqa:78.2, metr:'~50 min' } },

  { slug:'grok-3', m:'Grok 3', lab:'xAI', d:'Feb 2025', y:2025.14, open:false, idx:19,
    note:'xAI reaches the frontier pack on raw scale. AIME figure is the 2025 contest.',
    scores:{ gpqa:84.6, aime:93.3 } },

  { slug:'gemini-2-5-pro', m:'Gemini 2.5 Pro', lab:'Google', d:'Mar 2025', y:2025.21, open:false, idx:21,
    note:'Google\'s first genuinely competitive reasoning model. AIME figure is the 2025 contest; HLE is without tools.',
    scores:{ swe:63.8, gpqa:84.0, aime:86.7, hle:18.8 } },

  { slug:'gemma-3', m:'Gemma 3', lab:'Google', d:'Mar 2025', y:2025.25, open:true, idx:20,
    licence:'Gemma terms', note:'Google\'s small open family — the tier that runs on a laptop.',
    scores:{} },

  { slug:'gpt-4-1', m:'GPT-4.1', lab:'OpenAI', d:'Apr 2025', y:2025.28, open:false, idx:21,
    ctx:'1M', note:'A long-context workhorse aimed at developers rather than benchmarks.',
    scores:{} },

  { slug:'o3', m:'o3', lab:'OpenAI', d:'Apr 2025', y:2025.29, open:false, idx:23,
    note:'Reasoning at the frontier, with a horizon measured in hours. AIME figure is the 2024 contest.',
    scores:{ swe:69.1, gpqa:83.3, aime:91.6, metr:'~1 hr 30 min' } },

  { slug:'o4-mini', m:'o4-mini', lab:'OpenAI', d:'Apr 2025', y:2025.29, open:false, idx:21,
    note:'Cheap reasoning that made agent loops affordable to run continuously. Beats o3 on AIME 2024 without tools.',
    scores:{ gpqa:81.4, aime:93.4 } },

  { slug:'claude-opus-4', m:'Claude Opus 4', lab:'Anthropic', d:'May 2025', y:2025.37, open:false, idx:23,
    note:'Sustained multi-hour agentic coding stops being a demo.',
    scores:{ swe:72.5, gpqa:79.6 } },

  { slug:'grok-4', m:'Grok 4', lab:'xAI', d:'Jul 2025', y:2025.54, open:false, idx:26,
    note:'HLE figure is the standard model; the reasoning variant scored 45% and Grok 4 Heavy became the first model to reach 50%. AIME figure is the 2025 contest.',
    scores:{ swe:75.0, gpqa:87.5, aime:91.7, hle:35.0 } },

  { slug:'kimi-k2', m:'Kimi K2', lab:'Moonshot', d:'Jul 2025', y:2025.54, open:true, idx:26,
    params:'1T MoE', note:'A second, unlicensable distribution channel for the frontier.',
    scores:{ swe:65.8 } },

  { slug:'gpt-5', m:'GPT-5', lab:'OpenAI', d:'Aug 2025', y:2025.62, open:false, idx:28,
    note:'Measured against real economic deliverables for the first time. GPQA figure is GPT-5 Pro with extended reasoning; AIME is the 2025 contest without tools.',
    scores:{ swe:74.9, gpqa:88.4, aime:94.6, gdpwin:38.8, metr:'~2 hr' } },

  { slug:'claude-opus-4-1', m:'Claude Opus 4.1', lab:'Anthropic', d:'Aug 2025', y:2025.62, open:false, idx:28,
    note:'The first model measured near expert parity on real deliverables.',
    scores:{ swe:74.5, gdpwin:47.6 } },

  { slug:'claude-sonnet-4-5', m:'Claude Sonnet 4.5', lab:'Anthropic', d:'Sep 2025', y:2025.71, open:false, idx:29,
    note:'Frontier coding at a mid-tier price. AIME figure is 2025 without tools — it reaches 100% with Python tools.',
    scores:{ swe:77.2, gpqa:83.4, aime:87.0, mmmlu:89.1 } },

  { slug:'claude-haiku-4-5', m:'Claude Haiku 4.5', lab:'Anthropic', d:'Oct 2025', y:2025.79, open:false, idx:28,
    note:'Small-model tier good enough to run sub-agents at volume.',
    scores:{} },

  { slug:'gemini-3-pro', m:'Gemini 3 Pro', lab:'Google', d:'Nov 2025', y:2025.87, open:false, idx:34,
    note:'AIME figure is 2025 without tools — 100% with code execution. Deep Think mode reaches 93.8% GPQA and over 40% HLE.',
    scores:{ swe:76.2, gpqa:91.9, aime:95.0, hle:37.5 } },

  { slug:'claude-opus-4-5', m:'Claude Opus 4.5', lab:'Anthropic', d:'Nov 2025', y:2025.87, open:false, idx:34,
    note:'Half a working day, unsupervised, at even odds. Reaches roughly 43% on HLE with web search, which is not comparable to the no-tools figures in that row.',
    scores:{ swe:80.9, gpqa:87.0, metr:'~4 hr 49 min' } },

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

  { slug:'qwen-3-235b', m:'Qwen 3 235B', lab:'Alibaba', d:'2025', y:2025.60, open:true, idx:27,
    params:'235B MoE', note:'Strongest open-weight model for reasoning and mathematics at its release.',
    scores:{ gpqa:77.2 } },

  { slug:'llama-4-maverick', m:'Llama 4 Maverick', lab:'Meta', d:'2025', y:2025.40, open:true, idx:24,
    params:'400B / 17B active', licence:'Meta custom (700M MAU clause)',
    note:'Meta\'s MoE turn, under a licence that stops short of genuinely open. Held the highest MMLU among open models at release.',
    scores:{ mmlu:85.5 } },

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

  { slug:'glm-5', m:'GLM-5', lab:'Z.ai', d:'Mar 2026', y:2026.21, open:true, idx:43,
    note:'The strongest open coding result at release, later superseded by GLM-5.2.',
    scores:{ swe:77.8 } },

  { slug:'gpt-5-4', m:'GPT-5.4', lab:'OpenAI', d:'Apr 2026', y:2026.27, open:false, idx:44,
    note:'Evaluated by METR in April 2026.',
    scores:{} },

  { slug:'kimi-k2-6', m:'Kimi K2.6', lab:'Moonshot', d:'Apr 2026', y:2026.30, open:true, idx:45,
    note:'First of five open-weight flagships that reset the ranking in nine weeks.',
    scores:{} },

  { slug:'gpt-5-5', m:'GPT-5.5', lab:'OpenAI', d:'Apr 2026', y:2026.31, open:false, idx:46,
    note:'Strong on terminal agents and computer use, behind Opus 4.8 on hard engineering.',
    scores:{ swepro:58.6, tb:78.2, gpqa:93.6, osworld:78.7 } },

  { slug:'deepseek-v4-pro', m:'DeepSeek V4 Pro', lab:'DeepSeek', d:'Apr 2026', y:2026.31, open:true, idx:46,
    params:'1.6T / 49B active', ctx:'1M', licence:'MIT',
    note:'Frontier-grade coding, downloadable, with no permission required. 384 routed experts plus one shared. AA figure is the max-reasoning setting.',
    scores:{ swe:80.6, gpqa:90.1, aa:44.0 } },

  { slug:'mistral-large-3', m:'Mistral Large 3', lab:'Mistral', d:'2026', y:2026.35, open:true, idx:44,
    params:'675B / 41B active', licence:'Apache-2.0',
    note:'Europe\'s entry at the open frontier. The GPQA figure is Mistral\'s vendor card; independent runs have landed far lower, a gap attributed to differing prompt and eval setups.',
    scores:{ gpqa:67.2 } },

  { slug:'qwen-3-5', m:'Qwen 3.5 397B-A17B', lab:'Alibaba', d:'Feb 2026', y:2026.126, open:true, idx:45,
    params:'397B / 17B active', licence:'Apache-2.0',
    note:'397B-A17B results from the official model card: GPQA Diamond, original no-tools HLE, and MMMLU. HLE-Verified and tools-enabled HLE are separate measurements and omitted.',
    scores:{gpqa:88.4, hle:28.7, mmmlu:88.5},
    sources:[{label:'Official model card',url:'https://huggingface.co/Qwen/Qwen3.5-397B-A17B'}] },

  { slug:'claude-opus-4-8', m:'Claude Opus 4.8', lab:'Anthropic', d:'May 2026', y:2026.41, open:false, idx:49,
    note:'Topped the AA Intelligence Index on release, with standout computer-use gains.',
    scores:{ swe:88.6, swepro:69.2, tb:74.6, m2w:84.0, frontier:18.7, gpqa:93.6, hle:45.7, aa:61.4 } },

  { slug:'kimi-k2-7-code', m:'Kimi K2.7 Code', lab:'Moonshot', d:'Jun 2026', y:2026.45, open:true, idx:48,
    note:'Long-horizon coding agent, open weights.',
    scores:{} },

  { slug:'glm-5-2', m:'GLM-5.2', lab:'Z.ai', d:'Jun 2026', y:2026.45, open:true, idx:49,
    params:'744B / ~40B active', ctx:'1M', licence:'MIT',
    note:'The leading open-weight model on aggregate intelligence, with weights on Hugging Face from day one.',
    scores:{ swepro:62.1, tb:81.0, gpqa:91.2, aa:51.0 } },

  { slug:'minimax-m3', m:'MiniMax M3', lab:'MiniMax', d:'Jun 2026', y:2026.46, open:true, idx:49,
    ctx:'1M', note:'Natively multimodal open weights with a million-token window.',
    scores:{ swepro:59.0 } },

  { slug:'claude-fable-5', m:'Claude Fable 5', lab:'Anthropic', d:'Jun 2026', y:2026.48, open:false, idx:52,
    note:'Tops the Artificial Analysis Intelligence Index at 59.9%, and leads Humanity\'s Last Exam as of late July 2026.',
    scores:{ swe:95.0, swepro:80.3, frontier:33.7, hle:53.3, aa:59.9, gdp:1747 } },

  { slug:'grok-4-5', m:'Grok 4.5', lab:'xAI', d:'Jul 2026', y:2026.52, open:false, idx:52,
    params:'1.5T (V9 base)', price:'$2 / $6 per M tokens',
    note:'Radically token-efficient: ~16K output tokens per SWE-bench Pro task against ~67K for Opus 4.8.',
    scores:{ tb:83.3, aa:54.0 } },

  { slug:'gpt-5-6-sol', m:'GPT-5.6 Sol', lab:'OpenAI', d:'Jul 2026', y:2026.53, open:false, idx:53,
    note:'Terminal-Bench figure is Sol; Sol Ultra reaches 91.9%. OpenAI has not published GPQA or FrontierMath figures for this release.',
    scores:{ swe:96.2, swepro:64.6, deepswe:72.7, tb:88.8, hle:47.2, aa:58.9, gdp:1735 } },

  { slug:'kimi-k3', m:'Kimi K3', lab:'Moonshot', d:'Jul 2026', y:2026.55, open:true, idx:53,
    params:'2.8T MoE', ctx:'1M',
    note:'Open weights within a point of the closed frontier, released 27 Jul 2026. AIME figure is the 2026 contest.',
    scores:{ swe:93.4, tb:88.3, browse:91.2, swemar:42.0, deepswe:67.5, gpqa:90.5, aime:96.4, aa:57.1 } },

  { slug:'claude-opus-5', m:'Claude Opus 5', lab:'Anthropic', d:'Jul 2026', y:2026.55, open:false, idx:53,
    note:'Leads SWE-bench Verified, GDPval-AA and ARC-AGI-3 simultaneously — the last at roughly four times the next model. Best-in-class on OSWorld 2.0 at about a third of Fable 5\'s cost, though no headline percentage was published.',
    scores:{ swe:97.0, frontier:43.3, arc3:30.2, gdp:1861, metr:'~17 hr †' } },

  // October 2026 research refresh. No new displacement position inferred.
  {"slug": "gpt-6-astra", "m": "GPT-6 Astra", "lab": "OpenAI", "d": "Sep 2026", "y": 2026.6712, "open": false, "note": "Released 3 September for complex reasoning, coding and computer use.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://developers.openai.com/api/docs/changelog"}]},
  {"slug": "gpt-6-sol", "m": "GPT-6 Sol (September)", "lab": "OpenAI", "d": "Sep 2026", "y": 2026.7233, "open": false, "note": "September API, Codex and Work version; distinct from October ChatGPT training.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://developers.openai.com/api/docs/changelog"}]},
  {"slug": "gpt-6-luna", "m": "GPT-6 Luna (September)", "lab": "OpenAI", "d": "Sep 2026", "y": 2026.7233, "open": false, "note": "September API reasoning model accepting text and images.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://developers.openai.com/api/docs/changelog"}]},
  {"slug": "gpt-6-1-sol", "m": "GPT-6.1 Sol", "lab": "OpenAI", "d": "Sep 2026", "y": 2026.7425, "open": false, "note": "Released 29 September for coding and professional tasks; multi-agent support in beta.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://developers.openai.com/api/docs/changelog"}]},
  {"slug": "gpt-5-6-cyber", "m": "GPT-5.6 Cyber", "lab": "OpenAI", "d": "Aug 2026", "y": 2026.5973, "open": false, "note": "Restricted to approved Daybreak Red defenders.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://developers.openai.com/api/docs/changelog"}]},
  {"slug": "gpt-live-1", "m": "GPT-Live 1", "lab": "OpenAI", "d": "Sep 2026", "y": 2026.6904, "open": false, "note": "Specialist: full-duplex conversational voice, generally available 10 September.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://developers.openai.com/api/docs/changelog"}]},
  {"slug": "gpt-image-2-5-sunburst", "m": "GPT Image 2.5 Sunburst", "lab": "OpenAI", "d": "Sep 2026", "y": 2026.6849, "open": false, "note": "Specialist: image generation and editing; precision-oriented variant.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://developers.openai.com/api/docs/changelog"}]},
  {"slug": "gpt-image-2-5-flare", "m": "GPT Image 2.5 Flare", "lab": "OpenAI", "d": "Sep 2026", "y": 2026.6849, "open": false, "note": "Specialist: fast image generation and editing.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://developers.openai.com/api/docs/changelog"}]},
  {"slug": "gpt-rosalind", "m": "GPT-Rosalind", "lab": "OpenAI", "d": "Sep 2026", "y": 2026.6849, "open": false, "note": "Specialist: life-sciences research, restricted trusted access.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://developers.openai.com/api/docs/changelog"}]},
  {"slug": "gpt-5-6-terra", "m": "GPT-5.6 Terra", "lab": "OpenAI", "d": "Jul 2026", "y": 2026.5178, "open": false, "note": "Backfill: July reasoning-family variant balancing capability and cost.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://developers.openai.com/api/docs/changelog"}]},
  {"slug": "gpt-5-6-luna", "m": "GPT-5.6 Luna", "lab": "OpenAI", "d": "Jul 2026", "y": 2026.5178, "open": false, "note": "Backfill: July reasoning-family variant for high-volume workloads.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://developers.openai.com/api/docs/changelog"}]},
  {"slug": "gpt-6-sol-october", "m": "GPT-6 Sol (October ChatGPT)", "lab": "OpenAI", "d": "Oct 2026", "y": 2026.7644, "open": false, "note": "October ChatGPT version; September versions remain separate in Codex and Work.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://deploymentsafety.openai.com/gpt-6-october/model-data-and-training"}]},
  {"slug": "gpt-6-luna-october", "m": "GPT-6 Luna (October ChatGPT)", "lab": "OpenAI", "d": "Oct 2026", "y": 2026.7644, "open": false, "note": "October ChatGPT version; September versions remain separate in Codex and Work.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://deploymentsafety.openai.com/gpt-6-october/model-data-and-training"}]},
  {"slug": "claude-haiku-5-5", "m": "Claude Haiku 5.5", "lab": "Anthropic", "d": "Oct 2026", "y": 2026.7644, "open": false, "note": "Released 2026-10-07. Published benchmark charts are not transcribed into unverified numerical cells.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://www.anthropic.com/claude-haiku-5-5"}]},
  {"slug": "claude-sonnet-5-5", "m": "Claude Sonnet 5.5", "lab": "Anthropic", "d": "Sep 2026", "y": 2026.7397, "open": false, "note": "Released 2026-09-28. Published benchmark charts are not transcribed into unverified numerical cells.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://www.anthropic.com/claude-sonnet-5-5"}]},
  {"slug": "claude-opus-5-5", "m": "Claude Opus 5.5", "lab": "Anthropic", "d": "Sep 2026", "y": 2026.7233, "open": false, "note": "Released 2026-09-22. Published benchmark charts are not transcribed into unverified numerical cells.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://www.anthropic.com/claude-opus-5-5"}]},
  {"slug": "claude-fable-5-1", "m": "Claude Fable 5.1", "lab": "Anthropic", "d": "Sep 2026", "y": 2026.6658, "open": false, "note": "September general release; Mythos 5.1 shares the underlying model with different safeguards.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://www.anthropic.com/claude-fable-and-mythos-5-1"}]},
  {"slug": "claude-mythos-5-1", "m": "Claude Mythos 5.1", "lab": "Anthropic", "d": "Sep 2026", "y": 2026.6658, "open": false, "note": "Restricted trusted access for vetted cybersecurity and life-sciences organizations; not a public release.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://www.anthropic.com/claude-fable-and-mythos-5-1"}]},
  {"slug": "claude-sonnet-5", "m": "Claude Sonnet 5", "lab": "Anthropic", "d": "Jun 2026", "y": 2026.4932, "open": false, "note": "Backfill: released 30 June. Agentic search figures require attention to the corrected methodology.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://www.anthropic.com/news/claude-sonnet-5"}]},
  {"slug": "gemini-3-7-flash", "m": "Gemini 3.7 Flash", "lab": "Google", "d": "Aug 2026", "y": 2026.6137, "open": false, "note": "Coding and agentic workhorse. DeepSWE v1.1 is a different version from the existing undated matrix row.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/"}]},
  {"slug": "gemini-3-8-flash", "m": "Gemini 3.8 Flash", "lab": "Google", "d": "Sep 2026", "y": 2026.6685, "open": false, "note": "General agentic release. HLE-Verified 54.9% is not interchangeable with the original HLE row.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/"}]},
  {"slug": "gemini-3-8-flash-cyber", "m": "Gemini 3.8 Flash Cyber", "lab": "Google", "d": "Sep 2026", "y": 2026.6685, "open": false, "note": "Specialist: cybersecurity; restricted Fairwind access for trusted defenders.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/"}]},
  {"slug": "gemini-4-argon", "m": "Gemini 4 Argon", "lab": "Google", "d": "Sep 2026", "y": 2026.7452, "open": false, "note": "Restricted rollout to trusted Fairwind cyber defenders; broader availability was still planned at announcement.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/"}]},
  {"slug": "gemini-omni-1-1-flash", "m": "Gemini Omni 1.1 Flash", "lab": "Google", "d": "Aug 2026", "y": 2026.6521, "open": false, "note": "Specialist: generative video, available through developer APIs.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/"}]},
  {"slug": "gemini-3-5-transcribe", "m": "Gemini 3.5 Transcribe", "lab": "Google", "d": "Aug 2026", "y": 2026.6493, "open": false, "note": "Specialist: speech transcription.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/"}]},
  {"slug": "gemini-3-8-live", "m": "Gemini 3.8 Live", "lab": "Google", "d": "Sep 2026", "y": 2026.7041, "open": false, "note": "Specialist: live voice dialogue and visual context.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-gemini-3-8-live-extended-thinking/"}]},
  {"slug": "gemini-3-8-live-extended-thinking", "m": "Gemini 3.8 Live Extended Thinking", "lab": "Google", "d": "Sep 2026", "y": 2026.7041, "open": false, "note": "Specialist: live dialogue with extended reasoning.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-gemini-3-8-live-extended-thinking/"}]},
  {"slug": "gemini-3-8-flash-tts", "m": "Gemini 3.8 Flash TTS", "lab": "Google", "d": "Sep 2026", "y": 2026.726, "open": false, "note": "Specialist: expressive speech synthesis.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-text-to-speech/"}]},
  {"slug": "gemini-3-8-flash-lite-tts", "m": "Gemini 3.8 Flash-Lite TTS", "lab": "Google", "d": "Sep 2026", "y": 2026.726, "open": false, "note": "Specialist: lightweight speech synthesis.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-text-to-speech/"}]},
  {"slug": "embeddinggemma-2", "m": "EmbeddingGemma 2", "lab": "Google", "d": "Oct 2026", "y": 2026.7616, "open": true, "note": "Specialist: open multimodal embeddings, not a conversational model.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2/"}]},
  {"slug": "deepseek-v4-1-flash", "m": "DeepSeek V4.1 Flash", "lab": "DeepSeek", "d": "Sep 2026", "y": 2026.6904, "open": true, "note": "Native visual understanding; API launch 10 September. Official weights are available.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://www.deepseek.com/en/news/deepseek-v4-1-flash/"}, {"label": "Official model weights", "url": "https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash"}], "params": "552B MoE"},
  {"slug": "glm-5-3", "m": "GLM-5.3", "lab": "Z.ai", "d": "Aug 2026", "y": 2026.6274, "open": true, "note": "Official release notes date this entry 18 August; press reported initial access 14 August. Terminal-Bench 3.0 is not the existing 2.1 evaluation.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://docs.z.ai/release-notes/new-released"}, {"label": "Official model weights", "url": "https://huggingface.co/zai-org/GLM-5.3"}]},
  {"slug": "glm-5-3-flash", "m": "GLM-5.3 Flash", "lab": "Z.ai", "d": "Aug 2026", "y": 2026.6493, "open": true, "note": "Native multimodal agent model with open weights. FlashX is a named faster hosted variant; benchmark equivalence has not been established.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://docs.z.ai/guides/vlm/glm-5.3-flash"}, {"label": "Official model weights", "url": "https://huggingface.co/zai-org/GLM-5.3-Flash"}], "ctx": "1M"},
  {"slug": "grok-4-6", "m": "Grok 4.6", "lab": "xAI", "d": "Aug 2026", "y": 2026.611, "open": false, "note": "Released 2026-08-12. Fast is a service tier of the same model; not counted twice.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://docs.x.ai/developers/release-notes"}], "ctx": "500K"},
  {"slug": "grok-4-7", "m": "Grok 4.7", "lab": "xAI", "d": "Sep 2026", "y": 2026.7205, "open": false, "note": "Released 2026-09-21. Fast is a service tier of the same model; not counted twice.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://docs.x.ai/developers/release-notes"}], "ctx": "500K"},
  {"slug": "grok-voice-transcribe-2", "m": "Grok Voice Transcribe 2.0", "lab": "xAI", "d": "Sep 2026", "y": 2026.7096, "open": false, "note": "Specialist: speech transcription.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://docs.x.ai/developers/release-notes"}]},
  {"slug": "qwen-3-8-2-4t", "m": "Qwen3.8 2.4T-A95B", "lab": "Alibaba", "d": "Aug 2026", "y": 2026.611, "open": true, "note": "Open Max-class variant. Published GPQA and no-tools HLE values only; versioned/qualified engineering scores omitted.", "scores": {"gpqa": 92.6, "hle": 43.6}, "sources": [{"label": "Official release / model documentation", "url": "https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B"}], "params": "2.4T / 95B active"},
  {"slug": "qwen-3-8-27b", "m": "Qwen3.8 27B", "lab": "Alibaba", "d": "Aug 2026", "y": 2026.6164, "open": true, "note": "Dense vision-language model. GPQA and HLE are the 27B column, not the Max sibling.", "scores": {"gpqa": 89.2, "hle": 30.8}, "sources": [{"label": "Official release / model documentation", "url": "https://huggingface.co/Qwen/Qwen3.8-27B"}], "params": "27B"},
  {"slug": "qwen-3-8-flash-next", "m": "Qwen3.8 Flash-Next", "lab": "Alibaba", "d": "Aug 2026", "y": 2026.6521, "open": true, "note": "August open release. GPQA and HLE use this exact variant; modified SWE-bench Pro and DeepSWE 1.1 results not merged into older rows.", "scores": {"gpqa": 91.7, "hle": 35.9}, "sources": [{"label": "Official release / model documentation", "url": "https://huggingface.co/Qwen/Qwen3.8-Flash-Next"}]},
  {"slug": "qwen-3-8-omni-flash", "m": "Qwen3.8 Omni-Flash", "lab": "Alibaba", "d": "Sep 2026", "y": 2026.7123, "note": "Omnimodal agent model with text, image, audio and video input.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://qwen.ai/blog?id=qwen3.8-omni-flash"}], "ctx": "1M"},
  {"slug": "muse-glimmer", "m": "Muse Glimmer", "lab": "Meta", "d": "Aug 2026", "y": 2026.6055, "open": true, "note": "Open model for local agent workflows.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model"}], "params": "30B", "licence": "Apache 2.0"},
  {"slug": "muse-spark-1-3", "m": "Muse Spark 1.3", "lab": "Meta", "d": "Sep 2026", "y": 2026.6685, "open": false, "note": "Agentic and coding release. Muse the personal-agent product is not an additional model.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://research.meta.ai/blog/introducing-muse-spark-1-3"}]},
  {"slug": "shieldstral-1", "m": "Shieldstral 1.0", "lab": "Mistral", "d": "Aug 2026", "y": 2026.589, "open": true, "note": "Specialist: security model.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://docs.mistral.ai/models/shieldstral-1-0"}]},
  {"slug": "mistral-ocr-4-1", "m": "Mistral OCR 4.1", "lab": "Mistral", "d": "Jul 2026", "y": 2026.537, "note": "Specialist: document extraction; July release became generally available 31 August.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://docs.mistral.ai/resources/changelogs"}]},
  {"slug": "minimax-music-3", "m": "MiniMax Music 3.0", "lab": "MiniMax", "d": "Aug 2026", "y": 2026.6137, "open": true, "note": "Specialist: open-weight music generation.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://www.minimax.io/blog/minimax-music-3-0-next-generation-open-weights-production-ready-versatile-music-model"}]},
  {"slug": "cohere-parse-5", "m": "Cohere Parse 5.0", "lab": "Cohere", "d": "Aug 2026", "y": 2026.6521, "note": "Specialist: structured document extraction.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://docs.cohere.com/v2/changelog"}]},
  {"slug": "cohere-embed-5-pro", "m": "Cohere Embed 5 Pro", "lab": "Cohere", "d": "Sep 2026", "y": 2026.7452, "note": "Specialist: multimodal embeddings; quality-oriented variant.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://docs.cohere.com/v2/changelog"}]},
  {"slug": "cohere-embed-5-fast", "m": "Cohere Embed 5 Fast", "lab": "Cohere", "d": "Sep 2026", "y": 2026.7452, "note": "Specialist: multimodal embeddings; low-latency variant.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://docs.cohere.com/v2/changelog"}]},
  {"slug": "north-small-translate", "m": "North Small Translate 1.0", "lab": "Cohere", "d": "Sep 2026", "y": 2026.6877, "open": true, "note": "Specialist: machine translation; weights use CC BY-NC 4.0.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://docs.cohere.com/v2/changelog"}]},
  {"slug": "mai-image-2-6", "m": "MAI-Image-2.6", "lab": "Microsoft", "d": "Sep 2026", "y": 2026.674, "open": false, "note": "Specialist: image generation; Microsoft Foundry public preview.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://microsoft.ai/news/pushing-the-quality-cost-frontier-with-mai-image-2-6/"}]},
  {"slug": "mai-image-2-6-flash", "m": "MAI-Image-2.6-Flash", "lab": "Microsoft", "d": "Sep 2026", "y": 2026.674, "open": false, "note": "Specialist: image generation; Microsoft Foundry public preview.", "scores": {}, "sources": [{"label": "Official release / model documentation", "url": "https://microsoft.ai/news/pushing-the-quality-cost-frontier-with-mai-image-2-6/"}]},
  {"slug": "qwen-image-2-1", "m": "Qwen Image 2.1", "lab": "Alibaba", "d": "Sep 2026", "y": 2026.7178, "open": true, "note": "Specialist: open image generation/editing.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://qwen.ai/blog?id=qwen-image-2.1"}]},
  {"slug": "qwen-image-2-1-turbo", "m": "Qwen Image 2.1 Turbo", "lab": "Alibaba", "d": "Oct 2026", "y": 2026.7699, "open": true, "note": "Specialist: accelerated open image checkpoint.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]},
  {"slug": "qwen-image-2-1-pro", "m": "Qwen Image 2.1 Pro", "lab": "Alibaba", "d": "Oct 2026", "y": 2026.7507, "note": "Specialist: image generation/editing API.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]},
  {"slug": "qwen-3-8-omni-flash-realtime", "m": "Qwen3.8 Omni-Flash Realtime", "lab": "Alibaba", "d": "Sep 2026", "y": 2026.7205, "note": "Specialist: realtime audiovisual interaction.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]},
  {"slug": "qwen-3-8-livetranslate", "m": "Qwen3.8 LiveTranslate Flash Realtime", "lab": "Alibaba", "d": "Sep 2026", "y": 2026.7096, "note": "Specialist: realtime audiovisual translation.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]},
  {"slug": "qwen-audio-3-1-realtime-plus", "m": "Qwen Audio 3.1 Realtime Plus", "lab": "Alibaba", "d": "Sep 2026", "y": 2026.7178, "note": "Specialist: duplex speech.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]},
  {"slug": "qwen-mt-uni", "m": "Qwen MT Uni", "lab": "Alibaba", "d": "Sep 2026", "y": 2026.7068, "note": "Specialist: multimodal translation service.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]},
  {"slug": "qwen-3-8-max-0902", "m": "Qwen3.8 Max 0902", "lab": "Alibaba", "d": "Sep 2026", "y": 2026.6685, "note": "Updated hosted snapshot; separate from August weights.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]},
  {"slug": "qwen-3-7-text-rerank", "m": "Qwen3.7 Text Rerank", "lab": "Alibaba", "d": "Sep 2026", "y": 2026.6658, "note": "Specialist: retrieval reranking.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]},
  {"slug": "qwen-3-7-text-embedding-flash", "m": "Qwen3.7 Text Embedding Flash", "lab": "Alibaba", "d": "Sep 2026", "y": 2026.6658, "note": "Specialist: text embeddings.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]},
  {"slug": "qwen-mt-image-2", "m": "Qwen MT Image 2.0", "lab": "Alibaba", "d": "Aug 2026", "y": 2026.6548, "note": "Specialist: image translation.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]},
  {"slug": "qwen-3-8-flash", "m": "Qwen3.8 Flash", "lab": "Alibaba", "d": "Aug 2026", "y": 2026.6493, "note": "Hosted multimodal variant.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]},
  {"slug": "wan-3-video", "m": "Wan 3.0 Video", "lab": "Alibaba", "d": "Aug 2026", "y": 2026.6438, "note": "Specialist: video; public release after invitation testing.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]},
  {"slug": "wan-3-video-prime", "m": "Wan 3.0 Video Prime", "lab": "Alibaba", "d": "Aug 2026", "y": 2026.6438, "note": "Specialist: faster video variant.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]},
  {"slug": "happyoyster-1-adventure", "m": "HappyOyster 1.0 Adventure", "lab": "Alibaba", "d": "Sep 2026", "y": 2026.7123, "note": "Specialist: interactive world generation.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]},
  {"slug": "qwen-decision-preview", "m": "Qwen Decision Model Preview", "lab": "Alibaba", "d": "Sep 2026", "y": 2026.7288, "note": "Specialist: structured decisions; preview.", "scores": {}, "sources": [{"label": "Official release record", "url": "https://platform.qianwenai.com/docs/changelog/models"}]}
];

/* sort once, oldest first — every view depends on this order */
MODELS.sort((a, b) => a.y - b.y);
