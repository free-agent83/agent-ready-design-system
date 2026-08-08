import * as React from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const iconProps = {
  className: "h-4 w-4 shrink-0",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

// The dashboard's primary navigation. Kept in one place so the sidebar and the
// breadcrumb both derive from the same source of truth.
export const navItems: NavItem[] = [
  {
    href: "/",
    label: "Overview",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
  },
  {
    href: "/users",
    label: "Users",
    icon: (
      <svg {...iconProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: (
      <svg {...iconProps}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

export function labelForPath(pathname: string): string {
  const match = navItems.find((n) => n.href === pathname);
  return match?.label ?? "Overview";
}
