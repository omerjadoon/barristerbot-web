"use client";

import { useState } from "react";

const initialDocuments = [
  {
    id: "placeholder-1",
    title: "Legal context will appear here.",
    source: "System",
    text: "Submit a question to retrieve relevant legal passages.",
    score: 0,
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [documents, setDocuments] = useState(initialDocuments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setAnswer("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to get a response.");
      }

      setAnswer(payload.answer || "No answer returned.");
      setDocuments(payload.documents || []);
    } catch (err) {
      setError(err.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-900/40 backdrop-blur">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">Barrister Bot</p>
              <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">
                Legal assistant for research and guidance
              </h1>
            </div>
            <div className="rounded-3xl bg-slate-950/80 px-5 py-3 text-sm text-slate-300 ring-1 ring-slate-700">
              Embedding model: <span className="font-semibold text-cyan-200">infly/inf-retriever-v1-1.5b</span>
            </div>
          </div>

          <p className="max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            Ask a legal question and Barrister Bot will retrieve relevant legal passages, build a context-aware prompt, and respond with a concise answer. This is a research assistant, not formal legal advice.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 sm:flex-row">
            <label className="sr-only" htmlFor="query">
              Legal question
            </label>
            <input
              id="query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask a legal question, e.g. ‘What constitutes a binding contract?’"
              className="min-h-[56px] flex-1 rounded-3xl border border-slate-700 bg-slate-950/80 px-5 text-base text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="min-h-[56px] rounded-3xl bg-cyan-500 px-6 text-base font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Thinking..." : "Ask Barrister Bot"}
            </button>
          </form>

          {error ? (
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1.4fr_0.9fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-900/40">
            <h2 className="text-xl font-semibold text-white">Answer</h2>
            <div className="mt-5 rounded-3xl bg-slate-950/90 p-6 text-slate-200 ring-1 ring-slate-800">
              {loading ? (
                <p className="text-slate-400">Generating answer from Groq Cloud...</p>
              ) : answer ? (
                <pre className="whitespace-pre-wrap text-sm leading-7">{answer}</pre>
              ) : (
                <p className="text-slate-500">Submit a question to see the response here.</p>
              )}
            </div>
          </article>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-900/40">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Retrieved Documents</h2>
                <p className="text-sm text-slate-500">Source passages used for the response.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {documents.length === 0 ? (
                <p className="text-sm text-slate-500">No documents available yet.</p>
              ) : (
                documents.map((document, index) => (
                  <div
                    key={document.id ?? `doc-${index}`}
                    className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-4"
                  >
                    <p className="text-sm font-semibold text-cyan-200">{document.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">{document.source}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{document.text}</p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
