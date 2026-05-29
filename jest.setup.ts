import "@testing-library/jest-dom";
import type { ReactNode } from "react";
import enMessages from "./src/i18n/messages/en.json";

const messagesByNamespace = enMessages as unknown as Record<
  string,
  Record<string, unknown>
>;

function resolveMessage(namespace: string, key: string): string {
  const scopedMessages = messagesByNamespace[namespace];
  const message = scopedMessages?.[key];

  return typeof message === "string" ? message : key;
}

jest.mock("next-intl", () => ({
  useTranslations:
    (namespace?: string) =>
    (key: string, values?: Record<string, string | number>) => {
      const template = namespace ? resolveMessage(namespace, key) : key;

      if (!values) {
        return template;
      }

      return Object.entries(values).reduce(
        (message, [token, value]) => message.replace(`{${token}}`, String(value)),
        template
      );
    },
  useLocale: () => "en",
  NextIntlClientProvider: ({ children }: { children: ReactNode }) => children,
}));

// Radix UI primitives (Dialog, etc.) call ResizeObserver internally.
// jsdom does not ship ResizeObserver, so we provide a no-op stub.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
