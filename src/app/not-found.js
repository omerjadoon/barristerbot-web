export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-6">
      <div className="max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/90 p-10 text-center shadow-xl shadow-slate-900/40">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-4 text-slate-300">We couldn’t find the page you were looking for.</p>
        <a
          href="/"
          className="mt-8 inline-flex rounded-3xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Return home
        </a>
      </div>
    </div>
  );
}
