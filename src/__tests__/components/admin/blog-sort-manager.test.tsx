import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BlogSortManager } from "@/features/blogs/components/blog-sort-manager";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const items = [
  { id: "1", name: "First", displayOrder: 0 },
  { id: "2", name: "Second", displayOrder: 1 },
];

describe("BlogSortManager", () => {
  it("reorders items and saves sequential displayOrder values", async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    render(<BlogSortManager title="Posts" items={items} onSave={onSave} />);

    const downButtons = screen.getAllByRole("button");
    fireEvent.click(downButtons[1]);
    fireEvent.click(screen.getByRole("button", { name: "actions.saveOrder" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith([
        { id: "2", name: "Second", displayOrder: 0 },
        { id: "1", name: "First", displayOrder: 1 },
      ]);
    });
  });
});
