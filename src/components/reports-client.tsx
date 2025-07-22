
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, ListChecks, UserCheck } from 'lucide-react';
import Papa from 'papaparse';
import type { Asset, Company, Employee } from '@/lib/types';

export function ReportsClient({
  assets,
  employees,
}: {
  assets: Asset[];
  employees: Employee[];
}) {

  const getCompanyById = (id: string, companies: Company[]): Company | undefined => companies.find(c => c.id === id);
  const getEmployeeById = (id: string, employees: Employee[]): Employee | undefined => employees.find(e => e.id === id);

  const downloadCsv = (data: any[], filename: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateFullInventory = async () => {
    const companies: Company[] = []; // You need to fetch companies here if they are not passed
    const data = assets.map((asset) => ({
      'Serial Number': asset.serialNumber,
      Category: asset.category,
      Brand: asset.brand,
      Model: asset.model,
      Company: getCompanyById(asset.companyId, companies)?.name ?? 'N/A',
      Status: asset.status,
      'Assigned To': asset.assignedTo
        ? getEmployeeById(asset.assignedTo, employees)?.name
        : 'Unassigned',
      'Purchase Date': asset.purchaseDate,
      'Warranty Expiry': asset.warrantyExpiry,
    }));
    downloadCsv(data, 'full_asset_inventory.csv');
  };

  const generateAssetsByStatus = () => {
    const data = assets.map((asset) => ({
      Status: asset.status,
      'Serial Number': asset.serialNumber,
      Category: asset.category,
      Brand: asset.brand,
      Model: asset.model,
    }));
    downloadCsv(data, 'assets_by_status.csv');
  };

  const generateEmployeeAllocation = () => {
    const data = employees.flatMap((employee) => {
      const assignedAssets = assets.filter(
        (asset) => asset.assignedTo === employee.id
      );
      if (assignedAssets.length === 0) {
        return [{
            'Employee Name': employee.name,
            'Employee Email': employee.email,
            'Department': employee.department,
            'Asset Serial Number': 'N/A',
            'Asset Category': 'N/A',
            'Asset Brand': 'N/A',
            'Asset Model': 'N/A',
        }];
      }
      return assignedAssets.map((asset) => ({
        'Employee Name': employee.name,
        'Employee Email': employee.email,
        'Department': employee.department,
        'Asset Serial Number': asset.serialNumber,
        'Asset Category': asset.category,
        'Asset Brand': asset.brand,
        'Asset Model': asset.model,
      }));
    });
    downloadCsv(data, 'employee_asset_allocation.csv');
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Reports & Exports
        </h1>
      </div>
      <p className="text-muted-foreground">
        Generate and download reports in CSV format.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-md bg-secondary">
              <FileText className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <CardTitle className="font-headline">
                Full Asset Inventory
              </CardTitle>
              <CardDescription>
                A complete list of all assets.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Export a detailed CSV file containing all information for every
              asset in the inventory system.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={generateFullInventory}>
              <Download className="mr-2" /> Generate
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-md bg-secondary">
              <ListChecks className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <CardTitle className="font-headline">Assets by Status</CardTitle>
              <CardDescription>
                Report of assets grouped by their status.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Download a report that lists all assets, sorted and grouped by
              their current operational status.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={generateAssetsByStatus}>
              <Download className="mr-2" /> Generate
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-md bg-secondary">
              <UserCheck className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <CardTitle className="font-headline">
                Employee Asset Allocation
              </CardTitle>
              <CardDescription>
                Which assets are assigned to each employee.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate a CSV file detailing which employee has been assigned
              which assets.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={generateEmployeeAllocation}>
              <Download className="mr-2" /> Generate
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
