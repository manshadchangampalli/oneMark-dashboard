import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/Pagination"

interface DataTablePaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function DataTablePagination({ page, totalPages, onPageChange }: DataTablePaginationProps) {
  const maxVisible = 5
  let startPage = Math.max(1, page - 2)
  let endPage = Math.min(totalPages, startPage + maxVisible - 1)
  if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1)
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <Pagination className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => { e.preventDefault(); if (page > 1) onPageChange(page - 1) }}
            className={page <= 1 ? "pointer-events-none opacity-40" : ""}
          />
        </PaginationItem>
        {startPage > 1 && <PaginationItem><span className="flex h-9 w-6 items-center justify-center text-app-muted text-sm">…</span></PaginationItem>}
        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink href="#" isActive={page === p} onClick={(e) => { e.preventDefault(); onPageChange(p) }}>{p}</PaginationLink>
          </PaginationItem>
        ))}
        {endPage < totalPages && <PaginationItem><span className="flex h-9 w-6 items-center justify-center text-app-muted text-sm">…</span></PaginationItem>}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => { e.preventDefault(); if (page < totalPages) onPageChange(page + 1) }}
            className={page >= totalPages ? "pointer-events-none opacity-40" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
