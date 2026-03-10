# PM Research Toolkit

> Structured deep research for AI/ML PM interview prep — powered by Perplexity Deep Research and a set of PM-opinionated prompt templates.

## What This Is

I built this toolkit to solve a specific interview prep problem: going into company and product conversations with genuine depth, not just surface-level familiarity.

Most interview prep stops at "read the 10-K and a few articles." This toolkit goes further — it produces structured research across four dimensions (product evolution, domain mechanics, company strategy, competitive dynamics) and forces a synthesis with a prepared opinion at the end of each piece.

The output lives in a browsable research library built with Lovable and Supabase, so I can pull up any piece the night before an interview and review it in 10 minutes.

## What It Produces

Each research piece follows one of four templates:

- **Product Teardown** — how a specific product evolved, what tradeoffs were made at each inflection point, and what the product is fundamentally optimizing for today
- **Domain Primer** — how a business category works structurally, what the real constraints are, and what most candidates miss
- **Company Deep Dive** — business architecture, strategic bets, org and culture signals for PMs, AI strategy, and key vulnerabilities
- **Competitive Landscape** — who's winning and why, what differentiation actually holds, and where the category goes in 3 years

Every piece ends with a synthesis section: a one-line thesis, the one bet that defines the next few years, and a prepared opinion — the thing I'd say in an interview if directly asked.

## Research Library

Built with Lovable (frontend) and Supabase (backend). Each entry has a filterable card in the library view and a full detail view with rendered Markdown.

Current pieces:

| Title | Type | 
|-------|------|
| Instagram Reels | Product Teardown |
| Short-Form Video | Competitive Landscape |
| Ads | Domain Primer |
| Meta | Company Deep Dive |

## How It Works

```
Prompt Template (one of four types)
        ↓
Perplexity Deep Research
(multi-step web research, structured by prompt)
        ↓
Word Document Export
(synthesis first, full research sections below)
        ↓
Markdown Conversion
(bold preserved, labels stripped, headings formatted)
        ↓
Lovable Research Library
(filterable by type, synthesis + full research per entry)
```

## Prompt Templates

The four templates are in [`/prompt-templates`](/prompt-templates). Each template:

- Has a single variable to replace (e.g. `[COMPANY]`, `[PRODUCT NAME]`)
- Runs as a sequence of prompts in Perplexity Deep Research
- Ends with a Word document export instruction that puts synthesis first

### Template Design Principles

Each template was built around a core question a PM interviewer actually asks, not just "tell me about this company":

| Template | Core question it answers |
|----------|--------------------------|
| Product Teardown | What did the PM team actually decide, and why? |
| Domain Primer | How does this business category structurally work? |
| Company Deep Dive | What is it actually like to be a PM here? |
| Competitive Landscape | Who wins, and what would it take to beat them? |

## Research Workflow

For each new piece:

1. Open the relevant prompt template doc
2. Replace the variable (e.g. `[COMPANY]` → `Google`)
3. Upload the template to Perplexity Deep Research and run prompts sequentially
4. Export as Word doc (synthesis first, full research below)
5. Convert to Markdown and paste into the Lovable library

Total time per piece: ~45 minutes in Perplexity, ~10 minutes to format and publish.

## What I Learned Building This

- **Prompt sequencing matters more than prompt quality** — a single long prompt produces mediocre research; breaking it into sequential prompts where each builds on the last produces genuinely structured analysis
- **Forcing a synthesis is the hardest part** — the prepared opinion section consistently produces the most interview-useful output, but it requires the full research to already be done before the model can reason across it
- **Research depth compounds** — after doing a Domain Primer on Ads and a Company Deep Dive on Meta, the Competitive Landscape on Short-Form Video took half the time to synthesize because the underlying model was already built
- **The library format changes how you review** — having all pieces in a filterable, searchable UI means you actually go back and read them the night before, rather than losing them in a folder of Word docs

## Repo Structure

```
pm-research-toolkit/
├── README.md
├── prompt-templates/
│   ├── Prompt_Template_Product_Teardown.docx
│   ├── Prompt_Template_Domain_Primer.docx
│   ├── Prompt_Template_Company_Deep_Dive.docx
│   └── Prompt_Template_Competitive_Landscape.docx

```

## Built With

- Perplexity Deep Research
- Lovable (frontend + UI)
- Supabase (database)
- Claude (Markdown conversion and synthesis structuring)
