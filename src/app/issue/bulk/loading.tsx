export default function BulkIssueLoading() {
  return (
    <div className="min-h-screen bg-[#fafaf9] animate-pulse">
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-3 w-28 bg-muted rounded mb-4" />
          <div className="h-6 w-56 bg-muted rounded mb-1" />
          <div className="h-3 w-80 bg-muted rounded" />
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4 flex gap-3">
          <div className="h-4 w-4 bg-muted rounded shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-20 bg-muted rounded" />
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-3/4 bg-muted rounded" />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <div className="h-4 w-28 bg-muted rounded" />
          </div>
          <div className="px-6 py-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-32 bg-muted rounded" />
                  <div className="h-10 w-full bg-muted rounded-lg" />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-32 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded-lg" />
            </div>
            <div className="h-32 w-full bg-muted rounded-xl" />
            <div className="h-16 w-full bg-muted rounded-xl" />
            <div className="h-11 w-full bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
