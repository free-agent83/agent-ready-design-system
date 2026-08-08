import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

// Tabs are not portalled and switch on a plain click, so the full flow works in
// jsdom.
function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview panel</TabsContent>
      <TabsContent value="activity">Activity panel</TabsContent>
    </Tabs>
  );
}

test("renders the default tab selected and its panel visible", () => {
  render(<Example />);
  const selected = screen.getByRole("tab", { selected: true });
  expect(selected).toHaveTextContent("Overview");
  expect(selected).toHaveAttribute("data-slot", "tabs-trigger");
  expect(screen.getByText("Overview panel")).toBeInTheDocument();
  expect(screen.queryByText("Activity panel")).toBeNull();
});

test("clicking a tab switches the active panel", async () => {
  const user = userEvent.setup();
  render(<Example />);
  await user.click(screen.getByRole("tab", { name: "Activity" }));
  expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  expect(screen.getByText("Activity panel")).toBeInTheDocument();
});
