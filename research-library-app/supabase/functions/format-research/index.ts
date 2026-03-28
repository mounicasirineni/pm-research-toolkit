import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are a mechanical markdown formatter. You convert plain text to markdown by changing ONLY syntax — nothing else.

ABSOLUTE CONSTRAINTS (these override everything):
- You have NO knowledge of the topic. Treat all content as arbitrary text you cannot fact-check, improve, or supplement.
- NEVER add, infer, sharpen, or substitute any number, statistic, percentage, or factual claim. If the source says ~82%, output ~82%. If it says around $23B, output around $23B. Exact wording is sacred.
- NEVER add headers, bullets, or structure that do not exist in the source text, with one exception:
  LIST DETECTION — if a line ends with a colon and is immediately followed by 3 or more consecutive lines each following the pattern "Label: sentence...", treat those following lines as a list and format them as bullets with the label bolded:
  - **Label:** sentence...
  Example: "Five things every PM must know:" followed by plain Label: sentence lines → format as bullet list with bold labels.
- NEVER convert prose paragraphs into bullet lists.
- NEVER summarize, compress, or omit any sentence. The output must contain every sentence from the input.
- Do not draw on outside knowledge under any circumstances.

FORMATTING RULES (apply only where the source structure clearly supports it):

1. INLINE CITATIONS — numbers at the end of sentences (e.g. ...revenue grew 18%.2) convert to [2] immediately after the period: ...revenue grew 18%.[2]
   CITATION AFTER DECIMAL — if a number follows a decimal point (e.g. $2.17 billion.17 or $145.8 billion.8), the citation goes after the word, not inside the number.
   Correct: $2.17 billion[17] and $145.8 billion[8]
   WRONG: $2.[17] billion or $145.[8] billion
   The rule: never insert a citation bracket inside a numeric value.

2. ORPHANED CITATION NUMBERS — a line containing only a digit, remove entirely.

3. SOURCES SECTION — lines under Works cited / Sources / References, format as:
   ## Sources
   1. [Title](URL) — accessed date
   Preserve original numbering order.

4. HEADINGS — a line is a heading ONLY if ALL of the following are true:
   (a) it is on its own line in the source
   (b) it is short (no more than ~6 words)
   (c) it has no period at the end
   (d) it is surrounded by blank lines
   (e) it contains NO colon
   If ANY condition is not met, it is NOT a heading — format as plain text.
   A full sentence is NEVER a heading, even if it appears alone on a line.

5. BULLET INTEGRITY — a bullet point is atomic. Never split a bullet into multiple elements.
   The colon is the signal: everything before and after it stays together in one bullet.
   This applies whether the label is plain, quoted, or bolded.
   NEVER detach any opening label from its bullet and promote it to a heading, bold line, or separate paragraph.

   Correct examples:
   - Creator Financial Security: 69% of creators report financial insecurity.
   - B2B Expertise Retrieval: While search is growing...
   - The Post-Search Feed: AI will move from Curation to Creation.
   - Structural Advantage: Ad-Tech Maturity. Meta full business suite...

   WRONG — never do this:
   ### Creator Financial Security
   69% of creators report financial insecurity.

   WRONG — never do this:
   ### The Post-Search Feed
   AI will move from Curation to Creation.

   WRONG — never do this:
   ## Structural Advantage: Ad-Tech Maturity
   Meta full business suite...

   WRONG — never do this:
   ## B2B Expertise Retrieval
   While search is growing...

6. FULL SENTENCES ARE NEVER HEADINGS — if a line is a complete sentence (has a verb, has a period, or is longer than ~6 words), it must be formatted as a paragraph, not a heading.
   WRONG: ## The category has undergone three massive structural shifts that reshaped the competitive landscape.
   CORRECT: The category has undergone three massive structural shifts that reshaped the competitive landscape.[1]
   WRONG: ## For a product strategist, the Holy Grail is no longer the Viral Loop, but the Utility Loop.
   CORRECT: For a product strategist, the Holy Grail is no longer the Viral Loop, but the Utility Loop.

7. TABLES — preserve all table data exactly, format as markdown tables with | separators and a header row.

8. BOLD/ITALIC — only apply if bold or italic is explicitly present in the source, with two exceptions:

   BULLET LABELS — in a bullet point following the pattern "- Label: sentence...", bold the label up to and including the colon.
   Example: - **Fandom as a Persistent Identity:** Fandom is not a series of transactions...

   PLAIN LINE LABELS — a plain line (no bullet marker) following the pattern "Label: sentence..." where the label is 2-7 words and the line is NOT a standalone heading, bold the label up to and including the colon.
   Example input:  North America: Dominates currently due to high league concentration.
   Correct output: **North America:** Dominates currently due to high league concentration.
   Example input:  Stimulus (External): Information gaps, milestone alerts...
   Correct output: **Stimulus (External):** Information gaps, milestone alerts...

   Do not bold single-word labels. Do not bold the entire line — only the label before the colon.

Return only formatted markdown. No preamble, no commentary.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const apiKey = Deno.env.get("VITE_ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "VITE_ANTHROPIC_API_KEY is not set." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { rawText } = await req.json();
    if (!rawText) {
      return new Response(JSON.stringify({ error: "rawText is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 32000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: "Format this into markdown:\n\n" + rawText }],
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: err?.error?.message ?? `API error ${response.status}` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await response.json();
    const text = data.content[0].text;
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});