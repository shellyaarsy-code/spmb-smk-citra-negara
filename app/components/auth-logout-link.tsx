"use client";

import Link from "next/link";
import { useState } from "react";

export default function AuthLogoutLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  const [pending, setPending] = useState(false);

  return (
    <Link
      className={className}
      href={href}
      aria-disabled={pending}
      onClick={async (event) => {
        event.preventDefault();
        if (pending) return;
        setPending(true);

        try {
          const response = await fetch("/api/auth/logout", { method: "POST" });
          if (response.ok) window.location.assign(href);
          else setPending(false);
        } catch {
          setPending(false);
        }
      }}
    >
      {children}
    </Link>
  );
}
