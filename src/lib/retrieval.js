import { legalDocuments } from "@/data/legalDocs";

function normalize(text) {
  return String(text || "").toLowerCase();
}

function scoreDocument(query, document) {
  const normalizedQuery = normalize(query);
  const tokens = [...new Set((normalizedQuery.match(/\w+/g) || []))];
  const content = `${normalize(document.title)} ${normalize(document.text)}`;
  let score = 0;

  if (content.includes(normalizedQuery)) {
    score += 10;
  }

  tokens.forEach((token) => {
    if (!token) return;
    const occurrences = content.split(token).length - 1;
    score += occurrences;
  });

  if (content.includes("contract") && normalizedQuery.includes("contract")) {
    score += 2;
  }

  return score;
}

function buildFallbackDocuments(query) {
  const scored = legalDocuments.map((document) => ({
    ...document,
    score: scoreDocument(query, document),
  }));

  const sorted = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return sorted.length ? sorted : legalDocuments.slice(0, 2).map((doc) => ({ ...doc, score: 1 }));
}

export async function retrieveRelevantDocuments(query) {
  const vectorUrl = process.env.VECTOR_DB_URL || process.env.WEAVIATE_REST_ENDPOINT;
  if (vectorUrl) {
    try {
      return await searchVectorDatabase(query);
    } catch (error) {
      console.warn("Vector DB lookup failed, falling back to local retrieval:", error.message);
    }
  }

  return buildFallbackDocuments(query);
}

async function searchVectorDatabase(query) {
  const vectorUrl = process.env.VECTOR_DB_URL || process.env.WEAVIATE_REST_ENDPOINT;
  const apiKey = process.env.VECTOR_DB_API_KEY || process.env.WEAVIATE_API_KEY;
  const model = process.env.EMBEDDING_MODEL || "infly/inf-retriever-v1-1.5b";
  const device = process.env.EMBEDDING_DEVICE || "mps";
  const batchSize = Number(process.env.EMBEDDING_BATCH_SIZE || 32);

  const response = await fetch(vectorUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      query,
      topK: 4,
      embeddingModel: model,
      device,
      batchSize,
    }),
  });

  if (!response.ok) {
    throw new Error(`Vector database request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload.results)) {
    throw new Error("Unexpected vector database response shape");
  }

  return payload.results.map((item) => ({
    id: item.id || item.source || item.title || "unknown",
    title: item.title || item.source || "Retrieved Document",
    source: item.source || "External Knowledge Base",
    text: item.text || item.content || "",
    score: Number(item.score ?? 1),
  }));
}

export function buildPrompt(query, documents) {
  const context = documents
    .map(
      (document, index) =>
        `Source ${index + 1}: ${document.title} (${document.source})\n${document.text.trim()}`
    )
    .join("\n\n");

  return `You are Barrister Bot, a legal research assistant. Use only the provided sources to answer the user's question. Keep the answer concise, accurate, and clearly cite the documents when appropriate.

User query: "${query}"

Context:
${context}

Answer:`;
}
