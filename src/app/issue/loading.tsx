export default function IssueLoading() {
  return (
    <div className="min-h-screen bg-[#fafaf9] animate-pulse">
      {/* header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-3 w-28 bg-muted rounded mb-4" />
          <div className="h-6 w-48 bg-muted rounded mb-1" />
          <div className="h-3 w-72 bg-muted rounded" />
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-border bg-white p-6 space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-32 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded-lg" />
            </div>
          ))}
          <div className="h-11 w-full bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}
