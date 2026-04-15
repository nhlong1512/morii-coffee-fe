import { renderHook, act } from "@testing-library/react";
import { reducer, useToast, toast } from "@/hooks/use-toast";

// Minimal stub for a toast to satisfy the type
const makeToast = (id: string, open = true) => ({
  id,
  open,
  title: `Toast ${id}`,
});

describe("use-toast reducer", () => {
  describe("ADD_TOAST", () => {
    it("adds a toast to an empty list", () => {
      const state = { toasts: [] };
      const action = { type: "ADD_TOAST" as const, toast: makeToast("1") };
      const next = reducer(state, action);
      expect(next.toasts).toHaveLength(1);
      expect(next.toasts[0].id).toBe("1");
    });

    it("prepends the new toast to the front", () => {
      const state = { toasts: [makeToast("1")] };
      const action = { type: "ADD_TOAST" as const, toast: makeToast("2") };
      const next = reducer(state, action);
      expect(next.toasts[0].id).toBe("2");
    });

    it("respects TOAST_LIMIT of 3", () => {
      const state = {
        toasts: [makeToast("1"), makeToast("2"), makeToast("3")],
      };
      const action = { type: "ADD_TOAST" as const, toast: makeToast("4") };
      const next = reducer(state, action);
      // prepend "4", then slice to limit — oldest tail item ("3") is dropped
      expect(next.toasts).toHaveLength(3);
      expect(next.toasts[0].id).toBe("4");
      expect(next.toasts.find((t) => t.id === "3")).toBeUndefined();
    });
  });

  describe("UPDATE_TOAST", () => {
    it("updates the matching toast", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] };
      const action = {
        type: "UPDATE_TOAST" as const,
        toast: { id: "1", title: "Updated" },
      };
      const next = reducer(state, action);
      expect(next.toasts.find((t) => t.id === "1")?.title).toBe("Updated");
    });

    it("does not affect non-matching toasts", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] };
      const action = {
        type: "UPDATE_TOAST" as const,
        toast: { id: "1", title: "Updated" },
      };
      const next = reducer(state, action);
      expect(next.toasts.find((t) => t.id === "2")?.title).toBe("Toast 2");
    });
  });

  describe("DISMISS_TOAST", () => {
    it("sets open=false for specified toast id", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] };
      const action = { type: "DISMISS_TOAST" as const, toastId: "1" };
      const next = reducer(state, action);
      expect(next.toasts.find((t) => t.id === "1")?.open).toBe(false);
      expect(next.toasts.find((t) => t.id === "2")?.open).toBe(true);
    });

    it("sets open=false for all toasts when no toastId provided", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] };
      const action = { type: "DISMISS_TOAST" as const };
      const next = reducer(state, action);
      expect(next.toasts.every((t) => t.open === false)).toBe(true);
    });
  });

  describe("REMOVE_TOAST", () => {
    it("removes the toast with the given id", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] };
      const action = { type: "REMOVE_TOAST" as const, toastId: "1" };
      const next = reducer(state, action);
      expect(next.toasts).toHaveLength(1);
      expect(next.toasts[0].id).toBe("2");
    });

    it("clears all toasts when no toastId is provided", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] };
      const action = { type: "REMOVE_TOAST" as const };
      const next = reducer(state, action);
      expect(next.toasts).toHaveLength(0);
    });

    it("is a no-op for unknown id", () => {
      const state = { toasts: [makeToast("1")] };
      const action = { type: "REMOVE_TOAST" as const, toastId: "999" };
      const next = reducer(state, action);
      expect(next.toasts).toHaveLength(1);
    });
  });
});

describe("toast() function", () => {
  it("returns an object with id, dismiss, and update", () => {
    const result = toast({ title: "Hello" });
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("dismiss");
    expect(result).toHaveProperty("update");
    expect(typeof result.id).toBe("string");
    expect(typeof result.dismiss).toBe("function");
    expect(typeof result.update).toBe("function");
  });

  it("generates unique ids for each call", () => {
    const t1 = toast({ title: "T1" });
    const t2 = toast({ title: "T2" });
    expect(t1.id).not.toBe(t2.id);
  });

  it("dismiss function fires without throwing", () => {
    const t = toast({ title: "Test" });
    expect(() => t.dismiss()).not.toThrow();
  });
});

describe("useToast hook", () => {
  it("returns toast function and initial toasts array", () => {
    const { result } = renderHook(() => useToast());
    expect(typeof result.current.toast).toBe("function");
    expect(Array.isArray(result.current.toasts)).toBe(true);
  });

  it("dismiss function is exposed", () => {
    const { result } = renderHook(() => useToast());
    expect(typeof result.current.dismiss).toBe("function");
  });

  it("dismiss called with undefined does not throw", () => {
    const { result } = renderHook(() => useToast());
    expect(() => {
      act(() => {
        result.current.dismiss(undefined);
      });
    }).not.toThrow();
  });
});
