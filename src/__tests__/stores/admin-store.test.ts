import { useAdminStore } from "@/stores/admin-store";

beforeEach(() => {
  useAdminStore.setState({ sidebarOpen: true });
});

describe("admin store — initial state", () => {
  it("starts with sidebarOpen=true", () => {
    expect(useAdminStore.getState().sidebarOpen).toBe(true);
  });
});

describe("admin store — toggleSidebar", () => {
  it("flips sidebarOpen from true to false", () => {
    useAdminStore.getState().toggleSidebar();
    expect(useAdminStore.getState().sidebarOpen).toBe(false);
  });

  it("flips sidebarOpen from false to true", () => {
    useAdminStore.setState({ sidebarOpen: false });
    useAdminStore.getState().toggleSidebar();
    expect(useAdminStore.getState().sidebarOpen).toBe(true);
  });

  it("toggles correctly across multiple calls", () => {
    useAdminStore.getState().toggleSidebar(); // → false
    useAdminStore.getState().toggleSidebar(); // → true
    useAdminStore.getState().toggleSidebar(); // → false
    expect(useAdminStore.getState().sidebarOpen).toBe(false);
  });
});

describe("admin store — setSidebarOpen", () => {
  it("sets sidebarOpen to false", () => {
    useAdminStore.getState().setSidebarOpen(false);
    expect(useAdminStore.getState().sidebarOpen).toBe(false);
  });

  it("sets sidebarOpen to true", () => {
    useAdminStore.setState({ sidebarOpen: false });
    useAdminStore.getState().setSidebarOpen(true);
    expect(useAdminStore.getState().sidebarOpen).toBe(true);
  });

  it("is idempotent when setting same value", () => {
    useAdminStore.getState().setSidebarOpen(true);
    expect(useAdminStore.getState().sidebarOpen).toBe(true);
  });
});
