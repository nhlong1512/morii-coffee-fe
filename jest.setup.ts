import "@testing-library/jest-dom";

// Radix UI primitives (Dialog, etc.) call ResizeObserver internally.
// jsdom does not ship ResizeObserver, so we provide a no-op stub.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
