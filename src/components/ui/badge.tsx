import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-amber-500 text-white",
        gold: "border-transparent bg-gradient-to-r from-yellow-600 to-amber-500 text-white",
        success: "border-transparent bg-emerald-600 text-white",
        error: "border-transparent bg-red-600 text-white",
        warning: "border-transparent bg-orange-500 text-white",
        secondary: "border-purple-400/30 bg-purple-500/15 text-purple-200",
        outline: "border-purple-300/40 text-purple-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }