import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl mb-4">🫗</div>
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        This potluck doesn&apos;t seem to exist, or the link may have expired.
      </p>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
