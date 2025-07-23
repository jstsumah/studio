
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
  HelpCircle,
} from 'lucide-react';
import Papa from 'papaparse';

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
import { updateAsset, clearCache } from '@/lib/data';
import { useDataRefresh } from '@/hooks/use-data-refresh';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { AssignAssetForm } from './assign-asset-form';

const statusConfig: Record<
  AssetStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  'In Use': { label: 'In Use', icon: Circle, color: 'text-green-500' },
  Available: { label: 'Available', icon: Circle, color: 'text-blue-500' },
  'In Repair': { label: 'In Repair', icon: Circle, color: 'text-yellow-500' },
  Decommissioned: { label: 'Decommissioned', icon: Circle, color: 'text-gray-500' },
};

const defaultStatusConfig = { label: 'Unknown', icon: HelpCircle, color: 'text-muted-foreground' };


const categoryIcons: Record<AssetCategory, React.ReactNode> = {
  Laptop: <Laptop className="h-4 w-4" />,
  Desktop: <HardDrive className="h-4 w-4" />,
  Phone: <Smartphone className="h-4 w-4" />,
  Tablet: <Tablet className="h-4 w-4" />,
  Other: <Circle className="h-4 w-4" />,
};

export function AssetTableClient({
  assets,
  employees,
  companies,
}: {
  assets: Asset[];
  employees: Employee[];
  companies: Company[];
}) {
  const { refreshData } = useDataRefresh();
  const { toast } = useToast();
  
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isAssignOpen, setIsAssignOpen] = React.useState(false);
  const [isDecommissionOpen, setIsDecommissionOpen] = React.useState(false);

  const getCompanyById = (id: string): Company | undefined => companies.find(c => c.id === id);
  const getEmployeeById = (id: string): Employee | undefined => employees.find(e => e.id === id);

  const openDialog = (dialog: 'edit' | 'assign' | 'decommission', asset: Asset) => {
    setSelectedAsset(asset);
    if (dialog === 'edit') setIsEditOpen(true);
    if (dialog === 'assign') setIsAssignOpen(true);
    if (dialog === 'decommission') setIsDecommissionOpen(true);
  }

  const closeDialogs = () => {
    setSelectedAsset(null);
    setIsRegisterOpen(false);
    setIsEditOpen(false);
    setIsAssignOpen(false);
    setIsDecommissionOpen(false);
  }

  const handleDecommission = async () => {
    if (!selectedAsset) return;
    try {
      await updateAsset(selectedAsset.id, { status: 'Decommissioned', assignedTo: '' });
      toast({
        title: 'Asset Decommissioned',
        description: `Asset ${selectedAsset.serialNumber} has been decommissioned.`,
      });
      clearCache();
      refreshData();
      closeDialogs();
    } catch (error) {
      toast({
        title: 'Decommission Failed',
        description: 'Could not decommission the asset. Please try again.',
        variant: 'destructive',
      });
    }
  }


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
      <div className="font-medium font-mono">{row.getValue('serialNumber')}</div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.getValue('category') as AssetCategory;
      return (
        <div className="flex items-center gap-2">
          {categoryIcons[category] || categoryIcons['Other']}
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
    },
    meta: {
      className: 'hidden md:table-cell',
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as AssetStatus;
      const config = statusConfig[status] || defaultStatusConfig;
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
            <div className="text-sm text-muted-foreground hidden lg:block">{employee.department}</div>
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
    meta: {
      className: 'hidden lg:table-cell',
    }
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
            <DropdownMenuItem onClick={() => openDialog('assign', asset)}>
              Assign Asset
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog('edit', asset)}>
              Edit Asset
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => openDialog('decommission', asset)}>
              Decommission
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];


  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
        'companyId': false,
        'purchaseDate': false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
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

  const exportToCsv = () => {
    const dataToExport = table.getFilteredRowModel().rows.map(row => {
        const asset = row.original;
        const company = getCompanyById(asset.companyId);
        const assignedTo = asset.assignedTo ? getEmployeeById(asset.assignedTo)?.name : 'Unassigned';
        return {
            'Serial Number': asset.serialNumber,
            'Category': asset.category,
            'Brand': asset.brand,
            'Model': asset.model,
            'Company': company?.name,
            'Status': asset.status,
            'Assigned To': assignedTo,
            'Purchase Date': asset.purchaseDate
        };
    });

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'assets.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  React.useEffect(() => {
    // Hide columns on mobile
    if (window.innerWidth < 768) {
      table.getColumn('companyId')?.toggleVisibility(false);
      table.getColumn('purchaseDate')?.toggleVisibility(false);
    } else if (window.innerWidth < 1024) {
      table.getColumn('companyId')?.toggleVisibility(true);
      table.getColumn('purchaseDate')?.toggleVisibility(false);
    } else {
       table.getColumn('companyId')?.toggleVisibility(true);
       table.getColumn('purchaseDate')?.toggleVisibility(true);
    }
  }, [table]);


  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>All Assets</CardTitle>
        <CardDescription>
          A comprehensive list of all assets in your organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
          <Input
            placeholder="Filter by serial, brand, model..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full md:max-w-sm"
          />
          <div className="flex w-full md:w-auto items-center gap-2">
            <Button className="w-full md:w-auto" variant="outline" onClick={exportToCsv}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto" onClick={() => setIsRegisterOpen(true)}>
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
                <Button variant="outline" className="ml-auto hidden md:flex">
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
                      <TableHead key={header.id} className={(header.column.columnDef.meta as any)?.className}>
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
                      <TableCell key={cell.id} className={(cell.column.columnDef.meta as any)?.className}>
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

    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} onCloseAutoFocus={closeDialogs}>
            <DialogHeader>
                <DialogTitle>Edit Asset</DialogTitle>
                <DialogDescription>Update the details for asset: {selectedAsset?.serialNumber}</DialogDescription>
            </DialogHeader>
            <RegisterAssetForm onFinished={closeDialogs} companies={companies} asset={selectedAsset} />
        </DialogContent>
    </Dialog>

    <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} onCloseAutoFocus={closeDialogs}>
            <DialogHeader>
                <DialogTitle>Assign Asset</DialogTitle>
                <DialogDescription>Assign asset {selectedAsset?.serialNumber} to an employee.</DialogDescription>
            </DialogHeader>
            {selectedAsset && <AssignAssetForm onFinished={closeDialogs} employees={employees} asset={selectedAsset} />}
        </DialogContent>
    </Dialog>

    <AlertDialog open={isDecommissionOpen} onOpenChange={setIsDecommissionOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action will mark the asset {selectedAsset?.serialNumber} as decommissioned. This cannot be easily undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDialogs}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDecommission} className="bg-destructive hover:bg-destructive/90">Decommission</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
