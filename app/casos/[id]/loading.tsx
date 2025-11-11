import Skeleton from "@/app/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/80 shadow-soft p-8 space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}