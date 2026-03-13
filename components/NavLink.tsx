"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type NextLinkProps = React.ComponentPropsWithoutRef<typeof Link>;

interface NavLinkCompatProps extends Omit<NextLinkProps, "href" | "className"> {
  to: NextLinkProps["href"];
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  end?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (
    { className, activeClassName, pendingClassName, to, end = false, ...props },
    ref,
  ) => {
    const pathname = usePathname();
    const [isPending, setIsPending] = useState(false);

    const toPathname = useMemo(() => {
      if (typeof to === "string") return to.split("?")[0]?.split("#")[0] ?? "";
      if (to && typeof to === "object" && "pathname" in to) {
        return (to.pathname as string) ?? "";
      }
      return "";
    }, [to]);

    const isActive = useMemo(() => {
      if (!toPathname) return false;
      if (end) return pathname === toPathname;
      return pathname === toPathname || pathname.startsWith(`${toPathname}/`);
    }, [end, pathname, toPathname]);

    useEffect(() => {
      setIsPending(false);
    }, [pathname]);

    return (
      <Link
        ref={ref}
        href={to}
        className={cn(
          className,
          isActive && activeClassName,
          isPending && pendingClassName,
        )}
        onClick={(e) => {
          props.onClick?.(e);
          if (e.defaultPrevented) return;
          if (props.target === "_blank") return;
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          if (e.button !== 0) return;
          setIsPending(true);
        }}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
