import { renderHook, act } from "@testing-library/react";
import { usePagination } from "@/hooks/use-pagination";

describe("usePagination", () => {
  it("starts at page 1 by default", () => {
    const { result } = renderHook(() => usePagination({ totalCount: 100 }));
    expect(result.current.page).toBe(1);
  });

  it("initialPage option sets the starting page", () => {
    const { result } = renderHook(() => usePagination({ initialPage: 3, totalCount: 100 }));
    expect(result.current.page).toBe(3);
  });

  it("calculates totalPages correctly", () => {
    const { result } = renderHook(() => usePagination({ totalCount: 100, pageSize: 10 }));
    expect(result.current.totalPages).toBe(10);
  });

  it("totalPages is 1 when totalCount is 0", () => {
    const { result } = renderHook(() => usePagination({ totalCount: 0 }));
    expect(result.current.totalPages).toBe(1);
  });

  it("totalPages rounds up for fractional pages", () => {
    const { result } = renderHook(() => usePagination({ totalCount: 11, pageSize: 10 }));
    expect(result.current.totalPages).toBe(2);
  });

  it("hasNext is true when not on last page", () => {
    const { result } = renderHook(() => usePagination({ totalCount: 50, pageSize: 10 }));
    expect(result.current.hasNext).toBe(true);
  });

  it("hasNext is false on last page", () => {
    const { result } = renderHook(() =>
      usePagination({ initialPage: 5, totalCount: 50, pageSize: 10 })
    );
    expect(result.current.hasNext).toBe(false);
  });

  it("hasPrevious is false on page 1", () => {
    const { result } = renderHook(() => usePagination({ totalCount: 100 }));
    expect(result.current.hasPrevious).toBe(false);
  });

  it("hasPrevious is true when not on first page", () => {
    const { result } = renderHook(() =>
      usePagination({ initialPage: 2, totalCount: 100, pageSize: 10 })
    );
    expect(result.current.hasPrevious).toBe(true);
  });

  it("nextPage increments page", () => {
    const { result } = renderHook(() => usePagination({ totalCount: 100, pageSize: 10 }));
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(2);
  });

  it("nextPage does not go past last page", () => {
    const { result } = renderHook(() =>
      usePagination({ initialPage: 5, totalCount: 50, pageSize: 10 })
    );
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(5); // no-op
  });

  it("previousPage decrements page", () => {
    const { result } = renderHook(() =>
      usePagination({ initialPage: 3, totalCount: 100, pageSize: 10 })
    );
    act(() => result.current.previousPage());
    expect(result.current.page).toBe(2);
  });

  it("previousPage does not go below page 1", () => {
    const { result } = renderHook(() => usePagination({ totalCount: 100 }));
    act(() => result.current.previousPage());
    expect(result.current.page).toBe(1); // no-op
  });

  it("goToPage navigates to specified page", () => {
    const { result } = renderHook(() => usePagination({ totalCount: 100, pageSize: 10 }));
    act(() => result.current.goToPage(7));
    expect(result.current.page).toBe(7);
  });

  it("goToPage clamps to 1 for value < 1", () => {
    const { result } = renderHook(() => usePagination({ totalCount: 100, pageSize: 10 }));
    act(() => result.current.goToPage(0));
    expect(result.current.page).toBe(1);
  });

  it("goToPage clamps to totalPages for value > totalPages", () => {
    const { result } = renderHook(() => usePagination({ totalCount: 100, pageSize: 10 }));
    act(() => result.current.goToPage(999));
    expect(result.current.page).toBe(10);
  });

  it("goToFirstPage navigates to page 1", () => {
    const { result } = renderHook(() =>
      usePagination({ initialPage: 5, totalCount: 100, pageSize: 10 })
    );
    act(() => result.current.goToFirstPage());
    expect(result.current.page).toBe(1);
  });

  it("goToLastPage navigates to last page", () => {
    const { result } = renderHook(() => usePagination({ totalCount: 100, pageSize: 10 }));
    act(() => result.current.goToLastPage());
    expect(result.current.page).toBe(10);
  });

  it("setPageSize updates pageSize and resets to page 1", () => {
    const { result } = renderHook(() =>
      usePagination({ initialPage: 3, totalCount: 100, pageSize: 10 })
    );
    act(() => result.current.setPageSize(20));
    expect(result.current.pageSize).toBe(20);
    expect(result.current.page).toBe(1);
  });

  it("offset is computed as (page-1) * pageSize", () => {
    const { result } = renderHook(() =>
      usePagination({ initialPage: 3, totalCount: 100, pageSize: 10 })
    );
    expect(result.current.offset).toBe(20);
  });

  it("limit equals pageSize", () => {
    const { result } = renderHook(() => usePagination({ totalCount: 100, pageSize: 15 }));
    expect(result.current.limit).toBe(15);
  });
});
