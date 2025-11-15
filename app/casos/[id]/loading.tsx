import Skeleton from "@/app/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="card p-8 space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}