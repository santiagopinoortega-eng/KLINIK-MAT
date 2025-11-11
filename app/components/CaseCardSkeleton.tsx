export default function CaseCardSkeleton() {
  return (
    <div className="card">
      <div className="card-body space-y-3">
        <div className="h-5 w-3/4 animate-pulse rounded bg-secondary-200/70" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-secondary-200/70" />
        <div className="h-4 w-full animate-pulse rounded bg-secondary-200/70" />
      </div>
    </div>
  );
}