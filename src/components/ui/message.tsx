"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Message({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message"
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    />
  )
}

function MessageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-header"
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        "max-w-[85%] rounded-2xl bg-muted px-3 py-2 text-sm",
        className
      )}
      {...props}
    />
  )
}

function MessageActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-actions"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function MessageAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-avatar"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  )
}

export {
  Message,
  MessageHeader,
  MessageContent,
  MessageActions,
  MessageAvatar,
}
