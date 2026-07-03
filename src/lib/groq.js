const GROQ_API_URL = process.env.GROQ_API_URL || "https://api.groq.cloud/v1/models";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.LLM_MODEL || "qwen/qwen3-32b";

function formatGroqResponse(payload) {
  if (!payload) return null;
  if (typeof payload === "string") return payload;

  if (payload.output_text) {
    return payload.output_text;
  }

  if (Array.isArray(payload.output) && payload.output.length > 0) {
    const first = payload.output[0];
    if (typeof first === "string") return first;
    if (first.content) {
      const content = Array.isArray(first.content) ? first.content : [first.content];
      return content.map((item) => item.text || item.content || "").join("\n");
    }
  }

  return JSON.stringify(payload, null, 2);
}

export async function generateAnswer(prompt) {
  if (!GROQ_API_KEY) {
    return `Missing GROQ_API_KEY. Configure this environment variable to generate answers from Groq Cloud.`;
  }

  const endpoint = `${GROQ_API_URL}/${encodeURIComponent(MODEL)}/generate`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      input: [prompt],
      temperature: 0.1,
      max_output_tokens: 1024,
      top_p: 0.95,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Groq API error ${response.status}: ${body}`);
  }

  const payload = await response.json();
  return formatGroqResponse(payload) || "No text returned from Groq Cloud.";
}
