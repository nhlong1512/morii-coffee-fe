import { getTranslations } from "next-intl/server";
import { SupportPageShell } from "@/components/support/support-page-shell";

export default async function PrivacyPage() {
  const t = await getTranslations("privacyPage");
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
        { title: t("sections.collection.title"), body: t("sections.collection.body") },
        { title: t("sections.usage.title"), body: t("sections.usage.body") },
        { title: t("sections.control.title"), body: t("sections.control.body") },
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
