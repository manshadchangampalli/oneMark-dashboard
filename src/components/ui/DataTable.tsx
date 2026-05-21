import * as React from "react"
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "@/components/ui/DataTablePagination"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface Column<T> {
  header: string
  accessorKey: keyof T | string
  cell?: (item: T) => React.ReactNode
  className?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  pageSize?: number
  actions?: React.ReactNode
  searchKeys?: string[]
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

function getVal(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

export function DataTable<T extends Record<string, any>>({
  columns, data, isLoading = false, pageSize = 15,
  actions, searchKeys = [], onRowClick, emptyMessage = "No results.",
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [sort, setSort] = React.useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)

  // Filter
  const filtered = React.useMemo(() => {
    let rows = [...data]
    if (search.trim() && searchKeys.length) {
      const q = search.toLowerCase()
      rows = rows.filter(r => searchKeys.some(k => String(getVal(r, k) ?? '').toLowerCase().includes(q)))
    }
    if (sort) {
      rows.sort((a, b) => {
        const av = getVal(a, sort.key), bv = getVal(b, sort.key)
        if (av === bv) return 0
        return (av < bv ? -1 : 1) * (sort.dir === 'asc' ? 1 : -1)
      })
    }
    return rows
  }, [data, search, sort, searchKeys])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageData = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  // Reset page when search changes
  React.useEffect(() => { setPage(1) }, [search])

  function toggleSort(key: string) {
    setSort(prev => {
      if (prev?.key === key) return prev.dir === 'asc' ? { key, dir: 'desc' } : null
      return { key, dir: 'asc' }
    })
  }

  function SortIcon({ colKey }: { colKey: string }) {
    if (!sort || sort.key !== colKey) return <ChevronsUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40" />
    return sort.dir === 'asc' ? <ChevronUp className="ml-1.5 h-3.5 w-3.5" /> : <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-app-muted pointer-events-none" />
          <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white border-app-border" />
        </div>
        {actions}
      </div>

      <div className="rounded-lg border border-app-border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-app-bg border-b border-app-border">
              {columns.map((col, i) => (
                <TableHead
                  key={i}
                  className={cn("text-xs font-bold uppercase tracking-wider text-app-muted py-3 select-none", col.sortable !== false && "cursor-pointer hover:text-app-text", col.className)}
                  onClick={col.sortable !== false ? () => toggleSort(String(col.accessorKey)) : undefined}
                >
                  <div className="flex items-center">
                    {col.header}
                    {col.sortable !== false && <SortIcon colKey={String(col.accessorKey)} />}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-app-muted text-sm">Loading…</TableCell></TableRow>
            ) : pageData.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-app-muted text-sm">{emptyMessage}</TableCell></TableRow>
            ) : pageData.map((item, idx) => (
              <TableRow
                key={item.id ?? idx}
                onClick={() => onRowClick?.(item)}
                className={cn("border-b border-app-border last:border-0 transition-colors", onRowClick && "cursor-pointer hover:bg-app-bg")}
              >
                {columns.map((col, ci) => (
                  <TableCell key={ci} className={cn("py-3 text-sm text-app-text", col.className)}>
                    {col.cell ? col.cell(item) : getVal(item, String(col.accessorKey))}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-app-muted">
          {filtered.length === 0 ? "No results" : `Showing ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length}`}
        </p>
        {totalPages > 1 && <DataTablePagination page={safePage} totalPages={totalPages} onPageChange={setPage} />}
      </div>
    </div>
  )
}
