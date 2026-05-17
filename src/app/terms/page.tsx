import { getTranslations } from "next-intl/server";
import { SupportPageShell } from "@/components/support/support-page-shell";

export default async function TermsPage() {
  const t = await getTranslations("termsPage");
  const tSupport = await getTranslations("supportPages");

  return (
    <SupportPageShell
      eyebrow={tSupport("eyebrow")}
      title={t("title")}
      description={t("description")}
      highlights={[
        t("highlights.one"),
        t("highlights.two"),
        t("highlights.three"),
        t("highlights.four"),
      ]}
      sections={[
        { title: t("sections.orders.title"), body: t("sections.orders.body") },
        { title: t("sections.payments.title"), body: t("sections.payments.body") },
        { title: t("sections.accounts.title"), body: t("sections.accounts.body") },
      ]}
      ctaLabel={tSupport("cta.contact")}
      ctaHref="/contact"
      quickLinksLabel={tSupport("quickLinks")}
      quickLinks={[
        { href: "/about", label: tSupport("links.about") },
        { href: "/contact", label: tSupport("links.contact") },
        { href: "/terms", label: tSupport("links.terms") },
        { href: "/privacy", label: tSupport("links.privacy") },
      ]}
    />
  );
}
