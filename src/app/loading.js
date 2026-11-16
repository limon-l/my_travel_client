import { Container, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Container className="py-16">
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((key) => (
          <div key={key} className="overflow-hidden rounded-2xl border border-line bg-surface">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <p className="sr-only" role="status">
        Loading page content
      </p>
    </Container>
  );
}
