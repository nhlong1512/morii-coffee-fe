import { isPublicRoute, requiresAuth, ROUTES } from "@/constants/routes";

describe("route authentication policy", () => {
  it("keeps public storefront routes accessible", () => {
    expect(isPublicRoute(ROUTES.HOME)).toBe(true);
    expect(isPublicRoute("/products/latte")).toBe(true);
    expect(isPublicRoute("/blog/how-to-brew")).toBe(true);
  });

  it("requires authentication for customer account routes", () => {
    expect(requiresAuth(ROUTES.PROFILE)).toBe(true);
    expect(requiresAuth(ROUTES.ORDERS)).toBe(true);
    expect(requiresAuth(ROUTES.CHANGE_PASSWORD)).toBe(true);
    expect(requiresAuth(ROUTES.CHECKOUT)).toBe(true);
  });

  it("requires authentication for admin routes", () => {
    expect(requiresAuth(ROUTES.ADMIN.REPORTS)).toBe(true);
  });
});
