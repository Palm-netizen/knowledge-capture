"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { SidebarAccount } from "./AccountMenu";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-72 md:shrink-0 md:flex-col md:overflow-y-auto bg-card px-6 py-10">
      <Link href="/" className="mb-10 px-3 font-display text-xl font-bold text-ink">
        Knowledge Capture<span className="text-primary">.</span>
      </Link>
      <nav className="flex flex-col gap-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition-colors ${
                active ? "bg-nav text-white" : "text-ink/70 hover:bg-secondary hover:text-ink"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-6">
        <SidebarAccount />
      </div>
    </aside>
  );
}
