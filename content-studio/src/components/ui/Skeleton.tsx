export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl animate-pulse px-4 pt-6 md:px-8 md:pt-10" aria-busy="true" aria-label="กำลังโหลด">
      <div className="h-7 w-48 rounded-md bg-line" />
      <div className="mt-2 h-4 w-72 rounded-md bg-subtle" />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-subtle" />
        ))}
      </div>
      <div className="mt-8 space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-subtle" />
        ))}
      </div>
    </div>
  );
}
