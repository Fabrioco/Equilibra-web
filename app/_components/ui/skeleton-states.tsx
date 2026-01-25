export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-pulse">
    <div className="h-4 w-20 bg-neutral-100 rounded mb-4" />
    <div className="h-8 w-32 bg-neutral-200 rounded" />
  </div>
);

export const SkeletonRow = () => (
  <div className="px-6 py-4 flex items-center justify-between animate-pulse">
    <div className="space-y-2">
      <div className="h-4 w-40 bg-neutral-200 rounded" />
      <div className="h-3 w-24 bg-neutral-100 rounded" />
    </div>
    <div className="flex items-center gap-3">
      <div className="h-6 w-20 bg-neutral-200 rounded" />
      <div className="h-8 w-8 bg-neutral-100 rounded-full" />
    </div>
  </div>
);