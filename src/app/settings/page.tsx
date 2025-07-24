
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { useDataRefresh } from '@/hooks/use-data-refresh';
import { getCompanies, getAssets, deleteCompany } from '@/lib/data';
import type { Company, Asset } from '@/lib/types';
import { CompanyForm } from '@/components/company-form';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { dataVersion, refreshData } = useDataRefresh();
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [selectedCompany, setSelectedCompany] = React.useState<Company | undefined>(undefined);
  const { toast } = useToast();

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [companiesData, assetsData] = await Promise.all([
            getCompanies(),
            getAssets()
        ]);
        setCompanies(companiesData);
        setAssets(assetsData);
      } catch (error) {
        console.error('Failed to load settings data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [dataVersion]);
  
  const openForm = (company?: Company) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  }

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedCompany(undefined);
  };
  
  const openDeleteAlert = (company: Company) => {
    const isCompanyInUse = assets.some(asset => asset.companyId === company.id);
    if (isCompanyInUse) {
        toast({
            title: 'Deletion Blocked',
            description: 'This company cannot be deleted because it has assets associated with it.',
            variant: 'destructive'
        });
        return;
    }
    setSelectedCompany(company);
    setIsDeleteAlertOpen(true);
  }

  const closeDeleteAlert = () => {
    setIsDeleteAlertOpen(false);
    setSelectedCompany(undefined);
  }

  const handleDelete = async () => {
    if (!selectedCompany) return;
    try {
        await deleteCompany(selectedCompany.id);
        toast({ title: 'Company Deleted', description: `${selectedCompany.name} has been removed.` });
        refreshData();
    } catch (error) {
        toast({ title: 'Deletion Failed', description: 'Could not delete the company. Please try again.', variant: 'destructive' });
    } finally {
        closeDeleteAlert();
    }
  }


  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Skeleton className="h-8 w-1/4" />
        <Separator />
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Settings
          </h1>
        </div>
        <Separator />
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Company Management</CardTitle>
                <CardDescription>
                  Add, edit, or remove companies from your organization.
                </CardDescription>
              </div>
               <DialogTrigger asChild>
                <Button onClick={() => openForm()}>
                  <PlusCircle className="mr-2" />
                  Add Company
                </Button>
              </DialogTrigger>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.length > 0 ? (
                    companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openForm(company)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => openDeleteAlert(company)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        No companies found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onCloseAutoFocus={closeForm}
      >
        <DialogHeader>
          <DialogTitle>{selectedCompany ? 'Edit Company' : 'Add New Company'}</DialogTitle>
          <DialogDescription>
            {selectedCompany ? `Update the name for ${selectedCompany.name}.` : 'Add a new company to the system.'}
          </DialogDescription>
        </DialogHeader>
        <CompanyForm onFinished={closeForm} company={selectedCompany} />
      </DialogContent>
    </Dialog>
      
       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the company record for {selectedCompany?.name}.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={closeDeleteAlert}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
