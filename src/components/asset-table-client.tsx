'use client';

import * as React from 'react';
import {
  ChevronsUpDown,
  ChevronDown,
  MoreHorizontal,
  Circle,
  Laptop,
  Smartphone,
  Tablet,
  HardDrive,
  PlusCircle,
  Download,
  Building,
} from 'lucide-react';

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Asset, Employee, AssetStatus, AssetCategory, Company } from '@/lib/types';
import { getCompanyById, getEmployeeById } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RegisterAssetForm } from './register-asset-form';

const statusConfig: Record<
  AssetStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  'In Use': { label: 'In Use', icon: Circle, color: 'text-green-500' },
  Available: { label: 'Available', icon: Circle, color: 'text-blue-500' },
  'In Repair': { label: 'In Repair', icon: Circle, color: 'text-yellow-500' },
  Decommissioned: { label: 'Decommissioned', icon: Circle, color: 'text-gray-500' },
};

const categoryIcons: Record<AssetCategory, React.ReactNode> = {
  Laptop: <Laptop className="h-4 w-4" />,
  Desktop: <HardDrive className="h-4 w-4" />,
  Phone: <Smartphone className="h-4 w-4" />,
  Tablet: <Tablet className="h-4 w-4" />,
  Other: <Circle className="h-4 w-4" />,
};

const columns: ColumnDef<Asset>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'serialNumber',
    header: 'Serial Number',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('serialNumber')}</div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.getValue('category') as AssetCategory;
      return (
        <div className="flex items-center gap-2">
          {categoryIcons[category]}
          <span>{category}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'model',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Brand / Model
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.brand}</div>
        <div className="text-sm text-muted-foreground">{row.original.model}</div>
      </div>
    ),
  },
  {
    accessorKey: 'companyId',
    header: 'Company',
    cell: ({ row }) => {
      const companyId = row.getValue('companyId') as string;
      const company = getCompanyById(companyId);
      return (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{company?.name ?? 'Unknown'}</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as AssetStatus;
      const config = statusConfig[status];
      return (
        <Badge variant="outline" className="flex items-center gap-2">
          <config.icon className={`h-2.5 w-2.5 ${config.color} fill-current`} />
          <span>{config.label}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
    cell: ({ row }) => {
      const employeeId = row.getValue('assignedTo') as string | undefined;
      if (!employeeId) return <span className="text-muted-foreground">Unassigned</span>;

      const employee = getEmployeeById(employeeId);
      if (!employee) return <span className="text-muted-foreground">Unknown User</span>;

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={employee.avatarUrl} alt={employee.name} />
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div>{employee.name}</div>
            <div className="text-sm text-muted-foreground">{employee.department}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'purchaseDate',
    header: 'Purchase Date',
    cell: ({ row }) => {
      const [formattedDate, setFormattedDate] = React.useState('');
      const date = row.getValue('purchaseDate');

      React.useEffect(() => {
        if (typeof date === 'string') {
          try {
            setFormattedDate(format(new Date(date), 'MM/dd/yyyy'));
          } catch (e) {
            setFormattedDate('Invalid Date');
          }
        }
      }, [date]);

      return formattedDate;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const asset = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(asset.id)}>
              Copy Asset ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Assign Asset</DropdownMenuItem>
            <DropdownMenuItem>Edit Asset</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Decommission</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function AssetTableClient({
  assets,
  employees,
  companies,
}: {
  assets: Asset[];
  employees: Employee[];
  companies: Company[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data: assets,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
        const asset = row.original;
        const company = getCompanyById(asset.companyId);
        const searchTerm = filterValue.toLowerCase();

        return (
          asset.serialNumber.toLowerCase().includes(searchTerm) ||
          asset.brand.toLowerCase().includes(searchTerm) ||
          asset.model.toLowerCase().includes(searchTerm) ||
          (company?.name.toLowerCase().includes(searchTerm) ?? false)
        );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Assets</CardTitle>
        <CardDescription>
          A comprehensive list of all assets in your organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between py-4">
          <Input
            placeholder="Filter by serial, brand, model, company..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Register Asset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register a New Asset</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to add a new asset to the inventory.
                  </DialogDescription>
                </DialogHeader>
                <RegisterAssetForm onFinished={() => setIsRegisterOpen(false)} companies={companies} />
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
