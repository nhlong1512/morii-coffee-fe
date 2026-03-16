import { Coffee } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <Coffee className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg text-muted-foreground">
        Oops! This page seems to have brewed away.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Back to Home
      </Link>
    </div>
  );
}
