# Component Index

This index is the first thing an agent (or engineer) should read when working in `@cbd/components`. Each row summarises what a component is for and, critically, what it is **not** for — so you reach for the right tool first time.

For full props, best practices, accessibility notes, and the quality checklist, open the component's sibling `COMPONENT.md` file.

## Atoms

| Component | Status | For | Not for |
|-----------|--------|-----|---------|
| Button | stable | The primary action in a section — submitting forms, confirming dialogs, triggering in-place operations. | Navigation to a URL or route — use a link instead. |
| Input | stable | Single-line text/number/email entry. | Multi-line text (Textarea), choosing from known options (Select), or boolean state (Checkbox/Switch). |
| Checkbox | stable | A boolean choice in a form — accept terms, multi-select options. | An immediate on/off setting with side effects (Switch), or choosing one of many (radio). |
| Switch | stable | An immediate on/off setting that takes effect at once — dark mode, notifications. | A form value submitted on save (Checkbox), or choosing one of many. |
| Badge | stable | A small, read-only status/category label — order state, severity, a qualifier. | Clickable/removable chips (use a control), or full-sentence messages (use text). |
| Separator | stable | A hairline rule dividing related groups — menu sections, toolbar clusters, list blocks. | Lifting distinct units apart (Card), or mere spacing (use whitespace). |

## Molecules

| Component | Status | For | Not for |
|-----------|--------|-----|---------|
| Select | stable | Choosing ONE option from a small, known list. | Many options or typeahead (Combobox), multiple selection, or a boolean (Switch/Checkbox). |
| Popover | stable | Transient, interactive content anchored to a trigger — filter panels, contextual forms. | Non-interactive text hints (Tooltip), action lists (DropdownMenu), or blocking tasks (Dialog). |
| Tooltip | stable | A short, non-interactive text hint on hover/focus — naming icon buttons, clarifying terse labels. | Interactive content (Popover), essential info (put it inline), or action lists (DropdownMenu). |
| DropdownMenu | stable | A list of ACTIONS triggered by a button — row overflow menus, account menus, bulk actions. | Picking a form value (Select/Combobox), free-form content (Popover), or a single hint (Tooltip). |
| Card | stable | A contained, elevated surface grouping a coherent unit — stat tiles, settings panels, summaries. | Separating content on the same plane (use spacing/Separator), or a modal task (Dialog). |
| Avatar | stable | A person/entity picture with an initials fallback — authors, assignees, member lists. | Brand/product logos (use an img/icon), or a status dot (Badge). |
| Tabs | stable | Switching between peer views of the same subject without navigating — Overview/Activity/Settings. | Separate destinations (use links + URL), sequences (stepper), or 10+ sections. |
| Breadcrumb | stable | Showing location in a hierarchy with one-click routes up it — Home › Reports › Q3. | Flat apps, process steps (stepper), or primary navigation (nav bar/sidebar). |
| Table | stable | Presenting rows of tabular data with semantic markup; `numeric` cells for aligned numbers. | Page layout (use grid/flex), or built-in sort/filter/pagination (DataTable). |
| Combobox | stable | Single-select with typeahead over a known, long list (10+) — frameworks, assignees, countries. | Short lists (Select), multi-select, free-form/async values, or action lists (DropdownMenu). |
| DatePicker | stable | Picking a single calendar date where the month grid helps — due dates, start dates. | Fast typed dates (birthdays), date ranges, or date+time (pair a time control). |

## Organisms

| Component | Status | For | Not for |
|-----------|--------|-----|---------|
| DataTable | stable | A sortable/filterable/paginated table over a `columns`+`data` API — invoices, users, products. | Static rows (Table), or server-scale virtualized grids (use a dedicated data grid). |
| AppShell | stable | The dashboard frame — collapsible sidebar + sticky header + content region. | Marketing/content sites (use a page layout), or a single panel (use a Card). |
