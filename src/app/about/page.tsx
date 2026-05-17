import { getTranslations } from "next-intl/server";
import { SupportPageShell } from "@/components/support/support-page-shell";

export default async function AboutPage() {
  const t = await getTranslations("aboutPage");
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
        { title: t("sections.story.title"), body: t("sections.story.body") },
        { title: t("sections.craft.title"), body: t("sections.craft.body") },
        { title: t("sections.community.title"), body: t("sections.community.body") },
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
