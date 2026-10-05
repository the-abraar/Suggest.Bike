import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-[64px] font-semibold tracking-tight text-faint tnum">404</p>
        <h1 className="mt-2 text-[24px] font-semibold text-ink">This road doesn&apos;t go anywhere.</h1>
        <p className="mt-2 text-[15px] text-muted">The page moved, or the bike isn&apos;t sold any more.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/" className="btn-primary">Home</Link>
          <Link href="/bikes/" className="btn-secondary">All bikes</Link>
        </div>
      </div>
    </div>
  );
}
