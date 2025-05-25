// /components/ui/button.tsx
import React, { ButtonHTMLAttributes, ReactNode } from "react";
import classNames from "classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive";
  children: ReactNode;
}

export function Button({ variant = "default", children, className, disabled, ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantStyles = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-400 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed",
  };

  const classes = classNames(baseStyles, variantStyles[variant], className);

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
