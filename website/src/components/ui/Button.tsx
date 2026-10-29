import React from "react";
import Link from "next/link";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "white"
  | "outline-white";

interface BaseButtonProps {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}

export interface LinkButtonProps extends BaseButtonProps {
  href: string;
  external?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export interface ActionButtonProps
  extends BaseButtonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {
  href?: undefined;
}

export type ButtonProps = LinkButtonProps | ActionButtonProps;

export function Button(props: ButtonProps) {
  const { variant = "primary", className = "", children } = props;
  const variantClass = `btn btn--${variant} ${className}`.trim();

  if ("href" in props && typeof props.href === "string") {
    const { href, external, onClick } = props;
    if (external || href.startsWith("http://") || href.startsWith("https://")) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={variantClass}
          onClick={onClick}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={variantClass} onClick={onClick}>
        {children}
      </Link>
    );
  }

  const {
    type = "button",
    variant: _variant,
    className: _className,
    children: _children,
    ...buttonRest
  } = props;
  void _variant;
  void _className;
  void _children;

  return (
    <button type={type} className={variantClass} {...buttonRest}>
      {children}
    </button>
  );
}
