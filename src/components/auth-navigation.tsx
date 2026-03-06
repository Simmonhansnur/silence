"use client";

import Link from "next/link";
import { useUserStatus } from "./user-provider";

export function AuthNavigation() {
  const { userId, isLoading } = useUserStatus();

  return (
    <nav className="absolute top-8 right-8 flex gap-6 text-xs tracking-widest uppercase items-center">
      {isLoading ? (
         <div className="w-16 h-4 bg-secondary/20 animate-pulse rounded"></div>
      ) : userId ? (
        <Link href="/profile" className="text-secondary hover:text-foreground transition-colors">
          Profile
        </Link>
      ) : (
        <Link href="/auth" className="text-secondary hover:text-foreground transition-colors">
          Sign In
        </Link>
      )}
    </nav>
  );
}
