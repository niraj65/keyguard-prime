/**
 * Enhanced button variants for password manager
 */

import { Button } from "./button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// Security-focused button variants
export const SecurityButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, children, ...props }, ref) => (
  <Button
    ref={ref}
    className={cn(
      "bg-gradient-to-r from-primary to-primary-glow security-glow",
      "hover:from-primary-glow hover:to-primary transform hover:scale-105",
      "transition-all duration-300 font-semibold",
      className
    )}
    {...props}
  >
    {children}
  </Button>
));

export const VaultButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, children, ...props }, ref) => (
  <Button
    ref={ref}
    variant="secondary"
    className={cn(
      "vault-card border border-border/20",
      "hover:border-primary/30 transition-all duration-300",
      className
    )}
    {...props}
  >
    {children}
  </Button>
));

export const DangerButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, children, ...props }, ref) => (
  <Button
    ref={ref}
    variant="destructive"
    className={cn(
      "bg-gradient-to-r from-destructive to-red-600",
      "hover:from-red-600 hover:to-destructive",
      "transition-all duration-300",
      className
    )}
    {...props}
  >
    {children}
  </Button>
));

export const SuccessButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, children, ...props }, ref) => (
  <Button
    ref={ref}
    className={cn(
      "bg-gradient-to-r from-accent to-green-500",
      "hover:from-green-500 hover:to-accent text-accent-foreground",
      "transition-all duration-300",
      className
    )}
    {...props}
  >
    {children}
  </Button>
));

SecurityButton.displayName = "SecurityButton";
VaultButton.displayName = "VaultButton";
DangerButton.displayName = "DangerButton";
SuccessButton.displayName = "SuccessButton";