export default function ConversationLoading() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 h-72 animate-pulse rounded-3xl bg-slate-200" />
      </div>
    </main>
  );
}
