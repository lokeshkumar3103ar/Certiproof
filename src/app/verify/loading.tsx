export default function VerifyLoading() {
  return (
    <div className="min-h-screen bg-[#fafaf9] animate-pulse">
      <div className="bg-white border-b border-border py-16">
        <div className="mx-auto max-w-2xl px-4 text-center space-y-4">
          <div className="h-6 w-64 bg-muted rounded mx-auto" />
          <div className="h-3.5 w-80 bg-muted rounded mx-auto" />
          <div className="h-3 w-60 bg-muted rounded mx-auto" />
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-4">
        <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded-lg" />
          <div className="h-10 w-full bg-muted rounded-lg" />
          <div className="h-11 w-32 bg-muted rounded-xl" />
        </div>
        <div className="rounded-xl border border-border bg-white p-5 flex gap-3">
          <div className="h-4 w-4 bg-muted rounded shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-2/3 bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
