# PM Research Toolkit

> A personal system for building deep, structured knowledge on products,
> companies, and markets — powered by Google Deep Research and Claude API.

## What This Is

Most product knowledge stays surface-level — a few articles, a 10-K skim,
some Twitter takes. This toolkit goes deeper.

It produces structured research across four dimensions: how a product evolved
and what it's actually optimizing for today, how a business category works
structurally, what a company's real strategic bets reveal about its worldview,
and where a competitive landscape is heading. Each piece ends with a synthesis
— a one-line thesis, the defining bet for the next few years, and a prepared
opinion grounded in the research.

The output lives in a live, browsable library so any piece is reviewable in
10 minutes.

## Live App

🔗 [PM Research Library](https://pm-research-library-xma0.bolt.host/)

Read-only public view. Research pieces added continuously.

## What Makes This Different

Most research prompts ask "what is X." These templates ask different questions:

- **Not** "what does this product do" → **"what forced each strategic change,
  what was deprioritized to enable it, and what do quiet failures reveal about
  the team's actual priorities"**
- **Not** "what is this company's strategy" → **"what are they sacrificing to
  fund their bets, and what does the capital allocation reveal that the
  earnings call doesn't say"**
- **Not** "who are the competitors" → **"who is gaining ground on what
  dimensions, what does conventional wisdom get wrong, and how would you
  compete against the leader if you were PM at #2"**
- **Not** "how does this industry work" → **"what domains that look nothing
  like this one share its deep structural mechanics, and what does that analogy
  reveal about product strategy"**

Every template forces two things most research skips: **signal/noise
discipline** (every claim is traceable — Google Deep Research substitutes inline 
citations and a numbered sources list rather than [DOCUMENTED]/[INFERRED] labels, 
but the intent is the same: no ungrounded assertions) and **a prepared opinion** 
(a specific, defensible point of view grounded in the research, not a summary of 
what everyone already knows).

## The Four Templates

### Product Teardown
Surfaces the *why* behind product decisions — not what the product does, but
what forced changes, what was deprioritized, and what quiet failures reveal
about strategic limits.

Key prompts: Evolution inflection points → Tradeoffs and roads not taken →
Metrics story and what the North Star has caused the team to optimize for →
Quiet failures (metrics that disappeared from earnings narratives, features
that launched with fanfare and quietly died) → Synthesis

**Core question:** *What did the PM team actually decide, and why?*

### Company Deep Dive
Surfaces how a company actually thinks — revealed preferences from strategic
decisions, not stated ones. Covers business architecture, strategic bets and
what's being sacrificed to fund them, PM authority and culture signals, AI
strategy (what has shipped vs what was announced), and structural
vulnerabilities.

Key prompts: Revenue mechanics and capital allocation signals → Strategic
bets and what they reveal about leadership's worldview → Org and culture
through a PM lens (decision authority, what gets rewarded, red flags) →
AI strategy (build vs buy, defensive vs offensive, what has actually shipped)
→ Vulnerabilities → Synthesis

**Core question:** *What is it actually like to be a PM here?*

### Domain Primer
Surfaces the structural mechanics every PM in a space must understand — how
value is created, captured, and distributed; what forces constrain every
product decision; and what patterns from other domains illuminate this one.

Key prompts: Business model mechanics and fundamental tensions → Customer
mindset evolution (before/after states, what drove each shift, the next shift
still arriving) → Structural dynamics (network effects, unit economics
ceilings, data feedback loops) → Cross-domain patterns (what this domain
exports to others, what it has borrowed, non-obvious structural analogies)
→ Synthesis

**Core question:** *How does this business category structurally work?*

### Competitive Landscape
Surfaces who's winning and why — not feature comparisons, but structural
differentiation, competitive dynamics, and where the category is heading.

Key prompts: Market map and structural shifts → Who's gaining vs losing
ground and what metrics tell the real story → Differentiation analysis
(what each player does that others can't easily replicate and how durable
it is) → How to compete against the leader (realistic path for #2 or #3)
→ Whitespace and future state → Synthesis

**Core question:** *Who wins, and what would it take to beat them?*

## How It Works

```
Prompt Template (one of four types)
        ↓
Google Deep Research
(6-7 sequential prompts, each building on the last)
        ↓
Word Document Export
(synthesis first, full research sections below,
[DOCUMENTED]/[INFERRED] labels preserved)
        ↓
Paste into Research Library app
        ↓
Claude API (Supabase Edge Function)
(auto-formats plain text → structured markdown:
headings, tables, bullets, inline citations [1],
sources consolidated at bottom)
        ↓
Saved to Supabase (PostgreSQL)
        ↓
PM Research Library
(filterable by type, synthesis + full research per entry)
```

## Research Library App

Built with Bolt (React + Vite), Supabase (PostgreSQL + Edge Functions),
and Claude API.

**Features:**
- Card grid browsable by research type
- Auto-formatter: raw text in → structured markdown out, via Claude API
  running server-side in a Supabase Edge Function
- Inline citation conversion (`sentence.1` → `sentence.[1]`)
- Sources section consolidated as a single numbered list
- Markdown rendering with tables, headings, bold terms
- Read-only public view — content managed privately

**Current research pieces:**

| Topic | Type |
|-------|------|
| Ads | Domain Primer |
| Meta | Company Deep Dive |
| Instagram Reels | Product Teardown |
| Short-Form Video | Competitive Landscape |
| Uber | Company Deep Dive |

## Template Design Principles

**Sequential prompting over single-shot prompting.** Each template runs 6-7
prompts in sequence within the same thread. The synthesis (always last) can
only be written after all prior research exists — it reasons across the full
body of work, not just a single query.

**Revealed preferences over stated ones.** Every template is oriented toward
what decisions reveal, not what communications say. "What are they sacrificing
to fund this bet" surfaces more than "what is their strategy."

**Signal/noise discipline.** Every template is designed so claims are traceable 
to sources. The prompt asks for [DOCUMENTED]/[INFERRED] labeling — in practice, 
Google Deep Research substitutes inline citations and a consolidated sources list. 
Either way, the output distinguishes grounded claims from reasoned inference, 
which makes the synthesis more defensible.

**Prepared opinion as a required output.** Every synthesis ends with a
specific, defensible point of view — not a summary of what everyone already
knows. The opinion has to be grounded in a signal from the research above.

## What I Learned Building This

- **Prompt sequencing matters more than prompt quality** — a single long
  prompt produces mediocre research; breaking it into sequential prompts
  where each builds on the last produces genuinely structured analysis
- **Forcing the tradeoff frame changes the output** — "what were they
  sacrificing" produces different (better) research than "what were they
  prioritizing"
- **Quiet failures are the most valuable signal** — metrics that disappeared
  from earnings narratives, features that launched and quietly died, job
  postings that never shipped. These reveal actual strategic limits better
  than any announced priority
- **The citation discipline changes how you read research** — when every claim 
  has a traceable source, you naturally start noticing how much of what passes 
  for product knowledge is inference presented as fact
- **Research depth compounds across pieces** — after a Domain Primer on Ads
  and a Company Deep Dive on Meta, the Competitive Landscape on Short-Form
  Video took half the time to synthesize because the underlying model was
  already built

## Repo Structure

```
pm-research-toolkit/
├── README.md
├── prompt-templates/
│   ├── Prompt_Template_Product_Teardown.docx
│   ├── Prompt_Template_Domain_Primer.docx
│   ├── Prompt_Template_Company_Deep_Dive.docx
│   └── Prompt_Template_Competitive_Landscape.docx
└── research-library-app/
    ├── src/
    ├── supabase/
    │   └── functions/
    │       └── format-research/   ← Claude API Edge Function
    ├── public/
    └── package.json
```

## Built With

- Google Deep Research
- Bolt (frontend + deployment)
- Supabase (PostgreSQL + Edge Functions)
- Claude API (markdown auto-formatter)
- React + Vite + Tailwind