import type { ReactNode, ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost"
  border?: "full" | "normal" | "none"
}

const variantStyles: Record<string, string> = {
  primary: "bg-blue-500 text-white hover:bg-blue-600",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
}

const borderStyles: Record<string, string> = {
  full: "rounded-full",
  normal: "rounded-lg",
  none: "",
}

export default function Button({
  children,
  variant = "primary",
  border = "full",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${variantStyles[variant]} ${borderStyles[border]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
