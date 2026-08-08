"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "../lib/nav";
import { cn } from "@cbd/components";

// Sidebar navigation — active state derived from the current route. Uses the
// accent role for the active/hover surface, matching the DropdownMenu/Select
// highlight so the whole system reads consistently.
export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
