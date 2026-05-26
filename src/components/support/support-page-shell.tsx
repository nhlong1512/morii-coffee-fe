import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface SupportSection {
  title: string;
  body: string;
}

interface SupportPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  sections: SupportSection[];
  ctaLabel: string;
  ctaHref: string;
  quickLinksLabel: string;
  quickLinks: Array<{
    href: string;
    label: string;
  }>;
}

export function SupportPageShell({
  eyebrow,
  title,
  description,
  highlights,
  sections,
  ctaLabel,
  ctaHref,
  quickLinksLabel,
  quickLinks,
}: SupportPageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <main className="min-w-0 space-y-8">
            <section className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="bg-gradient-to-r from-[#146d4d] via-[#1b7d58] to-[#0f4f39] px-5 py-10 pr-7 text-white sm:px-8 sm:pr-8">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/75">
                  {eyebrow}
                </p>
                <h1 className="mt-3 max-w-sm break-words text-2xl font-semibold leading-tight sm:max-w-2xl sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-2xl break-words text-sm leading-6 text-white/85 sm:text-base">
                  {description}
                </p>
              </div>

              <div className="grid gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="grid gap-3 sm:grid-cols-2">
                  {highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-background/60 p-4"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                      <p className="min-w-0 break-words text-sm leading-6 text-muted-foreground">{highlight}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-background/60 p-5">
                  <p className="text-sm font-semibold text-foreground">{quickLinksLabel}</p>
                  <div className="mt-4 flex flex-col gap-2">
                    {quickLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="inline-flex min-w-0 items-center justify-between rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <span className="min-w-0 break-words pr-3">{link.label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4">
              {sections.map((section) => (
                <article
                  key={section.title}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <h2 className="text-xl font-semibold text-card-foreground">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                    {section.body}
                  </p>
                </article>
              ))}
            </section>
          </main>

          <aside className="min-w-0 h-fit rounded-3xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground">{quickLinksLabel}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
            <Link
              href={ctaHref}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
