import CaseCardSkeleton from "@/app/components/CaseCardSkeleton";

export default function Loading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => <CaseCardSkeleton key={i} />)}
    </div>
  );
}