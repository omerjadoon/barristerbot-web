import { maskPII, restorePII, sanitizeUserQuery } from "@/lib/pii";
import { retrieveRelevantDocuments, buildPrompt } from "@/lib/retrieval";
import { generateAnswer } from "@/lib/groq";

export async function POST(request) {
  try {
    const body = await request.json();
    const query = sanitizeUserQuery(body.query);

    if (!query) {
      return new Response(JSON.stringify({ error: "Please provide a valid query." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { sanitized, piiMap } = maskPII(query);
    const documents = await retrieveRelevantDocuments(sanitized);
    const prompt = buildPrompt(sanitized, documents);
    const rawAnswer = await generateAnswer(prompt);
    const answer = restorePII(rawAnswer, piiMap);

    return new Response(
      JSON.stringify({
        answer,
        documents,
        query,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("/api/chat error", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unable to process the request." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
