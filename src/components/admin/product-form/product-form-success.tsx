interface ProductFormSuccessProps {
  title: string;
  message: string;
}

export function ProductFormSuccess({ title, message }: ProductFormSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="rounded-full bg-green-600/15 p-4 mb-4">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1">{message}</p>
    </div>
  );
}
