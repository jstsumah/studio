
'use client';

import * as React from 'react';
import { getAssets, getCompanies, getEmployees } from '@/lib/data';
import { AssetTableClient } from '@/components/asset-table-client';
import type { Asset, Company, Employee } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AssetsPage() {
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [assetsData, employeesData, companiesData] = await Promise.all([
        getAssets(),
        getEmployees(),
        getCompanies(),
      ]);
      setAssets(assetsData);
      setEmployees(employeesData);
      setCompanies(companiesData);
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold font-headline mb-4">Asset Inventory</h1>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }
  
  return (
     <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold font-headline mb-4">Asset Inventory</h1>
      <AssetTableClient assets={assets} employees={employees} companies={companies} />
    </div>
  );
}
