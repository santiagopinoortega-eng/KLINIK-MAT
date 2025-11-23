export default function CaseCardSkeleton() {
  return (
    <div className="card" style={{ minHeight: '320px', maxHeight: '320px' }}>
      <div className="space-y-4">
        {/* Badges skeleton */}
        <div className="flex gap-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-200" />
        </div>
        
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-3/4 animate-pulse rounded bg-neutral-200" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-neutral-200" />
        </div>
        
        {/* Summary skeleton */}
        <div className="space-y-2 pt-2">
          <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
        </div>
        
        {/* Button skeleton */}
        <div className="pt-4">
          <div className="h-12 w-full animate-pulse rounded-lg bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}