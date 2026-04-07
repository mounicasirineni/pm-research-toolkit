# PM Research Toolkit
A personal system for building deep, structured product knowledge — four
sequential prompt templates that drive Gemini Deep Research, plus a React +
Supabase library app that ingests the raw output, runs it through a hard-
constrained Claude formatter, and serves it as a browsable, citation-preserving
research library.

**Live demo:** [PM Research Library](https://pm-research-library-xma0.bolt.host/) _(read-only public view)_

---

## What It Is
A product-thinking instrument disguised as a research tool. The prompt
templates encode a specific philosophy about how PMs should interrogate
products, companies, and markets — *revealed preferences over stated ones,
quiet failures as the highest-signal data, a defensible opinion as a required
output*. The library app is the delivery surface: it takes raw Gemini exports,
formats them faithfully (no fact mutation, citations preserved to the
character), and renders them as a 10-minute-reviewable card grid.

## Why I Built It
Most PM interview prep is shallow because most research tooling is shallow.
You skim a 10-K, read three Stratechery posts, and walk into the room with
talking points everyone else also has. I wanted research that could survive
follow-up questions — research where every claim is traceable, every
synthesis ends in a defensible point of view, and the *why* behind product
decisions is the actual unit of work, not the *what*.

The product decision underneath the whole thing: **reframe the questions.**
Not "what is this company's strategy" but "what are they sacrificing to fund
their bets." Not "who are the competitors" but "how would you compete against
the leader if you were PM at #2." Reframing the prompt is the highest-leverage
move in the entire pipeline — better than any model upgrade.

## How It Works
```
Prompt Template (.docx) → Gemini Deep Research (6–7 sequential prompts)
↓
Word export with inline citations
↓
Paste into AddResearchForm (React)
↓
Client-side preprocessing: extractSources → preprocessCitations → chunking
↓
format-research Edge Function (Claude Sonnet, strict prompt)
↓
Supabase Postgres (research_pieces, RLS)
↓
Public read-only library (filterable card grid)
```
**Generation layer.** Four `.docx` templates in `prompt-templates/` — Product
Teardown, Company Deep Dive, Domain Primer, Competitive Landscape. Each is a
6–7 prompt sequence run inside Gemini Deep Research, where every prompt
builds on the last and the synthesis (always last) reasons over the entire
chain. Sequential prompting is the design choice that makes this work — a
single long prompt produces mediocre research.

**Ingest layer.** `src/components/AddResearchForm.tsx` is where raw text
becomes structured markdown. On `blur` of a textarea it runs three
deterministic preprocessing steps before any LLM call: `extractSources` slices
the Works Cited block off so it never reaches the model, `preprocessCitations`
rewrites `sentence.1` → `sentence.[1]` with a regex (more reliable than
asking an LLM to do syntax substitution), and the body gets chunked on
paragraph boundaries above ~8000 chars so citation context never breaks
mid-sentence. Each chunk is then sent to the `format-research` Edge Function.

**Formatter layer.** `supabase/functions/format-research/index.ts` is the
brain. It holds the Anthropic API key server-side and prepends a system
prompt structured as *hard constraints first, soft rules second*. The model
is told it has zero knowledge of the topic and must treat all content as
arbitrary text it cannot fact-check, improve, or supplement. Headings only
trigger if five conditions hold simultaneously. Bullets are atomic and
labels can never be promoted to headings. There are worked anti-pattern
examples in the prompt because few-shot negative examples constrain LLM
output better than abstract rules.

**Storage layer.** A single `research_pieces` table in Supabase Postgres
(see `supabase/migrations/`). RLS is on from the first migration. The
migration history is honest and unsquashed — you can watch the auth model
evolve from authenticated-only writes to anon writes once the password gate
moved server-side, and you can see the `title` column get dropped after I
realized `topic` + `type` + `synthesis` was the right primary identity.

**Serving layer.** `src/App.tsx` fetches all pieces on mount, owns filter
and modal state, and hides admin mode behind a 5-click easter egg on the
title (`handleSecretClick`) that opens a `PasswordDialog` which calls the
`verify-password` Edge Function — the password is checked server-side, never
in the browser. Cards (`ResearchCard.tsx`) render synthesis as memo-parsed
markdown with a 4-line clamp; clicking opens `ResearchModal.tsx` for the
full piece.

## What's Technically Interesting
**1. The formatter is a constraint engineering problem, not a prompting problem.**
The first version of `format-research` hallucinated statistics, split bullets
across paragraphs, and promoted bullet labels to H2 headings. Fixing it
required treating the system prompt as a contract: absolute constraints first
("you have NO knowledge of the topic," "exact wording is sacred"), then
heading detection as a five-condition AND gate, then worked anti-pattern
examples for the bullet-integrity rule. There's even a specific carve-out
for citations that land inside decimals (`$2.[17] billion` was a real bug).
The lesson: LLMs comply with explicit override hierarchies and negative
examples far better than with prose instructions.

**2. Deterministic preprocessing before the LLM, not after.**
Citation rewriting and sources extraction happen in TypeScript with regex
in `AddResearchForm.tsx` *before* the text reaches Claude. Asking an LLM to
do syntactic substitution is unreliable; asking it to format content whose
syntax has already been normalized is robust. This split — deterministic
where possible, LLM only for judgment — is the architectural pattern I'd
reuse anywhere I worked with model output again.

**3. Paragraph-boundary chunking, not character chunking.**
Long documents are split on `\n\n+` boundaries with a ~6000-char target.
Splitting mid-paragraph would orphan citations from the sentences they
support and the formatter would reinterpret each fragment in isolation.
Small detail, big effect on output quality.

**4. The API key is never in the browser.**
The Anthropic and password secrets live in Edge Functions (`format-research`,
`verify-password`). Even though `VITE_ANTHROPIC_API_KEY` is named with the
Vite prefix, it's only read inside `Deno.env.get` server-side. The client
calls `supabase.functions.invoke(...)` and gets back text. This was
non-negotiable from day one — a personal tool is still a public surface.

**5. Synthesis-first IA.**
`ResearchCard` renders the synthesis (not the topic dump) with a 4-line
clamp and a fade-out gradient. The product constraint was "every piece is
reviewable in 10 minutes." That constraint drove the schema (synthesis is
its own column), the card layout, and the filter chips that mirror the four
research types. The IA matches how a PM actually browses research — by
lens, not by date.

## Stack
- React 18 + Vite + TypeScript + Tailwind
- Supabase (Postgres + Edge Functions, Deno runtime)
- Anthropic Claude API (Sonnet) — markdown formatter
- Gemini Deep Research — research generation
- `marked` for client-side markdown rendering
- Bolt for frontend deployment

## Repo Structure
pm-research-toolkit/
├── README.md
├── prompt-templates/ ← four .docx prompt chains
└── research-library-app/
├── src/
│ ├── App.tsx ← shell, fetch, filter, admin gate
│ ├── components/
│ │ ├── ResearchCard.tsx ← grid card, synthesis preview
│ │ ├── ResearchModal.tsx ← full reader
│ │ ├── AddResearchForm.tsx ← ingest pipeline (preprocess → format)
│ │ ├── DeleteConfirmDialog.tsx
│ │ └── PasswordDialog.tsx
│ ├── lib/supabase.ts
│ └── types/index.ts
└── supabase/
├── functions/
│ ├── format-research/ ← strict Claude formatter (the brain)
│ ├── format-markdown/ ← legacy permissive formatter
│ └── verify-password/ ← server-side admin gate
└── migrations/ ← schema + RLS evolution

## What I Learned / What I'd Do Differently
- **Prompt sequencing matters more than prompt quality.** The single biggest
  quality unlock in the templates wasn't better wording — it was breaking one
  long prompt into 6–7 prompts where each builds on the prior. Anything that
  asks an LLM to do "research and synthesize" in one shot is leaving most of
  the value on the floor.

- **I almost built a fifth "User Trends" template. I'm glad I didn't.**
  Abstract user research isn't actionable; "user behavior in streaming" is
  useful, "user behavior" is not. Instead I embedded the user lens inside
  each existing template — segments and latent needs in Product Teardown,
  mindset evolution in Domain Primer, trust and attention dynamics in
  Competitive Landscape. Context-anchored beats standalone, every time.

- **The legacy `format-markdown` function is still in the repo and it
  shouldn't be.** I kept it during the prompt-tightening cycle so I could
  A/B compare outputs, then never deleted it. If I were starting over I'd
  delete it the day I cut over to `format-research`. Dead code is a tax on
  every future reader of the repo, including future me.

- **RLS got loosened to anon writes once the password gate moved to an Edge
  Function. I'd architect that differently next time.** Today, anyone with
  the anon key can technically write to the table; the only thing protecting
  it is that the UI gates the write path behind a server-checked password.
  That's *fine* for a personal tool, but the right design is a real auth
  session — issue a short-lived JWT from `verify-password` and gate writes
  on `auth.uid()` in RLS. I'd do that on day one of any non-personal version.

- **Bolt locks in its own Supabase instance on deployment.** When Bolt
  deploys, it provisions its own Supabase project and overrides any external
  connection — edge functions, DB, env vars all migrate. You lose direct
  dashboard access to the deployed Edge Functions, so prompt or config
  changes have to go through Bolt's editor and MCP tool, not the Supabase
  dashboard. I'd know to expect that next time and pick a deployment path
  that didn't fight the Supabase tooling.

- **Auto-formatting plain text into markdown is harder than it looks.**
  Every few-line edge case I didn't think of (citations inside decimals,
  Label: lines that should bold, Label: lines that look like bullets but
  aren't, "Sources" headings buried in prose) became its own constraint in
  the system prompt. The only sustainable approach was to write down each
  failure as a worked anti-pattern in the prompt itself. That file is now
  effectively a regression test suite written in English.

- **The citation discipline changed how I read other people's research.**
  Once every claim in my own pieces had a traceable source, I started
  noticing how much published "product analysis" is inference dressed up
  as fact. That shift in reading is, honestly, the most useful thing
  building this gave me.
