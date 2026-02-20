export default function VerifyResultLoading() {
  return (
    <div className="min-h-screen bg-[#fafaf9] animate-pulse">
      {/* Status banner */}
      <div className="h-32 bg-muted" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Certificate hash card */}
        <div className="rounded-2xl border border-border bg-white p-6 space-y-3">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-3.5 w-full bg-muted rounded" />
          <div className="h-3.5 w-4/5 bg-muted rounded" />
        </div>

        {/* On-chain record card */}
        <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 bg-muted rounded" />
            <div className="h-5 w-20 bg-muted rounded-full" />
          </div>
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-2/3 bg-muted rounded" />
          <div className="h-9 w-40 bg-muted rounded-lg mt-2" />
        </div>

        {/* Certificate details card */}
        <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
          <div className="h-4 w-44 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-2.5 w-24 bg-muted rounded" />
                <div className="h-3.5 w-32 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
