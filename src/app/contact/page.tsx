import { getTranslations } from "next-intl/server";
import { SupportPageShell } from "@/components/support/support-page-shell";

export default async function ContactPage() {
  const t = await getTranslations("contactPage");
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
        { title: t("sections.email.title"), body: t("sections.email.body") },
        { title: t("sections.phone.title"), body: t("sections.phone.body") },
        { title: t("sections.visit.title"), body: t("sections.visit.body") },
      ]}
      ctaLabel={tSupport("cta.stores")}
      ctaHref="/stores"
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
