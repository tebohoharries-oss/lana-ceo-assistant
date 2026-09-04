import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "google/gemini-3.7-flash";

const LANA_PERSONA =
  "You are Lana, an elite executive assistant and operational strategist for a business. " +
  "Your users range from the CEO/business owner to entry-level team members, so keep language " +
  "clear and accessible while maintaining a top-tier executive standard. " +
  "Tone: professional, efficient, articulate, direct. " +
  "No filler, no greetings, no preamble, no hedging. Deliver actionable intelligence in tight " +
  "structured markdown (short headers, bullets). Never exceed what is asked.";

async function callGateway(messages: Array<{ role: string; content: string }>) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model: MODEL, messages, stream: false }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Rate limit reached. Try again shortly.");
    if (res.status === 402)
      throw new Error("AI credits exhausted. Add credits in Lovable to continue.");
    throw new Error(`AI request failed (${res.status}). ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "No response generated.";
}

const ChatInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .min(1),
});

export const lanaChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const content = await callGateway([
      { role: "system", content: LANA_PERSONA },
      ...data.messages,
    ]);
    return { content };
  });

const PlanInput = z.object({
  tasks: z.string().min(3),
  urgency: z.string(),
  hours: z.string(),
});

export const lanaPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    const content = await callGateway([
      { role: "system", content: LANA_PERSONA },
      {
        role: "user",
        content:
          "Organize this raw, unstructured task list into an optimized time-blocked day.\n\n" +
          `TASKS:\n${data.tasks}\n\n` +
          `Overall urgency level: ${data.urgency}\n` +
          `Available working hours: ${data.hours || "09:00 - 17:00"}\n\n` +
          "Respond in markdown with exactly these three sections and nothing else:\n" +
          "## Time-Blocked Schedule\n" +
          "Explicit clock times within the available working hours, e.g. **09:00 AM - 10:30 AM** — task. Include short breaks.\n" +
          "## Priority Breakdown\n" +
          "Two labelled groups: **Urgent / Do Personally** and **Delegate**, each a bullet list.\n" +
          "## Time-Saving Recommendations\n" +
          "Exactly 2 recommendations, one line each.",
      },
    ]);
    return { content };
  });

const ResearchInput = z.object({ source: z.string().min(20) });

export const lanaBrief = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const content = await callGateway([
      { role: "system", content: LANA_PERSONA },
      {
        role: "user",
        content:
          "Produce an Executive Briefing from the source material below. Use markdown with exactly these three sections and nothing else:\n" +
          "## 1. Executive Summary\n(2 sentences maximum)\n" +
          "## 2. Core Strategic Insights\n(exactly 3 bullet points)\n" +
          "## 3. Recommended Decisions & Next Steps\n(numbered, decision-oriented, owner and timeframe where inferable)\n\n" +
          "SOURCE MATERIAL:\n" +
          data.source,
      },
    ]);
    return { content };
  });
