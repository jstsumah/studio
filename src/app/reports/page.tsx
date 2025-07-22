
'use client';

import * as React from 'react';
import { getAssets, getEmployees, getCompanies } from '@/lib/data';
import { ReportsClient } from '@/components/reports-client';
import type { Asset, Employee, Company } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';


export default function ReportsPage() {
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
        <div className="flex-1 space-y-4 p-4 md:p-8">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
  }

  return <ReportsClient assets={assets} employees={employees} companies={companies} />;
}
