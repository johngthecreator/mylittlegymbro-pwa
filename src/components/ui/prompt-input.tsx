"use client"

import * as React from "react"

import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const PromptInput = React.forwardRef<
  React.ComponentRef<typeof Textarea>,
  React.ComponentProps<typeof Textarea>
>(function PromptInput({ className, onKeyDown, rows = 1, ...props }, ref) {
  return (
    <Textarea
      ref={ref}
      rows={rows}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          e.currentTarget.form?.requestSubmit()
        }
        onKeyDown?.(e)
      }}
      className={cn(
        "min-h-12 max-h-40 flex-1 border-0 bg-transparent px-3 py-2.5 shadow-none focus-visible:ring-0",
        className
      )}
      {...props}
    />
  )
})
PromptInput.displayName = "PromptInput"

function MessageBar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-bar"
      className={cn(
        "flex w-full items-center gap-2 rounded-2xl border bg-background p-2",
        className
      )}
      {...props}
    />
  )
}

export { PromptInput, MessageBar }
