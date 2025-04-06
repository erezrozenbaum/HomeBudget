import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className, ...props }) => (
  <div
    className={cn(
      "bg-background rounded-lg shadow-lg w-full mx-4",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0",
      className
    )}
    {...props}
  />
);

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0",
      className
    )}
    {...props}
  />
);

const DialogTitle = ({ className, ...props }) => (
  <div
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
);

const DialogClose = ({ className, children, onClick, ...props }) => (
  <button
    className={cn(
      "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children || <X className="h-4 w-4" />}
  </button>
);

const DialogDescription = ({ className, ...props }) => (
  <div
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);

// Default export
export default {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};

// Named exports
export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};