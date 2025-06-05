import * as React from "react";
import { cn } from "~/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "w-full rounded-md border border-destructive/50 bg-destructive/20 p-4 text-sm text-destructive",
        className,
      )}
      {...props}
    />
  ),
);
Alert.displayName = "Alert";
