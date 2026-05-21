import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav role="navigation" aria-label="pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("flex flex-row items-center gap-1", className)} {...props} />
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li {...props} />
}

function PaginationLink({ className, isActive, ...props }: { isActive?: boolean } & React.ComponentProps<"a">) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm transition-colors",
        isActive
          ? "border-app-border bg-app-text text-white font-semibold"
          : "border-transparent bg-transparent text-app-muted hover:bg-app-accent hover:text-app-text",
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to previous page" className={cn("gap-1 px-3", className)} {...props}>
      <ChevronLeftIcon className="h-4 w-4" />
      <span className="hidden sm:block text-sm">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to next page" className={cn("gap-1 px-3", className)} {...props}>
      <span className="hidden sm:block text-sm">Next</span>
      <ChevronRightIcon className="h-4 w-4" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span className={cn("flex h-9 w-9 items-center justify-center text-app-muted", className)} {...props}>
      <MoreHorizontalIcon className="h-4 w-4" />
    </span>
  )
}

export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis }
