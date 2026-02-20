export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#fafaf9] animate-pulse">
      {/* header banner skeleton */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-muted shrink-0" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-5 w-44 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-muted rounded-lg" />
              <div className="h-8 w-24 bg-muted rounded-lg" />
              <div className="h-8 w-32 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-white px-6 py-5 flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-2.5 w-24 bg-muted rounded" />
                <div className="h-8 w-12 bg-muted rounded" />
              </div>
              <div className="h-11 w-11 rounded-xl bg-muted" />
            </div>
          ))}
        </div>

        {/* table skeleton */}
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="h-4 w-36 bg-muted rounded" />
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-6">
                <div className="h-4 w-28 bg-muted rounded" />
                <div className="h-4 w-48 bg-muted rounded flex-1" />
                <div className="h-5 w-16 bg-muted rounded-full" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="flex gap-1 ml-auto">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-8 w-8 bg-muted rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
