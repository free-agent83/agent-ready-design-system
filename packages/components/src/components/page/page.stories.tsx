import type { Meta, StoryObj } from "@storybook/react";
import { Page, PageActions, PageDescription, PageHeader, PageTitle } from "./page";
import { Section, SectionDescription, SectionHeader, SectionTitle } from "../section/section";
import { Stack } from "../stack/stack";
import { Grid } from "../grid/grid";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card";
import { Button } from "../button/button";
import { Switch } from "../switch/switch";

const meta = {
  title: "Layout/Page",
  component: Page,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Notifications</PageTitle>
          <PageDescription>Choose what reaches you, and how.</PageDescription>
        </div>
        <PageActions>
          <Button variant="outline">Discard</Button>
          <Button>Save changes</Button>
        </PageActions>
      </PageHeader>
    </Page>
  ),
};

// The story COMPOSITION.md binds its rules to: every rule in that table is
// visible here, and the human checklist is answered against this render.
export const WithSections: Story = {
  name: "Page with sections",
  render: () => (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Notifications</PageTitle>
          <PageDescription>Choose what reaches you, and how.</PageDescription>
        </div>
        <PageActions>
          <Button>Save changes</Button>
        </PageActions>
      </PageHeader>
      <Section surface>
        <SectionHeader>
          <SectionTitle>Delivery</SectionTitle>
          <SectionDescription>Which channels carry each kind of notification.</SectionDescription>
        </SectionHeader>
        <Stack>
          <Stack direction="horizontal" align="center" gap="control">
            <Switch id="mentions" defaultChecked />
            <label htmlFor="mentions">Mentions</label>
          </Stack>
          <Stack direction="horizontal" align="center" gap="control">
            <Switch id="replies" />
            <label htmlFor="replies">Replies</label>
          </Stack>
        </Stack>
      </Section>
      <Grid min="sm">
        <Card>
          <CardHeader><CardTitle>Bundling</CardTitle></CardHeader>
          <CardContent>How often notifications are grouped and sent.</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quiet hours</CardTitle></CardHeader>
          <CardContent>Push notifications are held during these hours.</CardContent>
        </Card>
      </Grid>
    </Page>
  ),
};
