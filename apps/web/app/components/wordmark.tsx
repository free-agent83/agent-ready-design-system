// The "Correct by Design" wordmark — a square monogram plate (the primary role)
// beside the name. Token-only; no raster asset.
export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="grid h-7 w-7 place-items-center rounded-md bg-primary font-mono text-sm font-semibold text-primary-foreground"
      >
        C
      </span>
      <span className="text-sm font-semibold tracking-tight">Correct by Design</span>
    </span>
  );
}
