/** @format */

import React from "react";
import { cn } from "@/lib/utils";

type CardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
};

export function CardContent({
  children,
  className,
  ...props
}: CardContentProps) {
  return (
    <div
      {...props}
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border p-5 shadow",
        className
      )}
    >
      {children}
    </div>
  );
}
